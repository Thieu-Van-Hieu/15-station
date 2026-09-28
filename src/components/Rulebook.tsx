import { useState } from "react";
import type { DayId, IssueId } from "../engine/types";
import { activeRules } from "../engine/active";
import { content } from "../content";

interface RulebookProps {
  dayId: DayId;
  issuesActive: ReadonlySet<IssueId>;
}

export function Rulebook({ dayId, issuesActive }: RulebookProps) {
  const [collapsed, setCollapsed] = useState(false);
  const rules = activeRules(content.rules, dayId, issuesActive);

  return (
    <div
      className={`border-2 border-nau bg-giay text-muc shadow-lg transition-all duration-300 ${
        collapsed ? "w-12 overflow-hidden" : "w-80 md:w-96"
      }`}
    >
      <div
        onClick={() => setCollapsed(!collapsed)}
        className="bg-nau text-giay px-3 py-2 flex items-center justify-between cursor-pointer select-none font-bold text-sm tracking-wider"
      >
        <span className="truncate">{content.strings["desk.rulebook_title"]}</span>
        <button type="button" className="text-xs px-1 hover:text-dau-do">
          {collapsed ? "+" : "—"}
        </button>
      </div>

      {!collapsed && (
        <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto text-xs leading-relaxed">
          {rules.map((rule) => (
            <div key={rule.id} className="border-b border-nau/30 pb-3">
              <h4 className="font-bold text-sm text-dau-do mb-1">
                {rule.article}: {rule.title}
              </h4>
              <p className="italic text-muc/90 whitespace-pre-line">{rule.page_text}</p>

              {rule.id === "R3-DON-THUOC" && Array.isArray((rule.params as any)?.danh_muc_thuoc) && (
                <div className="mt-2 pl-2 border-l-2 border-nau/40 space-y-0.5">
                  <div className="font-semibold text-[11px] text-nau">
                    {content.strings["rulebook.catalog_medicine"]}
                  </div>
                  <ul className="list-disc list-inside">
                    {((rule.params as any).danh_muc_thuoc as { ma: string; ten: string }[]).map((item) => (
                      <li key={item.ma}>
                        {item.ten} ({item.ma})
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {rule.id === "R6-HANG-CAM" && Array.isArray((rule.params as any)?.danh_muc) && (
                <div className="mt-2 pl-2 border-l-2 border-dau-do/60 space-y-0.5">
                  <div className="font-semibold text-[11px] text-dau-do">
                    {content.strings["rulebook.catalog_prohibited"]}
                  </div>
                  <ul className="list-disc list-inside">
                    {((rule.params as any).danh_muc as { ma: string; ten: string }[]).map((item) => (
                      <li key={item.ma}>
                        {item.ten} ({item.ma})
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
