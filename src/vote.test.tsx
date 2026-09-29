// @vitest-environment jsdom
import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { VoteScreen } from "./screens/VoteScreen";
import { content } from "./content";

describe("VoteScreen (Smartphone voting - Step 2)", () => {
  beforeEach(() => {
    localStorage.clear();
    window.history.pushState({}, "", "/vote");
    vi.restoreAllMocks();
  });

  afterEach(() => {
    cleanup();
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("1. Hiện form nhập mã phòng khi không có ?room= trên URL", () => {
    window.history.pushState({}, "", "/vote");
    render(<VoteScreen />);

    expect(screen.getByText(content.strings["vote.title"])).toBeDefined();
    expect(screen.getByPlaceholderText(content.strings["vote.room_placeholder"])).toBeDefined();
    expect(screen.getByRole("button", { name: content.strings["vote.room_submit"] })).toBeDefined();
  });

  it("2. Nhập mã phòng và submit chuyển sang màn chờ với mã phòng tương ứng", async () => {
    window.history.pushState({}, "", "/vote");

    // Mock fetch trả về round chưa mở
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ round: 0, open: false }),
    } as any);

    render(<VoteScreen />);

    const input = screen.getByPlaceholderText(content.strings["vote.room_placeholder"]);
    fireEvent.change(input, { target: { value: "phong1" } });

    const submitBtn = screen.getByRole("button", { name: content.strings["vote.room_submit"] });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText("PHONG1")).toBeDefined();
      expect(screen.getByText(content.strings["vote.waiting"])).toBeDefined();
    });
  });

  it("3. Khi có ?room= trên URL và vòng đang mở, hiển thị câu hỏi và 2 nút lựa chọn", async () => {
    window.history.pushState({}, "", "/vote?room=PHONG1");

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        round: 2,
        open: true,
        turnId: "d3-t3",
        question: "Bà Tư mang 18 kg gạo",
        options: ["CHO_QUA", "GIU_LAI"],
      }),
    } as any);

    render(<VoteScreen />);

    await waitFor(() => {
      expect(screen.getByText(content.strings["class.case.d3_t3.question"])).toBeDefined();
      expect(screen.getByText(content.strings["vote.stamp_approve"])).toBeDefined();
      expect(screen.getByText(content.strings["vote.stamp_reject"])).toBeDefined();
    });
  });

  it("4. Bấm bầu gửi phiếu qua POST /api/vote và hiện xác nhận đã ghi nhận", async () => {
    window.history.pushState({}, "", "/vote?room=PHONG1");

    const fetchMock = vi.fn().mockImplementation((url: string, opts?: any) => {
      if (url.startsWith("/api/state")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            round: 2,
            open: true,
            turnId: "d3-t3",
            question: "Bà Tư mang 18 kg gạo",
            options: ["CHO_QUA", "GIU_LAI"],
          }),
        });
      }
      if (url.startsWith("/api/vote")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ ok: true }),
        });
      }
      return Promise.reject(new Error("Unknown URL"));
    });

    globalThis.fetch = fetchMock as any;

    render(<VoteScreen />);

    await waitFor(() => {
      expect(screen.getByText(content.strings["class.case.d3_t3.question"])).toBeDefined();
    });

    const approveBtn = screen.getByRole("button", {
      name: new RegExp(content.strings["vote.stamp_approve"], "i"),
    });

    fireEvent.click(approveBtn);

    await waitFor(() => {
      expect(screen.getByText(new RegExp(content.strings["vote.your_vote"], "i"))).toBeDefined();
    });

    // Kiểm tra fetch POST /api/vote đã được gọi với voterId và lựa chọn
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/vote",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining('"choice":"CHO_QUA"'),
      }),
    );
  });

  it("5. Cho phép đổi ý bỏ phiếu lại trước khi đóng vòng", async () => {
    window.history.pushState({}, "", "/vote?room=PHONG1");

    const fetchMock = vi.fn().mockImplementation((url: string, opts?: any) => {
      if (url.startsWith("/api/state")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            round: 2,
            open: true,
            turnId: "d3-t3",
            question: "Bà Tư mang 18 kg gạo",
            options: ["CHO_QUA", "GIU_LAI"],
          }),
        });
      }
      if (url.startsWith("/api/vote")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ ok: true }),
        });
      }
      return Promise.reject(new Error("Unknown URL"));
    });

    globalThis.fetch = fetchMock as any;

    render(<VoteScreen />);

    await waitFor(() => {
      expect(screen.getByText(content.strings["class.case.d3_t3.question"])).toBeDefined();
    });

    // Bầu CHO_QUA
    fireEvent.click(
      screen.getByRole("button", {
        name: new RegExp(content.strings["vote.stamp_approve"], "i"),
      }),
    );

    await waitFor(() => {
      expect(screen.getByText(new RegExp(content.strings["vote.your_vote"], "i"))).toBeDefined();
    });

    // Đổi ý sang GIU_LAI
    fireEvent.click(
      screen.getByRole("button", {
        name: new RegExp(content.strings["vote.stamp_reject"], "i"),
      }),
    );

    await waitFor(() => {
      expect(fetchMock).toHaveBeenLastCalledWith(
        "/api/vote",
        expect.objectContaining({
          method: "POST",
          body: expect.stringContaining('"choice":"GIU_LAI"'),
        }),
      );
    });
  });

  it("6. Xử lý mất mạng không văng trắng và hiện cảnh báo kết nối", async () => {
    window.history.pushState({}, "", "/vote?room=PHONG1");

    globalThis.fetch = vi.fn().mockRejectedValue(new Error("Failed to fetch"));

    render(<VoteScreen />);

    await waitFor(() => {
      expect(screen.getByText(content.strings["vote.connection_lost"])).toBeDefined();
    });
  });

  it("7. Có đồng hồ đếm ngược, hồ sơ nhân vật và lý lẽ hai phía khi vòng mở", async () => {
    window.history.pushState({}, "", "/vote?room=PHONG1");
    const now = Date.now();
    globalThis.fetch = vi.fn().mockImplementation((url: string) =>
      url.startsWith("/api/state")
        ? Promise.resolve({ ok: true, json: async () => ({ round: 1, open: true, turnId: "d3-t3", openedAt: now, endsAt: now + 30000 }) })
        : Promise.resolve({ ok: true, json: async () => ({ ok: true }) }),
    ) as any;

    render(<VoteScreen />);

    await waitFor(() => expect(screen.getByText(content.strings["vote.time_left"])).toBeDefined());
    expect(screen.getByText("Bà Tư Lành")).toBeDefined();
    expect(screen.getByText(content.strings["vote.read_args"])).toBeDefined();
    expect(globalThis.fetch).toHaveBeenCalledWith("/api/join", expect.objectContaining({ method: "POST" }));
  });

  it("8. Vòng đóng có kết quả: hiện tỉ lệ và cho biết mình thuộc phe nào", async () => {
    window.history.pushState({}, "", "/vote?room=PHONG1");
    localStorage.setItem("tram15_vote_PHONG1_3", "GIU_LAI");
    globalThis.fetch = vi.fn().mockImplementation((url: string) =>
      url.startsWith("/api/state")
        ? Promise.resolve({ ok: true, json: async () => ({ round: 3, open: false, turnId: "d3-t3", result: { CHO_QUA: 6, GIU_LAI: 2 } }) })
        : Promise.resolve({ ok: true, json: async () => ({ ok: true }) }),
    ) as any;

    render(<VoteScreen />);

    await waitFor(() => {
      expect(screen.getByText(content.strings["vote.result_title"])).toBeDefined();
      expect(screen.getByText(content.strings["vote.you_minority"])).toBeDefined();
    });
    expect(screen.getByText(content.strings["class.case.d3_t3.history"])).toBeDefined();
  });

  it("9. Hết giờ thì khoá hai nút", async () => {
    window.history.pushState({}, "", "/vote?room=PHONG1");
    const now = Date.now();
    globalThis.fetch = vi.fn().mockImplementation((url: string) =>
      url.startsWith("/api/state")
        ? Promise.resolve({ ok: true, json: async () => ({ round: 1, open: true, turnId: "d3-t3", openedAt: now - 60000, endsAt: now - 1000 }) })
        : Promise.resolve({ ok: true, json: async () => ({ ok: true }) }),
    ) as any;

    render(<VoteScreen />);

    await waitFor(() => expect(screen.getByText(content.strings["vote.time_up"])).toBeDefined());
    const btn = screen.getByRole("button", { name: new RegExp(content.strings["vote.stamp_approve"]) }) as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
  });
});
