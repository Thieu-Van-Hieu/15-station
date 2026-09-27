/**
 * bots.ts — Bốn bot chơi thử tự động cho game "Trạm 15".
 * Theo đặc tả docs/07-trien-khai.md mục 5 và docs/08-cac-phase.md mục P5.
 *
 * 1. Theo sổ: Luôn chọn đáp án engine tính, không kiến nghị, không nhận phong bì -> END-GAC-CONG
 * 2. Kiến nghị: Như Theo sổ, thêm biên bản đúng lý do ở mọi lượt có kn -> END-KIEN-NGHI
 * 3. Làm ngơ: Làm ngơ mọi lượt có vi phạm -> END-LAM-NGO
 * 4. Ăn tiền: Nhận mọi phong bì, các lượt khác theo sổ -> END-AN-TIEN
 */

import { type Strategy, simulate } from "../src/engine/simulate.js";
import type { GameContent, GameState } from "../src/engine/types.js";

/** Bot 1: Luôn làm đúng theo sổ, không kiến nghị, không nhận phong bì. */
export const theoSoStrategy: Strategy = ({ evaluation }) => ({
  action: evaluation.verdict,
  takeBribe: false,
  reasonId: null,
});

/** Bot 2: Như Theo sổ, kèm biên bản đúng lý do ở mọi lượt có kiến nghị. */
export const kienNghiStrategy: Strategy = ({ day, traveler, evaluation, reasons }) => {
  let reasonId: string | null = null;
  if (day.kn_enabled && traveler.kn) {
    const r = reasons.find((item) => item.issue === traveler.kn!.issue);
    if (r) reasonId = r.id;
  }

  return {
    action: evaluation.verdict,
    takeBribe: false,
    reasonId,
  };
};

/** Bot 3: Làm ngơ mọi lượt có vi phạm. */
export const lamNgoStrategy: Strategy = ({ evaluation }) => {
  if (evaluation.verdict === "GIU_LAI") {
    return {
      action: "LAM_NGO",
      takeBribe: false,
      reasonId: null,
    };
  }

  return {
    action: "CHO_QUA",
    takeBribe: false,
    reasonId: null,
  };
};

/** Bot 4: Nhận mọi phong bì và cho qua, các lượt khác làm đúng theo sổ. */
export const anTienStrategy: Strategy = ({ traveler, evaluation }) => {
  if (traveler.bribe) {
    return {
      takeBribe: true,
      action: "CHO_QUA",
      reasonId: null,
    };
  }

  return {
    action: evaluation.verdict,
    takeBribe: false,
    reasonId: null,
  };
};

export function botTheoSo(content: GameContent): GameState {
  return simulate(content, theoSoStrategy);
}

export function botKienNghi(content: GameContent): GameState {
  return simulate(content, kienNghiStrategy);
}

export function botLamNgo(content: GameContent): GameState {
  return simulate(content, lamNgoStrategy);
}

export function botAnTien(content: GameContent): GameState {
  return simulate(content, anTienStrategy);
}

export interface BotResult {
  name: string;
  state: GameState;
}

export function runBots(content: GameContent): Record<string, GameState> {
  return {
    theoSo: botTheoSo(content),
    kienNghi: botKienNghi(content),
    lamNgo: botLamNgo(content),
    anTien: botAnTien(content),
  };
}
