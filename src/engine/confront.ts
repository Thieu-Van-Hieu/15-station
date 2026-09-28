/**
 * Đối chất (V8) — 03 mục 5.5.
 *
 * Người chơi khoanh hai chỗ trên bàn (một trường trên giấy, một dòng hàng thực mang theo…) rồi bấm "Đối chiếu".
 * Engine so hai chỗ: lệch thật thì là đối chất đúng; khớp nhau, hoặc hai chỗ không so được với nhau,
 * thì là đối chất sai và mất thời gian ca. Đối chất không đổi đáp án của lượt.
 */

import { docDef, fieldOf, sameText } from "./compare";
import { type ConditionState, filterByWhen } from "./conditions";
import type { DocumentDef, Item, Line, Traveler } from "./types";

/** Đối chất sai (hai chỗ khớp nhau hoặc không so được) tốn chừng này phút ca. */
export const CONFRONT_WRONG_MIN = 15;

export type FactKind = "name" | "year" | "item" | "list" | "other";

export interface Fact {
  /** `d<số giấy>.<trường>`, `d<số giấy>.<trường>.<dòng>` cho một dòng trong danh sách hàng, `c<dòng>` cho hàng thực mang theo. */
  id: string;
  kind: FactKind;
  /** Khoá trường, để hai trường "khác" chỉ so được khi cùng khoá. */
  key: string;
  value: string | number | Item | Item[];
}

export type ConfrontKind = "name" | "year" | "item" | "other";

export interface ConfrontResult {
  /** Hai chỗ có cùng loại để so hay không. */
  comparable: boolean;
  /** Hai chỗ lệch nhau. */
  mismatch: boolean;
  /** Đối chất đúng: so được và lệch thật. */
  found: boolean;
  kind: ConfrontKind | null;
}

/** Mọi chỗ khoanh được trong một lượt. */
export function factsOf(t: Traveler, documents: readonly DocumentDef[]): Fact[] {
  const facts: Fact[] = [];
  t.documents.forEach((d, di) => {
    const def = docDef(documents, d.type);
    for (const f of def.fields) {
      const v = fieldOf(d, f.key);
      if (v === undefined || v === null) continue;
      const id = `d${di}.${f.key}`;
      if (f.kind === "items" && Array.isArray(v)) {
        facts.push({ id, kind: "list", key: f.key, value: v as Item[] });
        (v as Item[]).forEach((item, i) => facts.push({ id: `${id}.${i}`, kind: "item", key: f.key, value: item }));
      } else if (f.kind === "item" && typeof v === "object") {
        facts.push({ id, kind: "item", key: f.key, value: v as Item });
      } else if (f.key === def.holder_field) {
        facts.push({ id, kind: "name", key: f.key, value: String(v) });
      } else if (f.key === def.birth_year_field) {
        facts.push({ id, kind: "year", key: f.key, value: Number(v) });
      } else {
        facts.push({ id, kind: "other", key: f.key, value: typeof v === "number" ? v : String(v) });
      }
    }
  });
  t.cargo.forEach((c, i) => facts.push({ id: `c${i}`, kind: "item", key: "cargo", value: c }));
  return facts;
}

function sameItem(a: Item, b: Item): boolean {
  return a.ma === b.ma && a.so_luong === b.so_luong && a.don_vi === b.don_vi;
}

function sameList(a: Item[], b: Item[]): boolean {
  return a.length === b.length && a.every((x) => b.some((y) => sameItem(x, y)));
}

const NONE: ConfrontResult = { comparable: false, mismatch: false, found: false, kind: null };

function result(kind: ConfrontKind, mismatch: boolean): ConfrontResult {
  return { comparable: true, mismatch, found: mismatch, kind };
}

/** So hai chỗ đã khoanh. */
export function compareFacts(a: Fact, b: Fact): ConfrontResult {
  if (a.id === b.id) return NONE;
  if (a.kind === "name" && b.kind === "name") return result("name", !sameText(String(a.value), String(b.value)));
  if (a.kind === "year" && b.kind === "year") return result("year", a.value !== b.value);

  // Hàng hoá: dòng với dòng (cùng mã), dòng với cả danh sách, danh sách với danh sách.
  const isItem = (f: Fact) => f.kind === "item";
  const isList = (f: Fact) => f.kind === "list";
  if (isItem(a) && isItem(b)) {
    const x = a.value as Item;
    const y = b.value as Item;
    return x.ma === y.ma ? result("item", !sameItem(x, y)) : NONE;
  }
  if ((isItem(a) && isList(b)) || (isList(a) && isItem(b))) {
    const item = (isItem(a) ? a.value : b.value) as Item;
    const list = (isList(a) ? a.value : b.value) as Item[];
    const same = list.find((x) => x.ma === item.ma);
    return result("item", same === undefined || !sameItem(same, item));
  }
  if (isList(a) && isList(b)) return result("item", !sameList(a.value as Item[], b.value as Item[]));

  if (a.kind === "other" && b.kind === "other" && a.key === b.key) return result("other", String(a.value) !== String(b.value));
  return NONE;
}

/** So hai chỗ theo mã. Mã lạ thì coi như không so được. */
export function confront(t: Traveler, documents: readonly DocumentDef[], aId: string, bId: string): ConfrontResult {
  const facts = factsOf(t, documents);
  const a = facts.find((f) => f.id === aId);
  const b = facts.find((f) => f.id === bId);
  return a && b ? compareFacts(a, b) : NONE;
}

/**
 * Lời người khách khi bị đối chất. Đúng thì lấy mục `on` trùng loại lệch (hoặc `any`);
 * sai thì lấy mục `khop`. Không có thì trả mảng rỗng để giao diện dùng câu chung.
 */
export function confrontLines(t: Traveler, r: ConfrontResult, cs: ConditionState): Line[] {
  const entries = t.confront ?? [];
  const pick = r.found ? entries.find((e) => e.on === r.kind) ?? entries.find((e) => e.on === "any") : entries.find((e) => e.on === "khop");
  return pick ? filterByWhen(pick.lines, cs) : [];
}
