import type { Character, GameState, Traveler, Action } from "../engine/types";
import { filterByWhen } from "../engine/conditions";
import { conditionState } from "../engine/state";
import { content } from "../content";
import { playSfx } from "../audio";
import { Label, Paper, Portrait, cx, s } from "./ui";

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

function speakerName(id: string): string {
  return content.characters.find((c) => c.id === id)?.name ?? id;
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
  const name = character?.name ?? speakerName(traveler.character);
  const portraitKey = character?.portrait.key ?? traveler.character;

  const reactionLines =
    chosenAction && chosenAction !== "LAM_NGO" && traveler.reactions?.[chosenAction]
      ? filterByWhen(traveler.reactions[chosenAction], cState)
      : [];

  const showBribe = traveler.bribe && !bribeAccepted && !bribeDismissed && !chosenAction;

  return (
    <div className="flex flex-col gap-4">
      {lastReprimandText && (
        <Paper tone="bia" tilt={-1} className="p-3 pl-4 border-l-4 !border-l-son animate-truot-vao">
          <Label className="text-son-dam text-[10px]">{s("desk.reprimand_title")}</Label>
          <p className="text-[12px] leading-relaxed italic mt-1 whitespace-pre-line">{lastReprimandText}</p>
        </Paper>
      )}

      {/* Ô cửa và chân dung */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-ho-phach">{s("desk.window_title")}</Label>
          <Label className="text-chu-ban-phu/50 text-[10px]">{traveler.id.toUpperCase()}</Label>
        </div>
        <div key={traveler.id} className="border-[6px] border-ban-4 bg-ban-1 shadow-noi animate-truot-vao">
          <Portrait charKey={portraitKey} expression={traveler.portrait.expression} alt={name} className="aspect-[5/6] w-full" />
          <div className="flex items-center justify-between gap-2 bg-ban-3 px-3 py-2 border-t border-vien">
            <span className="font-tieu-de font-bold text-giay truncate">{name}</span>
            {character?.home && <Label className="text-chu-ban-phu/60 text-[10px] truncate">{character.home}</Label>}
          </div>
        </div>
      </div>

      {/* Lời khai */}
      {(visibleDialogue.length > 0 || reactionLines.length > 0) && (
        <Paper tone="giay" className="p-3 pr-4">
          <Label className="text-muc-nhat text-[10px]">{s("desk.dialogue_title")}</Label>
          <div className="mt-2 space-y-2.5 max-h-56 overflow-y-auto thanh-cuon pr-1 text-[12.5px] leading-relaxed">
            {visibleDialogue.map((line, idx) => (
              <p key={idx}>
                <span className="font-nhan font-bold text-[10px] uppercase tracking-wider text-son-dam mr-1.5">
                  {speakerName(line.speaker)}:
                </span>
                <span>{line.text}</span>
              </p>
            ))}
            {reactionLines.map((line, idx) => (
              <p key={`rx-${idx}`} className="animate-truot-vao border-l-2 border-son pl-2 text-son-dam italic">
                <span className="font-nhan font-bold text-[10px] uppercase tracking-wider mr-1.5 not-italic">{speakerName(line.speaker)}:</span>
                <span>{line.text}</span>
              </p>
            ))}
          </div>
        </Paper>
      )}

      {/* Phong bì */}
      {showBribe && traveler.bribe && (
        <Paper tone="bia" tilt={1.2} clip className="p-3 animate-truot-vao">
          <div className="flex items-center justify-between">
            <Label className="text-son-dam">{s("desk.bribe_title")}</Label>
            <span className="font-nhan font-bold text-son-dam">
              +{traveler.bribe.amount} {s("ui.money_unit")}
            </span>
          </div>
          <p className="text-[11px] italic text-muc-nhat mt-1">{s("desk.bribe_prompt")}</p>
          {traveler.bribe.lines.map((l, idx) => (
            <p key={idx} className="text-[12px] mt-1.5">
              &ldquo;{l.text}&rdquo;
            </p>
          ))}
          <div className="flex gap-2 mt-3">
            <button
              type="button"
              onClick={() => {
                playSfx("coin");
                onAcceptBribe();
              }}
              className="flex-1 border-2 border-son-dam bg-son-dam text-giay font-nhan font-bold text-[11px] uppercase tracking-wider py-1.5 hover:bg-son"
            >
              {s("desk.accept_bribe")}
            </button>
            <button
              type="button"
              onClick={onDeclineBribe}
              className="flex-1 border-2 border-muc/60 text-muc font-nhan font-bold text-[11px] uppercase tracking-wider py-1.5 hover:bg-bia-dam"
            >
              {s("desk.decline_bribe")}
            </button>
          </div>
        </Paper>
      )}

      {bribeAccepted && (
        <div
          className={cx(
            "border-2 border-dashed border-son/70 bg-son/10 px-3 py-2 text-center font-nhan text-[11px] uppercase tracking-wider text-son-nhat",
          )}
        >
          {s("desk.bribe_taken")}: +{traveler.bribe?.amount} {s("ui.money_unit")}
        </div>
      )}
    </div>
  );
}
