/**
 * Bảng tra: giá trị `check` trong rules.json → hàm kiểm tra.
 */

import type { CheckName } from "../types";
import { checkChungTu } from "./chung-tu";
import type { CheckFn } from "./context";
import { checkDinhMuc } from "./dinh-muc";
import { checkDonThuoc } from "./don-thuoc";
import { checkGdd } from "./gdd";
import { checkHangCam } from "./hang-cam";
import { checkKhopTen } from "./khop-ten";

export type { CheckContext, CheckFn } from "./context";

export const CHECKS: Record<CheckName, CheckFn> = {
  GDD_HOP_LE: checkGdd,
  DINH_MUC_LUONG_THUC: checkDinhMuc,
  DON_THUOC: checkDonThuoc,
  KHOP_TEN: checkKhopTen,
  CHUNG_TU_HANG_HOA: checkChungTu,
  // R5K không tự sinh lỗi, chỉ nới hạn mức — phần đó nằm trong checkDinhMuc.
  MIEN_DINH_MUC_KHOAN: () => [],
  HANG_CAM: checkHangCam,
};
