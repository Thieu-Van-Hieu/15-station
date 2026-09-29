import { useState, useEffect, useRef, useId } from "react";
import QRCode from "qrcode";
import { content } from "../content";
import { explainHostError, isHostSetupMessage } from "../hostApi";

const HOST_TOKEN_KEY = "tram15_host_token";
const HOST_ROOM_KEY = "tram15_host_room";
const DEFAULT_ROOM = "T15";
const TURN_PRESET_IDS = ["d3-t3", "d1-t1", "d3-t1", "d5-t1", "d5-t4"] as const;

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

export function HostScreen() {
  const [hostToken, setHostToken] = useState<string>(() => {
    try {
      // Không có token mặc định: token chỉ nằm ở máy chủ và trong trình duyệt của người chủ trì, không nằm trong bundle.
      return localStorage.getItem(HOST_TOKEN_KEY) ?? "";
    } catch {
      return "";
    }
  });

  const [room, setRoom] = useState<string>(() => {
    try {
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const r = params.get("room");
        if (r && r.trim().length > 0) return r.trim().toUpperCase();
      }
      return localStorage.getItem(HOST_ROOM_KEY) || DEFAULT_ROOM;
    } catch {
      return DEFAULT_ROOM;
    }
  });

  const [roomInput, setRoomInput] = useState<string>(room);
  const [tokenInput, setTokenInput] = useState<string>(hostToken);

  const [selectedTurnId, setSelectedTurnId] = useState<string>("d3-t3");
  const [customQuestion, setCustomQuestion] = useState<string>("");

  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const [tally, setTally] = useState<TallyData | null>(null);
  const [manualTally, setManualTally] = useState<{ approve: number; reject: number } | null>(null);
  const [manualApproveInput, setManualApproveInput] = useState<string>("0");
  const [manualRejectInput, setManualRejectInput] = useState<string>("0");

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const prevRoundRef = useRef<number>(0);
  const roomInputId = useId();
  const tokenInputId = useId();
  const turnSelectId = useId();
  const questionInputId = useId();
  const manualApproveId = useId();
  const manualRejectId = useId();

  // Tạo URL bình chọn cho học sinh
  const voteUrl = typeof window !== "undefined"
    ? `${window.location.origin}/vote?room=${encodeURIComponent(room)}`
    : `/vote?room=${encodeURIComponent(room)}`;

  // Tạo mã QR khi phòng thay đổi
  useEffect(() => {
    let isMounted = true;
    QRCode.toDataURL(voteUrl, {
      margin: 1,
      width: 256,
      color: {
        dark: "#0f172a",
        light: "#ffffff",
      },
    })
      .then((url) => {
        if (isMounted) setQrDataUrl(url);
      })
      .catch(() => {
        // Dự phòng nếu lỗi
        if (isMounted) setQrDataUrl("");
      });

    return () => {
      isMounted = false;
    };
  }, [voteUrl]);

  // Cập nhật câu hỏi mặc định theo lượt khách được chọn
  useEffect(() => {
    if (!customQuestion) {
      if (selectedTurnId === "d3-t3") {
        setCustomQuestion(content.strings["host.default_question_d3t3"]);
      } else {
        const tr = content.travelers.find((t) => t.id === selectedTurnId);
        if (tr) {
          const char = content.characters.find((c) => c.id === tr.character);
          const charName = char ? char.name : tr.character;
          setCustomQuestion(`${charName} (${tr.id}) - ${content.strings["vote.stamp_approve"]} / ${content.strings["vote.stamp_reject"]}?`);
        }
      }
    }
  }, [selectedTurnId, customQuestion]);

  // Polling kết quả kiểm phiếu /api/tally mỗi 1 giây
  useEffect(() => {
    if (!room) return;

    let isMounted = true;
    let timer: ReturnType<typeof setInterval> | null = null;

    async function fetchTally() {
      if (!hostToken) {
        setStatusMessage(content.strings["host.token_missing"]);
        return;
      }
      try {
        const res = await fetch(`/api/tally?room=${encodeURIComponent(room)}`, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${hostToken}`,
          },
        });

        if (!res.ok && isMounted) {
          setStatusMessage(await explainHostError(res));
          return;
        }
        if (res.ok) {
          const data: TallyData = await res.json();
          if (isMounted) {
            setStatusMessage((m) => (m !== null && isHostSetupMessage(m) ? null : m));
            setTally(data);
            if (prevRoundRef.current !== data.round) {
              prevRoundRef.current = data.round;
              if (data.turnId) setSelectedTurnId(data.turnId);
              if (data.question) setCustomQuestion(data.question);
            }
          }
        }
      } catch {
        // Bỏ qua lỗi polling định kỳ
      }
    }

    fetchTally();
    timer = setInterval(fetchTally, 1000);

    return () => {
      isMounted = false;
      if (timer) clearInterval(timer);
    };
  }, [room, hostToken]);

  // Mở vòng bỏ phiếu mới
  async function handleOpenRound() {
    setIsLoading(true);
    setStatusMessage(null);
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
          turnId: selectedTurnId,
          question: customQuestion,
          options: ["CHO_QUA", "GIU_LAI"],
        }),
      });

      if (!res.ok) throw new Error(await explainHostError(res));
      const data = await res.json();

      setManualTally(null);
      setTally({
        round: data.round,
        open: true,
        turnId: selectedTurnId,
        question: customQuestion,
        counts: { CHO_QUA: 0, GIU_LAI: 0 },
        total: 0,
      });
    } catch (err) {
      setStatusMessage(err instanceof Error ? err.message : String(content.strings["host.error"]));
    } finally {
      setIsLoading(false);
    }
  }

  // Chốt vòng bỏ phiếu
  async function handleCloseRound() {
    setIsLoading(true);
    setStatusMessage(null);
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

      if (!res.ok) throw new Error(await explainHostError(res));

      setTally((prev) => (prev ? { ...prev, open: false } : null));
    } catch (err) {
      setStatusMessage(err instanceof Error ? err.message : String(content.strings["host.error"]));
    } finally {
      setIsLoading(false);
    }
  }

  // Lưu mã phòng mới
  function handleSaveRoom(e: React.FormEvent) {
    e.preventDefault();
    const clean = roomInput.trim().toUpperCase();
    if (!clean) return;
    setRoom(clean);
    try {
      localStorage.setItem(HOST_ROOM_KEY, clean);
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        url.searchParams.set("room", clean);
        window.history.replaceState(null, "", url.toString());
      }
    } catch {
      // Bỏ qua
    }
  }

  // Lưu HOST_TOKEN mới
  function handleSaveToken(e: React.FormEvent) {
    e.preventDefault();
    const clean = tokenInput.trim();
    if (!clean) return;
    setHostToken(clean);
    try {
      localStorage.setItem(HOST_TOKEN_KEY, clean);
    } catch {
      // Bỏ qua
    }
  }

  // Sao chép liên kết bỏ phiếu
  function handleCopyLink() {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(voteUrl).then(() => {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      });
    }
  }

  // Áp dụng số nhập tay (Đường lui khẩn cấp)
  function handleApplyManualTally(e: React.FormEvent) {
    e.preventDefault();
    const approve = Math.max(0, parseInt(manualApproveInput, 10) || 0);
    const reject = Math.max(0, parseInt(manualRejectInput, 10) || 0);
    setManualTally({ approve, reject });
  }

  // Huỷ số nhập tay, quay lại kết quả trực tuyến
  function handleResetManualTally() {
    setManualTally(null);
  }

  // Tính toán số liệu hiển thị (kết quả online hoặc kết quả thủ công nếu đã bật)
  const currentApprove = manualTally ? manualTally.approve : tally?.counts?.CHO_QUA ?? 0;
  const currentReject = manualTally ? manualTally.reject : tally?.counts?.GIU_LAI ?? 0;
  const currentTotal = manualTally ? manualTally.approve + manualTally.reject : tally?.total ?? 0;

  const approvePercent = currentTotal > 0 ? Math.round((currentApprove / currentTotal) * 100) : 0;
  const rejectPercent = currentTotal > 0 ? Math.round((currentReject / currentTotal) * 100) : 0;

  const isRoundOpen = tally?.open ?? false;
  const roundNum = tally?.round ?? 0;

  // Quyết định đa số
  let winnerResultText: string | null = null;
  if (currentTotal > 0) {
    if (currentApprove > currentReject) {
      winnerResultText = content.strings["host.result_approve_wins"];
    } else if (currentReject > currentApprove) {
      winnerResultText = content.strings["host.result_reject_wins"];
    } else {
      winnerResultText = content.strings["host.result_tie"];
    }
  }

  // Thông tin nhân vật và hành lý của lượt khách được chọn
  const travelerInfo = content.travelers.find((t) => t.id === selectedTurnId);
  const charInfo = travelerInfo ? content.characters.find((c) => c.id === travelerInfo.character) : null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none">
      {/* Thanh tiêu đề tối ưu cho máy chiếu */}
      <header className="border-b border-slate-800 bg-slate-900/90 px-6 py-4 flex flex-wrap items-center justify-between gap-4 backdrop-blur shadow-md">
        <div className="flex items-center gap-4">
          <div className="bg-amber-600/20 text-amber-400 border border-amber-500/30 px-3 py-1 rounded text-xs font-mono font-bold tracking-wider">
            {content.strings["host.room_label"]}: {room}
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-wide text-slate-100 font-serif">
            {content.strings["host.title"]}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span
              className={`inline-block w-3 h-3 rounded-full ${
                isRoundOpen ? "bg-emerald-500 animate-ping" : roundNum > 0 ? "bg-amber-500" : "bg-slate-600"
              }`}
            />
            <span className="text-sm font-medium text-slate-300">
              {isRoundOpen
                ? `${content.strings["host.round_active"]} (#${roundNum})`
                : roundNum > 0
                ? `${content.strings["host.round_closed"]} (#${roundNum})`
                : content.strings["host.round_none"]}
            </span>
          </div>

          <a
            href="/"
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded border border-slate-700 transition"
          >
            {content.strings["host.back_game"]}
          </a>
        </div>
      </header>

      {/* Thông báo lỗi nếu có */}
      {statusMessage && (
        <div className="bg-rose-950/80 border-b border-rose-800 text-rose-200 px-6 py-2 text-sm flex items-center justify-between">
          <span>{statusMessage}</span>
          <button
            type="button"
            onClick={() => setStatusMessage(null)}
            className="text-rose-400 hover:text-rose-100 font-bold px-2"
          >
            ×
          </button>
        </div>
      )}

      {/* Bảng kết quả máy chiếu chính (Projector Centerpiece) */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 flex flex-col gap-6">
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-2xl flex flex-col gap-6">
          {/* Câu hỏi thảo luận cỡ chữ lớn cho máy chiếu */}
          <div className="text-center flex flex-col items-center gap-2">
            <span className="text-xs uppercase tracking-widest text-slate-400 font-mono">
              {content.strings["host.question_label"]} {roundNum > 0 && `· ${content.strings["vote.round_label"]} ${roundNum}`}
            </span>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-serif font-bold text-slate-50 max-w-4xl leading-snug">
              {customQuestion || content.strings["vote.waiting_desc"]}
            </h2>
          </div>

          {/* Cảnh báo đường lui nhập tay */}
          {manualTally && (
            <div className="bg-amber-950/70 border border-amber-600/60 text-amber-200 px-4 py-2.5 rounded-lg flex items-center justify-between text-sm">
              <span className="font-semibold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                {content.strings["host.manual_applied"]}
              </span>
              <button
                type="button"
                onClick={handleResetManualTally}
                className="px-2.5 py-1 bg-amber-800/80 hover:bg-amber-700 text-amber-100 text-xs rounded border border-amber-600 transition"
              >
                {content.strings["host.manual_reset"]}
              </button>
            </div>
          )}

          {/* Biểu đồ thanh bình chọn trực quan cỡ lớn */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-2">
            {/* Cột CHO QUA */}
            <div
              className={`p-6 rounded-xl border flex flex-col gap-3 transition-all ${
                winnerResultText === content.strings["host.result_approve_wins"]
                  ? "bg-emerald-950/40 border-emerald-500/80 shadow-lg shadow-emerald-950/50"
                  : "bg-slate-800/60 border-slate-700/60"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xl md:text-2xl font-bold tracking-wide text-emerald-400">
                  {content.strings["vote.stamp_approve"]}
                </span>
                <span className="text-4xl md:text-5xl font-mono font-black text-emerald-300">
                  {approvePercent}%
                </span>
              </div>

              {/* Thanh tiến trình */}
              <div className="w-full h-8 bg-slate-950/80 rounded-lg overflow-hidden border border-emerald-900/40 p-1">
                <div
                  className="h-full bg-emerald-500 rounded transition-all duration-500 ease-out"
                  style={{ width: `${approvePercent}%` }}
                />
              </div>

              <div className="text-sm font-mono text-emerald-200/80 text-right">
                {currentApprove} {content.strings["host.votes_total"].toLowerCase()}
              </div>
            </div>

            {/* Cột GIỮ LẠI */}
            <div
              className={`p-6 rounded-xl border flex flex-col gap-3 transition-all ${
                winnerResultText === content.strings["host.result_reject_wins"]
                  ? "bg-rose-950/40 border-rose-500/80 shadow-lg shadow-rose-950/50"
                  : "bg-slate-800/60 border-slate-700/60"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xl md:text-2xl font-bold tracking-wide text-rose-400">
                  {content.strings["vote.stamp_reject"]}
                </span>
                <span className="text-4xl md:text-5xl font-mono font-black text-rose-300">
                  {rejectPercent}%
                </span>
              </div>

              {/* Thanh tiến trình */}
              <div className="w-full h-8 bg-slate-950/80 rounded-lg overflow-hidden border border-rose-900/40 p-1">
                <div
                  className="h-full bg-rose-500 rounded transition-all duration-500 ease-out"
                  style={{ width: `${rejectPercent}%` }}
                />
              </div>

              <div className="text-sm font-mono text-rose-200/80 text-right">
                {currentReject} {content.strings["host.votes_total"].toLowerCase()}
              </div>
            </div>
          </div>

          {/* Dòng tổng số phiếu và kết quả đa số */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
            <div className="text-slate-300 font-mono text-base md:text-lg">
              {content.strings["host.votes_total"]}:{" "}
              <strong className="text-white text-xl">{currentTotal}</strong>
            </div>

            {winnerResultText && (
              <div
                className={`px-5 py-2.5 rounded-xl font-bold text-lg tracking-wide border shadow-md animate-fade-in ${
                  winnerResultText === content.strings["host.result_approve_wins"]
                    ? "bg-emerald-900/60 border-emerald-500 text-emerald-100"
                    : winnerResultText === content.strings["host.result_reject_wins"]
                    ? "bg-rose-900/60 border-rose-500 text-rose-100"
                    : "bg-amber-900/60 border-amber-500 text-amber-100"
                }`}
              >
                {winnerResultText}
              </div>
            )}
          </div>
        </section>

        {/* Khung điều khiển cho Host và người điều hành lớp */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cột 1: Mã QR và Hướng dẫn truy cập cho sinh viên */}
          <section className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col items-center justify-center text-center gap-4">
            <h3 className="text-sm font-mono uppercase tracking-wider text-slate-400">
              {content.strings["host.qr_scan_hint"]}
            </h3>

            {qrDataUrl ? (
              <div className="p-3 bg-white rounded-xl shadow-lg inline-block">
                <img src={qrDataUrl} alt="QR Code Vote" className="w-44 h-44 object-contain" />
              </div>
            ) : (
              <div className="w-44 h-44 bg-slate-800 rounded-xl flex items-center justify-center text-slate-500 text-sm">
                QR Code
              </div>
            )}

            <div className="w-full flex flex-col gap-2">
              <div className="bg-slate-950 px-3 py-2 rounded border border-slate-800 text-xs font-mono text-slate-300 break-all select-all">
                {voteUrl}
              </div>

              <button
                type="button"
                onClick={handleCopyLink}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded border border-slate-700 transition"
              >
                {copiedLink ? content.strings["host.copied"] : content.strings["host.copy_link"]}
              </button>
            </div>
          </section>

          {/* Cột 2: Điều khiển vòng bỏ phiếu & câu hỏi */}
          <section className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-4">
            <h3 className="text-sm font-mono uppercase tracking-wider text-slate-400">
              {content.strings["host.turn_preview"]}
            </h3>

            {/* Chọn lượt khách mẫu */}
            <div>
              <label htmlFor={turnSelectId} className="block text-xs font-mono text-slate-400 mb-1">
                {content.strings["host.turn_label"]}
              </label>
              <select
                id={turnSelectId}
                value={selectedTurnId}
                onChange={(e) => setSelectedTurnId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
              >
                {TURN_PRESET_IDS.map((turnId) => {
                  const tr = content.travelers.find((t) => t.id === turnId);
                  const char = tr ? content.characters.find((c) => c.id === tr.character) : null;
                  const label = `${turnId}: ${char ? char.name : turnId}`;
                  return (
                    <option key={turnId} value={turnId}>
                      {label}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Xem nhanh thông tin nhân vật */}
            {charInfo && (
              <div className="bg-slate-950 p-3 rounded border border-slate-800 text-xs text-slate-300 flex flex-col gap-1">
                <div className="font-semibold text-slate-100">{charInfo.name}</div>
                <div className="text-slate-400">{charInfo.background}</div>
              </div>
            )}

            {/* Ô nhập câu hỏi tùy chỉnh */}
            <div>
              <label htmlFor={questionInputId} className="block text-xs font-mono text-slate-400 mb-1">
                {content.strings["host.question_label"]}
              </label>
              <textarea
                id={questionInputId}
                rows={2}
                value={customQuestion}
                onChange={(e) => setCustomQuestion(e.target.value)}
                placeholder={content.strings["host.custom_question"]}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500 resize-none"
              />
            </div>

            {/* Nút thao tác mở / chốt */}
            <div className="pt-2 flex flex-col gap-2">
              {!isRoundOpen ? (
                <button
                  type="button"
                  onClick={handleOpenRound}
                  disabled={isLoading}
                  className="w-full py-3 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold rounded-lg transition shadow-md flex items-center justify-center gap-2"
                >
                  {isLoading ? content.strings["host.connecting"] : content.strings["host.open_round"]}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleCloseRound}
                  disabled={isLoading}
                  className="w-full py-3 bg-rose-700 hover:bg-rose-600 disabled:opacity-50 text-white font-bold rounded-lg transition shadow-md flex items-center justify-center gap-2"
                >
                  {isLoading ? content.strings["host.connecting"] : content.strings["host.close_round"]}
                </button>
              )}
            </div>
          </section>

          {/* Cột 3: Đường lui nhập tay (Khẩn cấp) & Cài đặt token/phòng */}
          <section className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-5 justify-between">
            {/* Đường lui nhập tay */}
            <div className="bg-slate-950 p-4 rounded-lg border border-amber-500/40 flex flex-col gap-3">
              <div>
                <h4 className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wide">
                  {content.strings["host.manual_title"]}
                </h4>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  {content.strings["host.manual_desc"]}
                </p>
              </div>

              <form onSubmit={handleApplyManualTally} className="flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor={manualApproveId} className="block text-[11px] font-mono text-emerald-400 mb-1">
                      {content.strings["vote.stamp_approve"]}
                    </label>
                    <input
                      id={manualApproveId}
                      type="number"
                      min="0"
                      value={manualApproveInput}
                      onChange={(e) => setManualApproveInput(e.target.value)}
                      className="w-full bg-slate-900 border border-emerald-900/80 rounded px-2.5 py-1.5 text-sm text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label htmlFor={manualRejectId} className="block text-[11px] font-mono text-rose-400 mb-1">
                      {content.strings["vote.stamp_reject"]}
                    </label>
                    <input
                      id={manualRejectId}
                      type="number"
                      min="0"
                      value={manualRejectInput}
                      onChange={(e) => setManualRejectInput(e.target.value)}
                      className="w-full bg-slate-900 border border-rose-900/80 rounded px-2.5 py-1.5 text-sm text-slate-100 font-mono focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-amber-700 hover:bg-amber-600 text-white text-xs font-bold rounded transition shadow"
                >
                  {content.strings["host.manual_apply"]}
                </button>
              </form>
            </div>

            {/* Cài đặt phòng và Host Token */}
            <div className="flex flex-col gap-3 pt-2 border-t border-slate-800">
              <form onSubmit={handleSaveRoom} className="flex gap-2 items-center">
                <label htmlFor={roomInputId} className="text-xs font-mono text-slate-400 whitespace-nowrap">
                  {content.strings["host.room_label"]}:
                </label>
                <input
                  id={roomInputId}
                  type="text"
                  maxLength={10}
                  value={roomInput}
                  onChange={(e) => setRoomInput(e.target.value.toUpperCase())}
                  className="w-24 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs font-mono text-slate-200"
                />
                <button
                  type="submit"
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded border border-slate-700"
                >
                  OK
                </button>
              </form>

              <form onSubmit={handleSaveToken} className="flex gap-2 items-center">
                <label htmlFor={tokenInputId} className="text-xs font-mono text-slate-400 whitespace-nowrap">
                  Token:
                </label>
                <input
                  id={tokenInputId}
                  type="password"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  placeholder={content.strings["host.token_placeholder"]}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs font-mono text-slate-200"
                />
                <button
                  type="submit"
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded border border-slate-700"
                >
                  OK
                </button>
              </form>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
