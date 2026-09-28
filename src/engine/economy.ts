/**
 * Chi tiêu gia đình — 03 mục 8.
 */

import type { Grade } from "./day-end";
import type { Day, Expense } from "./types";

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

/** Mỗi điểm mệt làm mỗi lượt khách hôm sau chậm thêm chừng này phút (03 mục 8.3). */
export const FATIGUE_MIN_PER_POINT = 10;

/** Ngưỡng hardship của ba mức leo thang gia đình (03 mục 8.4). */
export const FAMILY_THRESHOLDS = [2, 5, 8] as const;

/** Mức leo thang gia đình 0–3 theo hardship cộng dồn. */
export function familyLevel(hardship: number): 0 | 1 | 2 | 3 {
  return FAMILY_THRESHOLDS.filter((t) => hardship >= t).length as 0 | 1 | 2 | 3;
}

/** Số người trong nhà trước khi Hoà đưa con về quê: Thành, Hoà, mẹ, Mai, Bình. */
const HOUSEHOLD_SIZE = 5;

/**
 * Các khoản chi thực tế của ngày. Từ mức 3 cả nhà đã về quê: bỏ các khoản của từng người,
 * khoản chung (gạo, chất đốt) chỉ còn phần của một mình Thành.
 */
export function expensesFor(day: Day, hardship: number): Expense[] {
  if (familyLevel(hardship) < 3) return day.economy.expenses;
  return day.economy.expenses
    .filter((x) => x.member === undefined || x.member === null)
    .map((x) => ({ ...x, cost: Math.ceil(x.cost / HOUSEHOLD_SIZE) }));
}

/**
 * Trả các khoản đã chọn. Null nếu có mã khoản lạ, chọn trùng, hoặc tổng vượt số có thể chi.
 * Mỗi khoản thiết yếu không trả làm hardship tăng 1.
 */
export function payExpenses(
  budget: Budget,
  day: Day,
  ids: readonly string[],
  hardshipSoFar = 0,
): { money: number; hardship: number } | null {
  const chosen = new Set(ids);
  if (chosen.size !== ids.length) return null;

  const expenses = expensesFor(day, hardshipSoFar);
  if (ids.some((id) => !expenses.some((x) => x.id === id))) return null;

  const spent = expenses.filter((x) => chosen.has(x.id)).reduce((sum, x) => sum + x.cost, 0);
  if (spent > budget.available) return null;

  const hardship = expenses.filter((x) => x.essential && !chosen.has(x.id)).length;
  return { money: budget.available - spent, hardship };
}
