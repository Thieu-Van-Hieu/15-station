/**
 * Quy ước so sánh — 03 mục 2.2.
 */

import type { DayId, DocType, DocOf, DocumentDef, Item, SealKind, Traveler, TravelerDocument } from "./types";

/** Chuẩn hoá NFC, bỏ khoảng trắng đầu cuối, gộp khoảng trắng liên tiếp. Giữ dấu và hoa thường. */
export function normalizeText(s: string): string {
  return s.normalize("NFC").trim().replace(/\s+/g, " ");
}

export function sameText(a: string, b: string): boolean {
  return normalizeText(a) === normalizeText(b);
}

/** Ngày `YYYY-MM-DD`. Hạn đúng bằng hôm nay thì vẫn còn hạn. */
export function isPastDate(today: string, validUntil: string): boolean {
  return today > validUntil;
}

/** `YYYY-MM-DD` → `YYYY-MM`. */
export function monthOf(date: string): string {
  return date.slice(0, 7);
}

/** `d3` → 3. */
export function dayNumber(id: DayId): number {
  return Number(id.slice(1));
}

/** Hai dòng hàng khớp khi cùng mã và cùng đơn vị. */
export function sameGoods(a: Pick<Item, "ma" | "don_vi">, b: Pick<Item, "ma" | "don_vi">): boolean {
  return a.ma === b.ma && a.don_vi === b.don_vi;
}

/** Danh sách hàng trên giấy "phủ" một dòng hàng: có dòng cùng mã, cùng đơn vị, số lượng lớn hơn hoặc bằng. */
export function covers(declared: readonly Item[], goods: Item): boolean {
  return declared.some((d) => sameGoods(d, goods) && d.so_luong >= goods.so_luong);
}

/** Đọc một trường của giấy theo tên, dùng cho các trường khai báo trong documents.json. */
export function fieldOf(doc: TravelerDocument, key: string): unknown {
  return (doc.fields as Record<string, unknown>)[key];
}

/**
 * Dấu hợp lệ: khác null, đọc được, đúng loại, và nếu loại giấy có trường kiểm nơi
 * đóng dấu thì nơi đóng dấu phải bằng giá trị trường đó.
 */
export function isSealValid(
  doc: TravelerDocument,
  kinds: readonly SealKind[],
  placeField: string | null,
): boolean {
  const seal = doc.seal;
  if (seal === null || !seal.legible || !kinds.includes(seal.kind)) return false;
  if (placeField === null) return true;
  const place = fieldOf(doc, placeField);
  return typeof place === "string" && sameText(seal.place, place);
}

/** Giấy hết hạn theo cách hạn của loại giấy (ngày, tháng, hoặc không có hạn). */
export function isExpired(doc: TravelerDocument, def: DocumentDef, today: string): boolean {
  if (def.expiry_field === null || def.expiry_kind === "none") return false;
  const value = fieldOf(doc, def.expiry_field);
  if (typeof value !== "string") return true;
  return def.expiry_kind === "month" ? value !== monthOf(today) : isPastDate(today, value);
}

export function docDef(documents: readonly DocumentDef[], type: DocType): DocumentDef {
  const def = documents.find((d) => d.code === type);
  if (def === undefined) throw new Error(`documents.json không có loại giấy ${type}`);
  return def;
}

export function docsOf<T extends DocType>(traveler: Traveler, type: T): DocOf<T>[] {
  return traveler.documents.filter((d): d is DocOf<T> => d.type === type);
}

export function firstDoc<T extends DocType>(traveler: Traveler, type: T): DocOf<T> | undefined {
  return docsOf(traveler, type)[0];
}
