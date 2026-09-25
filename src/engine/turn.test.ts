import { describe, expect, it } from "vitest";
import { gdd, goods, traveler } from "./__fixtures__";
import { gameContent, startAt } from "./__fixtures__/game";
import { type GameAction, reduce } from "./game";
import type { GameState } from "./state";
import { reprimandText } from "./turn";
import type { Action, DayId, GameContent, Traveler } from "./types";

/** Lượt ở d1 vi phạm R1 (không có GDD). */
const bad = (over: Partial<Traveler> = {}) => traveler({ id: "d1-t1", day: "d1", ...over });
/** Lượt ở d1 hợp lệ. */
const good = (over: Partial<Traveler> = {}) => traveler({ id: "d1-t1", day: "d1", documents: [gdd()], ...over });

function play(ts: Traveler[], dayId: DayId, actions: GameAction[], strings?: Record<string, string>) {
  const content = gameContent(ts, strings);
  let s = startAt(content, dayId);
  for (const a of actions) s = reduce(s, a, content);
  return { s, content };
}

const quyet = (action: Action, reasonId: string | null = null): GameAction => ({ type: "QUYET_DINH", action, reasonId });

describe("turn — 03 mục 5", () => {
  it("TRN-01 cho qua lượt có vi phạm: sai, bị nhắc nhở theo quy định vi phạm đầu tiên", () => {
    const { s, content } = play([bad()], "d1", [quyet("CHO_QUA")]);
    expect(s.log[0].correct).toBe(false);
    expect(s.total).toMatchObject({ recorded: 1, correct_recorded: 0, reprimands: 1 });
    expect(s.pendingReprimand).toEqual({ kind: "de-lot", rule: "R1-GDD" });
    expect(reprimandText(s.pendingReprimand!, content)).toBe(content.rules[0].reprimand);
  });

  it("TRN-02 cho qua lượt hợp lệ: đúng", () => {
    const { s } = play([good()], "d1", [quyet("CHO_QUA")]);
    expect(s.total).toMatchObject({ correct_total: 1, recorded: 1, correct_recorded: 1, reprimands: 0 });
    expect(s.pendingReprimand).toBeNull();
  });

  it("TRN-03 giữ lại lượt có vi phạm: đúng", () => {
    const { s } = play([bad()], "d1", [quyet("GIU_LAI")]);
    expect(s.log[0].correct).toBe(true);
  });

  it("TRN-04 giữ oan: nhắc nhở dùng chuỗi reprimand.giu_oan", () => {
    const { s, content } = play([good()], "d1", [quyet("GIU_LAI")], { "reprimand.giu_oan": "Trạm 15 giữ oan." });
    expect(s.pendingReprimand).toEqual({ kind: "giu-oan" });
    expect(reprimandText(s.pendingReprimand!, content)).toBe("Trạm 15 giữ oan.");
  });

  it("TRN-05 làm ngơ lượt có vi phạm: cấp trên không biết", () => {
    const { s } = play([bad()], "d1", [quyet("LAM_NGO")]);
    expect(s.total).toMatchObject({ lam_ngo_violations: 1, recorded: 0, reprimands: 0, correct_total: 0 });
    expect(s.pendingReprimand).toBeNull();
  });

  it("TRN-06 làm ngơ lượt hợp lệ: đúng, không ghi sổ", () => {
    const { s } = play([good()], "d1", [quyet("LAM_NGO")]);
    expect(s.total).toMatchObject({ correct_total: 1, recorded: 0, lam_ngo_violations: 0 });
  });

  it("TRN-07 giữ lại: tịch thu kg hàng, trừ đồ cá nhân", () => {
    const t = traveler({ id: "d2-t1", day: "d2", cargo: [goods("gao", 18, "LUONG_THUC"), goods("quan-ao", 2, "DO_CA_NHAN")] });
    const { s } = play([t], "d2", [quyet("GIU_LAI")]);
    expect(s.total).toMatchObject({ hang_tich_thu_kg: 18, so_vu_giu_lai: 1 });
  });

  const bribed = bad({
    flag_key: "np-dau-co-gao.m3",
    bribe: { amount: 120, lines: [{ speaker: "traveler", text: "Chút quà." }], consequence_note: "Gạo ra chợ đen." },
  });

  it("TRN-08 nhận phong bì rồi cho qua", () => {
    const { s } = play([bribed], "d1", [{ type: "NHAN_PHONG_BI" }, quyet("CHO_QUA")]);
    expect(s.total).toMatchObject({ bribes_accepted: 1, bribe_total: 120 });
    expect(s.today.bribe_total).toBe(120);
    expect(s.flags["np-dau-co-gao.m3"]).toBe("qua-tien");
  });

  it("TRN-09 đã nhận phong bì thì không được giữ lại", () => {
    const content = gameContent([bribed]);
    const s = reduce(startAt(content, "d1"), { type: "NHAN_PHONG_BI" }, content);
    expect(reduce(s, quyet("GIU_LAI"), content)).toBe(s);
  });

  it("TRN-10 làm ngơ mà lượt không khai outcomes.LAM_NGO thì dùng outcomes.CHO_QUA", () => {
    const t = bad({ outcomes: { CHO_QUA: { deltas: { gia_gao_index: 5 }, notes: [] }, GIU_LAI: { deltas: {}, notes: [] } } });
    const { s } = play([t], "d1", [quyet("LAM_NGO")]);
    expect(s.indicators.gia_gao_index).toBe(105);
  });

  describe("TRN-11 mã cờ cho từng tổ hợp", () => {
    const knTurn = traveler({ id: "d3-t1", day: "d3", flag_key: "ba-tu.m2", kn: { issue: "KN-KHOAN", note: "…" } });
    const bribeTurn = traveler({ ...bribed, id: "d3-t1", day: "d3", flag_key: "np-dau-co-gao.m2" });
    const cases: [string, Traveler, GameAction[], string][] = [
      ["qua", knTurn, [quyet("CHO_QUA")], "qua"],
      ["giu", knTurn, [quyet("GIU_LAI")], "giu"],
      ["lam-ngo", knTurn, [quyet("LAM_NGO")], "lam-ngo"],
      ["qua-kn", knTurn, [quyet("CHO_QUA", "LD-KHOAN")], "qua-kn"],
      ["giu-kn", knTurn, [quyet("GIU_LAI", "LD-KHOAN")], "giu-kn"],
      ["qua-tien", bribeTurn, [{ type: "NHAN_PHONG_BI" }, quyet("CHO_QUA")], "qua-tien"],
      ["lam-ngo-tien", bribeTurn, [{ type: "NHAN_PHONG_BI" }, quyet("LAM_NGO")], "lam-ngo-tien"],
    ];
    it.each(cases)("%s", (_name, t, actions, expected) => {
      const { s } = play([t], "d3", actions);
      expect(s.flags[t.flag_key!]).toBe(expected);
    });
  });

  it("TRN-12 biên bản không hợp lệ thì cờ không có -kn", () => {
    const t = traveler({ id: "d3-t1", day: "d3", flag_key: "ba-tu.m2", kn: { issue: "KN-KHOAN", note: "…" } });
    const { s } = play([t], "d3", [quyet("CHO_QUA", "LD-THUONG-BINH")]);
    expect(s.flags["ba-tu.m2"]).toBe("qua");
  });

  it("TRN-13 lượt không có flag_key thì không ghi cờ", () => {
    const { s } = play([good()], "d1", [quyet("CHO_QUA")]);
    expect(s.flags).toEqual({});
  });

  it("TRN-14 mỗi lượt cộng 100 phút vào đồng hồ", () => {
    const ts = [good(), good({ id: "d1-t2", order: 2 })];
    const { s } = play(ts, "d1", [quyet("CHO_QUA")]);
    expect(s.clockMin).toBe(7 * 60 + 100);
    expect(s.phase).toBe("TRAVELER");
  });

  it("giấy nhắc nhở được xoá sau lượt kế tiếp nếu lượt đó đúng", () => {
    const ts = [bad(), good({ id: "d1-t2", order: 2 })];
    const content: GameContent = gameContent(ts);
    let s: GameState = startAt(content, "d1");
    s = reduce(s, quyet("CHO_QUA"), content);
    expect(s.pendingReprimand).not.toBeNull();
    s = reduce(s, quyet("CHO_QUA"), content);
    expect(s.pendingReprimand).toBeNull();
  });
});
