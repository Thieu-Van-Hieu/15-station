/**
 * Cheat code cho nhóm làm game: gõ "Mr.NoBody" ở bất kỳ màn nào để mở bảng xem trước.
 * Mỗi kết cục được dựng bằng một bot chơi thật từ đầu đến cuối, nên số liệu trên màn kết là thật.
 */

import { useEffect } from "react";
import { newGame } from "./engine/game";
import { type Strategy, followRulebook, simulate } from "./engine/simulate";
import type { EndingId, GameContent, GameState, TravelerId } from "./engine/types";

export const CHEAT_CODE = "mr.nobody";

/** Kiến nghị ở mọi lượt có dịp, còn lại theo sổ. */
const petition: Strategy = ({ day, traveler, evaluation, reasons }) => ({
  action: evaluation.verdict,
  reasonId: day.kn_enabled && traveler.kn ? (reasons.find((r) => r.issue === traveler.kn!.issue)?.id ?? null) : null,
});

/** Làm ngơ mọi lượt có vi phạm. */
const lookAway: Strategy = ({ evaluation }) => ({ action: evaluation.verdict === "GIU_LAI" ? "LAM_NGO" : "CHO_QUA" });

/** Nhận mọi phong bì và cho qua. */
const takeMoney: Strategy = ({ traveler, evaluation }) =>
  traveler.bribe ? { action: "CHO_QUA", takeBribe: true } : { action: evaluation.verdict };

const PLAYTHROUGHS: Record<EndingId, (c: GameContent) => GameState> = {
  "END-AN-TIEN": (c) => simulate(c, takeMoney),
  "END-LAM-NGO": (c) => simulate(c, lookAway),
  "END-KIEN-NGHI": (c) => simulate(c, petition),
  "END-GAC-CONG": (c) => simulate(c, followRulebook),
  // Theo sổ nhưng không chi đồng nào cho gia đình: hardship vượt 5 nên rơi xuống người sống sót.
  "END-SONG-SOT": (c) => simulate(c, followRulebook, { expenses: () => [] }),
};

export function previewEnding(content: GameContent, id: EndingId): GameState {
  return PLAYTHROUGHS[id](content);
}

/** Trạng thái ở màn đầu ngày `dayIndex`, các ngày trước chơi theo sổ. */
export function previewDay(content: GameContent, dayIndex: number): GameState {
  if (dayIndex === 0) return { ...newGame(content), phase: "DAY_START" };
  const first = content.days[dayIndex].travelers[0] as TravelerId;
  return { ...simulate(content, followRulebook, { stopAt: first }), phase: "DAY_START" };
}

/** Gọi `onMatch` khi người dùng gõ đúng mã (không phân biệt hoa thường), bỏ qua lúc đang gõ vào ô nhập liệu. */
export function useCheatCode(onMatch: () => void, code = CHEAT_CODE) {
  useEffect(() => {
    let buffer = "";
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) return;
      if (e.key.length !== 1) return;
      buffer = (buffer + e.key.toLowerCase()).slice(-code.length);
      if (buffer === code) {
        buffer = "";
        onMatch();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onMatch, code]);
}

/**
 * Đọc tham số `?tu=` (chế độ nhảy lượt, UI-09). Chấp nhận `d3-t3`, `D3-T3`, `d3t3`, `3-3` và khoảng trắng thừa;
 * `d3` hoặc `3` nhảy tới đầu ngày 3. Trả `null` nếu không có lượt hoặc ngày nào như vậy,
 * để giao diện báo lỗi thay vì âm thầm chơi hết game.
 */
export function parseJump(content: GameContent, raw: string): { traveler: TravelerId } | { day: number } | null {
  const v = raw.trim().toLowerCase().replace(/\s+/g, "");
  const turn = v.match(/^d?(\d+)-?t?(\d+)$/);
  if (turn && (v.includes("t") || v.includes("-"))) {
    const id = `d${Number(turn[1])}-t${Number(turn[2])}` as TravelerId;
    return content.days.some((d) => d.travelers.includes(id)) ? { traveler: id } : null;
  }
  const day = v.match(/^d?(\d+)$/);
  if (day) {
    const i = Number(day[1]) - 1;
    return i >= 0 && i < content.days.length ? { day: i } : null;
  }
  return null;
}

/** Trạng thái mở đầu cho `?tu=`. Null nếu giá trị không hợp lệ. */
export function stateFromJump(content: GameContent, raw: string): GameState | null {
  const j = parseJump(content, raw);
  if (!j) return null;
  return "traveler" in j ? simulate(content, followRulebook, { stopAt: j.traveler }) : previewDay(content, j.day);
}

