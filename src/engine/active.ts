/**
 * Quy định đang hiệu lực — 03 mục 4.1.
 */

import { dayNumber } from "./compare";
import type { DayId, IssueId, Rule } from "./types";

export function activeRules(rules: readonly Rule[], day: DayId, issuesActive: ReadonlySet<IssueId>): Rule[] {
  const n = dayNumber(day);
  return rules.filter(
    (r) =>
      dayNumber(r.day_from) <= n &&
      n <= dayNumber(r.day_to) &&
      (r.condition === null || issuesActive.has(r.condition.issue_triggered)),
  );
}
