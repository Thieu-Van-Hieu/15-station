/**
 * Phiên "Hội đồng lớp học" (P4): cả lớp bỏ phiếu bằng điện thoại thay cho cán bộ trực trạm.
 * Ba bước trên cùng một màn chiếu:
 *   1. Phòng chờ: mã QR cỡ lớn, mã phòng, số người đã vào, hồ sơ lượt khách.
 *   2. Bỏ phiếu: đồng hồ đếm ngược, số phiếu đã bỏ; tỉ lệ được giữ kín để lớp không hùa theo nhau.
 *   3. Công bố: thanh kết quả chạy lên, con dấu của lớp đập xuống, kèm bối cảnh lịch sử và câu thảo luận.
 * Dùng ở bàn game (lớp phủ toàn màn hình) và ở trang /host.
 */
import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import QRCode from "qrcode";
import { playSfx } from "../audio";
import { caseFor, DEFAULT_DURATION, DURATIONS, majority, percent, type Choice, type ClassCase, type Counts } from "../classroom";
import { explainHostError, isHostSetupMessage, postRound, readHostToken, saveHostToken, type TallyData } from "../hostApi";
import { Label, Paper, Portrait, PrimaryButton, StampButton, cx, s } from "./ui";

type Phase = "lobby" | "voting" | "reveal";

interface ClassroomSessionProps {
  room: string;
  turnId: string;
  /** "overlay": phủ kín bàn game. "page": nằm trong trang /host. */
  variant: "overlay" | "page";
  /** Bàn game: đóng dấu theo quyết định của lớp (hoặc của người trực khi hoà). */
  onVerdict?: (verdict: Choice) => void;
  /** Bàn game: bỏ qua bỏ phiếu, tự xử lượt này. */
  onSkip?: () => void;
  /** Trang /host: một màn khác (bàn game) vừa mở vòng cho lượt khác. */
  onRemoteTurn?: (turnId: string) => void;
  /** Chèn thêm vào phòng chờ (trang /host dùng để chọn lượt). */
  lobbyExtra?: ReactNode;
}

const EMPTY: Counts = { CHO_QUA: 0, GIU_LAI: 0 };

export function ClassroomSession({ room, turnId, variant, onVerdict, onSkip, onRemoteTurn, lobbyExtra }: ClassroomSessionProps) {
  const dossier = caseFor(turnId);
  const [token, setToken] = useState(readHostToken);
  const [phase, setPhase] = useState<Phase>("lobby");
  const [duration, setDuration] = useState<number>(DEFAULT_DURATION);
  const [tally, setTally] = useState<TallyData | null>(null);
  const [endsAt, setEndsAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [result, setResult] = useState<{ counts: Counts; manual: boolean } | null>(null);
  const [problem, setProblem] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [qrBig, setQrBig] = useState(false);

  const roundRef = useRef(0);
  const closingRef = useRef(false);
  const phaseRef = useRef<Phase>("lobby");
  phaseRef.current = phase;

  const voteUrl = `${window.location.origin}/vote?room=${encodeURIComponent(room)}`;
  const shortUrl = `${window.location.host}/vote`;
  const qr = useQr(voteUrl);

  // Đổi lượt thì về phòng chờ.
  useEffect(() => {
    setPhase("lobby");
    setResult(null);
    setEndsAt(null);
    closingRef.current = false;
  }, [turnId, room]);

  const reveal = useCallback((counts: Counts, manual: boolean) => {
    setResult({ counts, manual });
    setPhase("reveal");
    setMinimized(false);
  }, []);

  // Hỏi số phiếu mỗi giây (trừ lúc đang công bố). Đồng bộ khi màn khác mở hoặc chốt vòng.
  useEffect(() => {
    if (phase === "reveal") return;
    let alive = true;
    async function poll() {
      if (!token) {
        setProblem(s("host.token_missing"));
        return;
      }
      try {
        const res = await fetch(`/api/tally?room=${encodeURIComponent(room)}`, {
          headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
        });
        if (!alive) return;
        if (!res.ok) {
          const msg = await explainHostError(res);
          if (alive) setProblem(msg);
          return;
        }
        const data = (await res.json()) as TallyData;
        if (!alive) return;
        setProblem((m) => (m !== null && isHostSetupMessage(m) ? null : m));
        setTally(data);
        if (data.open && phaseRef.current === "lobby") {
          if (data.turnId && data.turnId !== turnId) {
            onRemoteTurn?.(data.turnId);
            return;
          }
          roundRef.current = data.round;
          setEndsAt(data.endsAt ?? null);
          setPhase("voting");
        } else if (data.open && phaseRef.current === "voting" && data.round === roundRef.current) {
          // Màn khác (hoặc máy chủ) đổi giờ kết thúc thì theo.
          if (data.endsAt) setEndsAt(data.endsAt);
        } else if (!data.open && phaseRef.current === "voting" && data.round === roundRef.current && !closingRef.current) {
          reveal(data.counts, false);
        }
      } catch {
        // Mất mạng một nhịp thì thôi, nhịp sau hỏi lại.
      }
    }
    poll();
    const timer = setInterval(poll, 1000);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [phase, room, token, turnId, onRemoteTurn, reveal]);

  async function start() {
    setBusy(true);
    setProblem(null);
    try {
      const data = await postRound(token, {
        room,
        action: "open",
        turnId,
        question: dossier?.question ?? "",
        seconds: duration,
      });
      roundRef.current = Number(data.round) || 0;
      closingRef.current = false;
      setEndsAt(typeof data.endsAt === "number" ? data.endsAt : Date.now() + duration * 1000);
      setTally((t) => ({ ...(t ?? { round: 0, open: true, total: 0 }), round: roundRef.current, open: true, counts: EMPTY, total: 0 }));
      setPhase("voting");
      playSfx("bell");
    } catch (err) {
      setProblem(err instanceof Error ? err.message : s("host.error"));
    } finally {
      setBusy(false);
    }
  }

  const close = useCallback(async () => {
    if (closingRef.current) return;
    closingRef.current = true;
    setBusy(true);
    let counts = tally?.counts ?? EMPTY;
    try {
      const data = await postRound(token, { room, action: "close" });
      if (data.counts && typeof data.counts === "object") counts = data.counts as Counts;
    } catch (err) {
      // Không chốt được trên máy chủ thì công bố theo số vừa đếm được.
      setProblem(err instanceof Error ? err.message : s("host.error"));
    } finally {
      setBusy(false);
    }
    reveal(counts, false);
  }, [tally, token, room, reveal]);

  // Đồng hồ đếm ngược. Hết giờ thì tự chốt.
  useEffect(() => {
    if (phase !== "voting" || endsAt === null) return;
    const timer = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(timer);
  }, [phase, endsAt]);
  const remaining = endsAt === null ? null : Math.max(0, Math.ceil((endsAt - now) / 1000));
  useEffect(() => {
    if (phase === "voting" && remaining === 0) void close();
  }, [phase, remaining, close]);

  function applyManual(counts: Counts) {
    closingRef.current = true;
    // Vẫn thử đóng vòng trên máy chủ để điện thoại thôi nhận phiếu; lỗi thì bỏ qua.
    if (token) void postRound(token, { room, action: "close" }).catch(() => undefined);
    reveal(counts, true);
  }

  function backToLobby() {
    closingRef.current = false;
    setResult(null);
    setEndsAt(null);
    setPhase("lobby");
  }

  function onTokenSaved(t: string) {
    saveHostToken(t);
    setToken(t);
    setProblem(null);
  }

  const joined = tally?.joined ?? 0;
  const ballots = tally?.total ?? 0;
  const needsToken = !token || problem === s("host.token_invalid");

  if (variant === "overlay" && minimized) {
    // Gắn thẳng vào body: lớp phủ không bị kẹt trong khung cuộn của mặt bàn.
    return createPortal(
      <div className="fixed bottom-24 right-4 z-40 flex items-center gap-3 border-2 border-ho-phach bg-ban-1/95 px-4 py-2.5 shadow-noi max-sm:left-3 max-sm:right-3 max-sm:bottom-28">
        <span className="w-2.5 h-2.5 rounded-full bg-ho-phach animate-nhap-nhay" />
        <span className="font-nhan text-xs font-bold tracking-widest text-ho-phach">{s("class.title")}</span>
        {phase === "voting" && (
          <span className="font-nhan text-sm text-giay tabular-nums">
            {remaining !== null && `${remaining}$s · `}
            {ballots} {s("class.ballots")}
          </span>
        )}
        <button type="button" onClick={() => setMinimized(false)} className="ml-auto border border-ho-phach/70 px-2.5 py-1 font-nhan text-[11px] font-bold uppercase tracking-wider text-ho-phach hover:bg-ho-phach hover:text-muc">
          {s("class.restore")}
        </button>
      </div>,
      document.body,
    );
  }

  const body = (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] items-start">
      {/* Cột trái: sàn hội đồng */}
      <div className="flex flex-col gap-5 min-w-0">
        {phase === "lobby" && (
          <>
            <QrBlock qr={qr} big onZoom={() => setQrBig(true)} shortUrl={shortUrl} room={room} />
            <BigCount value={joined} label={s("class.joined")} />
            {lobbyExtra}
            {needsToken ? (
              <TokenForm onSave={onTokenSaved} />
            ) : (
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Label className="text-chu-ban-phu/70 mr-1">{s("class.duration")}</Label>
                  {DURATIONS.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDuration(d)}
                      aria-pressed={duration === d}
                      className={cx(
                        "border px-3 py-1.5 font-nhan text-sm tabular-nums transition",
                        duration === d ? "border-ho-phach bg-ho-phach text-muc font-bold" : "border-vien text-chu-ban-phu hover:border-ho-phach/70",
                      )}
                    >
                      {d}
                      s
                    </button>
                  ))}
                </div>
                <PrimaryButton onClick={start} disabled={busy} className="w-full text-base">
                  {busy ? s("host.connecting") : s("class.start")}
                </PrimaryButton>
              </div>
            )}
          </>
        )}

        {phase === "voting" && (
          <>
            <Countdown remaining={remaining} total={duration} />
            <BigCount value={ballots} label={s("class.ballots")} of={joined > 0 ? joined : undefined} />
            <p className="text-center text-sm italic text-chu-ban-phu/70">{s("class.hidden")}</p>
            <button
              type="button"
              onClick={() => void close()}
              disabled={busy}
              className="w-full border-2 border-son bg-son/15 py-3 font-nhan font-bold uppercase tracking-[0.18em] text-son-nhat hover:bg-son hover:text-giay disabled:opacity-50 transition"
            >
              {busy ? s("class.counting") : s("class.close_now")}
            </button>
            <QrBlock qr={qr} onZoom={() => setQrBig(true)} shortUrl={shortUrl} room={room} />
          </>
        )}

        {phase === "reveal" && result && (
          <Reveal counts={result.counts} manual={result.manual} onVerdict={onVerdict} onAgain={backToLobby} />
        )}

        {problem && !needsToken && (
          <p role="alert" className="border border-son/70 bg-son-dam/30 px-3 py-2 text-xs text-son-nhat">
            {problem} {s("host.use_manual")}
          </p>
        )}

        {phase !== "reveal" && <ManualFallback onApply={applyManual} />}
      </div>

      {/* Cột phải: hồ sơ */}
      {dossier && <Dossier dossier={dossier} phase={phase} />}
    </div>
  );

  const zoom = qrBig && (
    <button
      type="button"
      onClick={() => setQrBig(false)}
      title={s("class.qr_close")}
      className="fixed inset-0 z-[60] flex flex-col items-center justify-center gap-4 bg-ban/95 p-6 cursor-zoom-out"
    >
      {qr && <img src={qr} alt={voteUrl} className="w-[min(82vh,92vw)] aspect-square bg-white p-3" />}
      <span className="font-nhan text-2xl tracking-widest text-giay">
        {shortUrl} · <b className="text-ho-phach">{room}</b>
      </span>
    </button>
  );

  if (variant === "page") {
    return (
      <>
        {body}
        {zoom}
      </>
    );
  }

  return createPortal(
    <div className="fixed inset-0 z-40 mat-ban lop-nhieu overflow-y-auto text-chu-ban font-may-chu" role="dialog" aria-label={s("class.title")}>
      <header className="sticky top-0 z-10 flex flex-wrap items-center gap-3 border-b border-vien/70 bg-ban/90 px-6 py-3 backdrop-blur-sm max-sm:px-3">
        <span className="w-2.5 h-2.5 rounded-full bg-ho-phach animate-nhap-nhay" />
        <div className="min-w-0">
          <h2 className="font-tieu-de text-xl font-bold tracking-wide text-giay">{s("class.title")}</h2>
          <Label className="text-chu-ban-phu/60 text-[10px]">{s("class.subtitle")}</Label>
        </div>
        <span className="border border-ho-phach/60 px-2 py-0.5 font-nhan text-xs font-bold text-ho-phach">
          {s("class.room_code")}: {room}
        </span>
        <div className="ml-auto flex items-center gap-2">
          <button type="button" onClick={() => setMinimized(true)} className="border border-vien px-3 py-1.5 font-nhan text-[11px] font-bold uppercase tracking-wider text-chu-ban-phu hover:text-giay hover:border-vien-sang">
            {s("class.minimize")}
          </button>
          {onSkip && phase === "lobby" && (
            <button type="button" onClick={onSkip} className="border border-vien px-3 py-1.5 font-nhan text-[11px] font-bold uppercase tracking-wider text-chu-ban-phu/70 hover:text-giay hover:border-vien-sang">
              {s("class.skip")}
            </button>
          )}
        </div>
      </header>
      <div className="mx-auto max-w-7xl p-6 max-sm:p-3">{body}</div>
      {zoom}
    </div>,
    document.body,
  );
}

// ---------------------------------------------------------------------------

function useQr(url: string): string {
  const [dataUrl, setDataUrl] = useState("");
  useEffect(() => {
    let alive = true;
    QRCode.toDataURL(url, { margin: 1, width: 720, errorCorrectionLevel: "M", color: { dark: "#181513", light: "#ffffff" } })
      .then((d) => alive && setDataUrl(d))
      .catch(() => alive && setDataUrl(""));
    return () => {
      alive = false;
    };
  }, [url]);
  return dataUrl;
}

function QrBlock({ qr, big, onZoom, shortUrl, room }: { qr: string; big?: boolean; onZoom: () => void; shortUrl: string; room: string }) {
  return (
    <div className={cx("flex items-center gap-5", big ? "flex-col" : "flex-row")}>
      <button
        type="button"
        onClick={onZoom}
        title={s("class.qr_zoom")}
        className={cx(
          "shrink-0 bg-white p-2.5 shadow-noi cursor-zoom-in transition-transform hover:scale-[1.02]",
          big ? "w-[min(52vh,100%)] max-w-[480px]" : "w-32",
        )}
      >
        {qr ? <img src={qr} alt={s("class.scan")} className="block w-full aspect-square" /> : <div className="w-full aspect-square bg-giay-than" />}
      </button>
      <div className={cx("min-w-0", big ? "text-center" : "text-left")}>
        <Label className={cx("block text-ho-phach", big ? "text-sm" : "text-[10px]")}>{s("class.scan")}</Label>
        <div className={cx("font-nhan text-chu-ban-phu/80 break-all", big ? "text-lg mt-1" : "text-xs")}>
          {s("class.or_visit")} <b className="text-giay">{shortUrl}</b>
        </div>
        <div className={cx("font-nhan font-bold tracking-[0.25em] text-giay", big ? "text-5xl mt-2" : "text-2xl mt-1")}>
          <span className="sr-only">{s("class.room_code")}: </span>
          {room}
        </div>
      </div>
    </div>
  );
}

function BigCount({ value, label, of }: { value: number; label: string; of?: number }) {
  return (
    <div className="flex items-baseline justify-center gap-3 border-y border-vien/60 py-3">
      <span key={value} className="font-nhan text-6xl font-bold tabular-nums text-giay animate-dong-dau max-sm:text-5xl">
        {value}
      </span>
      {of !== undefined && <span className="font-nhan text-2xl text-chu-ban-phu/50 tabular-nums">/ {of}</span>}
      <Label className="text-chu-ban-phu/70">{label}</Label>
    </div>
  );
}

function Countdown({ remaining, total }: { remaining: number | null; total: number }) {
  const r = 54;
  const circ = 2 * Math.PI * r;
  const left = remaining ?? total;
  const frac = Math.max(0, Math.min(1, left / total));
  const urgent = left <= 10;
  return (
    <div className="flex flex-col items-center gap-2">
      <Label className="text-ho-phach">{s("class.voting")}</Label>
      <div className="relative w-52 h-52 max-sm:w-40 max-sm:h-40">
        <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
          <circle cx="60" cy="60" r={r} fill="none" stroke="currentColor" strokeWidth="8" className="text-ban-3" />
          <circle
            cx="60"
            cy="60"
            r={r}
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeDasharray={circ}
            strokeDashoffset={circ * (1 - frac)}
            className={cx("transition-[stroke-dashoffset] duration-300 ease-linear", urgent ? "text-son" : "text-ho-phach")}
          />
        </svg>
        <span className={cx("absolute inset-0 grid place-items-center font-nhan text-6xl font-bold tabular-nums max-sm:text-5xl", urgent ? "text-son-nhat animate-nhap-nhay" : "text-giay")}>
          {left}
        </span>
      </div>
    </div>
  );
}

function Reveal({ counts, manual, onVerdict, onAgain }: { counts: Counts; manual: boolean; onVerdict?: (v: Choice) => void; onAgain: () => void }) {
  const total = counts.CHO_QUA + counts.GIU_LAI;
  const winner = majority(counts);
  const [step, setStep] = useState(0);
  useEffect(() => {
    const a = setTimeout(() => setStep(1), 60);
    const b = setTimeout(() => {
      setStep(2);
      if (winner === "CHO_QUA" || winner === "GIU_LAI") playSfx("stamp");
    }, 1500);
    return () => {
      clearTimeout(a);
      clearTimeout(b);
    };
  }, [winner]);

  const bar = (choice: Choice) => {
    const pct = percent(counts[choice], total);
    const approve = choice === "CHO_QUA";
    return (
      <div className="flex flex-col gap-1.5">
        <div className="flex items-baseline justify-between">
          <span className={cx("font-nhan text-lg font-bold tracking-[0.15em]", approve ? "text-xanh-so-nhat" : "text-son-nhat")}>
            {approve ? s("vote.stamp_approve") : s("vote.stamp_reject")}
          </span>
          <span className="font-nhan text-4xl font-bold tabular-nums text-giay">
            {step >= 1 ? pct : 0}%<span className="ml-2 text-base text-chu-ban-phu/60">{counts[choice]}</span>
          </span>
        </div>
        <div className="h-7 border border-vien bg-ban-1 p-1">
          <div
            className={cx("h-full transition-[width] duration-[1300ms] ease-out", approve ? "bg-xanh-so" : "bg-son")}
            style={{ width: step >= 1 ? `${pct}%` : "0%" }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-5">
      <Label className="text-ho-phach">{step >= 2 ? s("class.verdict") : s("class.counting")}</Label>
      {manual && <Label className="text-chu-ban-phu/60 text-[10px]">{s("class.manual_note")}</Label>}
      {bar("CHO_QUA")}
      {bar("GIU_LAI")}

      <div className="relative grid min-h-36 place-items-center">
        {step >= 2 && (winner === "CHO_QUA" || winner === "GIU_LAI") && (
          <div
            className={cx(
              "border-[6px] border-double px-8 py-3 font-nhan text-5xl font-bold tracking-[0.2em] animate-dong-dau max-sm:text-3xl",
              winner === "CHO_QUA" ? "border-xanh-so text-xanh-so-nhat" : "border-son text-son-nhat",
            )}
            style={{ ["--xoay" as string]: "-6deg", transform: "rotate(-6deg)" }}
          >
            {winner === "CHO_QUA" ? s("vote.stamp_approve") : s("vote.stamp_reject")}
          </div>
        )}
        {step >= 2 && (winner === "HOA" || winner === null) && (
          <div className="text-center">
            <div className="font-nhan text-4xl font-bold tracking-[0.2em] text-ho-phach">{winner === "HOA" ? s("class.tie") : "—"}</div>
            <p className="mt-2 text-sm text-chu-ban-phu/80">{winner === "HOA" ? s("class.tie_hint") : s("class.no_votes")}</p>
          </div>
        )}
      </div>

      {step >= 2 && (
        <div className="flex flex-col gap-3">
          {onVerdict && (winner === "CHO_QUA" || winner === "GIU_LAI") && (
            <PrimaryButton onClick={() => onVerdict(winner)} className="w-full">
              {s("class.apply")}: {winner === "CHO_QUA" ? s("vote.stamp_approve") : s("vote.stamp_reject")}
            </PrimaryButton>
          )}
          {onVerdict && (winner === "HOA" || winner === null) && (
            <div className="grid grid-cols-2 gap-3">
              <StampButton tone="xanh" title={s("vote.stamp_approve")} onClick={() => onVerdict("CHO_QUA")} tilt={-1} />
              <StampButton tone="son" title={s("vote.stamp_reject")} onClick={() => onVerdict("GIU_LAI")} tilt={1} />
            </div>
          )}
          <button type="button" onClick={onAgain} className="self-center font-nhan text-xs uppercase tracking-widest text-chu-ban-phu/60 underline underline-offset-4 hover:text-giay">
            {s("class.again")}
          </button>
        </div>
      )}
    </div>
  );
}

function Dossier({ dossier, phase }: { dossier: ClassCase; phase: Phase }) {
  return (
    <Paper raised clip className="p-6 max-sm:p-4 animate-truot-vao">
      <div className="flex items-start gap-4 border-b border-muc/25 pb-4">
        <Portrait charKey={dossier.portraitKey} expression={dossier.expression} alt={dossier.name} className="w-24 aspect-[5/6] shrink-0 border border-giay-vien max-sm:w-16 lg:w-32" />
        <div className="min-w-0">
          <Label className="text-son">{s("class.dossier")} · {dossier.turnId.toUpperCase()}</Label>
          <h3 className="font-tieu-de text-2xl font-bold leading-tight max-sm:text-xl lg:text-3xl">{dossier.name}</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-muc-nhat lg:text-base">{dossier.lead}</p>
        </div>
      </div>

      {dossier.facts.length > 0 && (
        <ul className="mt-4 space-y-2">
          {dossier.facts.map((f, i) => (
            <li key={i} className="flex gap-3 text-[15px] leading-relaxed lg:text-lg">
              <span className="font-nhan font-bold text-son">{i + 1}.</span>
              <span>{f}</span>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-5 border-2 border-muc px-4 py-3 font-tieu-de text-xl font-bold leading-snug max-sm:text-lg lg:text-2xl">{dossier.question}</p>

      {phase !== "reveal" && (dossier.argFor || dossier.argAgainst) && (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {dossier.argFor && <Argument tone="xanh" title={s("class.arg_for")} text={dossier.argFor} />}
          {dossier.argAgainst && <Argument tone="son" title={s("class.arg_against")} text={dossier.argAgainst} />}
        </div>
      )}

      {phase === "reveal" && (
        <div className="mt-5 space-y-4">
          {dossier.history && (
            <div className="border-l-4 border-muc-xanh bg-bia/50 px-4 py-3">
              <Label className="text-muc-xanh">{s("class.history")}</Label>
              <p className="mt-1 text-sm leading-relaxed lg:text-base">{dossier.history}</p>
            </div>
          )}
          {dossier.discuss && (
            <div className="border-l-4 border-son bg-bia/50 px-4 py-3">
              <Label className="text-son">{s("class.discuss")}</Label>
              <p className="mt-1 font-tieu-de text-lg font-bold leading-snug lg:text-xl">{dossier.discuss}</p>
            </div>
          )}
        </div>
      )}
    </Paper>
  );
}

function Argument({ tone, title, text }: { tone: "xanh" | "son"; title: string; text: string }) {
  return (
    <div className={cx("border px-3 py-2.5", tone === "xanh" ? "border-xanh-so-dam/50 bg-xanh-so/10" : "border-son/50 bg-son/10")}>
      <Label className={tone === "xanh" ? "text-xanh-so-dam" : "text-son-dam"}>{title}</Label>
      <p className="mt-1 text-[13px] leading-relaxed lg:text-[15px]">{text}</p>
    </div>
  );
}

function TokenForm({ onSave }: { onSave: (token: string) => void }) {
  const [value, setValue] = useState("");
  const id = useId();
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (value.trim()) onSave(value.trim());
      }}
      className="flex flex-col gap-2 border border-ho-phach/60 bg-ban-1/80 p-4"
    >
      <label htmlFor={id} className="font-nhan text-sm font-bold text-ho-phach">
        {s("class.token_title")}
      </label>
      <p className="text-xs text-chu-ban-phu/70">{s("class.token_desc")}</p>
      <div className="flex gap-2">
        <input
          id={id}
          type="password"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={s("host.token_placeholder")}
          className="flex-1 min-w-0 border border-vien bg-ban px-3 py-2 font-nhan text-sm text-giay focus:outline-none focus:border-ho-phach"
        />
        <button type="submit" className="border border-ho-phach bg-ho-phach px-4 font-nhan text-xs font-bold uppercase tracking-wider text-muc">
          {s("host.token_save")}
        </button>
      </div>
    </form>
  );
}

function ManualFallback({ onApply }: { onApply: (counts: Counts) => void }) {
  const [approve, setApprove] = useState("0");
  const [reject, setReject] = useState("0");
  const approveId = useId();
  const rejectId = useId();
  return (
    <details className="border-t border-vien/60 pt-2 text-xs">
      <summary className="cursor-pointer select-none py-1 font-nhan text-[11px] text-chu-ban-phu/50 hover:text-ho-phach">{s("host.manual_title")}</summary>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onApply({ CHO_QUA: Math.max(0, parseInt(approve, 10) || 0), GIU_LAI: Math.max(0, parseInt(reject, 10) || 0) });
        }}
        className="mt-2 flex flex-col gap-2 border border-vien bg-ban-1/80 p-3"
      >
        <p className="text-[11px] text-chu-ban-phu/60">{s("host.manual_desc")}</p>
        <div className="grid grid-cols-2 gap-2">
          <label htmlFor={approveId} className="flex flex-col gap-1 font-nhan text-[10px] text-xanh-so-nhat">
            {s("vote.stamp_approve")}
            <input id={approveId} type="number" min="0" value={approve} onChange={(e) => setApprove(e.target.value)} className="border border-vien bg-ban px-2 py-1 text-sm text-giay" />
          </label>
          <label htmlFor={rejectId} className="flex flex-col gap-1 font-nhan text-[10px] text-son-nhat">
            {s("vote.stamp_reject")}
            <input id={rejectId} type="number" min="0" value={reject} onChange={(e) => setReject(e.target.value)} className="border border-vien bg-ban px-2 py-1 text-sm text-giay" />
          </label>
        </div>
        <button type="submit" className="border border-ho-phach/70 py-1.5 font-nhan text-[11px] font-bold uppercase tracking-wider text-ho-phach hover:bg-ho-phach hover:text-muc">
          {s("host.manual_apply")}
        </button>
      </form>
    </details>
  );
}
