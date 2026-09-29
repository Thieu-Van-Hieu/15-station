import { useEffect, useRef, useState } from "react";
import { content } from "../content";
import { caseFor, majority, percent, type Choice, type Counts } from "../classroom";
import { Label, Paper, Portrait, cx } from "../components/ui";

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
  options?: Choice[];
  openedAt?: number;
  endsAt?: number;
  /** Chỉ có khi vòng đã đóng. */
  result?: Counts;
  closedAt?: number;
}

/** Kết quả cũ hơn mốc này là của buổi trước: người mới vào phòng thấy phòng chờ thay vì kết quả cũ. */
const RESULT_FRESH_MS = 10 * 60 * 1000;

const str = content.strings;

/** Màn điện thoại /vote: phòng chờ, hồ sơ lượt khách và hai nút bỏ phiếu, rồi kết quả của lớp. */
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
  const [myChoice, setMyChoice] = useState<Choice | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [isConnectionError, setIsConnectionError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());

  const prevRoundRef = useRef<number>(0);

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

  // Báo đã vào phòng để máy chiếu đếm người. Lỗi thì thôi, không ảnh hưởng bỏ phiếu.
  useEffect(() => {
    if (!room) return;
    Promise.resolve()
      .then(() =>
        fetch("/api/join", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ room, voterId }),
        }),
      )
      .catch(() => undefined);
  }, [room, voterId]);

  // Khôi phục phiếu đã bầu của vòng hiện tại từ localStorage
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

  // Hỏi trạng thái phòng mỗi 3 giây
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
          // Vòng đã đóng thì xoá thông báo lỗi gửi trước đó
          if (!data.open) setErrorMessage(null);
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
  }, [room]);

  const isRoundOpen = Boolean(voteState && voteState.open && voteState.round > 0);
  const endsAt = isRoundOpen ? voteState?.endsAt : undefined;

  // Đồng hồ đếm ngược chạy mượt giữa hai lần hỏi máy chủ
  useEffect(() => {
    if (!endsAt) return;
    const timer = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(timer);
  }, [endsAt]);

  const remaining = endsAt ? Math.max(0, Math.ceil((endsAt - now) / 1000)) : null;
  const totalSec = endsAt && voteState?.openedAt ? Math.max(1, Math.round((endsAt - voteState.openedAt) / 1000)) : null;
  const timeUp = remaining === 0;

  async function handleVote(choice: Choice) {
    if (!room || !voteState || !voteState.open || submitting || timeUp) return;

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
        setErrorMessage(str["vote.error_closed"]);
        setVoteState((prev) => (prev ? { ...prev, open: false } : null));
      } else {
        setErrorMessage(data.error || str["vote.error_submit"]);
      }
    } catch {
      setErrorMessage(str["vote.connection_lost"]);
    } finally {
      setSubmitting(false);
    }
  }

  // 1. Màn hình nhập mã phòng (khi không có ?room= trên URL)
  if (!room) {
    return (
      <main className="min-h-screen mat-ban lop-nhieu text-muc font-may-chu p-4 flex flex-col items-center justify-center">
        <Paper raised clip className="max-w-md w-full p-6 space-y-6 text-center">
          <header className="border-b-2 border-muc/30 pb-3">
            <h1 className="text-xl font-tieu-de font-bold text-son tracking-wider">{str["vote.title"]}</h1>
            <p className="text-xs text-muc-nhat font-nhan mt-1">{str["ui.brand_sub"]}</p>
          </header>

          <form onSubmit={handleJoinRoom} className="space-y-4 text-left">
            <div>
              <label htmlFor="room-input" className="block text-xs font-bold uppercase text-muc-nhat mb-1">
                {str["vote.room_label"]}
              </label>
              <input
                id="room-input"
                type="text"
                autoFocus
                autoCapitalize="characters"
                maxLength={10}
                placeholder={str["vote.room_placeholder"]}
                value={roomInput}
                onChange={(e) => setRoomInput(e.target.value)}
                className="w-full p-3 border-2 border-muc bg-white text-muc font-nhan text-center text-2xl font-bold tracking-[0.3em] uppercase placeholder:text-sm placeholder:tracking-normal placeholder:normal-case focus:outline-none focus:ring-2 focus:ring-son"
              />
            </div>

            <button
              type="submit"
              disabled={!roomInput.trim()}
              className="w-full py-3.5 bg-son hover:bg-son-dam text-giay font-nhan font-bold text-sm tracking-widest uppercase shadow-bia disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
            >
              {str["vote.room_submit"]}
            </button>
          </form>
        </Paper>
      </main>
    );
  }

  const dossier = voteState?.turnId ? caseFor(voteState.turnId) : null;
  const question = dossier?.question ?? voteState?.question;
  const result =
    !isRoundOpen && voteState?.result && voteState.closedAt && now - voteState.closedAt < RESULT_FRESH_MS ? voteState.result : null;
  const delegateNo = voterId.replace(/[^a-z0-9]/gi, "").slice(-4).toUpperCase();

  return (
    <main className="min-h-screen mat-ban lop-nhieu text-muc font-may-chu p-3 flex flex-col items-center justify-start sm:justify-center">
      <Paper raised className="max-w-md w-full p-5 space-y-5">
        {/* Header phòng và vòng */}
        <header className="border-b-2 border-muc/30 pb-3 flex items-center justify-between text-xs">
          <div>
            <span className="font-tieu-de font-bold text-son uppercase tracking-wider block">{str["vote.title"]}</span>
            <span className="font-nhan text-muc-nhat">
              {str["vote.room_label"]}: <strong className="text-muc">{room}</strong>
            </span>
          </div>
          {voteState && voteState.round > 0 && (
            <div className="bg-bia/60 border border-muc/25 px-2 py-1 text-right font-nhan">
              <span className="text-[10px] text-muc-nhat block leading-tight">{str["vote.round_label"]}</span>
              <strong className="text-son text-sm font-bold">#{voteState.round}</strong>
            </div>
          )}
        </header>

        {isConnectionError && (
          <div className="p-2.5 bg-ho-phach/25 border border-ho-phach text-muc text-xs text-center animate-nhap-nhay">
            {str["vote.connection_lost"]}
          </div>
        )}

        {errorMessage && <div className="p-2.5 bg-son/15 border border-son text-son-dam text-xs text-center font-semibold">{errorMessage}</div>}

        {isRoundOpen ? (
          <div className="space-y-4">
            {/* Hồ sơ lượt khách */}
            {dossier ? (
              <div className="space-y-3">
                <div className="flex gap-3">
                  <Portrait charKey={dossier.portraitKey} expression={dossier.expression} alt={dossier.name} className="w-16 aspect-[5/6] shrink-0 border border-giay-vien" />
                  <div className="min-w-0">
                    <Label className="text-son text-[10px]">
                      {str["vote.turn_prefix"]} {dossier.turnId.toUpperCase()}
                    </Label>
                    <div className="font-tieu-de font-bold text-lg leading-tight">{dossier.name}</div>
                    <p className="text-[12px] leading-snug text-muc-nhat mt-0.5">{dossier.lead}</p>
                  </div>
                </div>
                {dossier.facts.length > 0 && (
                  <ul className="space-y-1.5 text-[13px] leading-snug">
                    {dossier.facts.map((f, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="font-nhan font-bold text-son">{i + 1}.</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <Label className="text-son">{str["vote.situation"]}</Label>
            )}

            <p className="border-2 border-muc px-3 py-2.5 font-tieu-de font-bold text-base leading-snug">{question}</p>

            {dossier && (dossier.argFor || dossier.argAgainst) && (
              <details className="text-[12.5px] leading-snug">
                <summary className="cursor-pointer font-nhan text-[11px] uppercase tracking-wider text-muc-xanh">{str["vote.read_args"]}</summary>
                <div className="mt-2 space-y-2">
                  {dossier.argFor && (
                    <p className="border-l-4 border-xanh-so pl-2">
                      <b className="text-xanh-so-dam">{str["class.arg_for"]}:</b> {dossier.argFor}
                    </p>
                  )}
                  {dossier.argAgainst && (
                    <p className="border-l-4 border-son pl-2">
                      <b className="text-son-dam">{str["class.arg_against"]}:</b> {dossier.argAgainst}
                    </p>
                  )}
                </div>
              </details>
            )}

            {/* Đồng hồ */}
            {remaining !== null && (
              <div className="space-y-1">
                <div className="flex justify-between font-nhan text-xs">
                  <span className={cx(timeUp ? "text-son font-bold" : "text-muc-nhat")}>{timeUp ? str["vote.time_up"] : str["vote.time_left"]}</span>
                  {!timeUp && <span className={cx("font-bold tabular-nums", remaining <= 10 ? "text-son" : "text-muc")}>{remaining}s</span>}
                </div>
                {totalSec && (
                  <div className="h-1.5 bg-bia">
                    <div
                      className={cx("h-full transition-[width] duration-500 ease-linear", remaining <= 10 ? "bg-son" : "bg-ho-phach")}
                      style={{ width: `${Math.min(100, (remaining / totalSec) * 100)}%` }}
                    />
                  </div>
                )}
              </div>
            )}

            {myChoice && (
              <div className="p-2.5 bg-xanh-so/10 border-2 border-xanh-so-dam text-center space-y-0.5">
                <div className="font-bold text-xs uppercase text-xanh-so-dam">
                  ✓ {str["vote.your_vote"]}:{" "}
                  <span className="underline tracking-wider">{myChoice === "CHO_QUA" ? str["vote.stamp_approve"] : str["vote.stamp_reject"]}</span>
                </div>
                <p className="text-[11px] text-muc-nhat italic">{str["vote.can_change"]}</p>
              </div>
            )}

            {/* Hai con dấu to */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <VoteStamp choice="CHO_QUA" selected={myChoice === "CHO_QUA"} disabled={submitting || timeUp} onClick={() => handleVote("CHO_QUA")} />
              <VoteStamp choice="GIU_LAI" selected={myChoice === "GIU_LAI"} disabled={submitting || timeUp} onClick={() => handleVote("GIU_LAI")} />
            </div>
          </div>
        ) : result ? (
          <ResultCard counts={result} mine={myChoice} history={dossier?.history} />
        ) : (
          <div className="py-8 text-center space-y-4">
            <div className="font-nhan text-[11px] uppercase tracking-[0.3em] text-muc-nhat">
              {str["vote.delegate"]} <b className="text-son text-base">#{delegateNo}</b>
            </div>
            <div className="w-14 h-14 mx-auto rounded-full border-4 border-dashed border-muc/40 animate-spin [animation-duration:4s]" />
            <h2 className="text-lg font-tieu-de font-bold text-muc uppercase tracking-wide">{str["vote.waiting"]}</h2>
            <p className="text-xs font-bold text-xanh-so-dam">
              ✓ {str["vote.joined_room"]} {room}
            </p>
            <p className="text-xs text-muc-nhat leading-relaxed max-w-xs mx-auto italic">{str["vote.lobby_desc"]}</p>
          </div>
        )}

        <footer className="border-t border-muc/25 pt-3 text-center text-[10px] text-muc-nhat font-nhan">
          #{delegateNo} · {str["vote.footer_secret"]}
        </footer>
      </Paper>
    </main>
  );
}

function VoteStamp({ choice, selected, disabled, onClick }: { choice: Choice; selected: boolean; disabled: boolean; onClick: () => void }) {
  const approve = choice === "CHO_QUA";
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-pressed={selected}
      className={cx(
        "min-h-24 border-[4px] border-double font-nhan font-bold text-lg tracking-[0.15em] uppercase transition-transform active:scale-95 disabled:opacity-50",
        approve ? "-rotate-1" : "rotate-1",
        selected
          ? approve
            ? "bg-xanh-so text-giay border-xanh-so-dam shadow-kep animate-dong-dau"
            : "bg-son text-giay border-son-dam shadow-kep animate-dong-dau"
          : approve
            ? "border-xanh-so-dam text-xanh-so-dam bg-xanh-so/10"
            : "border-son text-son bg-son/10",
      )}
    >
      {approve ? str["vote.stamp_approve"] : str["vote.stamp_reject"]}
      {selected && <span className="block text-sm">✓</span>}
    </button>
  );
}

function ResultCard({ counts, mine, history }: { counts: Counts; mine: Choice | null; history?: string }) {
  const total = counts.CHO_QUA + counts.GIU_LAI;
  const winner = majority(counts);
  const note = winner === "HOA" ? str["vote.you_tie"] : !mine ? str["vote.you_none"] : mine === winner ? str["vote.you_majority"] : str["vote.you_minority"];
  return (
    <div className="space-y-4">
      <Label className="text-son">{str["vote.result_title"]}</Label>
      {(["CHO_QUA", "GIU_LAI"] as const).map((c) => (
        <div key={c}>
          <div className="flex justify-between font-nhan text-sm font-bold">
            <span className={c === "CHO_QUA" ? "text-xanh-so-dam" : "text-son"}>{c === "CHO_QUA" ? str["vote.stamp_approve"] : str["vote.stamp_reject"]}</span>
            <span className="tabular-nums">
              {percent(counts[c], total)}% <span className="text-muc-nhat font-normal">({counts[c]})</span>
            </span>
          </div>
          <div className="h-3 bg-bia mt-1">
            <div className={cx("h-full", c === "CHO_QUA" ? "bg-xanh-so" : "bg-son")} style={{ width: `${percent(counts[c], total)}%` }} />
          </div>
        </div>
      ))}
      {winner && winner !== "HOA" && (
        <div
          className={cx(
            "mx-auto w-fit border-[4px] border-double px-5 py-1.5 font-nhan text-2xl font-bold tracking-[0.2em] -rotate-3 animate-dong-dau",
            winner === "CHO_QUA" ? "border-xanh-so-dam text-xanh-so-dam" : "border-son text-son",
          )}
        >
          {winner === "CHO_QUA" ? str["vote.stamp_approve"] : str["vote.stamp_reject"]}
        </div>
      )}
      <p className="text-center text-sm font-bold">{note}</p>
      {history && (
        <div className="border-l-4 border-muc-xanh bg-bia/50 px-3 py-2">
          <Label className="text-muc-xanh text-[10px]">{str["class.history"]}</Label>
          <p className="mt-1 text-[12.5px] leading-relaxed">{history}</p>
        </div>
      )}
    </div>
  );
}
