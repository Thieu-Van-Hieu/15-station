/**
 * R4-KHOP-TEN — Đối chiếu hộ khẩu. 03 mục 4.5.
 * Chỉ so các giấy có trường chủ giấy / năm sinh khai trong documents.json.
 */

import { docDef, fieldOf, firstDoc, sameText } from "../compare";
import type { CheckFn } from "./context";

interface Params {
  reference_doc: "SHK";
  compare_birth_year: boolean;
}

export const checkKhopTen: CheckFn = ({ traveler, params, book }) => {
  const p = params as unknown as Params;
  const s = firstDoc(traveler, p.reference_doc);
  if (s === undefined) return ["E5"];

  const mismatch = traveler.documents.some((x) => {
    if (x === s) return false;
    const def = docDef(book.documents, x.type);

    if (def.holder_field !== null) {
      const holder = fieldOf(x, def.holder_field);
      if (typeof holder !== "string" || !sameText(holder, s.fields.ho_ten)) return true;
    }
    if (p.compare_birth_year && def.birth_year_field !== null) {
      if (fieldOf(x, def.birth_year_field) !== s.fields.nam_sinh) return true;
    }
    return false;
  });

  return mismatch ? ["E2"] : [];
};
