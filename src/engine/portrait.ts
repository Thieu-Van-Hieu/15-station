/**
 * Chân dung của một lượt theo nhánh đời (V3): biến thể đầu tiên có `when` thoả thì thay bộ chân dung hoặc biểu cảm.
 */

import { type ConditionState, checkAll } from "./conditions";
import type { Character, Expression, Traveler } from "./types";

export function portraitFor(t: Traveler, c: Character | undefined, cs: ConditionState): { key: string; expression: Expression } {
  const baseKey = t.portrait.key ?? c?.portrait.key ?? t.character;
  const v = (t.portrait.variants ?? []).find((x) => checkAll(x.when, cs));
  return { key: v?.key ?? baseKey, expression: v?.expression ?? t.portrait.expression };
}
