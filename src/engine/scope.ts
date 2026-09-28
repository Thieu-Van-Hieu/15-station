/**
 * Phạm vi áp dụng của quy định — 03 mục 1.7, cột "Áp dụng cho".
 * Dùng để bàn làm việc gắn nhãn điều lên từng dòng hàng và để giấy nhắc nhở giữ oan nêu tên điều.
 */

import type { CargoItem, Rule } from "./types";

type Catalog = { ma: string }[];

/** Các quy định trong `rules` mà dòng hàng này thuộc phạm vi. Đồ dùng cá nhân không thuộc quy định nào về hàng. */
export function rulesForItem(rules: readonly Rule[], item: CargoItem): Rule[] {
  return rules.filter((r) => {
    if (!r.applies_to.includes(item.category)) return false;
    // Điều 3 chỉ xét thuốc có trong danh mục, Thông báo hàng cấm chỉ xét mã có trong danh mục.
    const p = r.params as { danh_muc_thuoc?: Catalog; danh_muc?: Catalog };
    const catalog = p.danh_muc_thuoc ?? p.danh_muc;
    return catalog === undefined || catalog.some((x) => x.ma === item.ma);
  });
}

/** Quy định có xét hàng hoá (khác quy định chỉ xét giấy tờ con người như Điều 4). */
export function isGoodsRule(r: Rule): boolean {
  return r.applies_to.length > 0;
}
