/**
 * Chỉ số ẩn và chọn kết cục — 03 mục 9.
 */

import { compareStat, type HiddenStats } from "./conditions";
import type { GameState, IssueProgress } from "./state";
import type { Ending } from "./types";

export function hiddenStats(state: GameState): HiddenStats {
  const t = state.total;
  const triggered = (Object.values(state.issues) as IssueProgress[]).filter((p) => p.triggeredOn !== null).length;
  return {
    true_compliance: t.total === 0 ? 1 : t.correct_total / t.total,
    // Câu hỏi mở số 2 (07 mục 9): chưa ghi sổ lượt nào thì coi là 1, giống tỷ lệ trong ngày.
    reported_compliance: t.recorded === 0 ? 1 : t.correct_recorded / t.recorded,
    valid_reports: t.valid_reports,
    invalid_reports: t.invalid_reports,
    lam_ngo_violations: t.lam_ngo_violations,
    bribes_accepted: t.bribes_accepted,
    bribe_total: t.bribe_total,
    issues_triggered: triggered,
    hardship: state.hardship,
    overtime_days: state.overtimeDays,
    reprimands: t.reprimands,
  };
}

/** Xét theo priority tăng dần, lấy kết cục đầu tiên thoả mọi điều kiện. */
export function pickEnding(endings: readonly Ending[], stats: HiddenStats): Ending {
  const sorted = [...endings].sort((a, b) => a.priority - b.priority);
  const found = sorted.find((e) => e.conditions.every((c) => compareStat(stats[c.stat], c.op, c.value)));
  if (found === undefined) throw new Error("Không kết cục nào thoả; endings.json phải có END-SONG-SOT không điều kiện");
  return found;
}
