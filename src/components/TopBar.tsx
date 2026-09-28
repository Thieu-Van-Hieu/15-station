import type { Day, GameState } from "../engine/types";
import { formatClock } from "../engine/day-end";
import { AppHeader, Chip, Label, s } from "./ui";

interface TopBarProps {
  state: GameState;
  day: Day;
  currentTravelerOrder: number;
  totalTravelersInDay: number;
}

export function TopBar({ state, day, currentTravelerOrder, totalTravelersInDay }: TopBarProps) {
  const late = state.clockMin > toMin(day.clock.end);
  return (
    <AppHeader
      center={
        <div className="flex flex-wrap items-center justify-center gap-2">
          <div className="border border-vien bg-ban-1 px-3 py-1 leading-tight text-center">
            <Label className="block text-ho-phach text-[10px]">{day.label}</Label>
            <span className="font-nhan text-[11px] text-chu-ban-phu/70">{day.game_date}</span>
          </div>
          <Chip label={s("desk.clock")} value={formatClock(state.clockMin)} tone={late ? "son" : "xanh"} />
          <Chip label={s("ui.traveler_count")} value={`${String(currentTravelerOrder).padStart(2, "0")} / ${String(totalTravelersInDay).padStart(2, "0")}`} />
        </div>
      }
      right={
        <div className="hidden md:flex items-center gap-3">
          <div className="text-right leading-tight">
            <Label className="block text-chu-ban-phu/50 text-[9px]">{s("ui.officer_label")}</Label>
            <span className="text-[12px] text-giay">{s("ui.officer_name")}</span>
          </div>
          <Chip label={s("ui.money")} value={`${state.money} ${s("ui.money_unit")}`} tone="ho-phach" />
        </div>
      }
    />
  );
}

function toMin(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}
