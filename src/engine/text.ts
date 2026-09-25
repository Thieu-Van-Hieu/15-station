/**
 * Biến trong chữ — 03 mục 1.13.
 * `{{bribe_total}}`, `{{valid_reports}}`, `{{hang_tich_thu_kg}}`, `{{day_label}}`, `{{kn_remaining:KN-KHOAN}}`.
 */

import { currentDay, type GameState } from "./state";
import type { GameContent } from "./types";

const VARIABLE = /\{\{([a-z_]+(?::[A-Z0-9-]+)?)\}\}/g;

/** Thay các biến có trong `vars`. Biến không có thì giữ nguyên để validate phát hiện. */
export function fillText(template: string, vars: Readonly<Record<string, string | number>>): string {
  return template.replace(VARIABLE, (whole, name: string) => (name in vars ? String(vars[name]) : whole));
}

/** Tên các biến xuất hiện trong một chuỗi. */
export function listVariables(template: string): string[] {
  return [...template.matchAll(VARIABLE)].map((m) => m[1]);
}

export function textVars(state: GameState, content: GameContent): Record<string, string | number> {
  const vars: Record<string, string | number> = {
    bribe_total: state.total.bribe_total,
    valid_reports: state.total.valid_reports,
    hang_tich_thu_kg: state.total.hang_tich_thu_kg,
    day_label: currentDay(state, content).label,
  };
  for (const issue of content.reports) {
    const count = state.issues[issue.id]?.count ?? 0;
    vars[`kn_remaining:${issue.id}`] = Math.max(0, issue.threshold - count);
  }
  return vars;
}
