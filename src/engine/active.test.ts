import { describe, expect, it } from "vitest";
import { book } from "./__fixtures__";
import { activeRules } from "./active";
import type { DayId, IssueId } from "./types";

const ids = (d: DayId, issues: IssueId[] = []) => activeRules(book.rules, d, new Set(issues)).map((r) => r.id);

describe("active — 03 mục 4.1", () => {
  it("ACT-01 d1 chỉ có R1", () => {
    expect(ids("d1")).toEqual(["R1-GDD"]);
  });

  it("ACT-02 d4 có R1 đến R4", () => {
    expect(ids("d4")).toEqual(["R1-GDD", "R2-DINH-MUC", "R3-DON-THUOC", "R4-KHOP-TEN"]);
  });

  it("ACT-03 d5 khi KN-KHOAN chưa hiệu lực", () => {
    expect(ids("d5")).toEqual(["R1-GDD", "R2-DINH-MUC", "R3-DON-THUOC", "R4-KHOP-TEN", "R5-CHUNG-TU"]);
  });

  it("ACT-04 d5 khi KN-KHOAN đã hiệu lực thì thêm R5K", () => {
    expect(ids("d5", ["KN-KHOAN"])).toEqual([
      "R1-GDD",
      "R2-DINH-MUC",
      "R3-DON-THUOC",
      "R4-KHOP-TEN",
      "R5-CHUNG-TU",
      "R5K-KHOAN",
    ]);
  });

  it("ACT-05 d6 chỉ còn R6", () => {
    expect(ids("d6", ["KN-KHOAN"])).toEqual(["R6-HANG-CAM"]);
  });
});
