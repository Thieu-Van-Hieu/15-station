import type { Day, GameState } from "../engine/types";
import { formatClock } from "../engine/day-end";
import { content } from "../content";

interface TopBarProps {
  state: GameState;
  day: Day;
  currentTravelerOrder: number;
  totalTravelersInDay: number;
}

export function TopBar({ state, day, currentTravelerOrder, totalTravelersInDay }: TopBarProps) {
  return (
    <header className="bg-nau text-giay border-b-2 border-nau/80 px-4 py-2 flex flex-wrap items-center justify-between text-xs font-mono shadow-md">
      <div className="flex items-center space-x-4">
        <span className="font-bold text-sm text-giay tracking-wide">{day.label}</span>
        <span className="text-giay/80">({day.game_date})</span>
      </div>

      <div className="flex items-center space-x-6">
        <div>
          <span className="text-giay/70 mr-1">{content.strings["desk.clock"]}:</span>
          <span className="font-bold text-giay">{formatClock(state.clockMin)}</span>
        </div>

        <div>
          <span className="font-bold text-giay">
            {currentTravelerOrder} / {totalTravelersInDay}
          </span>
        </div>

        <div className="bg-giay text-muc px-2.5 py-0.5 rounded font-bold border border-nau">
          <span>{state.money}</span>
        </div>
      </div>
    </header>
  );
}
