import { describe, expect, it } from "vitest";
import { gdd, traveler } from "./__fixtures__";
import { gameContent, startAt } from "./__fixtures__/game";
import { addDeltas, formatClock, gradeFor, percentChange } from "./day-end";
import { type GameAction, reduce } from "./game";
import type { Traveler } from "./types";

const quyet = (action: "CHO_QUA" | "GIU_LAI" | "LAM_NGO", reasonId: string | null = null): GameAction => ({
  type: "QUYET_DINH",
  action,
  reasonId,
});

const fiveD5 = (): Traveler[] =>
  [1, 2, 3, 4, 5].map((i) => traveler({ id: `d5-t${i}` as Traveler["id"], day: "d5", order: i }));

function playD5(reports: number) {
  const content = gameContent(fiveD5());
  let s = startAt(content, "d5");
  for (let i = 0; i < 5; i += 1) s = reduce(s, quyet("GIU_LAI", i < reports ? "LD-KHOAN" : null), content);
  return s;
}

describe("day-end — 03 mục 7", () => {
  it("DAY-01 5 lượt, 1 biên bản: hết ca 16:20, không ngoài giờ", () => {
    const s = playD5(1);
    expect(s.phase).toBe("DAY_END");
    expect(formatClock(s.dayReport!.clockEnd)).toBe("16:20");
    expect(s.dayReport!.overtime).toBe(false);
  });

  it("DAY-02 5 lượt, 2 biên bản: hết ca 17:20, ngoài giờ", () => {
    const s = playD5(2);
    expect(formatClock(s.dayReport!.clockEnd)).toBe("17:20");
    expect(s.dayReport!.overtime).toBe(true);
    expect(s.overtimeDays).toBe(1);
  });

  it.each([
    ["DAY-03 9/10 là XUẤT SẮC", 9, 10, false, "XUAT_SAC"],
    ["DAY-04 7/10 là KHÁ", 7, 10, false, "KHA"],
    ["DAY-05 6/10 là TRUNG BÌNH", 6, 10, false, "TRUNG_BINH"],
    ["DAY-06 XUẤT SẮC mà ngoài giờ thì KHÁ", 10, 10, true, "KHA"],
    ["DAY-07 TRUNG BÌNH mà ngoài giờ vẫn TRUNG BÌNH", 1, 10, true, "TRUNG_BINH"],
  ] as const)("%s", (_n, correct, recorded, overtime, grade) => {
    expect(gradeFor(correct, recorded, overtime).grade).toBe(grade);
  });

  it("DAY-08 làm ngơ mọi lượt, không ghi sổ lượt nào: tỷ lệ 100%", () => {
    const content = gameContent([traveler({ id: "d1-t1", day: "d1" })]);
    const s = reduce(startAt(content, "d1"), quyet("LAM_NGO"), content);
    expect(s.dayReport).toMatchObject({ rate: 1, grade: "XUAT_SAC" });
  });

  it("DAY-09 chỉ số không bao giờ âm", () => {
    const start = { luong_thuc_vao_thi_xa: 5, ho_thieu_an: 10, gia_gao_index: 10 };
    expect(addDeltas(start, { luong_thuc_vao_thi_xa: -9 }).luong_thuc_vao_thi_xa).toBe(0);
  });

  it("DAY-10 100 → 86 là giảm 14%", () => {
    expect(percentChange(100, 86)).toBe(-14);
  });

  it("DAY-11 đầu ngày bằng 0 thì không chia cho 0", () => {
    expect(percentChange(0, 5)).toBeNull();
  });

  it("DAY-12 ghi chú theo thứ tự lượt, cộng yếu tố khác vào cuối ngày", () => {
    const ts = [
      traveler({ id: "d1-t1", day: "d1", documents: [gdd()], outcomes: { CHO_QUA: { deltas: {}, notes: ["A"] }, GIU_LAI: { deltas: {}, notes: [] } } }),
      traveler({ id: "d1-t2", day: "d1", order: 2, documents: [gdd()], outcomes: { CHO_QUA: { deltas: {}, notes: ["B"] }, GIU_LAI: { deltas: {}, notes: [] } } }),
    ];
    const content = gameContent(ts);
    content.days[0].other_factor = { text: "Lũ sớm ở xã Phú Hoà", deltas: { ho_thieu_an: 20 } };

    let s = startAt(content, "d1");
    s = reduce(s, quyet("CHO_QUA"), content);
    s = reduce(s, quyet("CHO_QUA"), content);

    expect(s.dayReport).toMatchObject({ notes: ["A", "B"], otherFactor: "Lũ sớm ở xã Phú Hoà" });
    expect(s.dayReport!.indicatorsStart.ho_thieu_an).toBe(210);
    expect(s.dayReport!.indicatorsEnd.ho_thieu_an).toBe(230);
  });
});
