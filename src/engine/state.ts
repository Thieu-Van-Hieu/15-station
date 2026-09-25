/**
 * Trạng thái game và các hàm tra cứu dùng chung.
 * Mọi thay đổi trạng thái đi qua reduce() trong game.ts.
 */

import { dayNumber } from "./compare";
import type { ConditionState } from "./conditions";
import type { DayReport } from "./day-end";
import type { Budget } from "./economy";
import { hiddenStats } from "./endings";
import type {
  Action,
  Day,
  DayId,
  EndingId,
  FlagValue,
  GameContent,
  Indicators,
  IssueId,
  RuleId,
  Traveler,
  TravelerId,
  Verdict,
  Violation,
} from "./types";

export type Phase = "INTRO" | "DAY_START" | "TRAVELER" | "DAY_END" | "BUDGET" | "ENDING";

/** Bộ đếm ở 03 mục 5.3. Giữ hai bản: cả game và trong ngày. */
export interface Counters {
  total: number;
  correct_total: number;
  recorded: number;
  correct_recorded: number;
  reprimands: number;
  lam_ngo_violations: number;
  so_vu_giu_lai: number;
  hang_tich_thu_kg: number;
  valid_reports: number;
  invalid_reports: number;
  bribes_accepted: number;
  bribe_total: number;
}

export function emptyCounters(): Counters {
  return {
    total: 0,
    correct_total: 0,
    recorded: 0,
    correct_recorded: 0,
    reprimands: 0,
    lam_ngo_violations: 0,
    so_vu_giu_lai: 0,
    hang_tich_thu_kg: 0,
    valid_reports: 0,
    invalid_reports: 0,
    bribes_accepted: 0,
    bribe_total: 0,
  };
}

/** Tiến độ một vấn đề kiến nghị (03 mục 6.4). */
export interface IssueProgress {
  /** Số biên bản hợp lệ. */
  count: number;
  /** Ngày chạm ngưỡng, null nếu chưa chạm. */
  triggeredOn: DayId | null;
  /** Ngày bắt đầu có hiệu lực. Null nếu chưa chạm, hoặc chạm quá muộn (không còn ngày nào sau). */
  effectiveFrom: DayId | null;
}

/** Giấy nhắc nhở chờ hiện ở lượt kế tiếp. Giao diện tự tra chữ (rules.json hoặc strings.json). */
export type Reprimand = { kind: "de-lot"; rule: RuleId } | { kind: "giu-oan" };

export interface TurnRecord {
  traveler: TravelerId;
  day: DayId;
  action: Action;
  verdict: Verdict;
  violations: Violation[];
  correct: boolean;
  recorded: boolean;
  report: { reasonId: string; issue: IssueId; valid: boolean } | null;
  bribe: number;
  flag: FlagValue | null;
  notes: string[];
}

export interface GameState {
  phase: Phase;
  dayIndex: number;
  travelerIndex: number;
  flags: Record<string, FlagValue>;
  total: Counters;
  today: Counters;
  issues: Partial<Record<IssueId, IssueProgress>>;
  indicators: Indicators;
  indicatorsDayStart: Indicators;
  /** Tiền cuối ngày trước (d1: savings_start). */
  money: number;
  /** Đồng hồ ca, tính bằng phút từ 00:00. */
  clockMin: number;
  /** Người chơi đã nhận phong bì ở lượt hiện tại. */
  bribeTaken: boolean;
  pendingReprimand: Reprimand | null;
  hardship: number;
  overtimeDays: number;
  log: TurnRecord[];
  dayReport: DayReport | null;
  budget: Budget | null;
  ending: EndingId | null;
}

// ---------------------------------------------------------------------------
// Tra cứu
// ---------------------------------------------------------------------------

export function currentDay(state: GameState, content: GameContent): Day {
  const day = content.days[state.dayIndex];
  if (day === undefined) throw new Error(`Không có ngày thứ ${state.dayIndex + 1} trong days.json`);
  return day;
}

export function travelerById(content: GameContent, id: TravelerId): Traveler {
  const t = content.travelers.find((x) => x.id === id);
  if (t === undefined) throw new Error(`travelers.json không có lượt ${id}`);
  return t;
}

export function currentTraveler(state: GameState, content: GameContent): Traveler {
  const id = currentDay(state, content).travelers[state.travelerIndex];
  if (id === undefined) throw new Error("Không còn lượt khách nào trong ngày");
  return travelerById(content, id);
}

/** Vấn đề đang có hiệu lực vào một ngày: đã chạm ngưỡng và đã tới ngày có hiệu lực. */
export function issuesActiveOn(state: GameState, day: DayId): Set<IssueId> {
  const active = new Set<IssueId>();
  for (const [id, p] of Object.entries(state.issues) as [IssueId, IssueProgress][]) {
    if (p.effectiveFrom !== null && dayNumber(p.effectiveFrom) <= dayNumber(day)) active.add(id);
  }
  return active;
}

/** Vấn đề đã chạm ngưỡng, kể cả chưa tới ngày có hiệu lực. */
export function issuesTriggered(state: GameState): Set<IssueId> {
  const triggered = new Set<IssueId>();
  for (const [id, p] of Object.entries(state.issues) as [IssueId, IssueProgress][]) {
    if (p.triggeredOn !== null) triggered.add(id);
  }
  return triggered;
}

export function conditionState(state: GameState): ConditionState {
  return { flags: state.flags, issuesTriggered: issuesTriggered(state), stats: hiddenStats(state) };
}
