import { describe, expect, it } from "vitest";
import { gdd, goods, gxnk, item, shk, traveler } from "./__fixtures__";
import { REPORTS, gameContent, startAt } from "./__fixtures__/game";
import { activeRules } from "./active";
import { hiddenStats } from "./endings";
import { evaluate } from "./evaluate";
import { type GameAction, reduce } from "./game";
import { effectiveDay, reasonsOn } from "./reports";
import { simulate } from "./simulate";
import { conditionState, currentDay, currentTraveler, issuesActiveOn } from "./state";
import type { DayId, IssueId, Traveler } from "./types";

const quyet = (action: "CHO_QUA" | "GIU_LAI" | "LAM_NGO", reasonId: string | null = null): GameAction => ({
  type: "QUYET_DINH",
  action,
  reasonId,
});

const knTurns = (d: DayId, n: number, issue: IssueId = "KN-KHOAN"): Traveler[] =>
  Array.from({ length: n }, (_, i) =>
    traveler({ id: `${d}-t${i + 1}` as Traveler["id"], day: d, order: i + 1, kn: { issue, note: "…" } }),
  );

function run(ts: Traveler[], d: DayId, actions: GameAction[]) {
  const content = gameContent(ts);
  let s = startAt(content, d);
  for (const a of actions) s = reduce(s, a, content);
  return { s, content };
}

describe("reports — 03 mục 6", () => {
  it("REP-01 không lập biên bản được ở d1, d2, d6", () => {
    for (const d of ["d1", "d2", "d6"] as DayId[]) {
      const content = gameContent([traveler({ id: `${d}-t1` as Traveler["id"], day: d })]);
      const s = startAt(content, d);
      expect(reduce(s, quyet("GIU_LAI", "LD-KHOAN"), content), d).toBe(s);
    }
  });

  it("REP-02 không kèm biên bản với làm ngơ", () => {
    const content = gameContent(knTurns("d3", 1));
    const s = startAt(content, "d3");
    expect(reduce(s, quyet("LAM_NGO", "LD-KHOAN"), content)).toBe(s);
  });

  it("REP-03 biên bản đúng vấn đề là hợp lệ", () => {
    const { s } = run(knTurns("d3", 1), "d3", [quyet("GIU_LAI", "LD-KHOAN")]);
    expect(s.total).toMatchObject({ valid_reports: 1, invalid_reports: 0 });
    expect(s.issues["KN-KHOAN"]?.count).toBe(1);
    expect(s.log[0].report).toEqual({ reasonId: "LD-KHOAN", issue: "KN-KHOAN", valid: true });
  });

  it("REP-04 lý do thuộc vấn đề khác là không hợp lệ", () => {
    const { s } = run(knTurns("d3", 1), "d3", [quyet("GIU_LAI", "LD-THUONG-BINH")]);
    expect(s.total).toMatchObject({ valid_reports: 0, invalid_reports: 1 });
    expect(s.issues).toEqual({});
  });

  it("REP-05 lượt không phải dịp kiến nghị thì biên bản không hợp lệ", () => {
    const { s } = run([traveler({ id: "d3-t1", day: "d3" })], "d3", [quyet("GIU_LAI", "LD-KHOAN")]);
    expect(s.total.invalid_reports).toBe(1);
  });

  it("REP-06 biên bản không hợp lệ vẫn tốn 60 phút", () => {
    const ts = [traveler({ id: "d3-t1", day: "d3" }), traveler({ id: "d3-t2", day: "d3", order: 2 })];
    const { s } = run(ts, "d3", [quyet("GIU_LAI", "LD-KHOAN")]);
    expect(s.clockMin).toBe(7 * 60 + 100 + 60);
  });

  it("REP-07 chạm ngưỡng ở d3 thì R5K có hiệu lực từ d5", () => {
    const { s, content } = run(knTurns("d3", 3), "d3", [1, 2, 3].map(() => quyet("GIU_LAI", "LD-KHOAN")));
    expect(s.issues["KN-KHOAN"]).toEqual({ count: 3, triggeredOn: "d3", effectiveFrom: "d5" });
    expect(issuesActiveOn(s, "d4").has("KN-KHOAN")).toBe(false);
    expect(activeRules(content.rules, "d5", issuesActiveOn(s, "d5")).map((r) => r.id)).toContain("R5K-KHOAN");
    expect(hiddenStats(s).issues_triggered).toBe(1);
  });

  it("REP-07b kiến nghị đủ ở màn 2 thì lượt mang giấy khoán ở d5 được cho qua", () => {
    const khoan = traveler({
      id: "d5-t1",
      day: "d5",
      documents: [gdd({ hang_mang_theo: [item("gao", 18)] }), shk(), gxnk()],
      cargo: [goods("gao", 18, "LUONG_THUC")],
    });
    const content = gameContent([...knTurns("d3", 3), khoan]);
    const reportAll = simulate(content, ({ traveler: t }) => ({ action: "GIU_LAI", reasonId: t.kn ? "LD-KHOAN" : null }), {
      stopAt: "d5-t1",
    });
    const silent = simulate(content, () => ({ action: "GIU_LAI" }), { stopAt: "d5-t1" });

    const verdictOf = (s: typeof silent) =>
      evaluate(currentTraveler(s, content), currentDay(s, content), content, issuesActiveOn(s, "d5")).verdict;
    expect(verdictOf(reportAll)).toBe("CHO_QUA");
    expect(verdictOf(silent)).toBe("GIU_LAI");
  });

  it("REP-08 chạm ngưỡng ở d5 thì hiệu lực từ d6, R5K không bao giờ bật", () => {
    const { s, content } = run(knTurns("d5", 3), "d5", [1, 2, 3].map(() => quyet("GIU_LAI", "LD-KHOAN")));
    expect(s.issues["KN-KHOAN"]).toMatchObject({ triggeredOn: "d5", effectiveFrom: "d6" });
    expect(activeRules(content.rules, "d6", issuesActiveOn(s, "d6")).map((r) => r.id)).toEqual(["R6-HANG-CAM"]);
  });

  it("REP-09 biên bản thứ 4 không làm tăng số vấn đề đã kích hoạt", () => {
    const { s } = run(knTurns("d4", 4), "d4", [1, 2, 3, 4].map(() => quyet("GIU_LAI", "LD-KHOAN")));
    expect(s.issues["KN-KHOAN"]).toEqual({ count: 4, triggeredOn: "d4", effectiveFrom: "d5" });
    expect(hiddenStats(s).issues_triggered).toBe(1);
  });

  it("REP-10 KN-THUONG-BINH chỉ có hiệu ứng tường thuật", () => {
    const { s, content } = run(knTurns("d3", 3, "KN-THUONG-BINH"), "d3", [1, 2, 3].map(() => quyet("GIU_LAI", "LD-THUONG-BINH")));
    expect(conditionState(s).issuesTriggered.has("KN-THUONG-BINH")).toBe(true);
    expect(activeRules(content.rules, "d5", issuesActiveOn(s, "d5")).map((r) => r.id)).not.toContain("R5K-KHOAN");
  });

  it("REP-11 danh sách lý do gồm mọi vấn đề đã mở", () => {
    expect(reasonsOn(REPORTS, "d3").map((r) => r.id)).toEqual(["LD-KHOAN", "LD-THUONG-BINH"]);
    expect(reasonsOn(REPORTS, "d2")).toEqual([]);
  });

  it("delay next_day có hiệu lực từ ngày kế tiếp", () => {
    const content = gameContent([]);
    const issue = { ...REPORTS[0], delay: "next_day" as const };
    expect(effectiveDay(issue, content.days[2], content.days)).toBe("d4");
    expect(effectiveDay(REPORTS[0], content.days[2], content.days)).toBe("d5");
    expect(effectiveDay(REPORTS[0], content.days[5], content.days)).toBeNull();
  });
});
