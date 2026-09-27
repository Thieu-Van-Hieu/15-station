import { useState } from "react";
import type { Action, Day } from "../engine/types";
import { reasonsOn } from "../engine/reports";
import { content } from "../content";
import { playSfx } from "../audio";

interface ActionControlsProps {
  day: Day;
  bribeAccepted: boolean;
  chosenAction?: Action | null;
  chosenReasonId?: string | null;
  onDecide: (action: Action, reasonId?: string | null) => void;
  onNext: () => void;
}

export function ActionControls({
  day,
  bribeAccepted,
  chosenAction,
  chosenReasonId,
  onDecide,
  onNext,
}: ActionControlsProps) {
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState<string | null>(chosenReasonId ?? null);

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
    playSfx("paper_rustle");
    setShowReportModal(true);
  }

  function handleConfirmReport(reasonId: string) {
    playSfx("paper_rustle");
    setSelectedReason(reasonId);
    setShowReportModal(false);
  }

  return (
    <div className="flex flex-col space-y-3">
      {/* Các nút quyết định */}
      <div className="flex flex-wrap items-center justify-center gap-4 p-4 border-2 border-nau bg-giay/80 rounded shadow-md">
        {/* Dấu CHO QUA */}
        <button
          type="button"
          disabled={isApproveDisabled}
          onClick={() => {
            playSfx("stamp_down");
            onDecide("CHO_QUA", selectedReason);
          }}
          className={`px-6 py-3 border-4 font-bold text-base tracking-widest uppercase rounded shadow transition-transform transform active:scale-95 ${
            chosenAction === "CHO_QUA"
              ? "bg-green-800 text-white border-green-950 scale-105"
              : isApproveDisabled
                ? "opacity-40 cursor-not-allowed border-green-900/40 text-green-950/40"
                : "border-green-800 text-green-900 bg-green-100 hover:bg-green-200 hover:-translate-y-0.5"
          }`}
        >
          {content.strings["desk.stamp.approve"]}
        </button>

        {/* Dấu GIỮ LẠI */}
        <button
          type="button"
          disabled={isRejectDisabled}
          onClick={() => {
            playSfx("stamp_down");
            onDecide("GIU_LAI", selectedReason);
          }}
          className={`px-6 py-3 border-4 font-bold text-base tracking-widest uppercase rounded shadow transition-transform transform active:scale-95 ${
            chosenAction === "GIU_LAI"
              ? "bg-dau-do text-white border-red-950 scale-105"
              : isRejectDisabled
                ? "opacity-40 cursor-not-allowed border-dau-do/40 text-dau-do/40"
                : "border-dau-do text-dau-do bg-red-100 hover:bg-red-200 hover:-translate-y-0.5"
          }`}
        >
          {content.strings["desk.stamp.reject"]}
        </button>

        {/* Nút LÀM NGƠ */}
        <button
          type="button"
          disabled={isIgnoreDisabled}
          onClick={() => onDecide("LAM_NGO", null)}
          className={`px-4 py-2.5 border-2 font-bold text-xs uppercase rounded transition-colors ${
            chosenAction === "LAM_NGO"
              ? "bg-neutral-800 text-white border-black"
              : isIgnoreDisabled
                ? "opacity-40 cursor-not-allowed border-neutral-400 text-neutral-400"
                : "border-neutral-600 text-neutral-800 bg-neutral-200 hover:bg-neutral-300"
          }`}
        >
          {content.strings["desk.ignore"]}
        </button>

        {/* Nút LẬP BIÊN BẢN */}
        <button
          type="button"
          disabled={isReportDisabled}
          onClick={handleOpenReport}
          className={`px-4 py-2.5 border-2 font-bold text-xs uppercase rounded transition-colors ${
            selectedReason
              ? "bg-blue-800 text-white border-blue-950"
              : isReportDisabled
                ? "opacity-30 cursor-not-allowed border-neutral-400 text-neutral-400"
                : "border-blue-700 text-blue-900 bg-blue-100 hover:bg-blue-200"
          }`}
        >
          {content.strings["desk.report"]}
          {selectedReason ? " (✓)" : ""}
        </button>
      </div>

      {/* Nút sang lượt kế tiếp khi đã có quyết định */}
      {chosenAction && (
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={onNext}
            className="px-8 py-3 bg-nau hover:bg-nau/90 text-giay font-bold text-sm tracking-wider uppercase rounded shadow-lg border-2 border-giay animate-bounce"
          >
            {content.strings["desk.next_traveler"]} →
          </button>
        </div>
      )}

      {/* Modal chọn lý do kiến nghị */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-giay border-4 border-nau p-6 rounded max-w-lg w-full shadow-2xl text-muc space-y-4">
            <div className="border-b border-nau/40 pb-2">
              <h3 className="font-bold text-base text-dau-do">{content.strings["report.title"]}</h3>
              <p className="text-xs italic text-muc/70 mt-1">{content.strings["desk.report_select_reason"]}</p>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {availableReasons.map((r) => (
                <div
                  key={r.id}
                  onClick={() => setSelectedReason(r.id)}
                  className={`p-3 border-2 rounded cursor-pointer text-xs transition-colors ${
                    selectedReason === r.id
                      ? "border-blue-700 bg-blue-100 font-semibold"
                      : "border-nau/30 hover:bg-nau/10"
                  }`}
                >
                  <p>{r.text}</p>
                </div>
              ))}
            </div>

            <div className="flex justify-end space-x-3 pt-3 border-t border-nau/30">
              <button
                type="button"
                onClick={() => {
                  setSelectedReason(null);
                  setShowReportModal(false);
                }}
                className="px-4 py-2 border border-nau/50 text-xs rounded hover:bg-nau/10"
              >
                {content.strings["desk.report_cancel"]}
              </button>
              <button
                type="button"
                disabled={!selectedReason}
                onClick={() => selectedReason && handleConfirmReport(selectedReason)}
                className={`px-4 py-2 bg-blue-800 text-white text-xs font-bold rounded ${
                  !selectedReason ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"
                }`}
              >
                {content.strings["desk.report_send"]}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
