import { useState, useEffect, useRef, useId } from "react";
import type { Verdict } from "../engine/types";
import { content } from "../content";
import { explainHostError } from "../hostApi";

interface ClassroomVotingPanelProps {
  room: string;
  hostToken: string;
  turnId: string;
  question: string;
  onMajorityDecide: (verdict: Verdict) => void;
  onManualTie: () => void;
  onDismiss?: () => void;
}

interface TallyData {
  round: number;
  open: boolean;
  turnId?: string;
  question?: string;
  /** Tên trường theo hợp đồng API `/api/tally`. */
  counts: {
    CHO_QUA: number;
    GIU_LAI: number;
  };
  total: number;
}

export function ClassroomVotingPanel({
  room,
  hostToken,
  turnId,
  question,
  onMajorityDecide,
  onManualTie,
  onDismiss,
}: ClassroomVotingPanelProps) {
  const [tally, setTally] = useState<TallyData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [roundOpened, setRoundOpened] = useState<boolean>(false);
  const [decidedVerdict, setDecidedVerdict] = useState<Verdict | null>(null);
  const [isTie, setIsTie] = useState<boolean>(false);
  /** Lý do mở vòng hoặc lấy kết quả thất bại (sai token, máy chủ chưa cấu hình, mất mạng). */
  const [problem, setProblem] = useState<string | null>(null);

  const [manualApproveInput, setManualApproveInput] = useState<string>("0");
  const [manualRejectInput, setManualRejectInput] = useState<string>("0");

  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevOpenRef = useRef<boolean>(false);
  const manualApproveId = useId();
  const manualRejectId = useId();

  // Mở vòng bỏ phiếu qua API khi component xuất hiện
  useEffect(() => {
    let isMounted = true;

    async function initRound() {
      setIsLoading(true);
      try {
        const res = await fetch("/api/round", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${hostToken}`,
          },
          body: JSON.stringify({
            room,
            action: "open",
            turnId,
            question,
            options: ["CHO_QUA", "GIU_LAI"],
          }),
        });

        if (res.ok && isMounted) {
          setRoundOpened(true);
          prevOpenRef.current = true;
          setProblem(null);
        } else if (!res.ok && isMounted) {
          setProblem(hostToken ? await explainHostError(res) : content.strings["host.token_missing"]);
        }
      } catch {
        // Nếu lỗi mạng, vẫn giữ giao diện để host có thể dùng đường lui nhập tay
        if (isMounted) setRoundOpened(true);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    initRound();

    return () => {
      isMounted = false;
    };
  }, [room, hostToken, turnId, question]);

  // Polling kết quả /api/tally mỗi 1 giây
  useEffect(() => {
    if (!room || decidedVerdict !== null) return;

    let isMounted = true;

    async function fetchTally() {
      try {
        const res = await fetch(`/api/tally?room=${encodeURIComponent(room)}`, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${hostToken}`,
          },
        });

        if (!res.ok) {
          if (isMounted) setProblem(hostToken ? await explainHostError(res) : content.strings["host.token_missing"]);
          return;
        }
        if (res.ok) {
          const data: TallyData = await res.json();
          if (!isMounted) return;
          setProblem(null);
          setTally(data);

          // Phát hiện vòng vừa được chốt (từ mở -> đóng)
          if (prevOpenRef.current && !data.open) {
            handleResolveVotes(data.counts.CHO_QUA, data.counts.GIU_LAI);
          }
          prevOpenRef.current = data.open;
        }
      } catch {
        // Bỏ qua lỗi polling định kỳ
      }
    }

    fetchTally();
    pollIntervalRef.current = setInterval(fetchTally, 1000);

    return () => {
      isMounted = false;
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [room, hostToken, decidedVerdict]);

  // Xử lý quyết định theo đa số phiếu
  function handleResolveVotes(approveCount: number, rejectCount: number) {
    if (approveCount > rejectCount) {
      setDecidedVerdict("CHO_QUA");
      onMajorityDecide("CHO_QUA");
    } else if (rejectCount > approveCount) {
      setDecidedVerdict("GIU_LAI");
      onMajorityDecide("GIU_LAI");
    } else {
      setIsTie(true);
      onManualTie();
    }
  }

  // Chốt kết quả ngay tại bàn
  async function handleCloseRound() {
    setIsLoading(true);
    try {
      const res = await fetch("/api/round", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${hostToken}`,
        },
        body: JSON.stringify({
          room,
          action: "close",
        }),
      });

      if (res.ok) {
        const approve = tally?.counts?.CHO_QUA ?? 0;
        const reject = tally?.counts?.GIU_LAI ?? 0;
        handleResolveVotes(approve, reject);
      }
    } catch {
      // Fallback lấy tally hiện tại nếu mạng ngắt
      const approve = tally?.counts?.CHO_QUA ?? 0;
      const reject = tally?.counts?.GIU_LAI ?? 0;
      handleResolveVotes(approve, reject);
    } finally {
      setIsLoading(false);
    }
  }

  // Dùng số nhập tay (Đường lui khẩn cấp tại bàn)
  function handleApplyManual(e: React.FormEvent) {
    e.preventDefault();
    const approve = Math.max(0, parseInt(manualApproveInput, 10) || 0);
    const reject = Math.max(0, parseInt(manualRejectInput, 10) || 0);
    handleResolveVotes(approve, reject);
  }

  const approveCount = tally?.counts?.CHO_QUA ?? 0;
  const rejectCount = tally?.counts?.GIU_LAI ?? 0;
  const totalCount = tally?.total ?? (approveCount + rejectCount);
  const approvePct = totalCount > 0 ? Math.round((approveCount / totalCount) * 100) : 0;
  const rejectPct = totalCount > 0 ? Math.round((rejectCount / totalCount) * 100) : 0;

  const projectorUrl = `/host?room=${encodeURIComponent(room)}`;

  return (
    <div className="bg-slate-900 border-2 border-amber-500/80 rounded-xl p-4 md:p-5 shadow-2xl text-slate-100 flex flex-col gap-4 animate-fade-in my-2">
      {/* Tiêu đề & Thông tin phòng */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
          <h3 className="font-bold text-base md:text-lg tracking-wide text-amber-400 font-serif">
            {content.strings["host.present_stop"]}
          </h3>
          <span className="bg-amber-600/30 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded text-xs font-mono font-bold">
            {content.strings["host.room_label"]}: {room}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={projectorUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded border border-slate-700 transition"
          >
            {content.strings["host.open_projector"]} ↗
          </a>
          {onDismiss && (
            <button
              type="button"
              onClick={onDismiss}
              className="text-slate-400 hover:text-slate-200 text-sm px-1.5"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {problem && (
        <p role="alert" className="border border-rose-600/70 bg-rose-950/60 text-rose-100 text-xs px-3 py-2 rounded">
          {problem} {content.strings["host.use_manual"]}
        </p>
      )}

      {/* Câu hỏi thảo luận */}
      <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-sm leading-relaxed text-slate-200 font-medium">
        {question}
      </div>

      {/* Trạng thái sau khi có kết quả */}
      {decidedVerdict && (
        <div
          className={`p-3.5 rounded-lg border text-sm font-bold flex items-center justify-between shadow ${
            decidedVerdict === "CHO_QUA"
              ? "bg-emerald-950/80 border-emerald-500 text-emerald-200"
              : "bg-rose-950/80 border-rose-500 text-rose-200"
          }`}
        >
          <span>
            {decidedVerdict === "CHO_QUA"
              ? content.strings["host.auto_stamped_approve"]
              : content.strings["host.auto_stamped_reject"]}
          </span>
          <span className="text-xs font-mono px-2 py-0.5 bg-black/40 rounded">
            {decidedVerdict === "CHO_QUA" ? `${approvePct}%` : `${rejectPct}%`}
          </span>
        </div>
      )}

      {/* Trường hợp hoà phiếu */}
      {isTie && (
        <div className="bg-amber-950/80 border border-amber-500 text-amber-200 p-3.5 rounded-lg text-sm font-bold shadow">
          {content.strings["host.tie_decide_hint"]}
        </div>
      )}

      {/* Biểu đồ số phiếu trực tiếp nếu chưa chốt */}
      {!decidedVerdict && !isTie && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>{content.strings["host.waiting_class"]}</span>
            <span>
              {content.strings["host.votes_total"]}: <strong className="text-slate-100">{totalCount}</strong>
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Cột CHO QUA */}
            <div className="bg-slate-950 p-3 rounded-lg border border-emerald-900/60 flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-xs font-bold text-emerald-400">
                <span>{content.strings["vote.stamp_approve"]}</span>
                <span className="font-mono text-sm">{approvePct}%</span>
              </div>
              <div className="w-full h-3 bg-slate-900 rounded overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${approvePct}%` }}
                />
              </div>
              <div className="text-[11px] font-mono text-emerald-300/80 text-right">
                {approveCount}
              </div>
            </div>

            {/* Cột GIỮ LẠI */}
            <div className="bg-slate-950 p-3 rounded-lg border border-rose-900/60 flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-xs font-bold text-rose-400">
                <span>{content.strings["vote.stamp_reject"]}</span>
                <span className="font-mono text-sm">{rejectPct}%</span>
              </div>
              <div className="w-full h-3 bg-slate-900 rounded overflow-hidden">
                <div
                  className="h-full bg-rose-500 transition-all duration-300"
                  style={{ width: `${rejectPct}%` }}
                />
              </div>
              <div className="text-[11px] font-mono text-rose-300/80 text-right">
                {rejectCount}
              </div>
            </div>
          </div>

          {/* Nút chốt kết quả */}
          <button
            type="button"
            onClick={handleCloseRound}
            disabled={isLoading || !roundOpened}
            className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition shadow"
          >
            {isLoading ? content.strings["host.connecting"] : content.strings["host.close_round"]}
          </button>
        </div>
      )}

      {/* Đường lui nhập tay (Khẩn cấp) ngay tại bàn */}
      {!decidedVerdict && !isTie && (
        <details className="border-t border-slate-800 pt-2 text-xs">
          <summary className="cursor-pointer text-slate-400 hover:text-amber-300 font-mono text-[11px] select-none py-1">
            ▶ {content.strings["host.manual_title"]}
          </summary>
          <form onSubmit={handleApplyManual} className="mt-2 p-2.5 bg-slate-950 rounded-lg border border-amber-600/40 flex flex-col gap-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor={manualApproveId} className="block text-[10px] font-mono text-emerald-400 mb-0.5">
                  {content.strings["vote.stamp_approve"]}
                </label>
                <input
                  id={manualApproveId}
                  type="number"
                  min="0"
                  value={manualApproveInput}
                  onChange={(e) => setManualApproveInput(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs font-mono text-slate-100"
                />
              </div>
              <div>
                <label htmlFor={manualRejectId} className="block text-[10px] font-mono text-rose-400 mb-0.5">
                  {content.strings["vote.stamp_reject"]}
                </label>
                <input
                  id={manualRejectId}
                  type="number"
                  min="0"
                  value={manualRejectInput}
                  onChange={(e) => setManualRejectInput(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs font-mono text-slate-100"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-1.5 bg-amber-700 hover:bg-amber-600 text-white text-[11px] font-bold rounded transition"
            >
              {content.strings["host.manual_apply"]}
            </button>
          </form>
        </details>
      )}
    </div>
  );
}
