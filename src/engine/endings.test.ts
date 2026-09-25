import { describe, expect, it } from "vitest";
import { ENDINGS } from "./__fixtures__/game";
import { type HiddenStats, filterByWhen } from "./conditions";
import { pickEnding } from "./endings";

const stats = (over: Partial<HiddenStats>): HiddenStats => ({
  true_compliance: 1,
  reported_compliance: 1,
  valid_reports: 0,
  invalid_reports: 0,
  lam_ngo_violations: 0,
  bribes_accepted: 0,
  bribe_total: 0,
  issues_triggered: 0,
  hardship: 0,
  overtime_days: 0,
  reprimands: 0,
  ...over,
});

const pick = (over: Partial<HiddenStats>) => pickEnding(ENDINGS, stats(over)).id;

describe("endings — 03 mục 9", () => {
  it("END-01 vừa kiến nghị vừa nhận tiền vẫn là người ăn tiền", () => {
    expect(pick({ bribes_accepted: 2, valid_reports: 5, issues_triggered: 1 })).toBe("END-AN-TIEN");
  });

  it("END-02 làm ngơ 4 lần", () => {
    expect(pick({ lam_ngo_violations: 4, true_compliance: 0.8 })).toBe("END-LAM-NGO");
  });

  it("END-03 người kiến nghị không bị đòi chấp hành cao", () => {
    expect(pick({ valid_reports: 4, issues_triggered: 1, lam_ngo_violations: 1, true_compliance: 0.6 })).toBe("END-KIEN-NGHI");
  });

  it("END-04 làm ngơ 2 lần thì không còn là người kiến nghị", () => {
    expect(pick({ valid_reports: 4, issues_triggered: 1, lam_ngo_violations: 2, true_compliance: 0.6 })).toBe("END-SONG-SOT");
  });

  it("END-05 chấp hành 85%, không kiến nghị, không làm ngơ", () => {
    expect(pick({ true_compliance: 0.85 })).toBe("END-GAC-CONG");
  });

  it("END-06 chấp hành 84% thì là người sống sót", () => {
    expect(pick({ true_compliance: 0.84 })).toBe("END-SONG-SOT");
  });

  it("END-07 cảnh có when không thoả thì không hiện", () => {
    const scenes = [
      { text: "luôn hiện" },
      { text: "chỉ khi giữ bà Tư", when: [{ flag: "ba-tu.m2", in: ["giu" as const] }] },
    ];
    const shown = filterByWhen(scenes, { flags: { "ba-tu.m2": "qua" }, issuesTriggered: new Set() });
    expect(shown.map((x) => x.text)).toEqual(["luôn hiện"]);
  });
});
