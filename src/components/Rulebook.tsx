import { useEffect, useRef, useState } from "react";
import type { DayId, IssueId } from "../engine/types";
import { activeRules } from "../engine/active";
import { content } from "../content";
import { Label, cx, s } from "./ui";

interface RulebookProps {
  dayId: DayId;
  issuesActive: ReadonlySet<IssueId>;
  className?: string;
  /** Điều cần làm sáng (khi người chơi bấm nhãn điều trên dòng hàng). `tick` đổi mỗi lần bấm để bấm lại cùng điều vẫn chạy. */
  highlight?: { id: string; tick: number } | null;
  /** Có thì hiện nút ẩn sổ ở đầu trang. */
  onHide?: () => void;
}

type Catalog = { ma: string; ten: string }[];

export function Rulebook({ dayId, issuesActive, className, highlight, onHide }: RulebookProps) {
  const articles = useRef(new Map<string, HTMLElement>());
  const [flash, setFlash] = useState<string | null>(null);

  useEffect(() => {
    if (!highlight) return;
    const el = articles.current.get(highlight.id);
    el?.scrollIntoView({ block: "center", behavior: "smooth" });
    setFlash(highlight.id);
    const t = setTimeout(() => setFlash(null), 2200);
    return () => clearTimeout(t);
  }, [highlight]);

  const rules = activeRules(content.rules, dayId, issuesActive);
  const day = content.days.find((d) => d.id === dayId);
  const fresh = new Set<string>(day?.new_rules ?? []);

  return (
    <div className={cx("flex flex-col min-h-0", className)}>
      <div className="flex items-start gap-3 px-1 pb-3">
        <span className="mt-1 w-2 h-8 bg-son shrink-0" />
        <div className="min-w-0">
          <h3 className="font-tieu-de font-bold text-lg tracking-wide text-giay leading-tight">{s("desk.rulebook_title")}</h3>
          <Label className="text-chu-ban-phu/60 text-[10px]">{s("rulebook.subtitle")}</Label>
        </div>
        {day && <Label className="ml-auto border border-son/70 text-son-nhat px-2 py-0.5 text-[10px] whitespace-nowrap">{day.game_date}</Label>}
        {onHide && (
          <button
            type="button"
            onClick={onHide}
            title={`${s("rulebook.hide")} (${s("rulebook.shortcut")})`}
            aria-label={s("rulebook.hide")}
            className="w-7 h-7 grid place-items-center border border-vien text-chu-ban-phu hover:bg-ban-3 hover:text-giay shrink-0"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M9 6l6 6-6 6" />
            </svg>
          </button>
        )}
      </div>

      <div className="giay-ke-dong flex-1 min-h-0 overflow-y-auto thanh-cuon shadow-giay border border-giay-vien text-muc">
        <div className="pl-10 pr-4 py-4 space-y-5 text-[12px] leading-[26px]">
          {rules.length === 0 && <p className="italic text-muc-nhat">{s("rulebook.empty")}</p>}

          {rules.map((rule) => {
            const params = rule.params as { danh_muc_thuoc?: Catalog; danh_muc?: Catalog };
            const isNew = fresh.has(rule.id);
            const catalog =
              rule.id === "R3-DON-THUOC" && Array.isArray(params.danh_muc_thuoc)
                ? { title: s("rulebook.catalog_medicine"), items: params.danh_muc_thuoc, tone: "border-muc-xanh text-muc-xanh" }
                : rule.id === "R6-HANG-CAM" && Array.isArray(params.danh_muc)
                  ? { title: s("rulebook.catalog_prohibited"), items: params.danh_muc, tone: "border-son text-son" }
                  : null;

            return (
              <article
                key={rule.id}
                ref={(el) => {
                  if (el) articles.current.set(rule.id, el);
                  else articles.current.delete(rule.id);
                }}
                className={cx(
                  "relative -mx-2 px-2 transition-[background-color,box-shadow] duration-500",
                  isNew && "animate-truot-vao",
                  flash === rule.id && "bg-ho-phach/30 shadow-[0_0_0_2px_rgba(217,164,65,0.9)]",
                )}
              >
                <h4 className="font-tieu-de font-bold text-[14px] text-son-dam leading-snug border-b border-muc/60 pb-0.5 mb-1 flex items-baseline gap-2">
                  <span>
                    {rule.article}: {rule.title}
                  </span>
                  {isNew && (
                    <span className="ml-auto font-nhan text-[9px] uppercase tracking-widest bg-son text-giay px-1.5 leading-4 -rotate-3 shrink-0">
                      {s("rulebook.new_badge")}
                    </span>
                  )}
                </h4>
                <p className="font-nhan text-[10px] uppercase tracking-wider text-muc-xanh leading-5 mb-1">
                  {s("rulebook.applies_to")}: <span className="normal-case tracking-normal font-may-chu text-[11px]">{rule.scope_note ?? rule.applies_to.join(", ")}</span>
                </p>
                <p className="whitespace-pre-line">{rule.page_text}</p>

                {catalog && (
                  <div className={cx("mt-2 border-l-4 pl-3 bg-giay/60", catalog.tone)}>
                    <div className="font-nhan font-bold text-[10px] uppercase tracking-wider">{catalog.title}</div>
                    <ul className="text-muc">
                      {catalog.items.map((item) => (
                        <li key={item.ma} className="flex justify-between gap-2 border-b border-dotted border-muc/25 leading-6">
                          <span>{item.ten}</span>
                          <span className="font-nhan text-[10px] text-muc-nhat">{item.ma}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </article>
            );
          })}

          <p className="pt-2 text-[10px] italic text-muc-nhat border-t border-dashed border-muc/40">{s("rulebook.footer")}</p>
        </div>
      </div>
    </div>
  );
}
