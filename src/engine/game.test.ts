import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { traveler } from "./__fixtures__";
import { gameContent } from "./__fixtures__/game";
import { type GameAction, newGame, reduce } from "./game";
import { followRulebook, simulate } from "./simulate";
import type { DayId, Traveler } from "./types";

const DAYS: DayId[] = ["d1", "d2", "d3", "d4", "d5", "d6"];
/** Mỗi ngày một lượt không có giấy tờ: vi phạm ở d1–d5 (thiếu GDD), hợp lệ ở d6. */
const mini = () => gameContent(DAYS.map((d) => traveler({ id: `${d}-t1` as Traveler["id"], day: d })));

describe("game — reducer tổng", () => {
  it("GAM-01 newGame lấy chỉ số và tiền từ d1", () => {
    const s = newGame(mini());
    expect(s).toMatchObject({
      phase: "INTRO",
      dayIndex: 0,
      travelerIndex: 0,
      money: 10,
      clockMin: 7 * 60,
      indicators: { luong_thuc_vao_thi_xa: 100, ho_thieu_an: 210, gia_gao_index: 100 },
    });
  });

  it("GAM-02 chơi hết 6 ngày theo sổ thì ra Người gác cổng", () => {
    const content = mini();
    const phases: string[] = [];
    let s = newGame(content);
    const steps: GameAction[] = [
      { type: "BAT_DAU_GAME" },
      { type: "BAT_DAU_NGAY" },
      { type: "QUYET_DINH", action: "GIU_LAI", reasonId: null },
      { type: "KET_THUC_NGAY" },
      { type: "TRA_CHI_TIEU", expenseIds: [] },
    ];
    phases.push(s.phase);
    for (const a of steps) {
      s = reduce(s, a, content);
      phases.push(s.phase);
    }
    expect(phases).toEqual(["INTRO", "DAY_START", "TRAVELER", "DAY_END", "BUDGET", "DAY_START"]);
    expect(s.dayIndex).toBe(1);

    const end = simulate(content, followRulebook);
    expect(end.phase).toBe("ENDING");
    expect(end.ending).toBe("END-GAC-CONG");
    expect(end.log.map((r) => r.verdict)).toEqual(["GIU_LAI", "GIU_LAI", "GIU_LAI", "GIU_LAI", "GIU_LAI", "CHO_QUA"]);
  });

  it("GAM-03 hành động sai phase bị từ chối, state giữ nguyên", () => {
    const content = mini();
    const s = newGame(content);
    expect(reduce(s, { type: "QUYET_DINH", action: "CHO_QUA", reasonId: null }, content)).toBe(s);
    expect(reduce(s, { type: "BAT_DAU_NGAY" }, content)).toBe(s);
    expect(reduce(s, { type: "TRA_CHI_TIEU", expenseIds: [] }, content)).toBe(s);
  });

  it("GAM-04 không có ngẫu nhiên: chạy hai lần ra cùng kết quả", () => {
    expect(simulate(mini(), followRulebook)).toEqual(simulate(mini(), followRulebook));
  });

  it("GAM-05 engine không đụng React, DOM, thời gian thật, số ngẫu nhiên hay data/", () => {
    const dir = path.dirname(fileURLToPath(import.meta.url));
    const files = readdirSync(dir, { recursive: true, encoding: "utf8" }).filter(
      (f) => f.endsWith(".ts") && !f.endsWith(".test.ts") && !f.includes("__fixtures__"),
    );
    expect(files.length).toBeGreaterThan(10);

    const forbidden = [/from "react/, /Date\.now/, /new Date\(/, /Math\.random/, /\bwindow\./, /\bdocument\./, /\/data\//, /content"/];
    for (const f of files) {
      const src = readFileSync(path.join(dir, f), "utf8");
      for (const re of forbidden) expect(re.test(src), `${f} chứa ${re}`).toBe(false);
    }
  });

  it("simulate dừng đúng lượt được yêu cầu (chế độ nhảy lượt)", () => {
    const s = simulate(mini(), followRulebook, { stopAt: "d3-t1" });
    expect(s.phase).toBe("TRAVELER");
    expect(s.dayIndex).toBe(2);
    expect(s.log).toHaveLength(2);
  });
});
