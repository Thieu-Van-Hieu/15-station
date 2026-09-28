import { useState } from "react";
import type { Action, Day } from "../engine/types";
import { reasonsOn } from "../engine/reports";
import { content } from "../content";
import { playSfx } from "../audio";
import { Label, Modal, Paper, PrimaryButton, StampButton, TypeRule, cx, s } from "./ui";

interface ActionControlsProps {
  day: Day;
  bribeAccepted: boolean;
  chosenAction?: Action | null;
  chosenReasonId?: string | null;
  travelerOrder?: number;
  onDecide: (action: Action, reasonId?: string | null) => void;
  onNext: () => void;
}

const IconReport = (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
    <path d="M6 3h9l4 4v14H6z" />
    <path d="M9 11h7M9 15h7M9 7h4" />
  </svg>
);
const IconEye = (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
    <path d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6S2 12 2 12z" />
    <path d="M4 20L20 4" />
  </svg>
);
const IconCross = (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
    <rect x="3" y="3" width="18" height="18" />
    <path d="M8 8l8 8M16 8l-8 8" />
  </svg>
);
const IconCheck = (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
    <rect x="3" y="3" width="18" height="18" />
    <path d="M7 12l3.5 3.5L17 9" />
  </svg>
);

export function ActionControls({
  day,
  bribeAccepted,
  chosenAction,
  chosenReasonId,
  travelerOrder,
  onDecide,
  onNext,
}: ActionControlsProps) {
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState<string | null>(chosenReasonId ?? null);
  const [draftReason, setDraftReason] = useState<string | null>(null);

  const availableReasons = reasonsOn(content.reports, day.id);

  // UI-03: Biên bản disabled ở d1, d2, d6 (!day.kn_enabled)
  // UI-04: Chọn làm ngơ -> Nút Biên bản không bấm được
  // UI-05: Nhận phong bì -> Dấu Giữ lại và nút Biên bản không bấm được
  const isReportDisabled = !day.kn_enabled || bribeAccepted || chosenAction === "LAM_NGO" || !!chosenAction;
  const isRejectDisabled = bribeAccepted || !!chosenAction;
  const isApproveDisabled = !!chosenAction;
  const isIgnoreDisabled = !!chosenAction;

  function handleOpenReport() {
    if (isReportDisabled) return;
    playSfx("paper");
    setDraftReason(selectedReason);
    setShowReportModal(true);
  }

  function stamp(action: Action) {
    playSfx(action === "LAM_NGO" ? "click" : "stamp");
    onDecide(action, action === "LAM_NGO" ? null : selectedReason);
  }

  const reportSub = !day.kn_enabled
    ? s("desk.report_locked")
    : selectedReason
      ? s("desk.report_attached")
      : s("desk.report_sub");

  return (
    <div className="border-t border-vien bg-ban/95 backdrop-blur-sm">
      <div className="flex flex-col xl:flex-row xl:items-center gap-3 px-4 md:px-6 py-3">
        <div className="flex items-center gap-3 min-w-0 xl:w-[340px] shrink-0">
          <div className="w-11 h-11 rounded-full border-2 border-ho-phach/70 text-ho-phach grid place-items-center font-nhan font-bold shrink-0">
            {travelerOrder ?? "•"}
          </div>
          <div className="min-w-0">
            <Label className="text-giay block">
              {s("desk.decision_title")} {travelerOrder ?? ""}
            </Label>
            <p className="text-[11px] text-chu-ban-phu/70 leading-snug">
              {chosenAction ? s("desk.decision_done") : s("desk.decision_hint")}
            </p>
          </div>
        </div>

        <div className="flex-1 flex flex-col lg:flex-row gap-2.5">
          <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-2.5">
            <StampButton
              tone="muc-xanh"
              title={s("desk.report")}
              sub={reportSub}
              icon={IconReport}
              disabled={isReportDisabled}
              selected={!!selectedReason}
              onClick={handleOpenReport}
            />
            <StampButton
              tone="xam"
              title={s("desk.ignore")}
              sub={s("desk.ignore_sub")}
              icon={IconEye}
              disabled={isIgnoreDisabled}
              selected={chosenAction === "LAM_NGO"}
              onClick={() => stamp("LAM_NGO")}
            />
            <StampButton
              tone="son"
              title={s("desk.stamp.reject")}
              sub={s("desk.stamp.reject_sub")}
              icon={IconCross}
              tilt={-1.5}
              disabled={isRejectDisabled}
              selected={chosenAction === "GIU_LAI"}
              onClick={() => stamp("GIU_LAI")}
            />
            <StampButton
              tone="xanh"
              title={s("desk.stamp.approve")}
              sub={s("desk.stamp.approve_sub")}
              icon={IconCheck}
              tilt={1}
              disabled={isApproveDisabled}
              selected={chosenAction === "CHO_QUA"}
              onClick={() => stamp("CHO_QUA")}
            />
          </div>
          {chosenAction && (
            <PrimaryButton onClick={onNext} className="lg:min-w-[220px] animate-truot-vao">
              {s("desk.next_traveler")}
            </PrimaryButton>
          )}
        </div>
      </div>

      {/* Hộp chọn lý do kiến nghị */}
      {showReportModal && (
        <Modal>
          <Paper tone="giay" raised className="max-w-lg w-full p-6 animate-truot-vao" tilt={-0.5}>
            <div className="text-center">
              <Label className="text-muc-nhat text-[10px]">{s("doc.nation")}</Label>
              <h3 className="font-tieu-de font-bold text-lg text-son mt-1">{s("report.title")}</h3>
            </div>
            <TypeRule className="my-3" />
            <p className="text-[12px] italic text-muc-nhat mb-3">{s("desk.report_select_reason")}</p>

            <div className="space-y-2 max-h-64 overflow-y-auto thanh-cuon pr-1">
              {availableReasons.map((r) => {
                const on = draftReason === r.id;
                return (
                  <button
                    type="button"
                    key={r.id}
                    onClick={() => setDraftReason(r.id)}
                    className={cx(
                      "w-full flex items-start gap-3 p-2.5 text-left text-[12.5px] leading-snug border transition-colors",
                      on ? "border-muc-xanh bg-muc-xanh/10" : "border-transparent hover:bg-bia/60",
                    )}
                  >
                    <span className="mt-0.5 w-4 h-4 border border-muc grid place-items-center shrink-0 text-muc-xanh font-bold">
                      {on ? "✕" : ""}
                    </span>
                    <span>{r.text}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-end gap-3 pt-4 mt-3 border-t border-dashed border-muc/40">
              <button
                type="button"
                onClick={() => {
                  setSelectedReason(null);
                  setShowReportModal(false);
                }}
                className="px-4 py-2 border border-ke font-nhan text-[11px] uppercase tracking-wider hover:bg-bia"
              >
                {s("desk.report_cancel")}
              </button>
              <button
                type="button"
                disabled={!draftReason}
                onClick={() => {
                  if (!draftReason) return;
                  playSfx("pen");
                  setSelectedReason(draftReason);
                  setShowReportModal(false);
                }}
                className="px-4 py-2 bg-muc-xanh text-giay font-nhan font-bold text-[11px] uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#3a5f9e]"
              >
                {s("desk.report_send")}
              </button>
            </div>
          </Paper>
        </Modal>
      )}
    </div>
  );
}

