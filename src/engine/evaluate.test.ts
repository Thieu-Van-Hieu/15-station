import { describe, expect, it } from "vitest";
import { GAME_DATE, book, gdd, goods, item, sampleTraveler, shk, traveler } from "./__fixtures__";
import { evaluate } from "./evaluate";
import type { DayId, IssueId, Traveler } from "./types";

const at = (t: Traveler, d: DayId, issues: IssueId[] = []) =>
  evaluate(t, { id: d, game_date: GAME_DATE[d] }, book, new Set(issues));

function deepFreeze<T>(x: T): T {
  if (x !== null && typeof x === "object") {
    Object.values(x).forEach(deepFreeze);
    Object.freeze(x);
  }
  return x;
}

describe("evaluate — 03 mục 4.9", () => {
  it("EV-01 lượt mẫu bà Tư ở d3: giữ lại vì vượt định mức", () => {
    expect(at(sampleTraveler(), "d3")).toEqual({
      verdict: "GIU_LAI",
      violations: [{ rule: "R2-DINH-MUC", error: "E4" }],
    });
  });

  it("EV-02 lượt mẫu ở d5 với KN-KHOAN: không còn vi phạm R2, nhưng GDD hết hạn và thiếu SHK", () => {
    const r = at(sampleTraveler(), "d5", ["KN-KHOAN"]);
    expect(r.violations.some((v) => v.rule === "R2-DINH-MUC")).toBe(false);
    expect(r.violations).toEqual([
      { rule: "R1-GDD", error: "E1" },
      { rule: "R4-KHOP-TEN", error: "E5" },
    ]);
  });

  it("EV-03 lượt mẫu đổi sang ngày 1986 và thêm SHK: cho qua khi KN-KHOAN hiệu lực", () => {
    const t = sampleTraveler();
    const g = t.documents.find((d) => d.type === "GDD");
    if (g?.type !== "GDD") throw new Error("lượt mẫu phải có GDD");
    g.fields.ngay_cap = "1986-04-10";
    g.fields.co_gia_tri_den = "1986-04-20";
    t.documents.push(shk({ ho_ten: g.fields.ho_ten, nam_sinh: g.fields.nam_sinh }));

    expect(at(t, "d5", ["KN-KHOAN"])).toEqual({ verdict: "CHO_QUA", violations: [] });
    // Cùng lượt đó khi KN-KHOAN chưa hiệu lực: vẫn vượt định mức.
    expect(at(t, "d5").violations).toEqual([{ rule: "R2-DINH-MUC", error: "E4" }]);
  });

  it("EV-04 vi phạm xếp theo thứ tự quy định trong rules.json", () => {
    const t = traveler({
      documents: [gdd({ co_gia_tri_den: "1981-03-01" })],
      cargo: [goods("gao", 10, "LUONG_THUC"), goods("penicillin", 5, "THUOC", "vien")],
    });
    expect(at(t, "d4").violations.map((v) => v.rule)).toEqual([
      "R1-GDD",
      "R1-GDD",
      "R2-DINH-MUC",
      "R3-DON-THUOC",
      "R4-KHOP-TEN",
    ]);
  });

  it("EV-05 hàm thuần: không sửa đầu vào, gọi lại cho cùng kết quả", () => {
    const t = deepFreeze(
      traveler({ documents: [gdd({ hang_mang_theo: [item("gao", 18)] })], cargo: [goods("gao", 18, "LUONG_THUC")] }),
    );
    const first = at(t, "d2");
    expect(at(t, "d2")).toEqual(first);
    expect(first.violations).toEqual([{ rule: "R2-DINH-MUC", error: "E4" }]);
  });
});
