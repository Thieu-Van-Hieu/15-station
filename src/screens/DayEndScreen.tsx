import { useEffect, type ReactNode } from "react";
import type { Day, DayReport, Indicators } from "../engine/types";
import { formatClock } from "../engine/day-end";
import { content } from "../content";
import { playSfx } from "../audio";
import { AppHeader, Label, Panel, Paper, PaperClip, PrimaryButton, Screen, TypeRule, cx, s } from "../components/ui";

interface DayEndScreenProps {
  day: Day;
  dayReport: DayReport;
  indicatorsStart: Indicators;
  indicatorsEnd: Indicators;
  onContinue: () => void;
}

const GRADE_KEY = { XUAT_SAC: "grade.xuat_sac", KHA: "grade.kha", TRUNG_BINH: "grade.trung_binh" } as const;

export function DayEndScreen({ day, dayReport, indicatorsStart, indicatorsEnd, onContinue }: DayEndScreenProps) {
  const food0 = indicatorsStart.luong_thuc_vao_thi_xa;
  const percentDeltaFood = food0 === 0 ? 0 : Math.round(((indicatorsEnd.luong_thuc_vao_thi_xa - food0) / food0) * 100);
  const foodChangeText = percentDeltaFood >= 0 ? `+${percentDeltaFood}%` : `${percentDeltaFood}%`;
  const hungerUp = indicatorsEnd.ho_thieu_an > indicatorsStart.ho_thieu_an;
  const priceUp = indicatorsEnd.gia_gao_index > indicatorsStart.gia_gao_index;
  const ratePct = Math.round(dayReport.rate * 100);
  const endLine = day.interludes?.find((i) => i.at === "end")?.lines[0];
  const endSpeaker = endLine && content.characters.find((c) => c.id === endLine.speaker);

  useEffect(() => {
    playSfx("typewriter");
    const t = setTimeout(() => playSfx("stamp"), 900);
    return () => clearTimeout(t);
  }, [day.id]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Enter" && onContinue();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onContinue]);

  return (
    <Screen
      header={
        <AppHeader
          center={<Label className="text-ho-phach">{day.label}</Label>}
          right={
            <Label className={cx("hidden md:inline", dayReport.overtime ? "text-son-nhat" : "text-xanh-so-nhat")}>
              {formatClock(dayReport.clockEnd)} • {dayReport.overtime ? s("board.overtime") : s("board.shift_end")}
            </Label>
          }
        />
      }
      className="px-4 md:px-6 py-6"
    >
      <div className="w-full max-w-6xl mx-auto space-y-6">
        {/* Tiêu đề hồ sơ */}
        <div className="flex flex-wrap items-center gap-4 border border-vien bg-ban-2/80 px-5 py-4 shadow-bia">
          <div className="w-11 h-11 bg-son grid place-items-center shrink-0">
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-giay" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <rect x="4" y="4" width="16" height="16" />
              <path d="M8 12l3 3 5-6" />
            </svg>
          </div>
          <div className="min-w-0">
            <Label className="text-chu-ban-phu/60 text-[10px]">{s("board.header_kicker")}</Label>
            <h1 className="font-tieu-de font-bold text-xl md:text-2xl text-giay">
              {s("board.header_title")} — {day.game_date}
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Báo cáo gửi cấp trên */}
          <Paper tone="giay" tilt={-0.4} className="px-6 py-6">
            <PaperClip className="-top-5 left-8" />
            <div className="text-center">
              <h2 className="font-tieu-de font-bold text-lg tracking-wide uppercase">{s("board.left.title")}</h2>
              <p className="text-[11px] italic text-muc-nhat">{day.label}</p>
            </div>
            <TypeRule className="my-4" />

            <div className="space-y-1">
              <Row label={s("board.left.compliance")} value={`${ratePct}%`} tone={ratePct >= 90 ? "text-xanh-so-dam" : ratePct >= 70 ? "text-muc" : "text-son"} big />
              <Row label={s("board.left.rejections")} value={`${dayReport.heldCount} ${s("board.unit_case")}`} />
              <Row label={s("board.left.confiscated")} value={`${dayReport.seizedKg} ${s("board.unit_kg")}`} />
              <Row
                label={s("board.left.reports")}
                value={`${dayReport.validReports} ${s("board.unit_report")}`}
                tone={dayReport.validReports > 0 ? "text-muc-xanh" : undefined}
              />
            </div>

            <div className="relative mt-6 pt-4 border-t border-dashed border-muc/40 min-h-28">
              <Label className="text-muc-nhat text-[10px]">{s("board.left.rating")}</Label>
              {endLine && (
                <p className="mt-2 pr-36 text-[12.5px] italic leading-relaxed">
                  &ldquo;{endLine.text}&rdquo;
                  <span className="block not-italic text-[11px] text-muc-nhat mt-1">— {endSpeaker?.name ?? endLine.speaker}</span>
                </p>
              )}
              <div
                className={cx(
                  "absolute right-2 top-6 border-4 border-double px-3 py-1.5 font-tieu-de font-bold text-xl uppercase tracking-wider mix-blend-multiply animate-dong-dau",
                  dayReport.grade === "XUAT_SAC" ? "border-son text-son" : dayReport.grade === "KHA" ? "border-muc-xanh text-muc-xanh" : "border-muc-nhat text-muc-nhat",
                )}
                style={{ ["--xoay" as string]: "-8deg", transform: "rotate(-8deg)", animationDelay: "400ms", animationFillMode: "backwards" }}
              >
                {s(GRADE_KEY[dayReport.grade])}
              </div>
            </div>
          </Paper>

          {/* Tình hình huyện */}
          <Paper tone="than" tilt={0.4} className="px-6 py-6">
            <div className="flex justify-between items-start gap-2">
              <Label className="bg-muc/10 px-1.5 text-[10px] text-muc-nhat">{s("board.right.simulated")}</Label>
            </div>
            <div className="text-center mt-2">
              <h2 className="font-tieu-de font-bold text-lg tracking-wide uppercase">{s("board.right.title")}</h2>
            </div>
            <TypeRule className="my-4" />

            <div className="space-y-2">
              <Metric
                label={s("board.right.food_inflow")}
                value={foodChangeText}
                dir={Math.sign(percentDeltaFood)}
                bad={percentDeltaFood < 0}
              />
              <Metric
                label={s("board.right.hunger_cases")}
                value={
                  <>
                    <span className="line-through opacity-50 mr-1.5">{indicatorsStart.ho_thieu_an}</span>→ {indicatorsEnd.ho_thieu_an} {s("board.unit_household")}
                  </>
                }
                dir={Math.sign(indicatorsEnd.ho_thieu_an - indicatorsStart.ho_thieu_an)}
                bad={hungerUp}
              />
              <Metric
                label={s("board.right.rice_price")}
                value={
                  <>
                    <span className="line-through opacity-50 mr-1.5">{indicatorsStart.gia_gao_index}</span>→ {indicatorsEnd.gia_gao_index}
                  </>
                }
                dir={Math.sign(indicatorsEnd.gia_gao_index - indicatorsStart.gia_gao_index)}
                bad={priceUp}
              />
            </div>

            <div className="mt-5 border border-ho-phach/50 bg-ho-phach/15 px-4 py-3">
              <Label className="text-son-dam text-[10px]">{s("board.right.other_factors")}</Label>
              <p className="text-[12.5px] italic leading-relaxed mt-1">{day.other_factor.text}</p>
            </div>
          </Paper>
        </div>

        {/* Nhật ký ca trực */}
        <Panel title={s("board.notes_title")}>
          {dayReport.notes.length === 0 ? (
            <p className="text-[12.5px] italic text-chu-ban-phu/60">{s("board.no_notes")}</p>
          ) : (
            <ol className="space-y-1.5 text-[12.5px] leading-relaxed text-chu-ban list-none">
              {dayReport.notes.map((n, i) => (
                <li key={i} className="flex gap-3">
                  <span className="font-nhan text-ho-phach/80 shrink-0">{String(i + 1).padStart(2, "0")}</span>
                  <span>{n}</span>
                </li>
              ))}
            </ol>
          )}
        </Panel>

        <div className="flex justify-end pb-6">
          <PrimaryButton onClick={onContinue} hint="ENTER" className="w-full sm:w-auto sm:min-w-[380px]">
            {s("board.go_budget")}
          </PrimaryButton>
        </div>
      </div>
    </Screen>
  );
}

function Row({ label, value, tone, big }: { label: string; value: string; tone?: string; big?: boolean }) {
  return (
    <div className="flex items-baseline gap-3 py-2 border-b border-muc/15">
      <span className="text-[13px]">{label}:</span>
      <span className="flex-1 border-b border-dotted border-muc/30" />
      <span className={cx("font-nhan font-bold", big ? "text-2xl" : "text-[15px]", tone)}>{value}</span>
    </div>
  );
}

function Metric({ label, value, dir, bad }: { label: string; value: ReactNode; dir: number; bad: boolean }) {
  const good = dir !== 0 && !bad;
  const tone = bad ? "text-son" : good ? "text-xanh-so-dam" : "text-muc-nhat";
  return (
    <div className={cx("flex items-center gap-3 px-3 py-2.5 border-l-4", bad ? "border-son bg-son/10" : good ? "border-xanh-so bg-xanh-so/10" : "border-ke bg-muc/5")}>
      <span className={cx("font-nhan text-lg w-4 text-center", tone)} aria-hidden>
        {dir > 0 ? "▲" : dir < 0 ? "▼" : "•"}
      </span>
      <span className="text-[13px] flex-1">{label}</span>
      <span className={cx("font-nhan font-bold text-[15px] whitespace-nowrap", bad || good ? tone : "text-muc")}>{value}</span>
    </div>
  );
}
