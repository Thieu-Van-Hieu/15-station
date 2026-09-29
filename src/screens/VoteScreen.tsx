import { useState, useEffect, useRef } from "react";
import { content } from "../content";

const VOTER_ID_KEY = "tram15_voter_id";

function getOrCreateVoterId(): string {
  try {
    const existing = localStorage.getItem(VOTER_ID_KEY);
    if (existing && existing.trim().length > 0) return existing;
    const newId =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `voter-${Math.random().toString(36).slice(2)}-${Date.now()}`;
    localStorage.setItem(VOTER_ID_KEY, newId);
    return newId;
  } catch {
    return `voter-${Math.random().toString(36).slice(2)}`;
  }
}

interface VoteStateResponse {
  round: number;
  open: boolean;
  turnId?: string;
  question?: string;
  options?: ("CHO_QUA" | "GIU_LAI")[];
}

export function VoteScreen() {
  const [voterId] = useState<string>(getOrCreateVoterId);
  const [room, setRoom] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return (params.get("room") ?? "").trim().toUpperCase();
    }
    return "";
  });
  const [roomInput, setRoomInput] = useState<string>("");

  const [voteState, setVoteState] = useState<VoteStateResponse | null>(null);
  const [myChoice, setMyChoice] = useState<"CHO_QUA" | "GIU_LAI" | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [isConnectionError, setIsConnectionError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const prevRoundRef = useRef<number>(0);

  // Cập nhật room từ URL nếu có thay đổi
  function handleJoinRoom(e: React.FormEvent) {
    e.preventDefault();
    const clean = roomInput.trim().toUpperCase();
    if (!clean) return;
    setRoom(clean);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("room", clean);
      window.history.replaceState(null, "", url.toString());
    }
  }

  // Khôi phục phiếu đã bầu của round hiện tại từ localStorage
  useEffect(() => {
    if (!room || !voteState?.round) return;
    try {
      const savedChoice = localStorage.getItem(`tram15_vote_${room}_${voteState.round}`);
      if (savedChoice === "CHO_QUA" || savedChoice === "GIU_LAI") {
        setMyChoice(savedChoice);
      } else if (prevRoundRef.current !== voteState.round) {
        setMyChoice(null);
      }
      prevRoundRef.current = voteState.round;
    } catch {
      // Bỏ qua lỗi localStorage
    }
  }, [room, voteState?.round]);

  // Polling /api/state?room=... mỗi 3 giây
  useEffect(() => {
    if (!room) return;

    let isMounted = true;

    async function pollState() {
      try {
        const res = await fetch(`/api/state?room=${encodeURIComponent(room)}`, {
          headers: { Accept: "application/json" },
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const data: VoteStateResponse = await res.json();
        if (isMounted) {
          setVoteState(data);
          setIsConnectionError(false);
          // Nếu vòng đã đóng, xoá thông báo lỗi gửi trước đó
          if (!data.open && errorMessage) {
            setErrorMessage(null);
          }
        }
      } catch {
        if (isMounted) {
          setIsConnectionError(true);
        }
      }
    }

    pollState();
    const timer = setInterval(pollState, 3000);

    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, [room, errorMessage]);

  // Gửi phiếu bầu
  async function handleVote(choice: "CHO_QUA" | "GIU_LAI") {
    if (!room || !voteState || !voteState.open || submitting) return;

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          room,
          round: voteState.round,
          voterId,
          choice,
        }),
      });

      const data = await res.json();

      if (data.ok) {
        setMyChoice(choice);
        try {
          localStorage.setItem(`tram15_vote_${room}_${voteState.round}`, choice);
        } catch {
          // Bỏ qua
        }
      } else if (data.reason === "closed") {
        setErrorMessage(content.strings["vote.error_closed"]);
        setVoteState((prev) => (prev ? { ...prev, open: false } : null));
      } else {
        setErrorMessage(data.error || content.strings["vote.error_submit"]);
      }
    } catch {
      setErrorMessage(content.strings["vote.connection_lost"]);
    } finally {
      setSubmitting(false);
    }
  }

  // 1. Màn hình nhập mã phòng (khi không có ?room= trên URL)
  if (!room) {
    return (
      <main className="min-h-screen bg-xi-mang text-muc font-may-chu p-4 flex flex-col items-center justify-center">
        <div className="max-w-md w-full border-4 border-nau bg-giay p-6 rounded shadow-2xl space-y-6 text-center">
          <header className="border-b-2 border-nau/40 pb-3">
            <h1 className="text-xl font-bold text-dau-do tracking-wider">
              {content.strings["vote.title"]}
            </h1>
            <p className="text-xs text-neutral-600 font-mono mt-1">
              {content.strings["ui.brand_sub"] ?? "Trạm kiểm soát liên huyện số 15"}
            </p>
          </header>

          <form onSubmit={handleJoinRoom} className="space-y-4 text-left">
            <div>
              <label htmlFor="room-input" className="block text-xs font-bold uppercase text-nau mb-1">
                {content.strings["vote.room_label"]}
              </label>
              <input
                id="room-input"
                type="text"
                autoFocus
                maxLength={10}
                placeholder={content.strings["vote.room_placeholder"]}
                value={roomInput}
                onChange={(e) => setRoomInput(e.target.value)}
                className="w-full p-3 border-2 border-nau rounded bg-white text-muc font-mono text-center text-lg font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-dau-do"
              />
            </div>

            <button
              type="submit"
              disabled={!roomInput.trim()}
              className="w-full py-3 bg-nau hover:bg-nau/90 text-giay font-bold text-sm tracking-widest uppercase rounded shadow border-2 border-giay disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
            >
              {content.strings["vote.room_submit"]}
            </button>
          </form>
        </div>
      </main>
    );
  }

  const isRoundOpen = Boolean(voteState && voteState.open && voteState.round > 0);

  return (
    <main className="min-h-screen bg-xi-mang text-muc font-may-chu p-4 flex flex-col items-center justify-center">
      <div className="max-w-md w-full border-4 border-nau bg-giay p-6 rounded shadow-2xl space-y-6">
        {/* Header phòng và vòng */}
        <header className="border-b-2 border-nau/40 pb-3 flex items-center justify-between text-xs">
          <div>
            <span className="font-bold text-dau-do uppercase tracking-wider block">
              {content.strings["vote.title"]}
            </span>
            <span className="font-mono text-neutral-600">
              {content.strings["vote.room_label"]}: <strong className="text-muc">{room}</strong>
            </span>
          </div>
          {voteState && voteState.round > 0 && (
            <div className="bg-nau/10 border border-nau/30 px-2 py-1 rounded text-right font-mono">
              <span className="text-[10px] text-neutral-600 block leading-tight">
                {content.strings["vote.round_label"]}
              </span>
              <strong className="text-dau-do text-sm font-bold">#{voteState.round}</strong>
            </div>
          )}
        </header>

        {/* Cảnh báo mất kết nối */}
        {isConnectionError && (
          <div className="p-2.5 bg-yellow-100 border border-yellow-700 text-yellow-950 text-xs rounded text-center animate-pulse">
            {content.strings["vote.connection_lost"]}
          </div>
        )}

        {/* Thông báo lỗi thao tác */}
        {errorMessage && (
          <div className="p-2.5 bg-red-100 border border-red-700 text-red-950 text-xs rounded text-center font-semibold">
            {errorMessage}
          </div>
        )}

        {/* Trạng thái 1: Chưa mở vòng hoặc vòng đã đóng */}
        {!isRoundOpen ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full border-4 border-dashed border-nau/50 flex items-center justify-center text-nau text-2xl font-bold animate-spin">
              ⏳
            </div>
            <h2 className="text-lg font-bold text-nau uppercase tracking-wide">
              {content.strings["vote.waiting"]}
            </h2>
            <p className="text-xs text-neutral-600 leading-relaxed max-w-xs mx-auto italic">
              {content.strings["vote.waiting_desc"]}
            </p>
          </div>
        ) : (
          /* Trạng thái 2: Đang mở vòng bỏ phiếu */
          <div className="space-y-6">
            {/* Câu hỏi / Tình huống */}
            <div className="p-4 bg-nau/5 border-2 border-dashed border-nau/40 rounded space-y-2">
              <h2 className="text-xs uppercase font-bold text-dau-do tracking-wider">
                {voteState?.turnId ? `Lượt: ${voteState.turnId}` : "Tình huống xem xét:"}
              </h2>
              <p className="text-sm font-serif leading-relaxed text-muc font-semibold">
                {voteState?.question}
              </p>
            </div>

            {/* Thông báo đã bầu */}
            {myChoice && (
              <div className="p-3 bg-green-50 border-2 border-green-700 text-green-950 rounded text-center space-y-1">
                <div className="font-bold text-xs uppercase text-green-800">
                  ✓ {content.strings["vote.your_vote"]}:{" "}
                  <span className="underline tracking-wider">
                    {myChoice === "CHO_QUA"
                      ? content.strings["vote.stamp_approve"]
                      : content.strings["vote.stamp_reject"]}
                  </span>
                </div>
                <p className="text-[11px] text-green-900/80 italic">
                  {content.strings["vote.can_change"]}
                </p>
              </div>
            )}

            {/* Hai nút to CHO QUA và GIỮ LẠI */}
            <div className="grid grid-cols-1 gap-4 pt-2">
              {/* Nút CHO QUA */}
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleVote("CHO_QUA")}
                className={`py-4 px-6 border-4 font-bold text-lg tracking-widest uppercase rounded shadow-lg transition-transform active:scale-95 flex items-center justify-center space-x-2 ${
                  myChoice === "CHO_QUA"
                    ? "bg-green-800 text-white border-green-950 ring-4 ring-green-600/40"
                    : "border-green-800 text-green-900 bg-green-100 hover:bg-green-200"
                }`}
              >
                <span>{content.strings["vote.stamp_approve"]}</span>
                {myChoice === "CHO_QUA" && <span className="text-xl">✓</span>}
              </button>

              {/* Nút GIỮ LẠI */}
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleVote("GIU_LAI")}
                className={`py-4 px-6 border-4 font-bold text-lg tracking-widest uppercase rounded shadow-lg transition-transform active:scale-95 flex items-center justify-center space-x-2 ${
                  myChoice === "GIU_LAI"
                    ? "bg-dau-do text-white border-red-950 ring-4 ring-red-600/40"
                    : "border-dau-do text-dau-do bg-red-100 hover:bg-red-200"
                }`}
              >
                <span>{content.strings["vote.stamp_reject"]}</span>
                {myChoice === "GIU_LAI" && <span className="text-xl">✓</span>}
              </button>
            </div>
          </div>
        )}

        {/* Footer ghi chú bảo mật cử tri */}
        <footer className="border-t border-nau/30 pt-3 text-center text-[10px] text-neutral-500 font-mono">
          ID: {voterId.slice(0, 8)}... • Phiếu kín & tự do
        </footer>
      </div>
    </main>
  );
}
