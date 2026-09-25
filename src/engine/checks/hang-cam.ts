/**
 * R6-HANG-CAM — Danh mục hàng cấm lưu thông (d6). 03 mục 4.8.
 * Vi phạm không gắn mã lỗi: error = null.
 */

import type { CheckFn } from "./context";

interface Params {
  danh_muc: { ma: string; ten: string }[];
}

export const checkHangCam: CheckFn = ({ traveler, params }) => {
  const p = params as unknown as Params;
  const banned = new Set(p.danh_muc.map((h) => h.ma));
  return traveler.cargo.some((h) => banned.has(h.ma)) ? [null] : [];
};
