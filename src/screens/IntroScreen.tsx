import { useEffect } from "react";
import { setLoop } from "../audio";
import { Label, Paper, PaperClip, PrimaryButton, Screen, s } from "../components/ui";

interface IntroScreenProps {
  onStart: () => void;
}

export function IntroScreen({ onStart }: IntroScreenProps) {
  useEffect(() => setLoop("mus_menu"), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Enter" && onStart();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onStart]);

  return (
    <Screen className="items-center px-4 py-8">
      <div className="w-full max-w-3xl flex items-center justify-between border-b border-vien/70 pb-3">
        <Label className="flex items-center gap-2 text-chu-ban-phu">
          <span className="w-2 h-2 rounded-full bg-son" />
          {s("ui.brand_sub")}
        </Label>
        <Label className="text-chu-ban-phu/50 hidden sm:inline">{s("ui.period")}</Label>
      </div>

      {/* Tiêu đề trong khung dấu */}
      <div className="relative mt-14 mb-12 text-center">
        <div className="absolute inset-x-[-40px] inset-y-[-22px] border-[3px] border-son/35 -rotate-3 pointer-events-none" />
        <Label className="text-chu-ban-phu/80 tracking-[0.35em]">{s("intro.kicker")}</Label>
        <h1 className="font-tieu-de font-bold text-6xl sm:text-7xl tracking-[0.12em] text-giay mt-2 drop-shadow-[3px_4px_0_rgba(0,0,0,0.6)]">
          {s("intro.title")}
        </h1>
        <div className="flex items-center justify-center gap-3 mt-2">
          <span className="h-px w-12 bg-chu-ban-phu/40" />
          <Label className="text-chu-ban-phu/60 tracking-[0.3em]">{s("intro.subtitle")}</Label>
          <span className="h-px w-12 bg-chu-ban-phu/40" />
        </div>
      </div>

      <Paper tone="giay" className="w-full max-w-2xl px-6 sm:px-8 py-7" tilt={-0.4}>
        <PaperClip className="-top-5 right-10" />
        <div className="flex items-start justify-between gap-4">
          <div>
            <Label className="text-muc-nhat text-[10px] block">{s("ui.period")}</Label>
            <span className="font-nhan font-bold text-[12px]">{s("intro.source")}</span>
          </div>
          <span className="shrink-0 border-2 border-son text-son font-nhan font-bold text-[11px] uppercase tracking-widest px-2 py-1 rotate-6 mix-blend-multiply">
            {s("intro.stamp")}
          </span>
        </div>

        <div className="border-t border-muc/30 mt-4 pt-4">
          <h2 className="font-nhan font-bold text-[13px] uppercase tracking-wider flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-son" />
            {s("intro.disclaimer_title")}
          </h2>
          <blockquote className="mt-3 border-l-4 border-son bg-bia/40 px-4 py-3 text-[13px] italic leading-relaxed">
            {s("intro.disclaimer")}
          </blockquote>
        </div>

        <div className="mt-5">
          <h2 className="font-nhan font-bold text-[13px] uppercase tracking-wider flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-son" />
            {s("intro.guide_title")}
          </h2>
          <p className="mt-2 text-[13px] leading-relaxed text-muc/90">{s("intro.guide_bao_cap")}</p>
        </div>

        <div className="flex items-center justify-between mt-6 pt-3 border-t border-dashed border-muc/40 text-[11px]">
          <span className="text-muc-nhat">
            {s("intro.archive_code")}: <b className="text-muc font-nhan">T15/1979-KT</b>
          </span>
          <span className="italic text-muc-nhat">{s("ui.officer_name")}</span>
        </div>
      </Paper>

      <PrimaryButton onClick={onStart} hint="ENTER" className="w-full max-w-2xl mt-8">
        {s("intro.start")}
      </PrimaryButton>

      <p className="max-w-2xl mt-6 text-[11px] text-chu-ban-phu/60 text-center leading-relaxed">
        <span className="text-son-nhat font-nhan font-bold mr-1">[!]</span>
        {s("intro.note")}
      </p>

      <footer className="mt-auto pt-10 text-[10px] text-chu-ban-phu/40 text-center font-nhan tracking-wider">{s("ui.footer")}</footer>
    </Screen>
  );
}
