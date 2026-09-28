import type { Character, GameState, Traveler, Action, Line } from "../engine/types";
import { filterByWhen } from "../engine/conditions";
import { conditionState, currentDay } from "../engine/state";
import { portraitFor } from "../engine/portrait";
import { QueueStrip } from "./QueueStrip";
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
  /** Lượt trước đó trong ngày đều bị giữ: người này đã nghe chuyện ngoài hàng chờ (V3f). */
  rumorLine?: string | null;
  /** Hàng người chờ ngoài cửa sổ (V6). */
  queue?: { waiting: number; dusk: number; stir?: number };
  /** Lời người khách khi vừa bị đối chất (V8), hiện đè lên chân dung như lời phản ứng. */
  confrontLines?: Line[] | null;
}

function speakerName(id: string): string {
  return content.characters.find((c) => c.id === id)?.name ?? id;
}

/** Một dòng thoại. Lời dẫn truyện (`narrator`) là chữ nghiêng, không có tên người nói. */
function DialogueLine({ line }: { line: Line }) {
  if (line.speaker === "narrator") return <p className="italic text-muc-nhat">{line.text}</p>;
  return (
    <p>
      <span className="font-nhan font-bold text-[10px] uppercase tracking-wider text-son-dam mr-1.5">{speakerName(line.speaker)}:</span>
      <span>{line.text}</span>
    </p>
  );
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
  rumorLine,
  queue,
  confrontLines,
}: WindowPanelProps) {
  const cState = conditionState(state);
  const visibleDialogue = filterByWhen(traveler.dialogue ?? [], cState);
  const name = character?.name ?? speakerName(traveler.character);
  const portrait = portraitFor(traveler, character, cState);

  // Trạm trưởng đứng sau lưng ở lượt này (V3g): lời của ông ta nằm trong interludes của ngày, trỏ đúng mã lượt.
  const day = state.phase === "TRAVELER" ? currentDay(state, content) : undefined;
  const observed = day?.observed?.includes(traveler.id) ?? false;
  const observerLines = (day?.interludes ?? [])
    .filter((i) => i.at === traveler.id)
    .filter((i) => filterByWhen([i], cState).length > 0)
    .flatMap((i) => filterByWhen(i.lines, cState));

  const reactionLines =
    chosenAction && chosenAction !== "LAM_NGO" && traveler.reactions?.[chosenAction]
      ? filterByWhen(traveler.reactions[chosenAction], cState)
      : (confrontLines ?? []);

  // Thẻ phong bì ở nguyên chỗ suốt lượt (chỉ đổi nội dung) để cột không co giãn khi người chơi quyết định.
  const bribeOpen = !bribeAccepted && !bribeDismissed && !chosenAction;
  const showDialogue = visibleDialogue.length > 0 || !!rumorLine;

  return (
    <div className="flex flex-col gap-4">
      {/* Ô cửa và chân dung */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-ho-phach">{s("desk.window_title")}</Label>
          <Label className="text-chu-ban-phu/50 text-[10px]">{traveler.id.toUpperCase()}</Label>
        </div>
        <div key={traveler.id} className="border-[6px] border-ban-4 bg-ban-1 shadow-noi animate-truot-vao">
          <div className="relative">
            <Portrait charKey={portrait.key} expression={portrait.expression} alt={name} className="aspect-[5/6] w-full" />
            {/* Quá giờ hết ca: ngoài ô cửa tối dần. */}
            {queue && queue.dusk > 0 && (
              <div
                className="absolute inset-0 pointer-events-none bg-[#0b1020] mix-blend-multiply transition-opacity duration-[1500ms]"
                style={{ opacity: queue.dusk * 0.45 }}
              />
            )}
            {/* Lời phản ứng hiện đè lên chân dung như bong bóng thoại, không chen vào bố cục. */}
            {reactionLines.length > 0 && (
              <div className="absolute inset-x-2 bottom-2 animate-truot-vao">
                <div className="giay-hat border border-giay-vien shadow-giay px-3 py-2 text-[12px] leading-snug text-muc italic max-h-[45%] overflow-hidden">
                  {reactionLines.map((line, idx) => (
                    <p key={idx} className={line.speaker === "narrator" ? "text-muc-nhat" : undefined}>
                      {line.text}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
          {queue && <QueueStrip waiting={queue.waiting} dusk={queue.dusk} stir={queue.stir} />}
          <div className="flex items-center justify-between gap-2 bg-ban-3 px-3 py-2 border-t border-vien">
            <span className="font-tieu-de font-bold text-giay truncate">{name}</span>
            {character?.home && <Label className="text-chu-ban-phu/60 text-[10px] truncate">{character.home}</Label>}
          </div>
        </div>
      </div>

      {lastReprimandText && (
        <Paper tone="bia" tilt={-0.6} className="p-3 pl-4 border-l-4 !border-l-son animate-truot-vao">
          <Label className="text-son-dam text-[10px]">{s("desk.reprimand_title")}</Label>
          <p className="text-[12px] leading-relaxed italic mt-1 whitespace-pre-line">{lastReprimandText}</p>
        </Paper>
      )}

      {observed && (
        <div className="border-l-4 border-son bg-son/10 px-3 py-2.5 animate-truot-vao">
          <Label className="text-son-nhat text-[10px]">{s("desk.observed_title")}</Label>
          {observerLines.map((l, i) => (
            <p key={i} className="text-[12px] italic text-chu-ban mt-1">
              &ldquo;{l.text}&rdquo;
            </p>
          ))}
          <p className="text-[11px] text-chu-ban-phu/70 mt-1">{s("desk.observed_note")}</p>
        </div>
      )}

      {/* Lời khai */}
      {showDialogue && (
        <Paper tone="giay" className="p-3 pr-4">
          <Label className="text-muc-nhat text-[10px]">{s("desk.dialogue_title")}</Label>
          <div className="mt-2 space-y-2.5 max-h-64 overflow-y-auto thanh-cuon pr-1 text-[12.5px] leading-relaxed">
            {rumorLine && (
              <p className="text-muc-nhat italic border-l-2 border-ho-phach pl-2">
                <span className="font-nhan font-bold text-[10px] uppercase tracking-wider not-italic mr-1.5">{s("rumor.title")}:</span>
                {rumorLine}
              </p>
            )}
            {visibleDialogue.map((line, idx) => (
              <DialogueLine key={idx} line={line} />
            ))}
          </div>
        </Paper>
      )}

      {/* Phong bì */}
      {traveler.bribe && (
        <Paper tone="bia" tilt={1.2} clip className={cx("p-3", !bribeOpen && !bribeAccepted && "opacity-60")}>
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
          {bribeAccepted ? (
            <div className="mt-3 border-2 border-dashed border-son-dam/70 bg-son/10 py-1.5 text-center font-nhan font-bold text-[11px] uppercase tracking-wider text-son-dam">
              {s("desk.bribe_taken")}: +{traveler.bribe.amount} {s("ui.money_unit")}
            </div>
          ) : !bribeOpen ? (
            <div className="mt-3 border-2 border-dashed border-muc/40 py-1.5 text-center font-nhan text-[11px] uppercase tracking-wider text-muc-nhat">
              {s("desk.bribe_declined")}
            </div>
          ) : (
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
          )}
        </Paper>
      )}
    </div>
  );
}
