/**
 * Reducer tổng của game. Luồng màn hình: 07-trien-khai.md mục 3.4.
 *
 *   INTRO → DAY_START → TRAVELER × N → DAY_END → BUDGET → (ngày sau: DAY_START | hết d6: ENDING)
 *
 * Hành động không hợp lệ với phase hiện tại trả về đúng state cũ (cùng tham chiếu).
 */

import { finishDay, parseClock } from "./day-end";
import { computeBudget, payExpenses } from "./economy";
import { hiddenStats, pickEnding } from "./endings";
import { CONFRONT_WRONG_MIN, confront } from "./confront";
import { type GameState, conditionState, currentDay, currentTraveler, emptyCounters } from "./state";
import { type Decision, canTakeBribe, decide } from "./turn";
import type { Action, GameContent, Indicators } from "./types";

export type GameAction =
  | { type: "BAT_DAU_GAME" }
  | { type: "BAT_DAU_NGAY" }
  | { type: "NHAN_PHONG_BI" }
  | { type: "QUYET_DINH"; action: Action; reasonId: string | null }
  /** Đối chất hai chỗ đã khoanh (V8). Không đổi đáp án; đối chất sai tốn thời gian ca. */
  | { type: "DOI_CHAT"; a: string; b: string }
  | { type: "KET_THUC_NGAY" }
  | { type: "TRA_CHI_TIEU"; expenseIds: string[] };

const ZERO: Indicators = { luong_thuc_vao_thi_xa: 0, ho_thieu_an: 0, gia_gao_index: 0 };

export function newGame(content: GameContent): GameState {
  const d1 = content.days[0];
  if (d1 === undefined) throw new Error("days.json rỗng");
  const indicators = d1.indicators_start ?? ZERO;

  return enterDay(
    {
      phase: "INTRO",
      dayIndex: 0,
      travelerIndex: 0,
      flags: {},
      total: emptyCounters(),
      today: emptyCounters(),
      issues: {},
      indicators,
      indicatorsDayStart: indicators,
      money: d1.savings_start ?? 0,
      clockMin: 0,
      bribeTaken: false,
      pendingReprimand: null,
      hardship: 0,
      fatigue: 0,
      overtimeDays: 0,
      log: [],
      dayReport: null,
      budget: null,
      ending: null,
    },
    content,
    0,
  );
}

/** Chuẩn bị đầu ngày: đặt lại bộ đếm trong ngày, đồng hồ, chỉ số đầu ngày. */
function enterDay(state: GameState, content: GameContent, dayIndex: number): GameState {
  const day = content.days[dayIndex];
  return {
    ...state,
    dayIndex,
    travelerIndex: 0,
    today: emptyCounters(),
    indicatorsDayStart: state.indicators,
    clockMin: parseClock(day.clock.start),
    bribeTaken: false,
    dayReport: null,
    budget: null,
  };
}

export function reduce(state: GameState, action: GameAction, content: GameContent): GameState {
  switch (action.type) {
    case "BAT_DAU_GAME":
      return state.phase === "INTRO" ? { ...state, phase: "DAY_START" } : state;

    case "BAT_DAU_NGAY": {
      if (state.phase !== "DAY_START") return state;
      const day = currentDay(state, content);
      // Ngày không có lượt nào (chỉ gặp trong dữ liệu thử) thì chuyển thẳng sang cuối ngày.
      return day.travelers.length === 0 ? finishDay(state, day) : { ...state, phase: "TRAVELER" };
    }

    case "NHAN_PHONG_BI":
      return canTakeBribe(state, content) ? { ...state, bribeTaken: true } : state;

    case "QUYET_DINH": {
      const decision: Decision = { action: action.action, reasonId: action.reasonId };
      return decide(state, content, decision) ?? state;
    }

    case "DOI_CHAT": {
      if (state.phase !== "TRAVELER") return state;
      const r = confront(currentTraveler(state, content), content.documents, action.a, action.b);
      const bump = (c: GameState["total"]) => ({
        ...c,
        doi_chat: (c.doi_chat ?? 0) + 1,
        doi_chat_dung: (c.doi_chat_dung ?? 0) + (r.found ? 1 : 0),
      });
      return {
        ...state,
        total: bump(state.total),
        today: bump(state.today),
        clockMin: state.clockMin + (r.found ? 0 : CONFRONT_WRONG_MIN),
        turnConfrontFound: state.turnConfrontFound === true || r.found,
      };
    }

    case "KET_THUC_NGAY": {
      if (state.phase !== "DAY_END" || state.dayReport === null) return state;
      const budget = computeBudget(
        state.money,
        currentDay(state, content),
        state.dayReport.grade,
        state.today.reprimands,
        state.today.bribe_total,
      );
      return { ...state, phase: "BUDGET", budget };
    }

    case "TRA_CHI_TIEU": {
      if (state.phase !== "BUDGET" || state.budget === null) return state;
      const paid = payExpenses(state.budget, currentDay(state, content), action.expenseIds, state.hardship, conditionState(state));
      if (paid === null) return state;

      const after: GameState = {
        ...state,
        money: paid.money,
        hardship: state.hardship + paid.hardship,
        fatigue: paid.hardship,
      };
      const nextIndex = state.dayIndex + 1;
      if (nextIndex < content.days.length) return { ...enterDay(after, content, nextIndex), phase: "DAY_START" };

      return { ...after, phase: "ENDING", ending: pickEnding(content.endings, hiddenStats(after)).id };
    }
  }
}
