import type { Character, GameState, Traveler, Action } from "../engine/types";
import { filterByWhen } from "../engine/conditions";
import { conditionState } from "../engine/state";
import { content } from "../content";

interface WindowPanelProps {
  traveler: Traveler;
  character?: Character;
  state: GameState;
  bribeAccepted: boolean;
  bribeDismissed: boolean;
  onAcceptBribe: () => void;
  onDeclineBribe: () => void;
  lastReprimandText?: string | null;
  chosenAction?: Action | null;
}

export function WindowPanel({
  traveler,
  character,
  state,
  bribeAccepted,
  bribeDismissed,
  onAcceptBribe,
  onDeclineBribe,
  lastReprimandText,
  chosenAction,
}: WindowPanelProps) {
  const cState = conditionState(state);
  const visibleDialogue = filterByWhen(traveler.dialogue ?? [], cState);

  const reactionLines =
    chosenAction && chosenAction !== "LAM_NGO" && traveler.reactions?.[chosenAction]
      ? filterByWhen(traveler.reactions[chosenAction], cState)
      : [];

  return (
    <div className="flex flex-col space-y-3 w-80 md:w-96">
      {lastReprimandText && (
        <div className="border-2 border-dau-do bg-giay p-3 rounded shadow-md text-xs leading-relaxed animate-pulse">
          <div className="font-bold text-dau-do uppercase text-[11px] mb-1">
            {content.strings["desk.reprimand_title"]}
          </div>
          <p className="italic text-muc/90">{lastReprimandText}</p>
        </div>
      )}

      {/* Cửa sổ trạm kiểm soát */}
      <div className="border-4 border-nau bg-neutral-800 text-giay p-4 rounded-t-lg shadow-inner min-h-64 flex flex-col justify-between">
        <div className="flex items-center space-x-3 border-b border-neutral-700 pb-2">
          <div className="w-14 h-14 rounded-full border-2 border-dau-do bg-neutral-900 overflow-hidden flex items-center justify-center flex-shrink-0 shadow">
            <img
              src={`/art/portraits/${character?.portrait.key ?? traveler.character}_${traveler.portrait.expression}.svg`}
              alt={character?.name ?? traveler.character}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLElement).style.display = "none";
              }}
            />
          </div>
          <div>
            <h3 className="font-bold text-sm text-giay">{character?.name ?? traveler.character}</h3>
            <span className="text-[10px] text-neutral-400 capitalize">{traveler.portrait.expression}</span>
          </div>
        </div>

        {/* Khung thoại */}
        <div className="my-3 space-y-2 max-h-48 overflow-y-auto pr-1 text-xs">
          {visibleDialogue.map((line, idx) => (
            <div key={idx} className="bg-neutral-900/90 border border-neutral-700 p-2 rounded text-neutral-200">
              <span className="font-semibold text-dau-do mr-1.5">
                {line.speaker === traveler.character ? character?.name ?? line.speaker : line.speaker}:
              </span>
              <span>{line.text}</span>
            </div>
          ))}

          {chosenAction && reactionLines.map((line, idx) => (
            <div key={`rx-${idx}`} className="bg-neutral-900/90 border border-dau-do/60 p-2 rounded text-dau-do">
              <span className="font-semibold mr-1.5">{character?.name ?? line.speaker}:</span>
              <span>{line.text}</span>
            </div>
          ))}
        </div>

        {/* Phong bì */}
        {traveler.bribe && !bribeAccepted && !bribeDismissed && !chosenAction && (
          <div className="mt-2 p-2.5 bg-yellow-950/80 border border-yellow-600 rounded text-xs">
            <p className="text-yellow-200 italic mb-2">{content.strings["desk.bribe_prompt"]}</p>
            {traveler.bribe.lines.map((l, idx) => (
              <p key={idx} className="text-yellow-100 text-[11px] mb-2 font-mono">
                "{l.text}"
              </p>
            ))}
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={onAcceptBribe}
                className="flex-1 bg-yellow-700 hover:bg-yellow-600 text-white font-bold py-1 px-2 rounded text-[11px] transition-colors"
              >
                {content.strings["desk.accept_bribe"]} ({traveler.bribe.amount})
              </button>
              <button
                type="button"
                onClick={onDeclineBribe}
                className="flex-1 bg-neutral-700 hover:bg-neutral-600 text-neutral-200 py-1 px-2 rounded text-[11px] transition-colors"
              >
                {content.strings["desk.decline_bribe"]}
              </button>
            </div>
          </div>
        )}

        {bribeAccepted && (
          <div className="mt-1 p-1.5 bg-dau-do/20 border border-dau-do rounded text-center text-[11px] text-dau-do font-bold">
            {content.strings["budget.bribe_money"]}: +{traveler.bribe?.amount}
          </div>
        )}
      </div>
    </div>
  );
}
