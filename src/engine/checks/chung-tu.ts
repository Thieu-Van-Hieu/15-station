/**
 * R5-CHUNG-TU — Chứng từ hàng hoá. 03 mục 4.6.
 * Giấy hết hạn hoặc sai dấu vừa sinh lỗi riêng, vừa không được tính là phủ hàng.
 */

import { covers, docDef, fieldOf, isExpired, isSealValid } from "../compare";
import type { Category, DocType, ErrorCode, Item } from "../types";
import type { CheckFn } from "./context";

interface Params {
  categories: Category[];
  accepted_docs: DocType[];
}

export const checkChungTu: CheckFn = ({ traveler, today, params, book }) => {
  const p = params as unknown as Params;
  const hh = traveler.cargo.filter((h) => p.categories.includes(h.category));
  if (hh.length === 0) return [];

  const ct = traveler.documents.filter((d) => p.accepted_docs.includes(d.type));
  if (ct.length === 0) return ["E5"];

  const status = ct.map((c) => {
    const def = docDef(book.documents, c.type);
    return {
      doc: c,
      expired: isExpired(c, def, today),
      sealOk: isSealValid(c, def.allowed_seal_kinds, def.seal_place_field),
    };
  });

  const errors: ErrorCode[] = [];
  if (status.some((s) => s.expired)) errors.push("E1");
  if (status.some((s) => !s.sealOk)) errors.push("E3");

  const valid = status.filter((s) => !s.expired && s.sealOk).map((s) => s.doc);
  const uncovered = hh.some((h) => !valid.some((c) => covers((fieldOf(c, "mat_hang") ?? []) as Item[], h)));
  if (uncovered) errors.push("E6");

  return errors;
};
