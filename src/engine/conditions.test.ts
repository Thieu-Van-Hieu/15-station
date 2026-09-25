import { describe, expect, it } from "vitest";
import { type ConditionState, checkAll, checkCondition } from "./conditions";
import type { HiddenStats } from "./conditions";

const state = (over: Partial<ConditionState> = {}): ConditionState => ({
  flags: {},
  issuesTriggered: new Set(),
  ...over,
});

describe("conditions — 03 mục 1.10", () => {
  it("CON-01 cờ chưa được ghi thì điều kiện sai", () => {
    expect(checkCondition({ flag: "ba-tu.m2", in: ["giu"] }, state())).toBe(false);
  });

  it("CON-02 cờ có giá trị nằm trong danh sách", () => {
    expect(checkCondition({ flag: "ba-tu.m2", in: ["giu", "giu-kn"] }, state({ flags: { "ba-tu.m2": "giu" } }))).toBe(true);
  });

  it("CON-03 'chưa kích hoạt' đúng khi vấn đề chưa chạm ngưỡng", () => {
    expect(checkCondition({ issue_triggered: "KN-KHOAN", value: false }, state())).toBe(true);
    expect(checkCondition({ issue_triggered: "KN-KHOAN", value: false }, state({ issuesTriggered: new Set(["KN-KHOAN"]) }))).toBe(false);
  });

  it("CON-04 nhiều điều kiện nối bằng VÀ", () => {
    const s = state({ flags: { "ba-tu.m2": "qua" } });
    expect(checkAll([{ flag: "ba-tu.m2", in: ["qua"] }, { issue_triggered: "KN-KHOAN", value: true }], s)).toBe(false);
    expect(checkAll(undefined, s)).toBe(true);
  });

  it("CON-05 điều kiện theo chỉ số ẩn", () => {
    const stats = { bribe_total: 120 } as HiddenStats;
    expect(checkCondition({ stat: "bribe_total", op: ">", value: 0 }, state({ stats }))).toBe(true);
  });
});
