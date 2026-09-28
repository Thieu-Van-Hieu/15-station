import { useEffect } from "react";
import type { Day } from "../engine/types";
import { content } from "../content";
import { FATIGUE_MIN_PER_POINT, familyLevel } from "../engine/economy";
import { playSfx, setLoop } from "../audio";
import { AppHeader, Label, Paper, Portrait, PrimaryButton, Screen, s } from "../components/ui";

interface DayStartScreenProps {
  day: Day;
  hardship: number;
  fatigue: number;
  onStart: () => void;
}

/** Màn chuyển cảnh đầu ngày: thẻ lịch sử phát qua đài bán dẫn, rồi trạm trưởng giao ban. */
export function DayStartScreen({ day, hardship, fatigue, onStart }: DayStartScreenProps) {
  const briefing = day.interludes?.find((i) => i.at === "start");
  const year = day.game_date.slice(0, 4);
  const dial = ((Number(year) - 1979) / 8) * 80 + 10;

  useEffect(() => {
    setLoop(null);
    playSfx("radio_tune");
  }, [day.id]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Enter" && onStart();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onStart]);

  return (
    <Screen
      header={
        <AppHeader
          center={<Label className="text-ho-phach">{day.label}</Label>}
          right={<Label className="text-chu-ban-phu/50 hidden md:inline">{s("ui.period")}</Label>}
        />
      }
      className="items-center px-4 py-10"
    >
      <div className="w-full max-w-2xl">
        <div className="text-center mb-6">
          <Label className="text-son-nhat tracking-[0.3em]">{s("desk.transition_title")}</Label>
          <h1 className="font-tieu-de font-bold text-4xl text-giay mt-2">{day.label}</h1>
          <p className="font-nhan text-chu-ban-phu/60 text-sm mt-1">{day.game_date}</p>
        </div>

        {/* Mặt đài VEF-206 */}
        <div className="border border-vien bg-ban-2 shadow-noi">
          <div className="flex items-center justify-between px-4 py-2 border-b border-vien">
            <Label className="text-chu-ban-phu">{s("start.radio_title")}</Label>
            <Label className="text-chu-ban-phu/50 text-[10px]">{s("start.radio_band")}</Label>
          </div>
          <div className="relative h-14 mx-4 my-3 bg-[#0c1a12] border border-black overflow-hidden">
            <div className="absolute inset-x-3 top-3 flex justify-between font-nhan text-[9px] text-xanh-so-nhat/60">
              {["1979", "1981", "1983", "1985", "1987"].map((y) => (
                <span key={y}>{y}</span>
              ))}
            </div>
            <div className="absolute inset-x-3 top-7 h-px bg-xanh-so-nhat/30" />
            <div className="absolute top-6 bottom-2 w-[2px] bg-son shadow-[0_0_6px_#c0392b] transition-all duration-700" style={{ left: `${dial}%` }} />
            <div className="absolute left-3 bottom-1.5 font-nhan text-[9px] text-xanh-so-nhat/70 animate-nhap-nhay">
              ◉ {s("start.radio_station")}
            </div>
          </div>

          {day.transition_card && (
            <Paper tone="giay" className="mx-3 mb-3 px-5 py-4 animate-truot-vao">
              <div className="space-y-2.5 text-[13.5px] leading-relaxed">
                {day.transition_card.lines.map((line, idx) => (
                  <p key={idx} className={idx === 0 ? "font-tieu-de font-bold text-[15px]" : undefined}>
                    {line}
                  </p>
                ))}
              </div>
            </Paper>
          )}
        </div>

        {/* Chuyện nhà: hậu quả của những đêm không đủ tiền chi tiêu */}
        {(familyLevel(hardship) > 0 || fatigue > 0) && (
          <div className="mt-6 border-l-4 border-son bg-son/10 px-4 py-3 animate-truot-vao space-y-2">
            <Label className="text-son-nhat">{s("family.title")}</Label>
            {familyLevel(hardship) > 0 && <p className="text-[13px] leading-relaxed italic">{s(`family.level_${familyLevel(hardship)}`)}</p>}
            {fatigue > 0 && (
              <p className="text-[12.5px] leading-relaxed text-chu-ban-phu">
                {s("start.fatigue")} <b className="font-nhan text-son-nhat">+{fatigue * FATIGUE_MIN_PER_POINT}</b> {s("start.fatigue_unit")}.
              </p>
            )}
          </div>
        )}

        {/* Giao ban */}
        {briefing && briefing.lines.length > 0 && (
          <div className="mt-6 border border-vien bg-ban-1 p-4 animate-truot-vao" style={{ animationDelay: "250ms", animationFillMode: "backwards" }}>
            <Label className="text-ho-phach">{s("start.briefing")}</Label>
            <div className="mt-3 space-y-3">
              {briefing.lines.map((line, idx) => {
                const c = content.characters.find((x) => x.id === line.speaker);
                return (
                  <div key={idx} className="flex gap-3">
                    {c && (
                      <Portrait
                        charKey={c.portrait.key}
                        expression={c.portrait.expressions[0]}
                        alt={c.name}
                        className="w-12 h-14 shrink-0 border border-vien"
                      />
                    )}
                    <div className="min-w-0">
                      <Label className="text-son-nhat text-[10px]">{c?.name ?? line.speaker}</Label>
                      <p className="text-[13px] leading-relaxed text-chu-ban">{line.text}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <PrimaryButton onClick={onStart} hint="ENTER" className="w-full mt-8">
          {s("desk.start_day")}
        </PrimaryButton>
      </div>
    </Screen>
  );
}
