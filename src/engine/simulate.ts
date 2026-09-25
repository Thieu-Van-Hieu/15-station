/**
 * Chơi tự động theo một chiến lược. Dùng cho:
 * - unit test (P2), bot chơi thử trong validate tầng 3 (P5),
 * - chế độ nhảy lượt `?tu=dX-tY` của giao diện (P6).
 */

import { type Evaluation, evaluate } from "./evaluate";
import { type GameAction, newGame, reduce } from "./game";
import { type ReasonOption, reasonsOn } from "./reports";
import { type GameState, currentDay, currentTraveler, issuesActiveOn } from "./state";
import type { Action, Day, GameContent, Traveler, TravelerId } from "./types";

export interface StrategyInput {
  state: GameState;
  day: Day;
  traveler: Traveler;
  /** Đáp án theo sổ ở trạng thái hiện tại. */
  evaluation: Evaluation;
  reasons: ReasonOption[];
}

export interface StrategyChoice {
  takeBribe?: boolean;
  action: Action;
  reasonId?: string | null;
}

export type Strategy = (input: StrategyInput) => StrategyChoice;

/** Luôn làm đúng theo sổ, không kiến nghị, không nhận phong bì. */
export const followRulebook: Strategy = ({ evaluation }) => ({ action: evaluation.verdict });

/** Trả các khoản thiết yếu theo thứ tự, khoản nào không đủ tiền thì bỏ. */
export function payEssentialsInOrder(state: GameState, content: GameContent): string[] {
  let left = state.budget?.available ?? 0;
  const ids: string[] = [];
  for (const x of currentDay(state, content).economy.expenses) {
    if (x.essential && x.cost <= left) {
      ids.push(x.id);
      left -= x.cost;
    }
  }
  return ids;
}

export interface SimulateOptions {
  /** Dừng ngay trước khi quyết định lượt này (chế độ nhảy lượt). */
  stopAt?: TravelerId;
  expenses?: (state: GameState, content: GameContent) => string[];
}

export function simulate(content: GameContent, strategy: Strategy, options: SimulateOptions = {}): GameState {
  const pay = options.expenses ?? payEssentialsInOrder;
  let state = newGame(content);
  const limit = 20 + content.travelers.length * 3 + content.days.length * 4;

  for (let step = 0; step < limit; step += 1) {
    let action: GameAction;

    switch (state.phase) {
      case "ENDING":
        return state;
      case "INTRO":
        action = { type: "BAT_DAU_GAME" };
        break;
      case "DAY_START":
        action = { type: "BAT_DAU_NGAY" };
        break;
      case "DAY_END":
        action = { type: "KET_THUC_NGAY" };
        break;
      case "BUDGET":
        action = { type: "TRA_CHI_TIEU", expenseIds: pay(state, content) };
        break;
      case "TRAVELER": {
        const day = currentDay(state, content);
        const traveler = currentTraveler(state, content);
        if (traveler.id === options.stopAt) return state;

        const choice = strategy({
          state,
          day,
          traveler,
          evaluation: evaluate(traveler, day, content, issuesActiveOn(state, day.id)),
          reasons: reasonsOn(content.reports, day.id),
        });
        if (choice.takeBribe === true) state = reduce(state, { type: "NHAN_PHONG_BI" }, content);
        action = { type: "QUYET_DINH", action: choice.action, reasonId: choice.reasonId ?? null };
        break;
      }
    }

    const next = reduce(state, action, content);
    if (next === state) throw new Error(`Mô phỏng bị kẹt ở phase ${state.phase}: hành động ${action.type} bị từ chối`);
    state = next;
  }

  throw new Error("Mô phỏng vượt quá số bước cho phép");
}
