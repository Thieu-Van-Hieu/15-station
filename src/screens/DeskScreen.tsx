import { useState } from "react";
import type { Action, Day, GameState, Traveler } from "../engine/types";
import { TopBar } from "../components/TopBar";
import { WindowPanel } from "../components/WindowPanel";
import { DocumentPaper } from "../components/DocumentPaper";
import { Rulebook } from "../components/Rulebook";
import { ActionControls } from "../components/ActionControls";
import { issuesActiveOn } from "../engine/state";
import { content } from "../content";

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

  const character = content.characters.find((c) => c.id === traveler.character);
  const activeIssues = issuesActiveOn(state, day.id);

  function handleAcceptBribe() {
    setBribeAccepted(true);
  }

  function handleDeclineBribe() {
    setBribeDismissed(true);
  }

  function handleDecide(action: Action, reasonId?: string | null) {
    setChosenAction(action);
    setChosenReasonId(reasonId ?? null);
  }

  function handleNext() {
    if (chosenAction) {
      onDecide(chosenAction, chosenReasonId, bribeAccepted);
      setChosenAction(null);
      setChosenReasonId(null);
      setBribeAccepted(false);
      setBribeDismissed(false);
      onNext();
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-xi-mang text-muc font-may-chu">
      <TopBar
        state={state}
        day={day}
        currentTravelerOrder={currentTravelerOrder}
        totalTravelersInDay={totalTravelersInDay}
      />

      <main className="flex-1 flex flex-col lg:flex-row p-4 gap-4 overflow-hidden">
        {/* Khu 1 (Trái): Ô cửa sổ, người qua trạm, thoại */}
        <section className="flex-shrink-0">
          <WindowPanel
            traveler={traveler}
            character={character}
            state={state}
            bribeAccepted={bribeAccepted}
            bribeDismissed={bribeDismissed}
            onAcceptBribe={handleAcceptBribe}
            onDeclineBribe={handleDeclineBribe}
            lastReprimandText={lastReprimandText}
            chosenAction={chosenAction}
          />
        </section>

        {/* Khu 2 (Giữa): Mặt bàn gỗ, giấy tờ, hàng hoá và con dấu */}
        <section className="flex-1 flex flex-col justify-between space-y-4 overflow-y-auto">
          {/* Hàng hoá mang theo */}
          <div className="border-2 border-nau/60 bg-giay/60 p-3 rounded text-xs shadow-sm">
            <h4 className="font-bold text-nau uppercase mb-1.5">{content.strings["desk.cargo_title"]}</h4>
            {traveler.cargo.length === 0 ? (
              <p className="italic text-muc/70">{content.strings["desk.no_cargo"]}</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {traveler.cargo.map((item, idx) => (
                  <div key={idx} className="flex justify-between border-b border-nau/20 pb-1">
                    <span className="font-semibold">{item.ten}</span>
                    <span className="font-mono">
                      {item.so_luong} {item.don_vi}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Giấy tờ xuất trình */}
          <div className="flex-1 min-h-[220px]">
            <h4 className="font-bold text-nau uppercase text-xs mb-2">
              {content.strings["desk.documents_title"]}
            </h4>
            {traveler.documents.length === 0 ? (
              <div className="p-6 border-2 border-dashed border-nau/40 rounded text-center text-xs italic text-muc/60">
                {content.strings["desk.no_documents"]}
              </div>
            ) : (
              <div className="flex flex-wrap gap-3 items-start justify-start">
                {traveler.documents.map((doc, idx) => (
                  <DocumentPaper key={idx} doc={doc} />
                ))}
              </div>
            )}
          </div>

          {/* Điều khiển con dấu và quyết định */}
          <ActionControls
            day={day}
            bribeAccepted={bribeAccepted}
            chosenAction={chosenAction}
            chosenReasonId={chosenReasonId}
            onDecide={handleDecide}
            onNext={handleNext}
          />
        </section>

        {/* Khu 3 (Phải): Sổ chỉ thị đối chiếu */}
        <aside className="flex-shrink-0">
          <Rulebook dayId={day.id} issuesActive={activeIssues} />
        </aside>
      </main>
    </div>
  );
}
