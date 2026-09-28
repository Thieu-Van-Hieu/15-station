import { useState, useEffect } from "react";
import { content } from "./content";
import { newGame, reduce, type GameAction } from "./engine/game";
import { simulate, followRulebook } from "./engine/simulate";
import { currentDay, currentTraveler } from "./engine/state";
import { reprimandText } from "./engine/turn";
import type { Action, GameState, TravelerId } from "./engine/types";
import { DeskScreen } from "./screens/DeskScreen";
import { DayEndScreen } from "./screens/DayEndScreen";
import { BudgetScreen } from "./screens/BudgetScreen";
import { EndingScreen } from "./screens/EndingScreen";
import { IntroScreen } from "./screens/IntroScreen";

const STORAGE_KEY = "tram15_state";

function getInitialState(): GameState {
  if (typeof window !== "undefined") {
    // UI-09: Chế độ nhảy lượt ?tu=dX-tY
    try {
      const params = new URLSearchParams(window.location.search);
      const tu = params.get("tu");
      if (tu) {
        return simulate(content, followRulebook, { stopAt: tu as TravelerId });
      }
    } catch {
      // Bỏ qua lỗi URL params
    }

    // UI-10, UI-11: Đọc từ localStorage, bảo vệ khi hỏng hoặc bị chặn
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.phase === "string" && typeof parsed.dayIndex === "number") {
          return parsed as GameState;
        }
      }
    } catch {
      // Dữ liệu hỏng hoặc bị chặn, fallback an toàn sang ván mới
    }
  }

  return newGame(content);
}

export default function App() {
  const [state, setState] = useState<GameState>(getInitialState);

  // Lưu tiến trình vào localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Bỏ qua lỗi ghi localStorage
    }
  }, [state]);

  function dispatch(action: GameAction) {
    setState((prev: GameState) => reduce(prev, action, content));
  }

  function handleRestart() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Bỏ qua
    }
    setState(newGame(content));
  }

  // 1. Màn chú thích mở đầu
  if (state.phase === "INTRO") {
    return <IntroScreen onStart={() => dispatch({ type: "BAT_DAU_GAME" })} />;
  }

  // 2. Màn đầu ngày (thẻ chuyển cảnh hoặc đài truyền thanh đầu ngày)
  if (state.phase === "DAY_START") {
    const day = currentDay(state, content);
    const startInterlude = day.interludes?.find((i) => i.at === "start");

    return (
      <div className="min-h-screen bg-xi-mang text-muc font-may-chu p-6 flex flex-col items-center justify-center">
        <div className="max-w-xl w-full border-4 border-nau bg-giay p-8 rounded shadow-2xl space-y-6 text-center">
          <header className="border-b-2 border-nau/40 pb-3">
            <span className="text-xs uppercase font-bold text-dau-do tracking-widest">
              {content.strings["desk.transition_title"]}
            </span>
            <h2 className="text-2xl font-bold text-muc mt-1 uppercase tracking-wide">{day.label}</h2>
            <p className="text-xs text-neutral-600 font-mono mt-0.5">{day.game_date}</p>
          </header>

          {day.transition_card && (
            <div className="space-y-3 text-xs leading-relaxed text-justify italic bg-nau/10 p-4 border-l-4 border-nau rounded">
              {day.transition_card.lines.map((line, idx) => (
                <p key={idx}>{line}</p>
              ))}
            </div>
          )}

          {startInterlude && (
            <div className="space-y-2 text-xs leading-relaxed text-left bg-neutral-800 text-giay p-4 rounded border-2 border-neutral-700">
              {startInterlude.lines.map((line, idx) => (
                <p key={idx}>
                  <span className="text-dau-do font-bold mr-2">[{line.speaker}]:</span>
                  <span>{line.text}</span>
                </p>
              ))}
            </div>
          )}

          <div className="pt-2">
            <button
              type="button"
              onClick={() => dispatch({ type: "BAT_DAU_NGAY" })}
              className="w-full py-3 bg-nau hover:bg-nau/90 text-giay font-bold text-sm tracking-widest uppercase rounded shadow-lg border-2 border-giay transition-colors active:scale-95"
            >
              {content.strings["desk.start_day"]} →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Màn làm việc (Desk)
  if (state.phase === "TRAVELER") {
    const day = currentDay(state, content);
    const traveler = currentTraveler(state, content);
    const lastReprimandText = state.pendingReprimand
      ? reprimandText(state.pendingReprimand, content)
      : null;

    return (
      <DeskScreen
        state={state}
        day={day}
        traveler={traveler}
        currentTravelerOrder={state.travelerIndex + 1}
        totalTravelersInDay={day.travelers.length}
        lastReprimandText={lastReprimandText}
        onDecide={(action: Action, reasonId?: string | null, takeBribe?: boolean) => {
          if (takeBribe) {
            dispatch({ type: "NHAN_PHONG_BI" });
          }
          dispatch({ type: "QUYET_DINH", action, reasonId: reasonId ?? null });
        }}
        onNext={() => {
          // Lượt đã được chuyển trong reduce(QUYET_DINH)
        }}
      />
    );
  }

  // 4. Màn báo cáo cuối ngày (DayEnd)
  if (state.phase === "DAY_END" && state.dayReport) {
    const day = currentDay(state, content);
    return (
      <DayEndScreen
        day={day}
        dayReport={state.dayReport}
        indicatorsStart={state.indicatorsDayStart}
        indicatorsEnd={state.indicators}
        onContinue={() => dispatch({ type: "KET_THUC_NGAY" })}
      />
    );
  }

  // 5. Màn chi tiêu gia đình (Budget)
  if (state.phase === "BUDGET" && state.budget) {
    const day = currentDay(state, content);
    return (
      <BudgetScreen
        day={day}
        budget={state.budget}
        onSubmitExpenses={(expenseIds: string[]) => dispatch({ type: "TRA_CHI_TIEU", expenseIds })}
      />
    );
  }

  // 6. Màn kết (Ending)
  if (state.phase === "ENDING" && state.ending) {
    const ending = content.endings.find((e) => e.id === state.ending);
    if (ending) {
      return <EndingScreen ending={ending} state={state} onRestart={handleRestart} />;
    }
  }

  return null;
}
