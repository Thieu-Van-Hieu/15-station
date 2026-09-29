import { useEffect, useRef, useState } from "react";
import type { Day, GameState } from "../engine/types";
import { formatClock } from "../engine/day-end";
import { AppHeader, Chip, Label, cx, s } from "./ui";

interface TopBarProps {
  state: GameState;
  day: Day;
  currentTravelerOrder: number;
  totalTravelersInDay: number;
  /** Giờ hiển thị, mặc định là `state.clockMin`. Bàn làm việc cộng trước 60 phút khi người chơi kèm biên bản (V6). */
  clockMin?: number;
  isHostMode?: boolean;
  hostRoom?: string;
  onToggleHostMode?: () => void;
}

export function TopBar({
  state,
  day,
  currentTravelerOrder,
  totalTravelersInDay,
  clockMin,
  isHostMode,
  hostRoom,
  onToggleHostMode,
}: TopBarProps) {
  const target = clockMin ?? state.clockMin;
  const { shown, jumping } = useTweenedClock(target);
  const late = shown > toMin(day.clock.end);
  return (
    <AppHeader
      center={
        <div className="flex flex-wrap items-center justify-center gap-2 max-sm:flex-nowrap max-sm:gap-1.5 max-sm:w-full">
          <div className="border border-vien bg-ban-1 px-3 py-1 leading-tight text-center max-sm:px-2 max-sm:py-0.5 max-sm:flex-1 max-sm:min-w-0 max-sm:text-left">
            <Label className="block text-ho-phach text-[10px] max-sm:text-[9px] max-sm:truncate">{day.label}</Label>
            <span className="font-nhan text-[11px] text-chu-ban-phu/70 max-sm:text-[10px]">{day.game_date}</span>
          </div>
          <div className={cx("transition-transform duration-300", jumping && "scale-110")}>
            <Chip
              label={s("desk.clock")}
              value={<span className={cx(jumping && "text-son-nhat")}>{formatClock(shown)}</span>}
              tone={late ? "son" : "xanh"}
            />
          </div>
          <Chip label={s("ui.traveler_count")} value={`${String(currentTravelerOrder).padStart(2, "0")} / ${String(totalTravelersInDay).padStart(2, "0")}`} />
        </div>
      }
      right={
        <div className="hidden md:flex items-center gap-3">
          {onToggleHostMode && (
            <button
              type="button"
              onClick={onToggleHostMode}
              className={cx(
                "px-2 py-1 border text-[10px] font-mono font-bold tracking-wider rounded transition flex items-center gap-1.5",
                isHostMode
                  ? "bg-amber-500/20 border-amber-500 text-amber-300"
                  : "bg-ban-1/60 border-vien/60 text-chu-ban-phu/70 hover:text-giay"
              )}
              title={s("host.mode_label")}
            >
              <span className={cx("w-2 h-2 rounded-full", isHostMode ? "bg-amber-400 animate-pulse" : "bg-slate-500")} />
              <span>{isHostMode ? `${s("host.mode_on")} (${hostRoom ?? "T15"})` : s("host.mode_off")}</span>
            </button>
          )}
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

/** Kim đồng hồ chạy dần tới giờ mới thay vì nhảy bụp, để người chơi thấy thời gian vừa mất. */
function useTweenedClock(target: number): { shown: number; jumping: boolean } {
  const [shown, setShown] = useState(target);
  const [jumping, setJumping] = useState(false);
  const from = useRef(target);

  useEffect(() => {
    const start = from.current;
    if (start === target) return;
    // Sang ngày mới (giờ lùi lại) thì đặt luôn.
    if (target < start) {
      from.current = target;
      setShown(target);
      return;
    }
    setJumping(target - start >= 30);
    const t0 = performance.now();
    const dur = Math.min(900, 250 + (target - start) * 6);
    let raf = 0;
    const step = (now: number) => {
      const k = Math.min(1, (now - t0) / dur);
      const v = Math.round(start + (target - start) * (1 - Math.pow(1 - k, 3)));
      setShown(v);
      if (k < 1) raf = requestAnimationFrame(step);
      else {
        from.current = target;
        setTimeout(() => setJumping(false), 350);
      }
    };
    raf = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(raf);
      from.current = target;
    };
  }, [target]);

  return { shown, jumping };
}

function toMin(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}
