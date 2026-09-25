/**
 * R2-DINH-MUC — Định mức lương thực, gồm cả phần nới hạn mức của R5K-KHOAN.
 * 03 mục 4.3 và 4.7.
 */

import { docDef, docsOf, firstDoc, isExpired, isSealValid, sameGoods, sameText } from "../compare";
import type { CargoItem, Rule, SealKind } from "../types";
import type { CheckContext, CheckFn } from "./context";

interface Params {
  max_kg: number;
  count_valid_tem_phieu: boolean;
}

interface KhoanParams {
  doc: "GXNK";
  seal_kinds: SealKind[];
  seal_place_field: string;
  require_holder_match: boolean;
}

const R5K = "R5K-KHOAN";

export const checkDinhMuc: CheckFn = (ctx) => {
  const { traveler, params } = ctx;
  const p = params as unknown as Params;

  const lt = traveler.cargo.filter((h) => h.category === "LUONG_THUC" && h.don_vi === "kg");
  const total = lt.reduce((sum, h) => sum + h.so_luong, 0);
  if (total === 0) return [];

  let limit = p.max_kg;
  if (p.count_valid_tem_phieu) limit += temPhieuAllowance(ctx, lt);
  if (ctx.active.has(R5K)) limit += khoanAllowance(ctx, lt);

  return total > limit ? ["E4"] : [];
};

/** Tem phiếu còn giá trị trong tháng, dấu hợp lệ, mặt hàng khớp một dòng lương thực. Không hợp lệ thì chỉ không được cộng. */
function temPhieuAllowance({ traveler, today, book }: CheckContext, lt: CargoItem[]): number {
  const def = docDef(book.documents, "TP");
  return docsOf(traveler, "TP")
    .filter(
      (tp) =>
        !isExpired(tp, def, today) &&
        isSealValid(tp, def.allowed_seal_kinds, def.seal_place_field) &&
        lt.some((h) => sameGoods(h, tp.fields.mat_hang)),
    )
    .reduce((sum, tp) => sum + tp.fields.mat_hang.so_luong, 0);
}

/** Giấy xác nhận sản phẩm khoán, chỉ tính khi R5K-KHOAN đang hiệu lực. */
function khoanAllowance({ traveler, book }: CheckContext, lt: CargoItem[]): number {
  const rule = book.rules.find((r: Rule) => r.id === R5K);
  if (rule === undefined) return 0;
  const p = rule.params as unknown as KhoanParams;
  const gdd = firstDoc(traveler, "GDD");

  return docsOf(traveler, p.doc)
    .filter(
      (k) =>
        isSealValid(k, p.seal_kinds, p.seal_place_field) &&
        lt.some((h) => h.ma === k.fields.san_pham_ma) &&
        (!p.require_holder_match || (gdd !== undefined && sameText(gdd.fields.ho_ten, k.fields.ho_ten))),
    )
    .reduce((sum, k) => sum + k.fields.so_luong_kg, 0);
}
