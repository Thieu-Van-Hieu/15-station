// @vitest-environment jsdom
import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { DeskScreen } from "./screens/DeskScreen";
import { content } from "./content";
import { newGame } from "./engine/game";
import { fakeClassroomApi } from "./test/fakeClassroomApi";

const t = content.strings;

describe("Hội đồng lớp học tại bàn game (P4)", { timeout: 15000 }, () => {
  const d3 = content.days.find((d) => d.id === "d3")!;
  const d3t3 = content.travelers.find((x) => x.id === "d3-t3")!; // lượt dung-trinh-bay

  beforeEach(() => {
    localStorage.clear();
    // Không có token mặc định trong bundle: người chủ trì nhập một lần, lưu ở localStorage.
    localStorage.setItem("tram15_host_token", "test-host-token");
    window.history.pushState({}, "", "/");
  });

  afterEach(() => {
    cleanup();
    localStorage.clear();
    vi.restoreAllMocks();
  });

  function renderDesk() {
    const onDecide = vi.fn();
    const onNext = vi.fn();
    render(
      <DeskScreen state={newGame(content)} day={d3} traveler={d3t3} currentTravelerOrder={3} totalTravelersInDay={4} onDecide={onDecide} onNext={onNext} />,
    );
    return { onDecide, onNext };
  }

  const stampApprove = () => screen.getByRole("button", { name: new RegExp(t["desk.stamp.approve"]) }) as HTMLButtonElement;

  /** Lớp phủ đóng lại, dấu nằm trên bàn; bấm "lượt kế tiếp" thì quyết định được ghi. */
  async function commit(onDecide: ReturnType<typeof vi.fn>, verdict: string) {
    await waitFor(() => expect(screen.queryByRole("dialog", { name: t["class.title"] })).toBeNull());
    fireEvent.click(await screen.findByRole("button", { name: t["desk.next_traveler"] }));
    await waitFor(() => expect(onDecide).toHaveBeenCalledWith(verdict, null, false));
  }

  async function startVoting() {
    fireEvent.click(await screen.findByRole("button", { name: t["class.start"] }));
    await screen.findByRole("button", { name: t["class.close_now"] });
  }

  it("HG-01 chế độ đơn: không có lớp phủ, có nút bật hội đồng, dấu thường vẫn dùng được", () => {
    renderDesk();
    expect(screen.getByText(t["host.present_stop"])).toBeDefined();
    expect(screen.getByRole("button", { name: t["host.enable_now"] })).toBeDefined();
    expect(screen.queryByRole("dialog", { name: t["class.title"] })).toBeNull();
    expect(stampApprove().disabled).toBe(false);
  });

  it("HG-02 bật host: phòng chờ có mã phòng, số người đã vào, hồ sơ và câu hỏi tự điền; chưa mở vòng khi chưa bấm", async () => {
    window.history.pushState({}, "", "/?host=1&room=T15");
    const api = fakeClassroomApi({ joined: 12 });
    globalThis.fetch = api.fetch as never;
    renderDesk();

    expect(screen.getByRole("dialog", { name: t["class.title"] })).toBeDefined();
    expect(screen.getByText(t["class.case.d3_t3.question"])).toBeDefined();
    expect(screen.getByText(t["class.case.d3_t3.fact2"])).toBeDefined();
    await waitFor(() => expect(screen.getByText("12")).toBeDefined());
    expect(api.bodies.some((b) => b.url === "/api/round")).toBe(false);
    // Lúc lớp đang quyết, dấu thường bị khoá
    expect(stampApprove().disabled).toBe(true);
  });

  it("HG-03 bắt đầu: mở vòng kèm thời gian và câu hỏi của hồ sơ, hiện đồng hồ và số phiếu, giấu tỉ lệ", async () => {
    window.history.pushState({}, "", "/?host=1&room=T15");
    const api = fakeClassroomApi({ joined: 3 });
    globalThis.fetch = api.fetch as never;
    renderDesk();

    fireEvent.click(screen.getByRole("button", { name: "60s" }));
    await startVoting();

    const open = api.bodies.find((b) => b.url === "/api/round")!.body;
    expect(open).toMatchObject({ room: "T15", action: "open", turnId: "d3-t3", seconds: 60, question: t["class.case.d3_t3.question"] });
    expect(screen.getByText(t["class.hidden"])).toBeDefined();

    api.vote("CHO_QUA", 2);
    await waitFor(() => expect(screen.getByText("2")).toBeDefined());
    expect(screen.queryByText("100%")).toBeNull();
  });

  it("HG-04 chốt sớm: công bố kết quả rồi đóng dấu theo lớp khi người trình bày bấm", async () => {
    window.history.pushState({}, "", "/?host=1&room=T15");
    const api = fakeClassroomApi();
    globalThis.fetch = api.fetch as never;
    const { onDecide } = renderDesk();

    await startVoting();
    api.vote("CHO_QUA", 3);
    api.vote("GIU_LAI", 1);
    fireEvent.click(screen.getByRole("button", { name: t["class.close_now"] }));

    const apply = await screen.findByRole("button", { name: new RegExp(t["class.apply"]) }, { timeout: 3000 });
    expect(screen.getByText(t["class.case.d3_t3.history"])).toBeDefined();
    expect(screen.getByText(t["class.case.d3_t3.discuss"])).toBeDefined();
    fireEvent.click(apply);
    await commit(onDecide, "CHO_QUA");
  });

  it("HG-05 hết giờ thì tự chốt", async () => {
    window.history.pushState({}, "", "/?host=1&room=T15");
    const api = fakeClassroomApi();
    globalThis.fetch = api.fetch as never;
    renderDesk();

    await startVoting();
    api.vote("GIU_LAI", 2);
    // Đẩy giờ kết thúc về quá khứ: đồng hồ về 0 và phiên tự đóng vòng.
    api.room.endsAt = Date.now() - 1;
    await waitFor(() => expect(api.bodies.some((b) => b.url === "/api/round" && b.body.action === "close")).toBe(true), { timeout: 3000 });
  });

  it("HG-06 đường lui nhập tay: không cần mạng vẫn công bố và đóng dấu", async () => {
    window.history.pushState({}, "", "/?host=1&room=T15");
    globalThis.fetch = vi.fn().mockRejectedValue(new Error("Network failed")) as never;
    const { onDecide } = renderDesk();

    const [approve, reject] = screen.getAllByRole("spinbutton");
    fireEvent.change(approve, { target: { value: "10" } });
    fireEvent.change(reject, { target: { value: "30" } });
    fireEvent.click(screen.getByRole("button", { name: t["host.manual_apply"] }));

    expect(screen.getByText(t["class.manual_note"])).toBeDefined();
    fireEvent.click(await screen.findByRole("button", { name: new RegExp(t["class.apply"]) }, { timeout: 3000 }));
    await commit(onDecide, "GIU_LAI");
  });

  it("HG-07 hoà phiếu: người trực tự chọn dấu trong lớp phủ", async () => {
    window.history.pushState({}, "", "/?host=1&room=T15");
    const api = fakeClassroomApi();
    globalThis.fetch = api.fetch as never;
    const { onDecide } = renderDesk();

    await startVoting();
    api.vote("CHO_QUA", 2);
    api.vote("GIU_LAI", 2);
    fireEvent.click(screen.getByRole("button", { name: t["class.close_now"] }));

    await screen.findByText(t["class.tie_hint"], undefined, { timeout: 3000 });
    expect(onDecide).not.toHaveBeenCalled();
    const dialog = screen.getByRole("dialog", { name: t["class.title"] });
    const reject = Array.from(dialog.querySelectorAll("button")).find((b) => b.textContent === t["vote.stamp_reject"])!;
    fireEvent.click(reject);
    await commit(onDecide, "GIU_LAI");
  });

  it("HG-08 chưa có token: hiện ô nhập token ngay trong lớp phủ, lưu xong thì bấm được bắt đầu", async () => {
    localStorage.removeItem("tram15_host_token");
    window.history.pushState({}, "", "/?host=1&room=T15");
    globalThis.fetch = fakeClassroomApi().fetch as never;
    renderDesk();

    expect(screen.queryByRole("button", { name: t["class.start"] })).toBeNull();
    fireEvent.change(screen.getByLabelText(t["class.token_title"]), { target: { value: "abc" } });
    fireEvent.click(screen.getByRole("button", { name: t["host.token_save"] }));
    expect(localStorage.getItem("tram15_host_token")).toBe("abc");
    await screen.findByRole("button", { name: t["class.start"] });
  });

  it("HG-09 thu nhỏ để xem giấy tờ rồi mở lại; bỏ qua thì mở khoá dấu thường", async () => {
    window.history.pushState({}, "", "/?host=1&room=T15");
    globalThis.fetch = fakeClassroomApi().fetch as never;
    renderDesk();

    fireEvent.click(screen.getByRole("button", { name: t["class.minimize"] }));
    expect(screen.queryByRole("dialog", { name: t["class.title"] })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: t["class.restore"] }));
    expect(screen.getByRole("dialog", { name: t["class.title"] })).toBeDefined();

    fireEvent.click(screen.getByRole("button", { name: t["class.skip"] }));
    expect(screen.queryByRole("dialog", { name: t["class.title"] })).toBeNull();
    expect(stampApprove().disabled).toBe(false);
  });
});
