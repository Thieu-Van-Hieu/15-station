/**
 * Đồng hồ ca và hai bảng chỉ số cuối ngày — 03 mục 7.
 */

import type { GameState } from "./state";
import type { Day, DayId, Deltas, Indicators, IndicatorName } from "./types";

export type Grade = "XUAT_SAC" | "KHA" | "TRUNG_BINH";

export interface DayReport {
  day: DayId;
  clockEnd: number;
  overtime: boolean;
  /** Tỷ lệ chấp hành hôm nay, 0..1. Không ghi sổ lượt nào thì coi là 1. */
  rate: number;
  grade: Grade;
  heldCount: number;
  seizedKg: number;
  validReports: number;
  indicatorsStart: Indicators;
  indicatorsEnd: Indicators;
  /** Ghi chú `outcomes[action].notes` của từng lượt, theo thứ tự lượt. */
  notes: string[];
  otherFactor: string;
}

/** `"07:00"` → 420. */
export function parseClock(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

/** 1040 → `"17:20"`. */
export function formatClock(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** Cộng thay đổi vào chỉ số huyện. Chỉ số không bao giờ âm. */
export function addDeltas(indicators: Indicators, deltas: Deltas): Indicators {
  const next = { ...indicators };
  for (const [key, value] of Object.entries(deltas) as [IndicatorName, number][]) {
    next[key] = Math.max(0, next[key] + value);
  }
  return next;
}

/** % thay đổi so với đầu ngày, làm tròn, có dấu. Null nếu đầu ngày là 0. */
export function percentChange(start: number, end: number): number | null {
  if (start === 0) return null;
  return Math.round(((end - start) / start) * 100);
}

/** Xếp loại theo tỷ lệ thật (chưa làm tròn); làm ngoài giờ thì hạ một bậc. */
export function gradeFor(correctRecorded: number, recorded: number, overtime: boolean): { rate: number; grade: Grade } {
  const rate = recorded === 0 ? 1 : correctRecorded / recorded;
  const base: Grade = rate >= 0.9 ? "XUAT_SAC" : rate >= 0.7 ? "KHA" : "TRUNG_BINH";
  const grade: Grade = !overtime ? base : base === "XUAT_SAC" ? "KHA" : "TRUNG_BINH";
  return { rate, grade };
}

/** Kết thúc ca: cộng yếu tố khác, tính hai bảng, đếm ngày ngoài giờ. */
export function finishDay(state: GameState, day: Day): GameState {
  const overtime = state.clockMin > parseClock(day.clock.end);
  const { rate, grade } = gradeFor(state.today.correct_recorded, state.today.recorded, overtime);
  const indicatorsEnd = addDeltas(state.indicators, day.other_factor.deltas);

  const report: DayReport = {
    day: day.id,
    clockEnd: state.clockMin,
    overtime,
    rate,
    grade,
    heldCount: state.today.so_vu_giu_lai,
    seizedKg: state.today.hang_tich_thu_kg,
    validReports: state.today.valid_reports,
    indicatorsStart: state.indicatorsDayStart,
    indicatorsEnd,
    notes: state.log.filter((r) => r.day === day.id).flatMap((r) => r.notes),
    otherFactor: day.other_factor.text,
  };

  return {
    ...state,
    phase: "DAY_END",
    indicators: indicatorsEnd,
    overtimeDays: state.overtimeDays + (overtime ? 1 : 0),
    dayReport: report,
  };
}
