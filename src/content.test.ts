import { describe, expect, it } from "vitest";
import { content } from "./content";

describe("content", () => {
  it("P1-05 có đủ 8 file dữ liệu", () => {
    expect(Object.keys(content).sort()).toEqual(
      ["characters", "days", "documents", "endings", "reports", "rules", "strings", "travelers"],
    );
  });

  it("P1-05 rules.json có 7 quy định theo 03 mục 1.7", () => {
    expect(content.rules.map((r) => r.id)).toEqual([
      "R1-GDD",
      "R2-DINH-MUC",
      "R3-DON-THUOC",
      "R4-KHOP-TEN",
      "R5-CHUNG-TU",
      "R5K-KHOAN",
      "R6-HANG-CAM",
    ]);
  });

  it("P1-05 documents.json có 8 loại giấy theo 03 mục 1.4", () => {
    expect(content.documents.map((d) => d.code)).toEqual([
      "GDD",
      "SHK",
      "TP",
      "HDHTX",
      "GPVC",
      "DT",
      "CNTB",
      "GXNK",
    ]);
  });
});
