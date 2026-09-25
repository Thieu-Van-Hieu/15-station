/**
 * Biên bản kiến nghị — 03 mục 6.
 */

import { dayNumber } from "./compare";
import type { IssueProgress } from "./state";
import type { Day, DayId, Issue, IssueId, Traveler } from "./types";

export interface ReasonOption {
  issue: IssueId;
  id: string;
  text: string;
}

/**
 * Mọi lý do của mọi vấn đề đã mở (unlock_day ≤ hôm nay), theo thứ tự trong reports.json.
 * Engine không xáo: giao diện tự xáo khi hiển thị (03 mục 6.2).
 */
export function reasonsOn(reports: readonly Issue[], day: DayId): ReasonOption[] {
  return reports
    .filter((i) => dayNumber(i.unlock_day) <= dayNumber(day))
    .flatMap((i) => i.reasons.map((r) => ({ issue: i.id, id: r.id, text: r.text })));
}

/** Ngày bắt đầu có hiệu lực khi chạm ngưỡng ở `on`. Null nếu không còn ngày nào sau. */
export function effectiveDay(issue: Issue, on: Day, days: readonly Day[]): DayId | null {
  const later = days.filter((d) => dayNumber(d.id) > dayNumber(on.id));
  const next = issue.delay === "next_day" ? later[0] : later.find((d) => d.act > on.act);
  return next?.id ?? null;
}

export interface ReportResult {
  issues: Partial<Record<IssueId, IssueProgress>>;
  issue: IssueId;
  valid: boolean;
}

/**
 * Lập một biên bản. Hợp lệ khi lượt là dịp kiến nghị và lý do thuộc đúng vấn đề của lượt.
 * Gọi hàm này sau khi đã kiểm `reasonId` có trong reasonsOn().
 */
export function fileReport(
  issues: Partial<Record<IssueId, IssueProgress>>,
  traveler: Traveler,
  reason: ReasonOption,
  reports: readonly Issue[],
  day: Day,
  days: readonly Day[],
): ReportResult {
  const valid = traveler.kn !== null && reason.issue === traveler.kn.issue;
  if (!valid) return { issues, issue: reason.issue, valid };

  const def = reports.find((i) => i.id === reason.issue);
  if (def === undefined) throw new Error(`reports.json không có vấn đề ${reason.issue}`);

  const before = issues[reason.issue] ?? { count: 0, triggeredOn: null, effectiveFrom: null };
  const count = before.count + 1;
  const reached = before.triggeredOn === null && count >= def.threshold;
  const after: IssueProgress = reached
    ? { count, triggeredOn: day.id, effectiveFrom: effectiveDay(def, day, days) }
    : { ...before, count };

  return { issues: { ...issues, [reason.issue]: after }, issue: reason.issue, valid };
}
