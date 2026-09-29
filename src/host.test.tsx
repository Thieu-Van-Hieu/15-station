// @vitest-environment jsdom
import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { HostScreen } from "./screens/HostScreen";
import { content } from "./content";

describe("HostScreen (Projector host display & manual fallback - Step 3)", () => {
  beforeEach(() => {
    localStorage.clear();
    window.history.pushState({}, "", "/host?room=TEST1");
    vi.restoreAllMocks();
  });

  afterEach(() => {
    cleanup();
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("1. Hiển thị tiêu đề máy chiếu, mã phòng và nút về game", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        round: 0,
        open: false,
        votes: { CHO_QUA: 0, GIU_LAI: 0 },
        total: 0,
      }),
    } as any);

    render(<HostScreen />);

    expect(screen.getByText(content.strings["host.title"])).toBeDefined();
    expect(screen.getByText(content.strings["host.back_game"])).toBeDefined();
    expect(screen.getAllByText(new RegExp("TEST1")).length).toBeGreaterThan(0);
  });

  it("2. Hiển thị liên kết bỏ phiếu và hỗ trợ sao chép liên kết", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        round: 0,
        open: false,
        votes: { CHO_QUA: 0, GIU_LAI: 0 },
        total: 0,
      }),
    } as any);

    // Mock clipboard
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });

    render(<HostScreen />);

    const copyBtn = screen.getByRole("button", { name: content.strings["host.copy_link"] });
    expect(copyBtn).toBeDefined();

    fireEvent.click(copyBtn);

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        expect.stringContaining("/vote?room=TEST1")
      );
    });
  });

  it("3. Cập nhật kết quả bình chọn theo thời gian thực từ /api/tally", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        round: 1,
        open: true,
        turnId: "d3-t3",
        question: "Cả lớp quyết định cho bà Tư?",
        votes: {
          CHO_QUA: 30,
          GIU_LAI: 10,
        },
        total: 40,
      }),
    } as any);

    render(<HostScreen />);

    await waitFor(() => {
      // 30 / 40 = 75%
      expect(screen.getByText("75%")).toBeDefined();
      // 10 / 40 = 25%
      expect(screen.getByText("25%")).toBeDefined();
      expect(screen.getByText(content.strings["host.result_approve_wins"])).toBeDefined();
    });
  });

  it("4. Gọi API mở vòng bỏ phiếu khi bấm Mở bỏ phiếu", async () => {
    let currentRound = 0;
    let isOpen = false;

    globalThis.fetch = vi.fn().mockImplementation((url, init) => {
      const urlStr = String(url);
      if (urlStr.includes("/api/tally")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            round: currentRound,
            open: isOpen,
            votes: { CHO_QUA: 0, GIU_LAI: 0 },
            total: 0,
          }),
        });
      }
      if (urlStr.includes("/api/round")) {
        const body = JSON.parse(init.body);
        if (body.action === "open") {
          currentRound = 1;
          isOpen = true;
          return Promise.resolve({
            ok: true,
            json: async () => ({ success: true, round: 1, open: true }),
          });
        }
      }
      return Promise.reject(new Error("Unknown URL"));
    });

    render(<HostScreen />);

    const openBtn = screen.getByRole("button", { name: content.strings["host.open_round"] });
    fireEvent.click(openBtn);

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith(
        "/api/round",
        expect.objectContaining({
          method: "POST",
          body: expect.stringContaining('"action":"open"'),
        })
      );
    });
  });

  it("5. Gọi API chốt vòng khi bấm Chốt kết quả", async () => {
    globalThis.fetch = vi.fn().mockImplementation((url, init) => {
      const urlStr = String(url);
      if (urlStr.includes("/api/tally")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            round: 2,
            open: true,
            votes: { CHO_QUA: 15, GIU_LAI: 15 },
            total: 30,
          }),
        });
      }
      if (urlStr.includes("/api/round")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ success: true, round: 2, open: false }),
        });
      }
      return Promise.reject(new Error("Unknown URL"));
    });

    render(<HostScreen />);

    // Đợi round mở hiển thị nút Chốt
    const closeBtn = await screen.findByRole("button", { name: content.strings["host.close_round"] });
    fireEvent.click(closeBtn);

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith(
        "/api/round",
        expect.objectContaining({
          method: "POST",
          body: expect.stringContaining('"action":"close"'),
        })
      );
    });
  });

  it("6. Đường lui nhập tay (Khẩn cấp): Bỏ qua mạng, lập tức tính tỷ lệ và công bố đa số trong <10s", async () => {
    // Giả lập mạng bị đơ hoặc API lỗi
    globalThis.fetch = vi.fn().mockRejectedValue(new Error("Network failed"));

    render(<HostScreen />);

    // Nhập số tay: CHO QUA = 40, GIỮ LẠI = 10
    const approveInputs = screen.getAllByRole("spinbutton");
    const approveInput = approveInputs[0];
    const rejectInput = approveInputs[1];

    fireEvent.change(approveInput, { target: { value: "40" } });
    fireEvent.change(rejectInput, { target: { value: "10" } });

    const applyManualBtn = screen.getByRole("button", { name: content.strings["host.manual_apply"] });
    fireEvent.click(applyManualBtn);

    // Kiểm tra ngay kết quả lập tức được cập nhật: 40/50 = 80%, 10/50 = 20%
    await waitFor(() => {
      expect(screen.getByText("80%")).toBeDefined();
      expect(screen.getByText("20%")).toBeDefined();
      expect(screen.getByText(content.strings["host.manual_applied"])).toBeDefined();
      expect(screen.getByText(content.strings["host.result_approve_wins"])).toBeDefined();
    });

    // Có thể quay lại trực tuyến khi cần
    const resetManualBtn = screen.getByRole("button", { name: content.strings["host.manual_reset"] });
    fireEvent.click(resetManualBtn);

    await waitFor(() => {
      expect(screen.queryByText(content.strings["host.manual_applied"])).toBeNull();
    });
  });
});
