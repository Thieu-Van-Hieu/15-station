import { content } from "../content";
import type { EndingId } from "../engine/types";
import { Label, Modal, Paper, TypeRule, s } from "./ui";

interface CheatPanelProps {
  onPickEnding: (id: EndingId) => void;
  onPickDay: (dayIndex: number) => void;
  onClose: () => void;
}

/** Bảng mở bằng cheat code "Mr.NoBody": xem nhanh kết cục hoặc nhảy tới đầu một ngày. */
export function CheatPanel({ onPickEnding, onPickDay, onClose }: CheatPanelProps) {
  const endings = [...content.endings].sort((a, b) => a.priority - b.priority);
  return (
    <Modal onClose={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-2xl">
        <Paper tone="giay" raised className="p-6 animate-truot-vao">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-tieu-de font-bold text-xl text-son">{s("cheat.title")}</h2>
              <p className="text-[12px] italic text-muc-nhat mt-1">{s("cheat.note")}</p>
            </div>
            <button type="button" onClick={onClose} className="border border-ke px-3 py-1 font-nhan text-[11px] uppercase tracking-wider hover:bg-bia">
              {s("cheat.close")}
            </button>
          </div>
          <TypeRule className="my-4" />

          <Label className="text-muc-nhat">{s("cheat.endings")}</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
            {endings.map((e, i) => (
              <button
                type="button"
                key={e.id}
                onClick={() => onPickEnding(e.id)}
                className="text-left border border-ke bg-bia/50 hover:bg-bia px-3 py-2.5 transition-colors"
              >
                <span className="font-nhan text-[10px] text-son-dam">
                  {i + 1}. {e.id}
                </span>
                <span className="block font-tieu-de font-bold text-[15px]">{e.title}</span>
                <span className="block text-[11px] text-muc-nhat">{s(`cheat.how.${e.id.toLowerCase().replace(/-/g, "_")}`)}</span>
              </button>
            ))}
          </div>

          <div className="mt-5 flex items-baseline justify-between">
            <Label className="text-muc-nhat">{s("cheat.days")}</Label>
            <span className="text-[11px] italic text-muc-nhat">{s("cheat.days_note")}</span>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-2">
            {content.days.map((d, i) => (
              <button
                type="button"
                key={d.id}
                onClick={() => onPickDay(i)}
                title={d.label}
                className="border border-ke bg-giay-than hover:bg-bia px-2 py-2 font-nhan text-[11px] uppercase tracking-wider"
              >
                {d.id} · {d.game_date.slice(0, 4)}
              </button>
            ))}
          </div>
        </Paper>
      </div>
    </Modal>
  );
}
