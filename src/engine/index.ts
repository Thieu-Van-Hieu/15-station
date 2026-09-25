/**
 * API công khai của engine cho giao diện và scripts/.
 */

export * from "./types";
export { activeRules } from "./active";
export { evaluate, type Evaluation } from "./evaluate";
export { checkAll, filterByWhen, type ConditionState, type HiddenStats } from "./conditions";
export { newGame, reduce, type GameAction } from "./game";
export {
  conditionState,
  currentDay,
  currentTraveler,
  issuesActiveOn,
  issuesTriggered,
  type Counters,
  type GameState,
  type IssueProgress,
  type Phase,
  type Reprimand,
  type TurnRecord,
} from "./state";
export { allowedActions, canReport, canTakeBribe, reprimandText } from "./turn";
export { reasonsOn, type ReasonOption } from "./reports";
export { formatClock, percentChange, type DayReport, type Grade } from "./day-end";
export { type Budget } from "./economy";
export { hiddenStats, pickEnding } from "./endings";
export { fillText, listVariables, textVars } from "./text";
export { followRulebook, simulate, type Strategy, type StrategyChoice, type StrategyInput } from "./simulate";
