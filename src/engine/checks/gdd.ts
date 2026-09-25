/**
 * R1-GDD — Giấy đi đường. 03 mục 4.2.
 */

import { covers, docDef, fieldOf, firstDoc, isExpired, isSealValid } from "../compare";
import type { Category, ErrorCode, Item, SealKind } from "../types";
import type { CheckFn } from "./context";

interface Params {
  doc: "GDD";
  seal_kinds: SealKind[];
  seal_place_field: string;
  declare_field: string;
  exempt_categories: Category[];
}

export const checkGdd: CheckFn = ({ traveler, today, params, book }) => {
  const p = params as unknown as Params;
  const g = firstDoc(traveler, p.doc);
  if (g === undefined) return ["E5"];

  const errors: ErrorCode[] = [];
  if (isExpired(g, docDef(book.documents, p.doc), today)) errors.push("E1");
  if (!isSealValid(g, p.seal_kinds, p.seal_place_field)) errors.push("E3");

  const declared = (fieldOf(g, p.declare_field) ?? []) as Item[];
  const undeclared = traveler.cargo.some(
    (h) => !p.exempt_categories.includes(h.category) && !covers(declared, h),
  );
  if (undeclared) errors.push("E6");

  return errors;
};
