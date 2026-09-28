/**
 * Chấm và cập nhật sau mỗi lượt — 03 mục 5.
 */

import { activeRules } from "./active";
import { FATIGUE_MIN_PER_POINT } from "./economy";
import { isGoodsRule, rulesForItem } from "./scope";
import { finishDay, addDeltas } from "./day-end";
import { evaluate } from "./evaluate";
import { fileReport, reasonsOn } from "./reports";
import {
  type Counters,
  type GameState,
  type Reprimand,
  type TurnRecord,
  currentDay,
  currentTraveler,
  issuesActiveOn,
} from "./state";
import type { Action, FlagValue, GameContent, Traveler } from "./types";

export interface Decision {
  action: Action;
  /** Mã lý do biên bản, hoặc null nếu không lập biên bản. */
  reasonId: string | null;
}

/** Hành động được phép ở lượt hiện tại. Đã nhận phong bì thì không được giữ lại (03 mục 12, quyết định 11). */
export function allowedActions(state: GameState): Action[] {
  if (state.phase !== "TRAVELER") return [];
  return state.bribeTaken ? ["CHO_QUA", "LAM_NGO"] : ["CHO_QUA", "GIU_LAI", "LAM_NGO"];
}

/**
 * Có được lập biên bản kèm hành động này không (03 mục 6.1).
 * Câu hỏi mở số 3 (07 mục 9): đã nhận phong bì thì không lập biên bản được.
 */
export function canReport(state: GameState, content: GameContent, action: Action): boolean {
  if (state.phase !== "TRAVELER" || state.bribeTaken || action === "LAM_NGO") return false;
  return currentDay(state, content).kn_enabled;
}

export function canTakeBribe(state: GameState, content: GameContent): boolean {
  return state.phase === "TRAVELER" && !state.bribeTaken && currentTraveler(state, content).bribe !== null;
}

/** Chữ của giấy nhắc nhở. Giữ oan thì nêu từng dòng hàng thuộc điều nào, không thuộc điều nào (V2). */
export function reprimandText(r: Reprimand, content: GameContent): string {
  const str = (k: string) => content.strings[k] ?? k;
  if (r.kind === "de-lot") return content.rules.find((x) => x.id === r.rule)?.reprimand ?? r.rule;

  const base = str("reprimand.giu_oan");
  const t = r.traveler === undefined ? undefined : content.travelers.find((x) => x.id === r.traveler);
  if (t === undefined) return base;

  const goodsRules = activeRules(content.rules, t.day, new Set()).filter(isGoodsRule);
  const lines = t.cargo
    .filter((h) => h.category !== "DO_CA_NHAN")
    .map((h) => {
      const inScope = rulesForItem(goodsRules, h);
      const outScope = goodsRules.filter((x) => !inScope.includes(x) && x.id !== "R5K-KHOAN");
      const parts = [
        inScope.length > 0 ? `${str("reprimand.scope_only")} ${inScope.map((x) => x.article).join(", ")}` : str("reprimand.scope_none"),
        outScope.length > 0 ? `${str("reprimand.scope_out")} ${outScope.map((x) => x.article).join(", ")}` : null,
      ].filter(Boolean);
      return `${h.ten}: ${parts.join("; ")}.`;
    });
  return [base, ...lines, str("reprimand.papers_ok")].join("\n");
}

/** Tổng kg hàng bị tịch thu khi giữ lại: các dòng tính bằng kg, trừ đồ cá nhân. */
function seizedKg(t: Traveler): number {
  return t.cargo.filter((h) => h.don_vi === "kg" && h.category !== "DO_CA_NHAN").reduce((s, h) => s + h.so_luong, 0);
}

function flagValue(action: Action, validReport: boolean, bribe: boolean): FlagValue {
  const base = action === "CHO_QUA" ? "qua" : action === "GIU_LAI" ? "giu" : "lam-ngo";
  return `${base}${validReport ? "-kn" : ""}${bribe ? "-tien" : ""}` as FlagValue;
}

/**
 * Xử lý quyết định của người chơi ở lượt hiện tại.
 * Trả về null nếu quyết định không hợp lệ (sai phase, hành động bị chặn, lý do lạ).
 */
export function decide(state: GameState, content: GameContent, { action, reasonId }: Decision): GameState | null {
  if (!allowedActions(state).includes(action)) return null;

  const day = currentDay(state, content);
  const t = currentTraveler(state, content);

  const reason = reasonId === null ? null : reasonsOn(content.reports, day.id).find((r) => r.id === reasonId);
  if (reasonId !== null && (reason === undefined || !canReport(state, content, action))) return null;

  const ev = evaluate(t, day, content, issuesActiveOn(state, day.id));
  const hv = ev.violations.length > 0;
  const correct = action === "GIU_LAI" ? hv : !hv;
  // Trạm trưởng đứng sau lưng thì làm ngơ cũng bị thấy và ghi sổ (V3).
  const observed = (day.observed ?? []).includes(t.id);
  const recorded = action !== "LAM_NGO" || observed;
  const bribe = state.bribeTaken && t.bribe !== null ? t.bribe.amount : 0;
  const found = state.turnConfrontFound === true;

  // Biên bản
  let issues = state.issues;
  let report: TurnRecord["report"] = null;
  if (reason !== null && reason !== undefined) {
    const r = fileReport(issues, t, reason, content.reports, day, content.days);
    issues = r.issues;
    report = { reasonId: reason.id, issue: r.issue, valid: r.valid };
  }

  // Bộ đếm, cập nhật cả bản tổng lẫn bản trong ngày
  const bump = (c: Counters): Counters => ({
    ...c,
    total: c.total + 1,
    correct_total: c.correct_total + (correct ? 1 : 0),
    recorded: c.recorded + (recorded ? 1 : 0),
    correct_recorded: c.correct_recorded + (recorded && correct ? 1 : 0),
    reprimands: c.reprimands + (recorded && !correct ? 1 : 0),
    lam_ngo_violations: c.lam_ngo_violations + (action === "LAM_NGO" && hv ? 1 : 0),
    so_vu_giu_lai: c.so_vu_giu_lai + (action === "GIU_LAI" ? 1 : 0),
    hang_tich_thu_kg: c.hang_tich_thu_kg + (action === "GIU_LAI" ? seizedKg(t) : 0),
    valid_reports: c.valid_reports + (report?.valid === true ? 1 : 0),
    invalid_reports: c.invalid_reports + (report?.valid === false ? 1 : 0),
    bribes_accepted: c.bribes_accepted + (bribe > 0 ? 1 : 0),
    bribe_total: c.bribe_total + bribe,
    // V8: đã chỉ ra được chỗ lệch ở lượt này rồi mới quyết định.
    doi_chat: c.doi_chat ?? 0,
    doi_chat_dung: c.doi_chat_dung ?? 0,
    doi_chat_hanh_dong: (c.doi_chat_hanh_dong ?? 0) + (found && action === "GIU_LAI" ? 1 : 0),
    doi_chat_bo_qua: (c.doi_chat_bo_qua ?? 0) + (found && action !== "GIU_LAI" ? 1 : 0),
  });

  // Giấy nhắc nhở: chỉ khi sai và có ghi sổ. Làm ngơ thì cấp trên không biết.
  // Hiện ở lượt kế tiếp. Câu hỏi mở số 1 (07 mục 9): lượt cuối ngày thì giấy chờ sang
  // lượt đầu của ngày sau; lượt cuối d6 thì không còn lượt nào để hiện.
  let pendingReprimand: Reprimand | null = null;
  if (recorded && !correct) {
    pendingReprimand = action === "GIU_LAI" ? { kind: "giu-oan", traveler: t.id } : { kind: "de-lot", rule: ev.violations[0].rule };
  }

  const outcome = t.outcomes[action] ?? t.outcomes.CHO_QUA;
  const flag = t.flag_key === null ? null : flagValue(action, report?.valid === true, bribe > 0);

  const record: TurnRecord = {
    traveler: t.id,
    day: day.id,
    action,
    verdict: ev.verdict,
    violations: ev.violations,
    correct,
    recorded,
    report,
    bribe,
    flag,
    notes: outcome.notes,
  };

  const next: GameState = {
    ...state,
    travelerIndex: state.travelerIndex + 1,
    flags: t.flag_key === null || flag === null ? state.flags : { ...state.flags, [t.flag_key]: flag },
    total: bump(state.total),
    today: bump(state.today),
    issues,
    indicators: addDeltas(state.indicators, outcome.deltas),
    clockMin:
      state.clockMin +
      day.clock.per_traveler_min +
      FATIGUE_MIN_PER_POINT * (state.fatigue ?? 0) +
      (report === null ? 0 : day.clock.per_report_min),
    bribeTaken: false,
    turnConfrontFound: false,
    pendingReprimand,
    log: [...state.log, record],
  };

  return next.travelerIndex >= day.travelers.length ? finishDay(next, day) : next;
}
