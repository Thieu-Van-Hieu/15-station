import { useEffect, useState } from "react";
import type { Action, Day, GameState, Traveler } from "../engine/types";
import { TopBar } from "../components/TopBar";
import { WindowPanel } from "../components/WindowPanel";
import { DocumentPaper } from "../components/DocumentPaper";
import { Rulebook } from "../components/Rulebook";
import { ActionControls } from "../components/ActionControls";
import { Label, Panel, s } from "../components/ui";
import { issuesActiveOn } from "../engine/state";
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
}: DeskScreenProps) {
  const [bribeAccepted, setBribeAccepted] = useState(false);
  const [bribeDismissed, setBribeDismissed] = useState(false);
  const [chosenAction, setChosenAction] = useState<Action | null>(null);
  const [chosenReasonId, setChosenReasonId] = useState<string | null>(null);
  const [top, setTop] = useState<number | null>(null);

  const character = content.characters.find((c) => c.id === traveler.character);
  const activeIssues = issuesActiveOn(state, day.id);

  useEffect(() => {
    setLoop("amb_tram_ngay");
    preloadSfx();
  }, []);

  useEffect(() => {
    playSfx("window");
    const t = setTimeout(() => playSfx("bell"), 350);
    setTop(null);
    return () => clearTimeout(t);
  }, [traveler.id]);

  function handleDecide(action: Action, reasonId?: string | null) {
    setChosenAction(action);
    setChosenReasonId(reasonId ?? null);
  }

  function handleNext() {
    if (!chosenAction) return;
    onDecide(chosenAction, chosenReasonId, bribeAccepted);
    setChosenAction(null);
    setChosenReasonId(null);
    setBribeAccepted(false);
    setBribeDismissed(false);
    onNext();
  }

  return (
    <div className="mat-ban lop-nhieu min-h-screen lg:h-screen flex flex-col text-chu-ban font-may-chu">
      <TopBar state={state} day={day} currentTravelerOrder={currentTravelerOrder} totalTravelersInDay={totalTravelersInDay} />

      <main className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[300px_minmax(0,1fr)_360px] xl:grid-cols-[330px_minmax(0,1fr)_400px]">
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
          />

          <Panel title={s("desk.cargo_title")} className="!bg-ban-1">
            {traveler.cargo.length === 0 ? (
              <p className="text-[12px] italic text-chu-ban-phu/60">{s("desk.no_cargo")}</p>
            ) : (
              <ul className="space-y-1.5 text-[12.5px]">
                {traveler.cargo.map((item, idx) => (
                  <li key={idx} className="flex items-baseline gap-2">
                    <span className="text-chu-ban-phu">{item.ten}</span>
                    <span className="flex-1 border-b border-dotted border-vien" />
                    <span className="font-nhan font-bold text-ho-phach whitespace-nowrap">
                      {item.so_luong} {item.don_vi}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </section>

        {/* Khu 2: Mặt bàn với giấy tờ */}
        <section className="mat-ban-cham min-h-[420px] lg:min-h-0 overflow-auto thanh-cuon relative flex flex-col">
          <div className="flex items-center justify-between px-5 pt-4">
            <Label className="text-chu-ban-phu/70">{s("desk.documents_title")}</Label>
            <Label className="text-chu-ban-phu/40 text-[10px]">{traveler.documents.length}</Label>
          </div>

          <div key={traveler.id} className="flex-1 flex flex-wrap content-start justify-center gap-x-2 gap-y-6 px-6 pt-8 pb-10">
            {traveler.documents.length === 0 ? (
              <div className="mt-16 border-2 border-dashed border-vien px-8 py-10 text-center text-[13px] italic text-chu-ban-phu/60">
                {s("desk.no_documents")}
              </div>
            ) : (
              traveler.documents.map((doc, idx) => {
                const p = SPREAD[idx % SPREAD.length];
                return (
                  <div
                    key={idx}
                    className="relative animate-truot-vao"
                    style={{
                      marginLeft: idx > 0 ? p.x : 0,
                      marginTop: p.y,
                      zIndex: top === idx ? 10 : idx + 1,
                      animationDelay: `${idx * 90}ms`,
                      animationFillMode: "backwards",
                    }}
                  >
                    <DocumentPaper doc={doc} tilt={p.tilt} onFocus={() => setTop(idx)} />
                  </div>
                );
              })
            )}
          </div>

          <div className="mx-4 mb-3 flex items-center gap-2 border border-vien/70 bg-ban/85 px-3 py-2 text-[11px] text-chu-ban-phu/70">
            <span aria-hidden>☞</span>
            <span>{s("desk.inspect_hint")}</span>
          </div>
        </section>

        {/* Khu 3: Sổ chỉ thị */}
        <aside className="min-h-0 flex flex-col p-4 border-t lg:border-t-0 lg:border-l border-vien/60 bg-ban-1/60 max-h-[80vh] lg:max-h-none">
          <Rulebook dayId={day.id} issuesActive={activeIssues} className="flex-1" />
        </aside>
      </main>

      <ActionControls
        key={traveler.id}
        day={day}
        bribeAccepted={bribeAccepted}
        chosenAction={chosenAction}
        chosenReasonId={chosenReasonId}
        travelerOrder={currentTravelerOrder}
        onDecide={handleDecide}
        onNext={handleNext}
      />
    </div>
  );
}
