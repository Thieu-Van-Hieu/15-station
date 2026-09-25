import type { ErrorCode, RuleBook, RuleId, Traveler } from "../types";

export interface CheckContext {
  traveler: Traveler;
  /** Ngày trong game, `YYYY-MM-DD`. */
  today: string;
  /** `params` của quy định đang chạy, lấy nguyên từ rules.json. */
  params: Record<string, unknown>;
  book: RuleBook;
  /** Mã các quy định đang hiệu lực. R2 cần biết R5K có hiệu lực không. */
  active: ReadonlySet<RuleId>;
}

/**
 * Một hàm kiểm tra trả về các mã lỗi mà quy định đó sinh ra cho lượt này,
 * mỗi mã tối đa một lần. `null` là vi phạm không gắn mã lỗi (R6).
 */
export type CheckFn = (ctx: CheckContext) => (ErrorCode | null)[];
