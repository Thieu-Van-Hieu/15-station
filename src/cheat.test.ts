import { describe, expect, it } from "vitest";
import { content } from "./content";
import { previewDay, previewEnding } from "./cheat";
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
});
