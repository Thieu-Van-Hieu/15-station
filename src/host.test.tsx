// @vitest-environment jsdom
import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { HostScreen } from "./screens/HostScreen";
import { content } from "./content";
import { fakeClassroomApi } from "./test/fakeClassroomApi";

const t = content.strings;

describe("Màn máy chiếu /host (P4)", { timeout: 15000 }, () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem("tram15_host_token", "test-host-token");
    window.history.pushState({}, "", "/host?room=TEST1");
  });

  afterEach(() => {
    cleanup();
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("H-01 phòng chờ: mã phòng to, đường dẫn ngắn, mã QR phóng to được, nút về game", async () => {
    globalThis.fetch = fakeClassroomApi({ joined: 7 }).fetch as never;
    render(<HostScreen />);

    expect(screen.getAllByText("TEST1").length).toBeGreaterThan(0);
    expect(screen.getByText(`${window.location.host}/vote`)).toBeDefined();
    expect(screen.getByRole("link", { name: t["host.back_game"] }).getAttribute("href")).toBe("/");
    await waitFor(() => expect(screen.getByText("7")).toBeDefined());

    fireEvent.click(screen.getByTitle(t["class.qr_zoom"]));
    expect(screen.getByTitle(t["class.qr_close"])).toBeDefined();
  });

  it("H-02 đổi lượt thì hồ sơ và câu hỏi tự đổi theo, không phải gõ tay", () => {
    globalThis.fetch = fakeClassroomApi().fetch as never;
    render(<HostScreen />);

    expect(screen.getByText(t["class.case.d3_t3.question"])).toBeDefined();
    fireEvent.change(screen.getByLabelText(t["host.turn_label"]), { target: { value: "d5-t4" } });
    expect(screen.getByText(t["class.case.d5_t4.question"])).toBeDefined();
  });

  it("H-03 mở vòng, đếm phiếu, chốt và công bố tỉ lệ", async () => {
    const api = fakeClassroomApi();
    globalThis.fetch = api.fetch as never;
    render(<HostScreen />);

    fireEvent.click(screen.getByRole("button", { name: t["class.start"] }));
    await screen.findByRole("button", { name: t["class.close_now"] });
    expect(api.bodies.find((b) => b.url === "/api/round")!.body).toMatchObject({ room: "TEST1", action: "open", turnId: "d3-t3", seconds: 45 });

    api.vote("CHO_QUA", 3);
    api.vote("GIU_LAI", 1);
    fireEvent.click(screen.getByRole("button", { name: t["class.close_now"] }));

    await waitFor(() => {
      expect(screen.getByText("75%")).toBeDefined();
      expect(screen.getByText("25%")).toBeDefined();
      expect(screen.getByText(t["class.verdict"])).toBeDefined();
    }, { timeout: 3000 });
    // Trang /host không đóng dấu, chỉ cho mở lại phòng chờ.
    expect(screen.queryByRole("button", { name: new RegExp(t["class.apply"]) })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: t["class.again"] }));
    expect(screen.getByRole("button", { name: t["class.start"] })).toBeDefined();
  });

  it("H-04 bàn game mở vòng cho lượt khác thì màn chiếu tự chuyển theo", async () => {
    const api = fakeClassroomApi();
    Object.assign(api.room, { round: 4, open: true, turnId: "d5-t1", endsAt: Date.now() + 30000 });
    globalThis.fetch = api.fetch as never;
    render(<HostScreen />);

    await screen.findByText(t["class.case.d5_t1.question"]);
    await screen.findByRole("button", { name: t["class.close_now"] });
  });

  it("H-05 đường lui nhập tay: mất mạng vẫn công bố ngay", async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error("Network failed")) as never;
    render(<HostScreen />);

    const [approve, reject] = screen.getAllByRole("spinbutton");
    fireEvent.change(approve, { target: { value: "40" } });
    fireEvent.change(reject, { target: { value: "10" } });
    fireEvent.click(screen.getByRole("button", { name: t["host.manual_apply"] }));

    expect(screen.getByText(t["class.manual_note"])).toBeDefined();
    await waitFor(() => {
      expect(screen.getByText("80%")).toBeDefined();
      expect(screen.getByText("20%")).toBeDefined();
    }, { timeout: 3000 });
  });

  it("H-06 sai token: hiện ô nhập token thay cho nút bắt đầu", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: false, status: 401, json: async () => ({}) }) as never;
    render(<HostScreen />);
    await screen.findByText(t["class.token_title"]);
    expect(screen.queryByRole("button", { name: t["class.start"] })).toBeNull();
  });
});
