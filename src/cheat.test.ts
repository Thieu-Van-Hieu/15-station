import { describe, expect, it } from "vitest";
import { content } from "./content";
import { parseJump, previewDay, previewEnding, stateFromJump } from "./cheat";
import type { EndingId } from "./engine/types";

describe("cheat Mr.NoBody — xem trước kết cục", () => {
  it.each(["END-AN-TIEN", "END-LAM-NGO", "END-KIEN-NGHI", "END-GAC-CONG", "END-SONG-SOT"] as EndingId[])(
    "CHEAT-01 %s dựng ra đúng kết cục đó",
    (id) => {
      const s = previewEnding(content, id);
      expect(s.phase).toBe("ENDING");
      expect(s.ending).toBe(id);
    },
  );

  it("CHEAT-02 nhảy tới đầu từng ngày", () => {
    content.days.forEach((d, i) => {
      const s = previewDay(content, i);
      expect(s.phase).toBe("DAY_START");
      expect(s.dayIndex).toBe(i);
    });
  });

  it.each([
    ["d3-t3", { traveler: "d3-t3" }],
    ["D3-T3", { traveler: "d3-t3" }],
    [" d3t3 ", { traveler: "d3-t3" }],
    ["3-3", { traveler: "d3-t3" }],
    ["d5-t6", { traveler: "d5-t6" }],
    ["d3", { day: 2 }],
    ["6", { day: 5 }],
  ])("JUMP-01 ?tu=%s đọc đúng", (raw, want) => {
    expect(parseJump(content, raw)).toEqual(want);
  });

  it.each(["d3-t", "d3-t9", "d7", "d0-t1", "abc", "t3"])("JUMP-02 ?tu=%s không hợp lệ thì trả null, không chơi mò tới cuối game", (raw) => {
    expect(parseJump(content, raw)).toBeNull();
    expect(stateFromJump(content, raw)).toBeNull();
  });

  it("JUMP-03 nhảy đúng lượt và đúng đầu ngày", () => {
    const a = stateFromJump(content, "D4-T2")!;
    expect(a.phase).toBe("TRAVELER");
    expect(content.days[a.dayIndex].travelers[a.travelerIndex]).toBe("d4-t2");
    const b = stateFromJump(content, "d5")!;
    expect(b).toMatchObject({ phase: "DAY_START", dayIndex: 4 });
  });
});

