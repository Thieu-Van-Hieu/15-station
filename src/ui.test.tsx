// @vitest-environment jsdom
import { describe, expect, it, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import fs from "node:fs";
import path from "node:path";
import { content } from "./content";
import { DocumentPaper } from "./components/DocumentPaper";
import { Rulebook } from "./components/Rulebook";
import { ActionControls } from "./components/ActionControls";
import { WindowPanel } from "./components/WindowPanel";
import { newGame } from "./engine/game";
import { reasonsOn } from "./engine/reports";
import App from "./App";
import type { IssueId, Traveler } from "./engine/types";

describe("UI tests (P6: UI-01 to UI-12)", () => {
  afterEach(() => {
    cleanup();
  });
  // UI-01: Hiển thị từng loại giấy trong documents.json bằng dữ liệu mẫu
  it("UI-01 hiển thị đủ 8 loại giấy tờ với nhãn trường và danh sách hàng cho GDD", () => {
    for (const def of content.documents) {
      const mockFields: Record<string, any> = {};
      for (const field of def.fields) {
        if (field.kind === "items") {
          mockFields[field.key] = [
            { ma: "gao", ten: "Gạo tẻ", so_luong: 10, don_vi: "kg" },
            { ma: "ngo", ten: "Ngô bắp", so_luong: 5, don_vi: "kg" },
          ];
        } else if (field.kind === "item") {
          mockFields[field.key] = { ma: "gao", ten: "Gạo", so_luong: 10, don_vi: "kg" };
        } else if (field.kind === "int") {
          mockFields[field.key] = 1950;
        } else {
          mockFields[field.key] = "Giá trị mẫu";
        }
      }

      const mockDoc = {
        type: def.code,
        fields: mockFields,
        seal: {
          kind: def.allowed_seal_kinds[0] ?? "UBND_XA",
          place: "Xã Mẫu",
          legible: true,
        },
      } as any;

      const { container, unmount } = render(<DocumentPaper doc={mockDoc} def={def} />);

      // Tên loại giấy và mã
      expect(container.textContent).toContain(def.name);
      expect(container.textContent).toContain(def.code);

      // Mọi nhãn trường phải xuất hiện
      for (const field of def.fields) {
        expect(container.textContent).toContain(field.label);
      }

      // Riêng GDD có danh sách hàng
      if (def.code === "GDD") {
        expect(container.textContent).toContain("Gạo tẻ");
        expect(container.textContent).toContain("10 kg");
        expect(container.textContent).toContain("Ngô bắp");
        expect(container.textContent).toContain("5 kg");
      }

      unmount();
    }
  });

  // UI-02: Sổ chỉ thị ở d1, d5 (có và không có R5K), d6
  it("UI-02 sổ chỉ thị ở d1, d5 (có/không có R5K), d6 hiển thị chính xác các điều", () => {
    // d1: chỉ Điều 1
    const { container: c1, unmount: u1 } = render(
      <Rulebook dayId="d1" issuesActive={new Set()} />
    );
    expect(c1.textContent).toContain("Điều 1");
    expect(c1.textContent).not.toContain("Điều 2");
    expect(c1.textContent).not.toContain("Điều 2 (bổ sung)");
    expect(c1.textContent).not.toContain("Thông báo");
    u1();

    // d5 không có R5K: có Điều 1, 2, 3, 4, 5 nhưng không có Điều 2 (bổ sung)
    const { container: c5NoR5K, unmount: u5NoR5K } = render(
      <Rulebook dayId="d5" issuesActive={new Set()} />
    );
    expect(c5NoR5K.textContent).toContain("Điều 1");
    expect(c5NoR5K.textContent).toContain("Điều 2");
    expect(c5NoR5K.textContent).toContain("Điều 3");
    expect(c5NoR5K.textContent).toContain("Điều 4");
    expect(c5NoR5K.textContent).toContain("Điều 5");
    expect(c5NoR5K.textContent).not.toContain("Điều 2 (bổ sung)");
    u5NoR5K();

    // d5 có R5K: có Điều 2 (bổ sung)
    const { container: c5WithR5K, unmount: u5WithR5K } = render(
      <Rulebook dayId="d5" issuesActive={new Set<IssueId>(["KN-KHOAN"])} />
    );
    expect(c5WithR5K.textContent).toContain("Điều 2 (bổ sung)");
    u5WithR5K();

    // d6: chỉ còn Thông báo (R6)
    const { container: c6, unmount: u6 } = render(
      <Rulebook dayId="d6" issuesActive={new Set()} />
    );
    expect(c6.textContent).toContain("Thông báo");
    expect(c6.textContent).not.toContain("Điều 1");
    expect(c6.textContent).not.toContain("Điều 2");
    u6();
  });

  // UI-03: Nút "Biên bản" ở d1, d2, d6 không bấm được
  it("UI-03 nút biên bản ở d1, d2, d6 bị vô hiệu hoá", () => {
    const d1 = content.days.find((d) => d.id === "d1")!;
    const d2 = content.days.find((d) => d.id === "d2")!;
    const d6 = content.days.find((d) => d.id === "d6")!;

    for (const day of [d1, d2, d6]) {
      const { unmount } = render(
        <ActionControls
          day={day}
          bribeAccepted={false}
          onDecide={() => {}}
          onNext={() => {}}
        />
      );
      const reportBtn = screen.getByRole("button", {
        name: new RegExp(content.strings["desk.report"], "i"),
      }) as HTMLButtonElement;
      expect(reportBtn.disabled).toBe(true);
      unmount();
    }
  });

  // UI-04: Chọn làm ngơ -> Nút "Biên bản" không bấm được
  it("UI-04 chọn làm ngơ thì nút biên bản bị vô hiệu hoá", () => {
    const d3 = content.days.find((d) => d.id === "d3")!;
    const { unmount } = render(
      <ActionControls
        day={d3}
        bribeAccepted={false}
        chosenAction="LAM_NGO"
        onDecide={() => {}}
        onNext={() => {}}
      />
    );
    const reportBtn = screen.getByRole("button", {
      name: new RegExp(content.strings["desk.report"], "i"),
    }) as HTMLButtonElement;
    expect(reportBtn.disabled).toBe(true);
    unmount();
  });

  // UI-05: Nhận phong bì -> Dấu "Giữ lại" và nút "Biên bản" không bấm được
  it("UI-05 nhận phong bì thì dấu giữ lại và nút biên bản bị vô hiệu hoá", () => {
    const d3 = content.days.find((d) => d.id === "d3")!;
    const { unmount } = render(
      <ActionControls
        day={d3}
        bribeAccepted={true}
        onDecide={() => {}}
        onNext={() => {}}
      />
    );
    const rejectBtn = screen.getByRole("button", {
      name: new RegExp(content.strings["desk.stamp.reject"], "i"),
    }) as HTMLButtonElement;
    const reportBtn = screen.getByRole("button", {
      name: new RegExp(content.strings["desk.report"], "i"),
    }) as HTMLButtonElement;

    expect(rejectBtn.disabled).toBe(true);
    expect(reportBtn.disabled).toBe(true);
    unmount();
  });

  // UI-06: Mở hộp lý do ở d3: Hiện đủ lý do của mọi vấn đề đã mở, mỗi lý do đúng một lần
  it("UI-06 mở hộp lý do ở d3 hiện đủ lý do của mọi vấn đề đã mở và mỗi lý do đúng một lần", () => {
    const d3 = content.days.find((d) => d.id === "d3")!;
    const { unmount } = render(
      <ActionControls
        day={d3}
        bribeAccepted={false}
        onDecide={() => {}}
        onNext={() => {}}
      />
    );

    const reportBtn = screen.getByRole("button", {
      name: new RegExp(content.strings["desk.report"], "i"),
    });
    fireEvent.click(reportBtn);

    const expectedReasons = reasonsOn(content.reports, "d3");
    expect(expectedReasons.length).toBeGreaterThan(0);

    for (const r of expectedReasons) {
      const items = screen.getAllByText(r.text);
      expect(items.length).toBe(1);
    }
    unmount();
  });

  // UI-07: Lượt trước quyết sai -> Giấy nhắc nhở hiện đầu lượt này
  it("UI-07 lượt trước quyết sai thì giấy nhắc nhở hiện đầu lượt này", () => {
    const traveler = content.travelers[0];
    const state = newGame(content);
    const reprimandMsg = "Đồng chí tổ trưởng nhắc nhở: cần kiểm tra kỹ hạn giấy đi đường.";

    const { container, unmount } = render(
      <WindowPanel
        traveler={traveler}
        state={state}
        bribeAccepted={false}
        bribeDismissed={false}
        onAcceptBribe={() => {}}
        onDeclineBribe={() => {}}
        lastReprimandText={reprimandMsg}
      />
    );

    expect(container.textContent).toContain(content.strings["desk.reprimand_title"]);
    expect(container.textContent).toContain(reprimandMsg);
    unmount();
  });

  // UI-08: Lời thoại có when không thoả -> Không hiện
  it("UI-08 lời thoại có when không thoả thì không hiển thị", () => {
    const state = newGame(content);
    const traveler: Traveler = {
      ...content.travelers[0],
      dialogue: [
        {
          speaker: "ba-tu",
          text: "Câu thoại này luôn hiện",
        },
        {
          speaker: "ba-tu",
          text: "Câu thoại này bị ẩn vì điều kiện sai",
          when: [{ issue_triggered: "KN-KHOAN", value: true }],
        },
      ],
    };

    const { container, unmount } = render(
      <WindowPanel
        traveler={traveler}
        state={state}
        bribeAccepted={false}
        bribeDismissed={false}
        onAcceptBribe={() => {}}
        onDeclineBribe={() => {}}
      />
    );

    expect(container.textContent).toContain("Câu thoại này luôn hiện");
    expect(container.textContent).not.toContain("Câu thoại này bị ẩn vì điều kiện sai");
    unmount();
  });

  // UI-09: Mở ?tu=d3-t3 vào thẳng lượt bà Tư, thanh trên ghi đúng ngày
  it("UI-09 mở ?tu=d3-t3 vào thẳng lượt bà Tư trên ngày 3", () => {
    window.history.pushState({}, "", "/?tu=d3-t3");

    const { container, unmount } = render(<App />);

    expect(container.textContent).toContain("Ngày 3");
    expect(container.textContent).toContain("Bà Tư");

    unmount();
    window.history.pushState({}, "", "/");
  });

  // UI-10: Tải lại trang giữa ván tiếp tục đúng lượt đang chơi
  it("UI-10 tải lại trang giữa ván khôi phục đúng trạng thái từ localStorage", () => {
    window.history.pushState({}, "", "/");

    const savedState = {
      ...newGame(content),
      phase: "TRAVELER",
      dayIndex: 1, // Ngày 2
      travelerIndex: 2, // Lượt 3
    };

    localStorage.setItem("tram15_state", JSON.stringify(savedState));

    const { container, unmount } = render(<App />);

    expect(container.textContent).toContain("Ngày 2");
    unmount();
    localStorage.clear();
  });

  // UI-11: localStorage chứa dữ liệu hỏng hoặc bị chặn thì bắt đầu ván mới không lỗi
  it("UI-11 localStorage chứa dữ liệu hỏng hoặc bị chặn thì tự khởi động ván mới không ném lỗi", () => {
    window.history.pushState({}, "", "/");

    localStorage.setItem("tram15_state", "invalid-json-data{{{");

    let renderedWithoutError = false;
    try {
      const { container, unmount } = render(<App />);
      expect(container.textContent).toContain(content.strings["intro.title"]);
      renderedWithoutError = true;
      unmount();
    } catch {
      renderedWithoutError = false;
    }

    expect(renderedWithoutError).toBe(true);
    localStorage.clear();
  });

  // UI-12: Quét src/**/*.tsx tìm chữ tiếng Việt có dấu nằm trong JSX
  it("UI-12 không có chữ tiếng Việt có dấu hardcode trực tiếp trong các JSX tags của src/**/*.tsx", () => {
    const srcDir = path.resolve(__dirname);
    const tsxFiles: string[] = [];

    function findTsxFiles(dir: string) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          findTsxFiles(fullPath);
        } else if (entry.isFile() && entry.name.endsWith(".tsx") && !entry.name.endsWith(".test.tsx")) {
          tsxFiles.push(fullPath);
        }
      }
    }

    findTsxFiles(srcDir);
    expect(tsxFiles.length).toBeGreaterThan(0);

    const vietnameseAccentedRegex = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđĐ]/i;

    const violations: { file: string; line: number; text: string }[] = [];

    for (const file of tsxFiles) {
      const relativePath = path.relative(srcDir, file);
      const lines = fs.readFileSync(file, "utf-8").split("\n");

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.trim().startsWith("//") || line.trim().startsWith("/*") || line.trim().startsWith("*")) {
          continue;
        }

        const matches = line.matchAll(/>([^<>{]+)</g);
        for (const match of matches) {
          const textInside = match[1].trim();
          if (textInside && vietnameseAccentedRegex.test(textInside)) {
            violations.push({
              file: relativePath,
              line: i + 1,
              text: textInside,
            });
          }
        }
      }
    }

    if (violations.length > 0) {
      console.error("Phát hiện chữ tiếng Việt có dấu hardcode trong JSX:", violations);
    }
    expect(violations).toEqual([]);
  });
});
