import { useCallback, useEffect, useRef, useState } from "react";
import type { Action, Day, GameState, Line, Traveler, Verdict } from "../engine/types";
import { TopBar } from "../components/TopBar";
import { WindowPanel } from "../components/WindowPanel";
import { Circlable, DocumentPaper, PencilScope, type Pencil } from "../components/DocumentPaper";
import { InkMark, randomInk, type Ink } from "../components/stamping";
import { ConfrontPanel, type ConfrontView } from "../components/ConfrontPanel";
import { CONFRONT_WRONG_MIN, confront, confrontLines, factsOf } from "../engine/confront";
import { parseClock } from "../engine/day-end";
import { Rulebook } from "../components/Rulebook";
import { ActionControls } from "../components/ActionControls";
import { ClassroomVotingPanel } from "../components/ClassroomVotingPanel";
import { Label, Panel, cx, s, unit } from "../components/ui";
import { conditionState, issuesActiveOn } from "../engine/state";
import { activeRules } from "../engine/active";
import { isGoodsRule, rulesForItem } from "../engine/scope";
import { content } from "../content";
import { playSfx, preloadSfx, setLoop } from "../audio";

interface DeskScreenProps {
  state: GameState;
  day: Day;
  traveler: Traveler;
  currentTravelerOrder: number;
  totalTravelersInDay: number;
  lastReprimandText?: string | null;
  onDecide: (action: Action, reasonId?: string | null, takeBribe?: boolean) => void;
  onNext: () => void;
  /** Đối chất hai chỗ đã khoanh (V8). */
  onConfront?: (a: string, b: string) => void;
}

const RULEBOOK_KEY = "tram15_rulebook";
const HOST_MODE_KEY = "tram15_host_mode";
const HOST_ROOM_KEY = "tram15_host_room";
const HOST_TOKEN_KEY = "tram15_host_token";
const DEFAULT_ROOM = "T15";

function readRulebookOpen(): boolean {
  try {
    return localStorage.getItem(RULEBOOK_KEY) !== "0";
  } catch {
    return true;
  }
}

/** Độ nghiêng và độ lệch cố định cho từng tờ giấy, để mặt bàn trông như giấy được đặt tay. */
const SPREAD = [
  { tilt: -2.2, x: 0, y: 0 },
  { tilt: 1.6, x: -18, y: 22 },
  { tilt: -0.8, x: 10, y: -6 },
  { tilt: 2.4, x: -8, y: 18 },
];

export function DeskScreen({
  state,
  day,
  traveler,
  currentTravelerOrder,
  totalTravelersInDay,
  lastReprimandText,
  onDecide,
  onNext,
  onConfront,
}: DeskScreenProps) {
  const [bribeAccepted, setBribeAccepted] = useState(false);
  const [bribeDismissed, setBribeDismissed] = useState(false);
  const [chosenAction, setChosenAction] = useState<Action | null>(null);
  const [chosenReasonId, setChosenReasonId] = useState<string | null>(null);
  const [top, setTop] = useState<number | null>(null);
  const [rulebookOpen, setRulebookOpen] = useState(readRulebookOpen);
  const [highlight, setHighlight] = useState<{ id: string; tick: number } | null>(null);
  const [tip, setTip] = useState<{ item: number; rule: string } | null>(null);
  // V5: vệt mực trên giấy và hoạt ảnh giấy trượt khỏi bàn.
  const [inks, setInks] = useState<Ink[]>([]);
  const [leaving, setLeaving] = useState(false);
  const mainRef = useRef<HTMLElement>(null);
  // V6: biên bản đã kèm thì đồng hồ nhảy trước và hàng chờ nhúc nhích.
  const [reportId, setReportId] = useState<string | null>(null);
  const [stir, setStir] = useState(0);
  // V8: bút chì đối chất.
  const [pencilOn, setPencilOn] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [confrontView, setConfrontView] = useState<ConfrontView | null>(null);

  // P4: Chế độ Host & Bỏ phiếu lớp học
  const isPresentationStop = Boolean(traveler.tags?.includes("dung-trinh-bay"));

  const [isHostMode, setIsHostMode] = useState<boolean>(() => {
    try {
      if (typeof window !== "undefined") {
        const p = new URLSearchParams(window.location.search);
        if (p.get("host") === "1" || p.get("room")) return true;
      }
      return localStorage.getItem(HOST_MODE_KEY) === "1";
    } catch {
      return false;
    }
  });

  const [hostRoom] = useState<string>(() => {
    try {
      if (typeof window !== "undefined") {
        const p = new URLSearchParams(window.location.search);
        const r = p.get("room");
        if (r && r.trim().length > 0) return r.trim().toUpperCase();
      }
      return localStorage.getItem(HOST_ROOM_KEY) || DEFAULT_ROOM;
    } catch {
      return DEFAULT_ROOM;
    }
  });

  const [hostToken] = useState<string>(() => {
    try {
      // Token nhập một lần ở màn /host (cùng trình duyệt), không có giá trị mặc định trong bundle.
      return localStorage.getItem(HOST_TOKEN_KEY) ?? "";
    } catch {
      return "";
    }
  });

  const [showVotingPanel, setShowVotingPanel] = useState<boolean>(
    () => isPresentationStop && isHostMode
  );

  useEffect(() => {
    setShowVotingPanel(isPresentationStop && isHostMode);
  }, [traveler.id, isPresentationStop, isHostMode]);

  function toggleHostMode() {
    setIsHostMode((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(HOST_MODE_KEY, next ? "1" : "0");
      } catch {
        // Bỏ qua lỗi localStorage
      }
      if (next && isPresentationStop) {
        setShowVotingPanel(true);
      }
      return next;
    });
  }

  function handleMajorityDecide(verdict: Verdict) {
    onStampDrop(verdict, null, null);
    handleDecide(verdict, reportId);
  }

  function handleManualTie() {
    // Khi hoà phiếu: không tự động đóng dấu, cho phép Host tự bấm
  }

  function toggleRulebook(open: boolean) {
    setRulebookOpen(open);
    try {
      localStorage.setItem(RULEBOOK_KEY, open ? "1" : "0");
    } catch {
      // Bỏ qua lỗi ghi localStorage
    }
  }

  /** Bấm nhãn điều trên dòng hàng: mở sổ nếu đang ẩn, cuộn tới điều đó và làm sáng nó. */
  function focusRule(id: string) {
    playSfx("paper");
    toggleRulebook(true);
    setHighlight((h) => ({ id, tick: (h?.tick ?? 0) + 1 }));
  }

  // Phím S ẩn/hiện sổ chỉ thị.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey || (e.key !== "s" && e.key !== "S")) return;
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;
      setRulebookOpen((open) => {
        try {
          localStorage.setItem(RULEBOOK_KEY, open ? "0" : "1");
        } catch {
          // Bỏ qua lỗi ghi localStorage
        }
        return !open;
      });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const character = content.characters.find((c) => c.id === traveler.character);
  const activeIssues = issuesActiveOn(state, day.id);
  const goodsRules = activeRules(content.rules, day.id, activeIssues).filter(isGoodsRule);

  // Tin đồn (V3f): hai lượt vừa rồi trong ngày đều bị giữ thì người này bước tới đã thủ thế.
  const today = state.log.filter((r) => r.day === day.id);
  const heldTwice = today.length >= 2 && today.slice(-2).every((r) => r.action === "GIU_LAI");
  const rumorLine = heldTwice ? s(`rumor.line_${(traveler.order % 3) + 1}`) : null;

  useEffect(() => {
    setLoop("amb_tram_ngay");
    preloadSfx();
  }, []);

  useEffect(() => {
    playSfx("window");
    const t = setTimeout(() => playSfx("bell"), 350);
    setTop(null);
    setInks([]);
    setLeaving(false);
    setSelected([]);
    setConfrontView(null);
    setReportId(null);
    return () => clearTimeout(t);
  }, [traveler.id]);

  const onReportChange = useCallback((id: string | null) => {
    setReportId((prev) => {
      if (id && !prev) setStir((n) => n + 1);
      return id;
    });
  }, []);

  /** Con dấu thả xuống (V5). Trúng giấy thì in vệt mực ở đúng chỗ thả, rung bàn một khung. */
  function onStampDrop(action: Verdict, x: number | null, y: number | null): boolean {
    let ink: Ink | null = null;
    if (x === null || y === null) {
      // Phím tắt: đặt dấu lên giấy đầu tiên (hoặc phiếu kiểm soát) ở chỗ ngẫu nhiên gần giữa.
      const target = traveler.documents.length > 0 ? "d0" : "slip";
      ink = randomInk(action, target, 50 + (Math.random() * 30 - 15), 62 + (Math.random() * 20 - 10));
    } else {
      const el = document
        .elementsFromPoint(x, y)
        .map((e) => (e as HTMLElement).closest<HTMLElement>("[data-stamp-target]"))
        .find((e) => e !== null);
      if (!el) return false;
      const r = el.getBoundingClientRect();
      ink = randomInk(action, el.dataset.stampTarget!, ((x - r.left) / r.width) * 100, ((y - r.top) / r.height) * 100);
    }
    setInks((list) => [...list, ink!]);
    playSfx("stamp");
    if (typeof mainRef.current?.animate === "function") {
      mainRef.current.animate(
        [{ transform: "translate(0,0)" }, { transform: "translate(1.5px,2px)" }, { transform: "translate(-1px,-1px)" }, { transform: "translate(0,0)" }],
        { duration: 110 },
      );
    }
    return true;
  }

  // V8: chọn chỗ khoanh, tối đa hai chỗ.
  const pencil: Pencil = {
    active: pencilOn && !chosenAction,
    selected,
    onSelect: (id) => {
      playSfx("pen");
      setSelected((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id].slice(-2)));
    },
  };

  function describeFact(id: string): { label: string; value: string } {
    const f = factsOf(traveler, content.documents).find((x) => x.id === id);
    if (id.startsWith("c")) {
      const c = traveler.cargo[Number(id.slice(1))];
      return { label: s("confront.cargo"), value: `${c.ten} ${c.so_luong} ${unit(c.don_vi)}` };
    }
    const [dPart, key, idx] = id.split(".");
    const d = traveler.documents[Number(dPart.slice(1))];
    const def = content.documents.find((x) => x.code === d.type);
    const label = `${def?.name ?? d.type} · ${def?.fields.find((x) => x.key === key)?.label ?? key}`;
    const v = f?.value;
    const item = (x: { ten?: string; ma: string; so_luong: number; don_vi: string }) => `${x.ten ?? x.ma} ${x.so_luong} ${unit(x.don_vi)}`;
    const value = Array.isArray(v) ? v.map(item).join(", ") : v !== null && typeof v === "object" ? item(v) : String(v ?? "");
    return { label: idx === undefined ? label : `${label} #${Number(idx) + 1}`, value };
  }

  function runConfront() {
    if (selected.length !== 2) return;
    const [a, b] = selected;
    const result = confront(traveler, content.documents, a, b);
    const lines: Line[] = confrontLines(traveler, result, conditionState(state));
    playSfx(result.found ? "stamp" : "paper");
    onConfront?.(a, b);
    setConfrontView({ a: describeFact(a), b: describeFact(b), result, lines, cost: result.found ? 0 : CONFRONT_WRONG_MIN });
    setSelected([]);
  }

  function handleDecide(action: Action, reasonId?: string | null) {
    setChosenAction(action);
    setChosenReasonId(reasonId ?? null);
  }

  function handleNext() {
    if (!chosenAction || leaving) return;
    // V5: giấy đã đóng dấu trượt khỏi bàn rồi mới sang lượt kế tiếp.
    setLeaving(true);
    playSfx("paper");
    setTimeout(() => {
      onDecide(chosenAction, chosenReasonId, bribeAccepted);
      setChosenAction(null);
      setChosenReasonId(null);
      setBribeAccepted(false);
      setBribeDismissed(false);
      onNext();
    }, 380);
  }

  const endMin = parseClock(day.clock.end);
  const clockShown = state.clockMin + (reportId ? day.clock.per_report_min : 0);
  const dusk = Math.max(0, Math.min(1, (clockShown - (endMin - 90)) / 90));
  const waiting = Math.max(0, day.travelers.length - state.travelerIndex - 1);

  return (
    <div className="mat-ban lop-nhieu min-h-screen lg:h-screen flex flex-col text-chu-ban font-may-chu">
      <TopBar
        state={state}
        day={day}
        currentTravelerOrder={currentTravelerOrder}
        totalTravelersInDay={totalTravelersInDay}
        clockMin={clockShown}
        isHostMode={isHostMode}
        hostRoom={hostRoom}
        onToggleHostMode={toggleHostMode}
      />

      <main
        ref={mainRef}
        className={cx(
          "flex-1 min-h-0 grid grid-cols-1",
          rulebookOpen
            ? "lg:grid-cols-[300px_minmax(0,1fr)_360px] xl:grid-cols-[330px_minmax(0,1fr)_400px]"
            : "lg:grid-cols-[300px_minmax(0,1fr)_52px] xl:grid-cols-[330px_minmax(0,1fr)_52px]",
        )}
      >
        {/* Khu 1: Ô cửa, người qua trạm, lời khai, hàng hoá */}
        <section className="min-h-0 overflow-y-auto thanh-cuon p-4 space-y-4 border-b lg:border-b-0 lg:border-r border-vien/60 bg-ban-1/60">
          <WindowPanel
            traveler={traveler}
            character={character}
            state={state}
            bribeAccepted={bribeAccepted}
            bribeDismissed={bribeDismissed}
            onAcceptBribe={() => setBribeAccepted(true)}
            onDeclineBribe={() => setBribeDismissed(true)}
            lastReprimandText={lastReprimandText}
            chosenAction={chosenAction}
            rumorLine={rumorLine}
            queue={{ waiting, dusk, stir }}
            confrontLines={confrontView?.lines.length ? confrontView.lines : null}
          />

          <Panel title={s("desk.cargo_title")} className="!bg-ban-1">
            {traveler.cargo.length === 0 ? (
              <p className="text-[12px] italic text-chu-ban-phu/60">{s("desk.no_cargo")}</p>
            ) : (
              <PencilScope pencil={pencil}>
                <ul className="space-y-2.5 text-[12.5px]">
                  {traveler.cargo.map((item, idx) => {
                    const applies = item.category === "DO_CA_NHAN" ? [] : rulesForItem(goodsRules, item);
                    return (
                      <li key={idx} className="relative">
                        <Circlable id={`c${idx}`}>
                          <div className="flex items-baseline gap-2">
                            <span className="text-chu-ban-phu">{item.ten}</span>
                            <span className="flex-1 border-b border-dotted border-vien" />
                            <span className="font-nhan font-bold text-ho-phach whitespace-nowrap">
                              {item.so_luong} {unit(item.don_vi)}
                            </span>
                          </div>
                        </Circlable>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {applies.length === 0 ? (
                            <span className="font-nhan text-[9px] uppercase tracking-wider text-chu-ban-phu/50 border border-vien/60 px-1.5">
                              {s("desk.scope_free")}
                            </span>
                          ) : (
                            applies.map((r) => (
                              <button
                                type="button"
                                key={r.id}
                                onClick={() => focusRule(r.id)}
                                onMouseEnter={() => setTip({ item: idx, rule: r.id })}
                                onMouseLeave={() => setTip(null)}
                                onFocus={() => setTip({ item: idx, rule: r.id })}
                                onBlur={() => setTip(null)}
                                aria-label={`${r.article}: ${r.title}. ${s("desk.scope_click")}`}
                                className="font-nhan text-[9px] uppercase tracking-wider text-son-nhat border border-son/50 bg-son/10 px-1.5 cursor-pointer hover:bg-son hover:text-giay focus-visible:outline-1 focus-visible:outline-ho-phach"
                              >
                                {r.article}
                              </button>
                            ))
                          )}
                        </div>
                        {/* Chú thích khi rê chuột vào nhãn điều: tóm tắt điều đó ngay tại chỗ. */}
                        {tip?.item === idx &&
                          (() => {
                            const r = applies.find((x) => x.id === tip.rule);
                            if (!r) return null;
                            return (
                              <div className="absolute left-0 right-0 bottom-full mb-1 z-30 giay-hat border border-giay-vien shadow-noi p-3 text-muc pointer-events-none animate-truot-vao">
                                <div className="font-tieu-de font-bold text-[13px] text-son-dam leading-snug">
                                  {r.article}: {r.title}
                                </div>
                                {r.scope_note && (
                                  <div className="font-nhan text-[9px] uppercase tracking-wider text-muc-xanh mt-1">
                                    {s("rulebook.applies_to")}: <span className="normal-case tracking-normal">{r.scope_note}</span>
                                  </div>
                                )}
                                <p className="text-[11.5px] leading-snug mt-1.5 line-clamp-4">{r.page_text}</p>
                                <p className="font-nhan text-[9px] uppercase tracking-wider text-muc-nhat mt-2">{s("desk.scope_click")}</p>
                              </div>
                            );
                          })()}
                      </li>
                    );
                  })}
                </ul>
                <p className="text-[10.5px] text-chu-ban-phu/50 mt-3 leading-snug">{s("desk.scope_hint")}</p>
              </PencilScope>
            )}
          </Panel>
        </section>

        {/* Khu 2: Mặt bàn với giấy tờ */}
        <section className="mat-ban-cham min-h-[420px] lg:min-h-0 overflow-auto thanh-cuon relative flex flex-col">
          {/* Bảng bỏ phiếu lớp học nếu là lượt dung-trinh-bay */}
          {isPresentationStop && showVotingPanel && (
            <div className="px-6 pt-4">
              <ClassroomVotingPanel
                room={hostRoom}
                hostToken={hostToken}
                turnId={traveler.id}
                question={
                  traveler.id === "d3-t3"
                    ? s("host.default_question_d3t3")
                    : `${character?.name ?? traveler.character} (${traveler.id}) - ${s("vote.stamp_approve")} / ${s("vote.stamp_reject")}?`
                }
                onMajorityDecide={handleMajorityDecide}
                onManualTie={handleManualTie}
                onDismiss={() => setShowVotingPanel(false)}
              />
            </div>
          )}

          {/* Gợi ý bật Host nếu là lượt dung-trinh-bay nhưng host đang tắt */}
          {isPresentationStop && !showVotingPanel && !chosenAction && (
            <div className="mx-6 mt-4 p-3 bg-amber-950/40 border border-amber-500/50 rounded flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 text-amber-300">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="font-semibold">{s("host.present_stop")}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsHostMode(true);
                  setShowVotingPanel(true);
                  try {
                    localStorage.setItem(HOST_MODE_KEY, "1");
                  } catch {
                    // Bỏ qua lỗi localStorage
                  }
                }}
                className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded text-xs transition"
              >
                {s("host.enable_now")}
              </button>
            </div>
          )}

          <div className="flex items-center justify-between px-5 pt-4">
            <Label className="text-chu-ban-phu/70">{s("desk.documents_title")}</Label>
            <Label className="text-chu-ban-phu/40 text-[10px]">{traveler.documents.length}</Label>
          </div>

          <div
            key={traveler.id}
            className={cx(
              "flex-1 flex flex-wrap content-start justify-center gap-x-2 gap-y-6 px-6 pt-8 pb-10 max-sm:px-3 max-sm:pt-5 max-sm:gap-y-5",
              leaving && "animate-truot-ra pointer-events-none",
            )}
          >
            {traveler.documents.length === 0 ? (
              <div className="mt-6 border-2 border-dashed border-vien px-8 py-6 text-center text-[13px] italic text-chu-ban-phu/60 w-full max-w-md">
                {s("desk.no_documents")}
              </div>
            ) : (
              traveler.documents.map((doc, idx) => {
                const p = SPREAD[idx % SPREAD.length];
                return (
                  <div
                    key={idx}
                    className="relative animate-truot-vao max-sm:!ml-0 max-sm:!mt-0 max-sm:max-w-full"
                    style={{
                      marginLeft: idx > 0 ? p.x : 0,
                      marginTop: p.y,
                      zIndex: top === idx ? 10 : idx + 1,
                      animationDelay: `${idx * 90}ms`,
                      animationFillMode: "backwards",
                    }}
                  >
                    <DocumentPaper
                      doc={doc}
                      tilt={p.tilt}
                      index={idx}
                      pencil={pencil}
                      inks={inks.filter((k) => k.target === `d${idx}`)}
                      onFocus={() => setTop(idx)}
                    />
                  </div>
                );
              })
            )}
            <ControlSlip traveler={traveler} day={day} inks={inks.filter((k) => k.target === "slip")} />
          </div>

          {confrontView && (
            <div className="absolute inset-x-4 bottom-20 z-30 flex justify-center max-lg:fixed max-lg:inset-x-3 max-lg:bottom-auto max-lg:top-24 max-lg:z-40 max-lg:max-h-[60vh] max-lg:overflow-y-auto">
              <ConfrontPanel view={confrontView} onClose={() => setConfrontView(null)} />
            </div>
          )}

          {/* Thanh công cụ trên bàn: bút chì đối chất (V8). Cao cố định để không làm giật bố cục. */}
          <div className="mx-4 mb-3 flex items-center gap-2 border border-vien/70 bg-ban/85 px-3 py-1.5 text-[11px] text-chu-ban-phu/70 min-h-[42px]">
            <button
              type="button"
              disabled={!!chosenAction}
              onClick={() => {
                setPencilOn((on) => !on);
                setSelected([]);
              }}
              aria-pressed={pencilOn}
              className={cx(
                "flex items-center gap-1.5 border px-2 py-1 font-nhan text-[10px] uppercase tracking-wider shrink-0 disabled:opacity-40",
                pencilOn ? "border-son bg-son/20 text-son-nhat" : "border-vien hover:bg-ban-3 text-chu-ban-phu",
              )}
            >
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M4 20l4-1 11-11-3-3L5 16z" />
                <path d="M14 6l3 3" />
              </svg>
              {pencilOn ? s("confront.pencil_off") : s("confront.pencil")}
            </button>
            <span className="flex-1 min-w-0 truncate">{pencilOn ? s("confront.pencil_hint") : s("desk.inspect_hint")}</span>
            {pencilOn && (
              <>
                <span className="font-nhan text-[10px] shrink-0">
                  {s("confront.selected")} {selected.length}/2
                </span>
                {selected.length > 0 && (
                  <button type="button" onClick={() => setSelected([])} className="border border-vien px-2 py-1 font-nhan text-[10px] uppercase tracking-wider hover:bg-ban-3 shrink-0">
                    {s("confront.clear")}
                  </button>
                )}
                <button
                  type="button"
                  disabled={selected.length !== 2}
                  onClick={runConfront}
                  className="bg-son text-giay px-3 py-1 font-nhan font-bold text-[10px] uppercase tracking-wider disabled:opacity-40 hover:bg-[#d0463a] shrink-0"
                >
                  {s("confront.go")}
                </button>
              </>
            )}
          </div>
        </section>

        {/* Khu 3: Sổ chỉ thị */}
        {rulebookOpen ? (
          <aside className="min-h-0 flex flex-col p-4 border-t lg:border-t-0 lg:border-l border-vien/60 bg-ban-1/60 max-h-[80vh] lg:max-h-none">
            <Rulebook
              dayId={day.id}
              issuesActive={activeIssues}
              highlight={highlight}
              onHide={() => toggleRulebook(false)}
              className="flex-1"
            />
          </aside>
        ) : (
          <button
            type="button"
            onClick={() => toggleRulebook(true)}
            title={`${s("rulebook.show")} (${s("rulebook.shortcut")})`}
            className="group flex lg:flex-col items-center justify-center gap-3 py-3 lg:py-6 border-t lg:border-t-0 lg:border-l border-vien/60 bg-ban-1/80 hover:bg-ban-3 text-chu-ban-phu hover:text-giay"
          >
            <span className="w-2 h-6 lg:w-6 lg:h-2 bg-son shrink-0" />
            <span className="font-nhan font-bold text-[11px] uppercase tracking-[0.2em] lg:[writing-mode:vertical-rl] lg:rotate-180">
              {s("desk.rulebook_title")}
            </span>
            <svg viewBox="0 0 24 24" className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M15 6l-6 6 6 6" />
            </svg>
          </button>
        )}
      </main>

      <ActionControls
        key={traveler.id}
        day={day}
        bribeAccepted={bribeAccepted}
        chosenAction={chosenAction}
        chosenReasonId={chosenReasonId}
        travelerOrder={currentTravelerOrder}
        isHostVoting={isHostMode && isPresentationStop && showVotingPanel && !chosenAction}
        onDecide={handleDecide}
        onNext={handleNext}
        onStampDrop={onStampDrop}
        onReportChange={onReportChange}
      />
    </div>
  );
}

/** Phiếu kiểm soát của lượt (V5): luôn nằm trên bàn để có chỗ đóng dấu, kể cả khi khách không xuất trình giấy nào. */
function ControlSlip({ traveler, day, inks }: { traveler: Traveler; day: Day; inks: Ink[] }) {
  const name = content.characters.find((c) => c.id === traveler.character)?.name ?? traveler.character;
  return (
    <div
      data-stamp-target="slip"
      className="relative w-[230px] self-start mt-4 max-sm:self-center max-sm:mt-0 giay-than-hat border-2 border-dashed border-ke shadow-giay p-3 text-muc text-[11px] rotate-[1.5deg] animate-truot-vao"
      style={{ animationDelay: "200ms", animationFillMode: "backwards" }}
    >
      <div className="text-center border-b border-muc/30 pb-1.5 mb-2">
        <div className="font-tieu-de font-bold uppercase tracking-wide text-son text-sm">{s("slip.title")}</div>
        <div className="font-nhan text-[10px] tracking-widest text-muc-nhat">{traveler.id.toUpperCase()}</div>
      </div>
      <div className="space-y-1">
        <div className="flex justify-between gap-2">
          <span className="text-muc-nhat">{s("slip.person")}:</span>
          <b className="text-right">{name}</b>
        </div>
        <div className="flex justify-between gap-2">
          <span className="text-muc-nhat">{s("slip.date")}:</span>
          <b>{day.game_date}</b>
        </div>
        <div className="flex justify-between gap-2 pt-6">
          <span className="text-muc-nhat">{s("slip.result")}:</span>
          <span className="flex-1 border-b border-dotted border-muc/40" />
        </div>
      </div>
      {inks.map((ink, i) => (
        <InkMark key={i} ink={ink} />
      ))}
    </div>
  );
}
