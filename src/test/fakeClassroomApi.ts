/**
 * Máy chủ giả cho test phiên bỏ phiếu lớp học: giữ trạng thái phòng trong bộ nhớ và trả lời như các endpoint trong `api/`.
 */
import { vi } from "vitest";

type Choice = "CHO_QUA" | "GIU_LAI";

export function fakeClassroomApi(opts: { joined?: number; failRound?: boolean } = {}) {
  const room = {
    round: 0,
    open: false,
    turnId: "",
    endsAt: undefined as number | undefined,
    counts: { CHO_QUA: 0, GIU_LAI: 0 } as Record<Choice, number>,
    joined: opts.joined ?? 0,
  };
  const bodies: { url: string; body: Record<string, unknown> }[] = [];

  const reply = (data: unknown, status = 200) =>
    Promise.resolve({ ok: status < 400, status, json: async () => data } as Response);

  const fetch = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    const body = init?.body ? (JSON.parse(String(init.body)) as Record<string, unknown>) : {};
    bodies.push({ url, body });
    const total = room.counts.CHO_QUA + room.counts.GIU_LAI;

    if (url.startsWith("/api/tally")) {
      return reply({ round: room.round, open: room.open, turnId: room.turnId, counts: { ...room.counts }, total, joined: room.joined, endsAt: room.endsAt });
    }
    if (url.startsWith("/api/round")) {
      if (opts.failRound) return Promise.reject(new Error("Network failed"));
      if (body.action === "open") {
        room.round += 1;
        room.open = true;
        room.turnId = String(body.turnId ?? "");
        room.counts = { CHO_QUA: 0, GIU_LAI: 0 };
        room.endsAt = typeof body.seconds === "number" ? Date.now() + body.seconds * 1000 : undefined;
        return reply({ ok: true, round: room.round, open: true, turnId: room.turnId, endsAt: room.endsAt });
      }
      room.open = false;
      return reply({ ok: true, round: room.round, open: false, counts: { ...room.counts }, total });
    }
    if (url.startsWith("/api/state")) {
      return reply({ round: room.round, open: room.open, turnId: room.turnId, endsAt: room.endsAt, ...(room.open ? {} : { result: room.counts, closedAt: Date.now() }) });
    }
    if (url.startsWith("/api/join")) return reply({ ok: true });
    return Promise.reject(new Error(`Unknown URL ${url}`));
  });

  /** Giả lập n điện thoại bỏ phiếu. */
  function vote(choice: Choice, n = 1) {
    room.counts[choice] += n;
  }

  return { fetch, room, bodies, vote };
}
