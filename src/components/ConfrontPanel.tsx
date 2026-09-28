/**
 * Màn so hai chỗ đã khoanh (V8): đưa hai chỗ lên cạnh nhau, đóng chữ LỆCH / KHỚP,
 * và lời người trước ô cửa. Đối chất không đổi đáp án; đối chất nhầm tốn thời gian ca.
 */
import type { ConfrontResult } from "../engine/confront";
import type { Line } from "../engine/types";
import { content } from "../content";
import { Label, Paper, cx, s } from "./ui";

export interface ConfrontView {
  a: { label: string; value: string };
  b: { label: string; value: string };
  result: ConfrontResult;
  lines: Line[];
  cost: number;
}

function speaker(id: string): string | null {
  if (id === "narrator") return null;
  return content.characters.find((c) => c.id === id)?.name ?? id;
}

export function ConfrontPanel({ view, onClose }: { view: ConfrontView; onClose: () => void }) {
  const { result } = view;
  const verdict = !result.comparable ? s("confront.incomparable") : result.found ? s("confront.found") : s("confront.match");
  const fallback = !result.comparable
    ? s("confront.generic_incomparable")
    : result.found
      ? s("confront.generic_found")
      : s("confront.generic_khop");
  return (
    <Paper tone="giay" raised className="w-full max-w-xl p-5 animate-truot-vao" tilt={-0.4}>
      <div className="flex items-center justify-between">
        <Label className="text-son-dam">{s("confront.title")}</Label>
        <button type="button" onClick={onClose} className="border border-ke px-3 py-1 font-nhan text-[11px] uppercase tracking-wider hover:bg-bia">
          {s("confront.close")}
        </button>
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 mt-4">
        {[view.a, view.b].map((x, i) => (
          <div key={i} className={cx("border-2 px-3 py-2 min-w-0", result.found ? "border-son bg-son/5" : "border-ke")} style={{ order: i === 0 ? 0 : 2 }}>
            <div className="font-nhan text-[9px] uppercase tracking-wider text-muc-nhat truncate">{x.label}</div>
            <div className="font-bold text-[14px] break-words">{x.value}</div>
          </div>
        ))}
        <div
          className={cx(
            "order-1 border-4 border-double px-2 py-1 font-nhan font-bold text-[12px] uppercase tracking-widest -rotate-6 animate-dong-dau",
            result.found ? "border-son text-son" : "border-muc-nhat text-muc-nhat",
          )}
          style={{ ["--xoay" as string]: "-6deg" }}
        >
          {verdict}
        </div>
      </div>
      <div className="mt-4 space-y-1.5 text-[13px] leading-relaxed">
        {(view.lines.length > 0 ? view.lines : [{ speaker: "narrator", text: fallback }]).map((l, i) => {
          const who = speaker(l.speaker);
          return (
            <p key={i} className={cx(!who && "italic text-muc-nhat")}>
              {who && <span className="font-nhan font-bold text-[10px] uppercase tracking-wider text-son-dam mr-1.5">{who}:</span>}
              {l.text}
            </p>
          );
        })}
      </div>
      {view.cost > 0 && (
        <p className="mt-3 font-nhan text-[10px] uppercase tracking-wider text-son-dam">
          {s("confront.cost")} +{view.cost} {s("start.fatigue_unit")}
        </p>
      )}
    </Paper>
  );
}
