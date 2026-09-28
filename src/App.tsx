import { useCallback, useState, useEffect } from "react";
import { CheatPanel } from "./components/CheatPanel";
import { previewDay, previewEnding, useCheatCode } from "./cheat";
import { content } from "./content";
import { newGame, reduce, type GameAction } from "./engine/game";
import { simulate, followRulebook } from "./engine/simulate";
import { conditionState, currentDay, currentTraveler } from "./engine/state";
import { reprimandText } from "./engine/turn";
import type { Action, GameState, TravelerId } from "./engine/types";
import { DeskScreen } from "./screens/DeskScreen";
import { DayEndScreen } from "./screens/DayEndScreen";
import { BudgetScreen } from "./screens/BudgetScreen";
import { EndingScreen } from "./screens/EndingScreen";
import { IntroScreen } from "./screens/IntroScreen";
import { DayStartScreen } from "./screens/DayStartScreen";

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

  const [cheatOpen, setCheatOpen] = useState(false);
  useCheatCode(useCallback(() => setCheatOpen(true), []));

  return (
    <>
      {renderScreen()}
      {cheatOpen && (
        <CheatPanel
          onClose={() => setCheatOpen(false)}
          onPickEnding={(id) => {
            setState(previewEnding(content, id));
            window.scrollTo(0, 0);
            setCheatOpen(false);
          }}
          onPickDay={(i) => {
            setState(previewDay(content, i));
            window.scrollTo(0, 0);
            setCheatOpen(false);
          }}
        />
      )}
    </>
  );

  function renderScreen() {
    // 1. Màn chú thích mở đầu
    if (state.phase === "INTRO") {
      return <IntroScreen onStart={() => dispatch({ type: "BAT_DAU_GAME" })} />;
    }

    // 2. Màn đầu ngày (thẻ chuyển cảnh và giao ban đầu ngày)
    if (state.phase === "DAY_START") {
      return <DayStartScreen
          day={currentDay(state, content)}
          hardship={state.hardship}
          fatigue={state.fatigue ?? 0}
          onStart={() => dispatch({ type: "BAT_DAU_NGAY" })} />;
    }

    // 3. Màn làm việc (Desk)
    if (state.phase === "TRAVELER") {
      const day = currentDay(state, content);
      const traveler = currentTraveler(state, content);
      // Lượt trước lập biên bản sai lý do: báo cho người chơi cùng chỗ với giấy nhắc nhở.
      const last = state.travelerIndex > 0 ? state.log[state.log.length - 1] : undefined;
      const invalidReport = last?.report && !last.report.valid ? content.strings["report.invalid"] : null;
      const notices = [state.pendingReprimand ? reprimandText(state.pendingReprimand, content) : null, invalidReport].filter(Boolean);
      const lastReprimandText = notices.length > 0 ? notices.join("\n\n") : null;

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
          onConfront={(a, b) => dispatch({ type: "DOI_CHAT", a, b })}
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
          hardship={state.hardship}
          conditions={conditionState(state)}
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
}
