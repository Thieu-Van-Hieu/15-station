import type { Ending } from "../engine/types";
import type { GameState } from "../engine/state";
import { filterByWhen } from "../engine/conditions";
import { conditionState } from "../engine/state";
import { content } from "../content";

interface EndingScreenProps {
  ending: Ending;
  state: GameState;
  onRestart: () => void;
}

export function EndingScreen({ ending, state, onRestart }: EndingScreenProps) {
  const cState = conditionState(state);
  const visibleScenes = filterByWhen(ending.scenes ?? [], cState);
  const visibleFates = filterByWhen(ending.character_lines ?? [], cState);

  return (
    <div className="min-h-screen bg-xi-mang text-muc font-may-chu p-6 flex flex-col items-center justify-center">
      <div className="max-w-2xl w-full border-4 border-nau bg-giay p-8 rounded shadow-2xl space-y-6">
        <header className="border-b-2 border-nau/40 pb-3 text-center">
          <span className="text-xs uppercase font-bold text-dau-do tracking-widest">
            {content.strings["end.title"]}
          </span>
          <h2 className="text-2xl font-bold text-muc mt-1 uppercase tracking-wide">
            {ending.title}
          </h2>
        </header>

        {/* Cảnh kết / Đoạn văn */}
        <div className="italic text-xs leading-relaxed text-muc/90 border-l-4 border-nau pl-4 space-y-2">
          {visibleScenes.map((scene, idx) => (
            <p key={idx}>{scene.text}</p>
          ))}
        </div>

        {/* Số phận nhân vật */}
        {visibleFates.length > 0 && (
          <div className="space-y-2 border-t border-nau/20 pt-4">
            <h4 className="font-bold text-xs uppercase text-dau-do">
              {content.strings["end.fates_title"]}
            </h4>
            <div className="space-y-2 text-xs leading-relaxed">
              {visibleFates.map((fate, idx) => (
                <div key={idx} className="p-2 bg-nau/10 border border-nau/20 rounded">
                  <span className="font-bold text-nau mr-2">{fate.character}:</span>
                  <span>{fate.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Trích dẫn giáo trình */}
        <div className="border-t border-nau/20 pt-4 text-center space-y-1">
          <span className="text-[10px] uppercase font-bold text-dau-do tracking-wider">
            {content.strings["end.quote_title"]}
          </span>
          <blockquote className="italic text-xs font-semibold text-muc/95 mt-1 px-4">
            "{ending.quote.text}"
          </blockquote>
          <p className="text-[11px] text-neutral-600 font-mono">
            — {content.strings["end.chapter_prefix"] ?? "Chương"} {ending.quote.chapter} ({ending.quote.section})
          </p>
        </div>

        {/* Câu hỏi suy ngẫm */}
        {ending.closing_question && (
          <div className="p-3 bg-dau-do/10 border border-dau-do/30 rounded text-center">
            <span className="text-[10px] font-bold uppercase text-dau-do block mb-1">
              {content.strings["end.reflection_title"]}
            </span>
            <p className="text-xs italic text-dau-do">{ending.closing_question}</p>
          </div>
        )}

        {/* Thẻ lịch sử */}
        <div className="border-t border-nau/30 pt-3 text-center text-xs text-neutral-600 italic">
          <p>{content.strings["end.history_card"]}</p>
        </div>

        {/* Nút chơi lại */}
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={onRestart}
            className="px-8 py-3 bg-nau hover:bg-nau/90 text-giay font-bold text-sm tracking-widest uppercase rounded shadow-lg border-2 border-giay transition-colors active:scale-95"
          >
            {content.strings["end.restart"]}
          </button>
        </div>
      </div>
    </div>
  );
}
