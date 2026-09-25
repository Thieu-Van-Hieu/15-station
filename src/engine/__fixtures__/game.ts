/**
 * Nội dung game thu nhỏ cho test trạng thái. reports.json và endings.json thật
 * còn rỗng, nên dùng bản mẫu theo đúng 03 mục 1.9 và 9.2.
 */

import { type GameAction, newGame, reduce } from "../game";
import type { GameState } from "../state";
import type { DayId, Ending, GameContent, Issue, Traveler } from "../types";
import { book, day } from "./index";

const DAY_IDS: DayId[] = ["d1", "d2", "d3", "d4", "d5", "d6"];

export const REPORTS: Issue[] = [
  {
    id: "KN-KHOAN",
    title: "Giấy khoán",
    description: "Giấy xác nhận sản phẩm khoán chưa có trong sổ",
    unlock_day: "d3",
    threshold: 3,
    delay: "next_act",
    effect: { type: "activate_rule", rule: "R5K-KHOAN", text: "Sổ bổ sung trang về giấy khoán." },
    reasons: [{ id: "LD-KHOAN", text: "Giấy xác nhận sản phẩm khoán của HTX chưa có trong sổ chỉ thị" }],
  },
  {
    id: "KN-THUONG-BINH",
    title: "Thương binh",
    description: "Sổ không có mục nào cho người có giấy chứng nhận thương binh",
    unlock_day: "d3",
    threshold: 3,
    delay: "next_act",
    effect: { type: "narrative", rule: null, text: "Chị Thu nhắc đến trạm 15." },
    reasons: [{ id: "LD-THUONG-BINH", text: "Sổ chưa có mục nào cho người có giấy chứng nhận thương binh" }],
  },
];

function ending(id: Ending["id"], priority: number, conditions: Ending["conditions"]): Ending {
  return {
    id,
    title: id,
    priority,
    conditions,
    scenes: [{ text: `Cảnh của ${id}` }],
    quote: { text: "…", chapter: 1, section: "2.3" },
    character_lines: [],
    closing_question: null,
  };
}

/** Điều kiện theo 03 mục 9.2. Cố ý xếp lộn thứ tự để kiểm engine tự sắp theo priority. */
export const ENDINGS: Ending[] = [
  ending("END-SONG-SOT", 5, []),
  ending("END-GAC-CONG", 4, [
    { stat: "true_compliance", op: ">=", value: 0.85 },
    { stat: "valid_reports", op: "==", value: 0 },
    { stat: "lam_ngo_violations", op: "==", value: 0 },
  ]),
  ending("END-KIEN-NGHI", 3, [
    { stat: "valid_reports", op: ">=", value: 4 },
    { stat: "issues_triggered", op: ">=", value: 1 },
    { stat: "lam_ngo_violations", op: "<=", value: 1 },
  ]),
  ending("END-LAM-NGO", 2, [{ stat: "lam_ngo_violations", op: ">=", value: 4 }]),
  ending("END-AN-TIEN", 1, [{ stat: "bribes_accepted", op: ">=", value: 2 }]),
];

/** Sáu ngày; mỗi ngày gồm các lượt có `day` tương ứng, theo thứ tự truyền vào. */
export function gameContent(travelers: Traveler[], strings: Record<string, string> = {}): GameContent {
  return {
    ...book,
    characters: [],
    days: DAY_IDS.map((id) => day(id, { travelers: travelers.filter((t) => t.day === id).map((t) => t.id) })),
    travelers,
    reports: REPORTS,
    endings: ENDINGS,
    strings,
  };
}

/** Chơi nhanh qua các ngày trước (không trả khoản chi nào) để đứng ở lượt đầu của `target`. */
export function startAt(content: GameContent, target: DayId): GameState {
  let s = reduce(newGame(content), { type: "BAT_DAU_GAME" }, content);
  while (content.days[s.dayIndex].id !== target) {
    for (const a of [{ type: "BAT_DAU_NGAY" }, { type: "KET_THUC_NGAY" }, { type: "TRA_CHI_TIEU", expenseIds: [] }] as GameAction[]) {
      s = reduce(s, a, content);
    }
    if (s.phase !== "DAY_START") throw new Error("startAt chỉ đi qua được các ngày không có lượt khách");
  }
  return reduce(s, { type: "BAT_DAU_NGAY" }, content);
}
