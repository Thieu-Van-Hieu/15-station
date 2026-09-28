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
