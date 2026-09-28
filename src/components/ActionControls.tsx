import { useEffect, useState } from "react";
import type { Action, Day, Verdict } from "../engine/types";
import { reasonsOn } from "../engine/reports";
import { content } from "../content";
import { playSfx } from "../audio";
import { Label, Modal, Paper, PrimaryButton, StampButton, TypeRule, cx, s } from "./ui";
import { DraggableStamp } from "./stamping";

interface ActionControlsProps {
  day: Day;
  bribeAccepted: boolean;
  chosenAction?: Action | null;
  chosenReasonId?: string | null;
  travelerOrder?: number;
  onDecide: (action: Action, reasonId?: string | null) => void;
  onNext: () => void;
  /**
   * Có thì CHO QUA và GIỮ LẠI là con dấu kéo thả (V5): trả `true` nếu thả trúng giấy.
   * `x`, `y` null khi đóng bằng phím tắt 1 và 2 (tự đặt dấu lên giấy).
   * Không có (ví dụ trong test) thì bấm nút là đóng dấu.
   */
  onStampDrop?: (action: Verdict, x: number | null, y: number | null) => boolean;
  /** Báo khi người chơi kèm hoặc bỏ biên bản, để đồng hồ và hàng chờ phản ứng ngay (V6). */
  onReportChange?: (reasonId: string | null) => void;
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
  onStampDrop,
  onReportChange,
}: ActionControlsProps) {
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState<string | null>(chosenReasonId ?? null);
  const [draftReason, setDraftReason] = useState<string | null>(null);
  const [dragHint, setDragHint] = useState(false);

  useEffect(() => onReportChange?.(selectedReason), [selectedReason, onReportChange]);

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

  /** Con dấu thả xuống: bàn làm việc quyết định có trúng giấy không, trúng thì đóng dấu. */
  function drop(action: Verdict, x: number | null, y: number | null): boolean {
    if ((action === "CHO_QUA" ? isApproveDisabled : isRejectDisabled) || !onStampDrop) return false;
    if (!onStampDrop(action, x, y)) return false;
    onDecide(action, selectedReason);
    return true;
  }

  // Phím tắt: 1 cho qua, 2 giữ lại, Enter sang lượt kế tiếp.
  useEffect(() => {
    if (!onStampDrop) return;
    const onKey = (e: KeyboardEvent) => {
      if (showReportModal || e.ctrlKey || e.metaKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;
      if (e.key === "1") drop("CHO_QUA", null, null);
      else if (e.key === "2") drop("GIU_LAI", null, null);
      else if (e.key === "Enter" && chosenAction && target?.tagName !== "BUTTON") onNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const reportSub = !day.kn_enabled
    ? s("desk.report_locked")
    : selectedReason
      ? s("desk.report_attached")
      : s("desk.report_sub");

  return (
    <div className="sticky bottom-0 z-20 lg:static border-t border-vien bg-ban/95 backdrop-blur-sm">
      <div className="flex flex-col xl:flex-row xl:items-center gap-3 px-4 md:px-6 py-3 max-sm:gap-2 max-sm:px-3 max-sm:py-2 max-sm:pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <div className="flex items-center gap-3 min-w-0 xl:w-[340px] shrink-0 max-sm:gap-2">
          <div className="w-11 h-11 rounded-full border-2 border-ho-phach/70 text-ho-phach grid place-items-center font-nhan font-bold shrink-0 max-sm:w-7 max-sm:h-7 max-sm:text-[12px]">
            {travelerOrder ?? "•"}
          </div>
          <div className="min-w-0">
            <Label className="text-giay block">
              {s("desk.decision_title")} {travelerOrder ?? ""}
            </Label>
            {/* Chỉ trên điện thoại: chạm con dấu là đóng thẳng lên giấy. */}
            <span className="sm:hidden block text-[10px] text-chu-ban-phu/60 leading-tight">
              {chosenAction ? s("desk.decision_done") : s("desk.stamp_tap_hint")}
            </span>
            <p className="text-[11px] text-chu-ban-phu/70 leading-snug min-h-[2.1rem] line-clamp-2 max-sm:hidden">
              {chosenAction ? s("desk.decision_done") : dragHint && onStampDrop ? s("desk.stamp_drag_hint") : s("desk.decision_hint")}
            </p>
          </div>
        </div>

        <div className="flex-1 flex flex-col lg:flex-row gap-2.5 max-sm:gap-2">
          <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-2.5 max-sm:gap-2">
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
            {onStampDrop ? (
              <DraggableStamp
                action="GIU_LAI"
                title={s("desk.stamp.reject")}
                sub={s("desk.stamp.reject_sub")}
                disabled={isRejectDisabled}
                selected={chosenAction === "GIU_LAI"}
                onDrop={(x, y) => drop("GIU_LAI", x, y)}
                onTap={(touch) => (touch ? drop("GIU_LAI", null, null) : setDragHint(true))}
              />
            ) : (
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
            )}
            {onStampDrop ? (
              <DraggableStamp
                action="CHO_QUA"
                title={s("desk.stamp.approve")}
                sub={s("desk.stamp.approve_sub")}
                disabled={isApproveDisabled}
                selected={chosenAction === "CHO_QUA"}
                onDrop={(x, y) => drop("CHO_QUA", x, y)}
                onTap={(touch) => (touch ? drop("CHO_QUA", null, null) : setDragHint(true))}
              />
            ) : (
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
            )}
          </div>
          {/* Nút luôn chiếm chỗ (ẩn khi chưa quyết định) để hàng con dấu không co giãn làm giật màn hình. */}
          <PrimaryButton
            onClick={onNext}
            disabled={!chosenAction}
            className={cx("lg:w-[220px] shrink-0 max-sm:py-2.5", chosenAction ? "animate-truot-vao" : "invisible max-lg:hidden")}
          >
            {s("desk.next_traveler")}
          </PrimaryButton>
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

