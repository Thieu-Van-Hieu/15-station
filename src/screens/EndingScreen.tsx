import type { Ending } from "../engine/types";
import type { GameState } from "../engine/state";
import { filterByWhen } from "../engine/conditions";
import { conditionState } from "../engine/state";
import { hiddenStats } from "../engine/endings";
import { fillText, textVars } from "../engine/text";
import { content } from "../content";
import { setLoop } from "../audio";
import { ResultCard, type CardData } from "../components/ResultCard";
import { useEffect } from "react";
import { AppHeader, Label, Panel, Paper, Portrait, PrimaryButton, Screen, cx, s } from "../components/ui";

interface EndingScreenProps {
  ending: Ending;
  state: GameState;
  onRestart: () => void;
}

export function EndingScreen({ ending, state, onRestart }: EndingScreenProps) {
  useEffect(() => setLoop("mus_ket"), []);

  const cState = conditionState(state);
  const visibleScenes = filterByWhen(ending.scenes ?? [], cState);
  const visibleFates = filterByWhen(ending.character_lines ?? [], cState);
  const stats = hiddenStats(state);
  const vars = textVars(state, content);
  const index = [...content.endings].sort((a, b) => a.priority - b.priority).findIndex((e) => e.id === ending.id) + 1;

  // "1988: ... 1989: ..." → từng mốc
  const timeline = s("end.history_card")
    .split(/(?=\b\d{4}:)/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const m = part.match(/^(\d{4}):\s*(.*)$/s);
      return m ? { year: m[1], text: m[2] } : { year: "", text: part };
    });

  const statRows: { label: string; value: string; pct?: number; good?: boolean }[] = [
    { label: s("end.stat_compliance"), value: `${Math.round(stats.true_compliance * 100)}%`, pct: stats.true_compliance, good: stats.true_compliance >= 0.8 },
    { label: s("end.stat_reports"), value: String(stats.valid_reports), good: stats.valid_reports > 0 },
    { label: s("end.stat_lam_ngo"), value: String(stats.lam_ngo_violations), good: stats.lam_ngo_violations === 0 },
    { label: s("end.stat_bribes"), value: `${stats.bribe_total} ${s("ui.money_unit")}`, good: stats.bribe_total === 0 },
    { label: s("end.stat_reprimands"), value: String(stats.reprimands), good: stats.reprimands <= 2 },
    { label: s("end.stat_hardship"), value: String(stats.hardship), good: stats.hardship === 0 },
  ];
  const confrontTurns = stats.doi_chat_hanh_dong + stats.doi_chat_bo_qua;
  if (stats.doi_chat_count > 0) {
    statRows.push({
      label: s("end.stat_confront"),
      value: `${confrontTurns} / ${stats.doi_chat_hanh_dong}`,
      good: stats.doi_chat_bo_qua === 0,
    });
  }

  // V7: thẻ kết quả. Một dòng nhân vật lấy từ số phận đầu tiên hiện được (đã xét cờ).
  const fate = visibleFates[0];
  const fateChar = fate && content.characters.find((c) => c.id === fate.character);
  const card: CardData = {
    endingId: ending.id,
    title: ending.title,
    cardLine: ending.card_line,
    reported: stats.reported_compliance,
    actual: stats.true_compliance,
    reports: stats.valid_reports,
    confront: stats.doi_chat_count > 0 ? { found: confrontTurns, acted: stats.doi_chat_hanh_dong } : null,
    character: fate ? { name: fateChar?.name ?? fate.character, text: fillText(fate.text, vars) } : null,
    quote: ending.quote,
  };

  return (
    <Screen header={<AppHeader center={<Label className="text-ho-phach">{s("ui.period")}</Label>} />} className="px-4 md:px-6 py-8">
      <div className="w-full max-w-6xl mx-auto space-y-8">
        {/* Tiêu đề */}
        <div className="text-center">
          <span className="inline-block bg-son-dam/60 border border-son/60 px-4 py-1.5 -rotate-1">
            <Label className="text-giay tracking-[0.2em]">{s("end.kicker")}</Label>
          </span>
          <div className="mt-6">
            <Label className="text-ho-phach tracking-[0.3em]">
              {s("end.title")} {index} / {content.endings.length}
            </Label>
          </div>
          <h1 className="font-tieu-de font-bold text-4xl md:text-5xl text-giay mt-3 uppercase tracking-wide">{ending.title}</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)] gap-6 items-start">
          {/* Bảng kê công tác */}
          <Panel title={s("end.stats_title")}>
            <div className="space-y-3">
              {statRows.map((r) => (
                <div key={r.label} className="border border-vien/70 bg-ban-1 px-3 py-2.5">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-[12px] text-chu-ban-phu">{r.label}</span>
                    <span className={cx("font-nhan font-bold text-[14px]", r.good ? "text-xanh-so-nhat" : "text-son-nhat")}>{r.value}</span>
                  </div>
                  {r.pct !== undefined && (
                    <div className="h-1.5 bg-ban-4 mt-2">
                      <div className={cx("h-full", r.good ? "bg-xanh-so" : "bg-ho-phach")} style={{ width: `${Math.round(r.pct * 100)}%` }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Panel>

          {/* Nhật ký hậu truyện */}
          <div className="space-y-4">
            <Paper tone="giay" className="px-6 py-5">
              <Label className="text-son-dam">{s("end.scenes_title")}</Label>
              <div className="mt-3 space-y-3 text-[14px] leading-relaxed">
                {visibleScenes.map((scene, idx) => (
                  <p key={idx} className={idx === 0 ? "first-letter:font-tieu-de first-letter:text-3xl first-letter:font-bold first-letter:float-left first-letter:mr-1.5 first-letter:leading-none" : undefined}>
                    {fillText(scene.text, vars)}
                  </p>
                ))}
              </div>
            </Paper>

            {visibleFates.length > 0 && (
              <div>
                <Label className="text-chu-ban-phu/70">{s("end.fates_title")}</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                  {visibleFates.map((fate, idx) => {
                    const c = content.characters.find((x) => x.id === fate.character);
                    return (
                      <div key={idx} className="flex gap-3 border border-vien bg-ban-2/80 p-3">
                        {c && (
                          <Portrait
                            charKey={c.portrait.key}
                            expression={c.portrait.expressions[0]}
                            alt={c.name}
                            className="w-16 h-20 shrink-0 border border-ban-4"
                          />
                        )}
                        <div className="min-w-0">
                          <h3 className="font-tieu-de font-bold text-giay">{c?.name ?? fate.character}</h3>
                          <p className="text-[12.5px] leading-relaxed text-chu-ban mt-1">{fillText(fate.text, vars)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Trích dẫn giáo trình */}
        <section className="border border-ho-phach/40 bg-gradient-to-b from-[#3a2f22] to-ban-2 px-6 md:px-10 py-8 shadow-noi">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Label className="text-ho-phach">{s("end.quote_title")}</Label>
            <Label className="border border-ho-phach/40 px-2 py-0.5 text-[10px] text-chu-ban-phu">
              {s("end.chapter_prefix")} {ending.quote.chapter} • {ending.quote.section}
            </Label>
          </div>
          <blockquote className="mt-5 flex gap-4">
            <span className="font-tieu-de text-6xl leading-none text-ho-phach/70 -mt-2" aria-hidden>
              &ldquo;
            </span>
            <p className="font-tieu-de text-xl md:text-2xl leading-snug text-giay">{ending.quote.text}</p>
          </blockquote>

          {ending.closing_question && (
            <div className="mt-6 border border-vien bg-ban/60 px-5 py-4">
              <Label className="text-son-nhat text-[10px]">{s("end.reflection_title")}</Label>
              <p className="text-[14px] italic leading-relaxed text-chu-ban mt-1">{fillText(ending.closing_question, vars)}</p>
            </div>
          )}
        </section>

        <ResultCard data={card} />

        {/* Niên biểu */}
        <section className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-4 border border-vien bg-ban-2/80 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 border border-vien grid place-items-center text-ho-phach" aria-hidden>
              ↗
            </div>
            <h2 className="font-tieu-de font-bold text-lg text-giay uppercase">{s("end.timeline_title")}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {timeline.map((t, i) => (
              <div key={i} className="flex gap-3 border border-vien/70 bg-ban-1 p-3">
                {t.year && <span className="font-nhan font-bold text-ho-phach bg-ban px-2 py-1 h-fit">{t.year}</span>}
                <p className="text-[12.5px] leading-relaxed text-chu-ban">{t.text}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="flex flex-wrap items-center justify-between gap-4 pb-6">
          <p className="text-[11px] text-chu-ban-phu/50 font-nhan">{s("ui.footer")}</p>
          <PrimaryButton onClick={onRestart} className="w-full sm:w-auto sm:min-w-[300px]">
            {s("end.restart")}
          </PrimaryButton>
        </div>
      </div>
    </Screen>
  );
}
