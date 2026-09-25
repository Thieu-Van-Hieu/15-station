/**
 * Điều kiện `when` của lời thoại, lời chen giữa, cảnh kết — 03 mục 1.10.
 * Nhiều điều kiện trong một mảng nối bằng VÀ.
 */

import type { Condition, FlagValue, IssueId, StatCondition, StatName } from "./types";

export type HiddenStats = Record<StatName, number>;

export interface ConditionState {
  flags: Readonly<Record<string, FlagValue>>;
  /** Vấn đề đã chạm ngưỡng, tính từ lúc chạm, không đợi ngày có hiệu lực. */
  issuesTriggered: ReadonlySet<IssueId>;
  /** Chỉ cần cho điều kiện theo chỉ số ẩn (endings.json). */
  stats?: HiddenStats;
}

export function compareStat(actual: number, op: StatCondition["op"], expected: number): boolean {
  switch (op) {
    case ">=":
      return actual >= expected;
    case "<=":
      return actual <= expected;
    case ">":
      return actual > expected;
    case "<":
      return actual < expected;
    case "==":
      return actual === expected;
  }
}

export function checkCondition(c: Condition, s: ConditionState): boolean {
  if ("flag" in c) {
    const value = s.flags[c.flag];
    return value !== undefined && c.in.includes(value);
  }
  if ("issue_triggered" in c) return s.issuesTriggered.has(c.issue_triggered) === c.value;
  if (s.stats === undefined) throw new Error(`Điều kiện theo chỉ số "${c.stat}" cần stats`);
  return compareStat(s.stats[c.stat], c.op, c.value);
}

export function checkAll(when: readonly Condition[] | undefined, s: ConditionState): boolean {
  return (when ?? []).every((c) => checkCondition(c, s));
}

/** Giữ các phần tử có `when` thoả (hoặc không có `when`). */
export function filterByWhen<T extends { when?: Condition[] }>(items: readonly T[], s: ConditionState): T[] {
  return items.filter((x) => checkAll(x.when, s));
}
