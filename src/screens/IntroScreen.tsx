import { content } from "../content";

interface IntroScreenProps {
  onStart: () => void;
}

export function IntroScreen({ onStart }: IntroScreenProps) {
  return (
    <div className="min-h-screen bg-xi-mang text-muc font-may-chu p-6 flex flex-col items-center justify-center">
      <div className="max-w-xl w-full border-4 border-nau bg-giay p-8 rounded shadow-2xl space-y-6 text-center">
        <header className="border-b-2 border-nau/40 pb-4">
          <h1 className="text-4xl font-extrabold text-dau-do tracking-wider">{content.strings["intro.title"]}</h1>
          <p className="text-xs uppercase tracking-widest text-nau font-bold mt-1">1979 — 1987</p>
        </header>

        <div className="space-y-4 text-xs leading-relaxed text-justify">
          <div className="p-3 bg-dau-do/10 border-l-4 border-dau-do rounded text-muc/90 italic">
            {content.strings["intro.disclaimer"]}
          </div>

          <p className="text-muc/90 indent-4">{content.strings["intro.guide_bao_cap"]}</p>
        </div>

        <div className="pt-4 border-t border-nau/30">
          <button
            type="button"
            onClick={onStart}
            className="w-full py-3 bg-nau hover:bg-nau/90 text-giay font-bold text-sm tracking-widest uppercase rounded shadow-lg border-2 border-giay transition-colors active:scale-95"
          >
            {content.strings["intro.start"]} →
          </button>
        </div>
      </div>
    </div>
  );
}
