/**
 * Phiên bỏ phiếu lớp học (P4): hồ sơ lượt khách cho máy chiếu và điện thoại, và các kiểu dữ liệu dùng chung.
 * Hồ sơ dựng từ dữ liệu game (nhân vật, giấy tờ, hàng mang theo) cộng phần viết tay trong `data/strings.json`
 * (`class.case.<lượt>.*`), nên người chủ trì không phải gõ hay chép câu hỏi.
 */
import { content } from "./content";
import type { Expression } from "./engine/types";

export type Choice = "CHO_QUA" | "GIU_LAI";
export type Counts = Record<Choice, number>;

/** Thời lượng bỏ phiếu cho người chủ trì chọn (giây). */
export const DURATIONS = [30, 45, 60, 90] as const;
export const DEFAULT_DURATION = 45;

export interface ClassCase {
  turnId: string;
  name: string;
  portraitKey: string;
  expression: Expression;
  /** Một câu dẫn: ai, mang gì, đi đâu. */
  lead: string;
  facts: string[];
  question: string;
  argFor?: string;
  argAgainst?: string;
  history?: string;
  discuss?: string;
}

function str(key: string): string | undefined {
  const v = content.strings[key];
  return typeof v === "string" && v.trim() ? v : undefined;
}

function fill(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, k: string) => vars[k] ?? "");
}

/** Hồ sơ của một lượt khách, hoặc `null` nếu mã lượt không có trong dữ liệu. */
export function caseFor(turnId: string): ClassCase | null {
  const t = content.travelers.find((x) => x.id === turnId);
  if (!t) return null;
  const c = content.characters.find((x) => x.id === t.character);
  const name = c?.name ?? t.character;
  const k = `class.case.${turnId.replace(/-/g, "_")}`;

  const gdd = t.documents.find((d) => d.type === "GDD");
  const reason = gdd && "ly_do" in gdd.fields ? String(gdd.fields.ly_do) : "";
  const cargo = (t.cargo ?? []).map((i) => `${i.so_luong} ${content.strings[`unit.${i.don_vi}`] ?? i.don_vi} ${i.ten.toLowerCase()}`).join(", ");

  const facts = [1, 2, 3, 4].map((n) => str(`${k}.fact${n}`)).filter((f): f is string => Boolean(f));
  if (facts.length === 0) {
    if (cargo) facts.push(fill(content.strings["class.auto_cargo"], { cargo }));
    if (reason) facts.push(fill(content.strings["class.auto_reason"], { reason }));
    if (t.kn?.note) facts.push(t.kn.note);
  }

  return {
    turnId,
    name,
    portraitKey: t.portrait.key ?? c?.portrait.key ?? t.character,
    expression: t.portrait.expression,
    lead: str(`${k}.lead`) ?? c?.background ?? "",
    facts,
    question: str(`${k}.question`) ?? fill(content.strings["class.auto_question"], { name }),
    argFor: str(`${k}.for`),
    argAgainst: str(`${k}.against`),
    history: str(`${k}.history`),
    discuss: str(`${k}.discuss`),
  };
}

/** Các lượt có thể đưa ra lớp: lượt gắn nhãn dừng trình bày trước, sau đó các lượt trung tâm. */
export function classroomTurns(): string[] {
  const stop = content.travelers.filter((t) => t.tags?.includes("dung-trinh-bay")).map((t) => t.id);
  const central = content.travelers.filter((t) => t.tags?.includes("luot-trung-tam") && !stop.includes(t.id)).map((t) => t.id);
  return [...stop, ...central];
}

/** Bên thắng, `"HOA"` khi bằng nhau, `null` khi chưa có phiếu nào. */
export function majority(c: Counts): Choice | "HOA" | null {
  if (c.CHO_QUA + c.GIU_LAI === 0) return null;
  if (c.CHO_QUA === c.GIU_LAI) return "HOA";
  return c.CHO_QUA > c.GIU_LAI ? "CHO_QUA" : "GIU_LAI";
}

export function percent(n: number, total: number): number {
  return total > 0 ? Math.round((n / total) * 100) : 0;
}
