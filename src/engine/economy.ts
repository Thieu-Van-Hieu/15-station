/**
 * Chi tiêu gia đình — 03 mục 8.
 */

import type { Grade } from "./day-end";
import type { Day } from "./types";

export interface Budget {
  /** Tiền cuối ngày trước. */
  carried: number;
  /** Sau khi đổi tiền (bằng `carried` nếu ngày không đổi tiền). */
  afterReform: number;
  income: number;
  bonus: number;
  fines: number;
  /** Tiền phong bì hôm nay. Hiện thành một dòng riêng trên bảng chi tiêu. */
  bribes: number;
  /** Số tiền có thể chi, không âm. */
  available: number;
}

export function computeBudget(carried: number, day: Day, grade: Grade, reprimandsToday: number, bribesToday: number): Budget {
  const e = day.economy;
  const afterReform = e.currency_reform_divisor === undefined ? carried : Math.floor(carried / e.currency_reform_divisor);
  const bonus = grade === "XUAT_SAC" ? e.bonus_xuat_sac : 0;
  const fines = e.fine_per_error * reprimandsToday;
  const available = Math.max(0, afterReform + e.income + bonus - fines + bribesToday);
  return { carried, afterReform, income: e.income, bonus, fines, bribes: bribesToday, available };
}

/**
 * Trả các khoản đã chọn. Null nếu có mã khoản lạ, chọn trùng, hoặc tổng vượt số có thể chi.
 * Mỗi khoản thiết yếu không trả làm hardship tăng 1.
 */
export function payExpenses(budget: Budget, day: Day, ids: readonly string[]): { money: number; hardship: number } | null {
  const chosen = new Set(ids);
  if (chosen.size !== ids.length) return null;

  const expenses = day.economy.expenses;
  if (ids.some((id) => !expenses.some((x) => x.id === id))) return null;

  const spent = expenses.filter((x) => chosen.has(x.id)).reduce((sum, x) => sum + x.cost, 0);
  if (spent > budget.available) return null;

  const hardship = expenses.filter((x) => x.essential && !chosen.has(x.id)).length;
  return { money: budget.available - spent, hardship };
}
