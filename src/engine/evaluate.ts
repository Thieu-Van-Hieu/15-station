/**
 * Chấm một lượt theo sổ chỉ thị — 03 mục 4.9.
 *
 * Hàm thuần: scripts/validate-data.ts tầng 3 gọi đúng hàm này. Nhận `issuesActive`
 * thay vì cả GameState để tầng 3 chấm được một lượt d5 trong cả hai trạng thái KN-KHOAN.
 */

import { activeRules } from "./active";
import { CHECKS } from "./checks";
import type { Day, IssueId, RuleBook, Traveler, Verdict, Violation } from "./types";

export interface Evaluation {
  verdict: Verdict;
  /** Theo thứ tự quy định trong rules.json, không trùng cặp (rule, error). */
  violations: Violation[];
}

export function evaluate(
  traveler: Traveler,
  day: Pick<Day, "id" | "game_date">,
  book: RuleBook,
  issuesActive: ReadonlySet<IssueId>,
): Evaluation {
  const active = activeRules(book.rules, day.id, issuesActive);
  const activeIds = new Set(active.map((r) => r.id));
  const seen = new Set<string>();
  const violations: Violation[] = [];

  for (const rule of active) {
    const check = CHECKS[rule.check];
    if (check === undefined) throw new Error(`Quy định ${rule.id} dùng hàm kiểm tra không tồn tại: ${rule.check}`);

    const errors = check({ traveler, today: day.game_date, params: rule.params, book, active: activeIds });
    for (const error of errors) {
      const key = `${rule.id}|${error}`;
      if (seen.has(key)) continue;
      seen.add(key);
      violations.push({ rule: rule.id, error });
    }
  }

  return { verdict: violations.length === 0 ? "CHO_QUA" : "GIU_LAI", violations };
}
