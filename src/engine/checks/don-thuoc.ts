/**
 * R3-DON-THUOC — Thuốc thuộc danh mục quản lý. 03 mục 4.4.
 * Người mang đơn không cần là bệnh nhân.
 */

import { covers, docDef, firstDoc, isExpired, isSealValid } from "../compare";
import type { ErrorCode, SealKind } from "../types";
import type { CheckFn } from "./context";

interface Params {
  doc: "DT";
  seal_kinds: SealKind[];
  danh_muc_thuoc: { ma: string; ten: string }[];
}

export const checkDonThuoc: CheckFn = ({ traveler, today, params, book }) => {
  const p = params as unknown as Params;
  const managed = new Set(p.danh_muc_thuoc.map((t) => t.ma));
  const tq = traveler.cargo.filter((h) => h.category === "THUOC" && managed.has(h.ma));
  if (tq.length === 0) return [];

  const d = firstDoc(traveler, p.doc);
  if (d === undefined) return ["E5"];

  const def = docDef(book.documents, p.doc);
  const errors: ErrorCode[] = [];
  if (isExpired(d, def, today)) errors.push("E1");
  if (!isSealValid(d, p.seal_kinds, def.seal_place_field)) errors.push("E3");
  if (tq.some((h) => !covers(d.fields.thuoc, h))) errors.push("E6");
  return errors;
};
