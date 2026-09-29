// @vitest-environment jsdom
import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { DeskScreen } from "./screens/DeskScreen";
import { content } from "./content";
import { newGame } from "./engine/game";

describe("Game Loop Host Voting Integration (Step 4)", () => {
  const d3 = content.days.find((d) => d.id === "d3")!;
  const d3t3Traveler = content.travelers.find((t) => t.id === "d3-t3")!; // dung-trinh-bay

  beforeEach(() => {
    localStorage.clear();
    window.history.pushState({}, "", "/");
    vi.restoreAllMocks();
  });

  afterEach(() => {
    cleanup();
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("1. Chế độ đơn (không bật host): game chạy bình thường, có nút tuỳ chọn bật host ở lượt dung-trinh-bay", () => {
    const gameState = newGame(content);
    const onDecide = vi.fn();
    const onNext = vi.fn();

    render(
      <DeskScreen
        state={gameState}
        day={d3}
        traveler={d3t3Traveler}
        currentTravelerOrder={3}
        totalTravelersInDay={4}
        onDecide={onDecide}
        onNext={onNext}
      />
    );

    // Ở chế độ đơn, hiện banner thông báo điểm dừng kèm nút bật host
    expect(screen.getByText(content.strings["host.present_stop"])).toBeDefined();
    expect(screen.getByRole("button", { name: content.strings["host.enable_now"] })).toBeDefined();

    // Các nút đóng dấu thông thường vẫn hoạt động bình thường
    const approveBtn = screen.getByRole("button", { name: new RegExp(content.strings["desk.stamp.approve"]) });
    expect(approveBtn).toBeDefined();
    expect((approveBtn as HTMLButtonElement).disabled).toBe(false);
  });

  it("2. Khi bật Host qua URL (?host=1): tự động mở vòng bỏ phiếu cho lượt dung-trinh-bay và khoá nút đóng dấu thường", async () => {
    window.history.pushState({}, "", "/?host=1&room=T15");

    globalThis.fetch = vi.fn().mockImplementation((url) => {
      const urlStr = String(url);
      if (urlStr.includes("/api/round")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ success: true, round: 1, open: true }),
        });
      }
      if (urlStr.includes("/api/tally")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            round: 1,
            open: true,
            votes: { CHO_QUA: 0, GIU_LAI: 0 },
            total: 0,
          }),
        });
      }
      return Promise.reject(new Error("Unknown URL"));
    });

    const gameState = newGame(content);
    const onDecide = vi.fn();
    const onNext = vi.fn();

    render(
      <DeskScreen
        state={gameState}
        day={d3}
        traveler={d3t3Traveler}
        currentTravelerOrder={3}
        totalTravelersInDay={4}
        onDecide={onDecide}
        onNext={onNext}
      />
    );

    // Mở vòng bỏ phiếu qua API
    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith(
        "/api/round",
        expect.objectContaining({
          method: "POST",
          body: expect.stringContaining('"action":"open"'),
        })
      );
    });

    // Màn hình hiện bảng bỏ phiếu lớp học
    expect(screen.getByText(content.strings["host.waiting_class"])).toBeDefined();
    expect(screen.getByRole("button", { name: content.strings["host.close_round"] })).toBeDefined();

    // Trong khi cả lớp đang bỏ phiếu, nút đóng dấu thường bị vô hiệu hoá
    const approveBtn = screen.getByRole("button", { name: new RegExp(content.strings["desk.stamp.approve"]) });
    expect((approveBtn as HTMLButtonElement).disabled).toBe(true);
  });

  it("3. Tự động đóng dấu theo đa số khi chốt kết quả (CHO QUA thắng)", async () => {
    window.history.pushState({}, "", "/?host=1&room=T15");

    let isRoundOpen = true;

    globalThis.fetch = vi.fn().mockImplementation((url, init) => {
      const urlStr = String(url);
      if (urlStr.includes("/api/round")) {
        const body = JSON.parse(init.body);
        if (body.action === "close") {
          isRoundOpen = false;
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ success: true, round: 1, open: isRoundOpen }),
        });
      }
      if (urlStr.includes("/api/tally")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            round: 1,
            open: isRoundOpen,
            votes: { CHO_QUA: 25, GIU_LAI: 5 },
            total: 30,
          }),
        });
      }
      return Promise.reject(new Error("Unknown URL"));
    });

    const gameState = newGame(content);
    const onDecide = vi.fn();
    const onNext = vi.fn();

    render(
      <DeskScreen
        state={gameState}
        day={d3}
        traveler={d3t3Traveler}
        currentTravelerOrder={3}
        totalTravelersInDay={4}
        onDecide={onDecide}
        onNext={onNext}
      />
    );

    // Chờ bảng bỏ phiếu tải xong và bấm chốt
    const closeBtn = await screen.findByRole("button", { name: content.strings["host.close_round"] });
    fireEvent.click(closeBtn);

    // Đa số CHO_QUA -> tự động hiển thị đã đóng dấu CHO_QUA
    await waitFor(() => {
      expect(screen.getByText(content.strings["host.auto_stamped_approve"])).toBeDefined();
    });

    // Nút Lượt kế tiếp hiển thị để tiếp tục ván chơi
    const nextBtn = screen.getByRole("button", { name: content.strings["desk.next_traveler"] });
    expect(nextBtn).toBeDefined();
    fireEvent.click(nextBtn);

    await waitFor(() => {
      expect(onDecide).toHaveBeenCalledWith("CHO_QUA", null, false);
      expect(onNext).toHaveBeenCalled();
    });
  });

  it("4. Đường lui nhập tay ngay tại bàn: Tính nhanh đa số và tự động đóng dấu trong <10s", async () => {
    window.history.pushState({}, "", "/?host=1&room=T15");

    // Giả lập mạng bị ngắt
    globalThis.fetch = vi.fn().mockRejectedValue(new Error("Network offline"));

    const gameState = newGame(content);
    const onDecide = vi.fn();
    const onNext = vi.fn();

    render(
      <DeskScreen
        state={gameState}
        day={d3}
        traveler={d3t3Traveler}
        currentTravelerOrder={3}
        totalTravelersInDay={4}
        onDecide={onDecide}
        onNext={onNext}
      />
    );

    // Mở phần đường lui nhập tay bằng predicate tìm text chính xác
    const summary = await screen.findByText((text) =>
      text.includes(content.strings["host.manual_title"])
    );
    fireEvent.click(summary);

    // Nhập số tay: CHO QUA = 5, GIỮ LẠI = 30
    const inputs = screen.getAllByRole("spinbutton");
    fireEvent.change(inputs[0], { target: { value: "5" } });
    fireEvent.change(inputs[1], { target: { value: "30" } });

    // Bấm dùng số nhập tay
    const applyBtn = screen.getByRole("button", { name: content.strings["host.manual_apply"] });
    fireEvent.click(applyBtn);

    // Ngay lập tức tự động đóng dấu GIU_LAI
    await waitFor(() => {
      expect(screen.getByText(content.strings["host.auto_stamped_reject"])).toBeDefined();
    });

    const nextBtn = screen.getByRole("button", { name: content.strings["desk.next_traveler"] });
    fireEvent.click(nextBtn);

    await waitFor(() => {
      expect(onDecide).toHaveBeenCalledWith("GIU_LAI", null, false);
      expect(onNext).toHaveBeenCalled();
    });
  });

  it("5. Hoà phiếu: Hiện thông báo và trao quyền quyết định lại cho Host", async () => {
    window.history.pushState({}, "", "/?host=1&room=T15");

    let isRoundOpen = true;

    globalThis.fetch = vi.fn().mockImplementation((url, init) => {
      const urlStr = String(url);
      if (urlStr.includes("/api/round")) {
        const body = JSON.parse(init.body);
        if (body.action === "close") {
          isRoundOpen = false;
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ success: true, round: 1, open: isRoundOpen }),
        });
      }
      if (urlStr.includes("/api/tally")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            round: 1,
            open: isRoundOpen,
            votes: { CHO_QUA: 15, GIU_LAI: 15 },
            total: 30,
          }),
        });
      }
      return Promise.reject(new Error("Unknown URL"));
    });

    const gameState = newGame(content);
    const onDecide = vi.fn();
    const onNext = vi.fn();

    render(
      <DeskScreen
        state={gameState}
        day={d3}
        traveler={d3t3Traveler}
        currentTravelerOrder={3}
        totalTravelersInDay={4}
        onDecide={onDecide}
        onNext={onNext}
      />
    );

    const closeBtn = await screen.findByRole("button", { name: content.strings["host.close_round"] });
    fireEvent.click(closeBtn);

    // Hiện thông báo hoà phiếu
    await waitFor(() => {
      expect(screen.getByText(content.strings["host.tie_decide_hint"])).toBeDefined();
    });
    expect(onDecide).not.toHaveBeenCalled();
  });
});
