import { describe, expect, it } from "vitest";
import { day, gdd, traveler } from "./__fixtures__";
import { gameContent, startAt } from "./__fixtures__/game";
import { computeBudget, expensesFor, familyLevel, payExpenses } from "./economy";
import { reduce } from "./game";
import type { Traveler } from "./types";

describe("economy — 03 mục 8 (số mặc định ở 8.2)", () => {
  it("ECO-01 d1: để dành 10 + lương 20 + thưởng 3", () => {
    expect(computeBudget(10, day("d1"), "XUAT_SAC", 0, 0).available).toBe(33);
  });

  it("ECO-02 d1, 3 lượt sai 1: TRUNG BÌNH, trừ 2", () => {
    const ts = [1, 2, 3].map((i) => traveler({ id: `d1-t${i}` as Traveler["id"], day: "d1", order: i, documents: [gdd()] }));
    const content = gameContent(ts);
    let s = startAt(content, "d1");
    for (const action of ["CHO_QUA", "CHO_QUA", "GIU_LAI"] as const) {
      s = reduce(s, { type: "QUYET_DINH", action, reasonId: null }, content);
    }
    expect(s.dayReport?.grade).toBe("TRUNG_BINH");
    s = reduce(s, { type: "KET_THUC_NGAY" }, content);
    expect(s.budget?.available).toBe(28);
  });

  it("ECO-03 d5 đổi tiền: 95 còn 9, rồi mới cộng lương", () => {
    const b = computeBudget(95, day("d5"), "KHA", 0, 0);
    expect(b.afterReform).toBe(9);
    expect(b.available).toBe(9 + 420);
  });

  it("ECO-04 tiền phạt lớn hơn tiền có thì còn 0", () => {
    expect(computeBudget(0, day("d1"), "TRUNG_BINH", 20, 0).available).toBe(0);
  });

  it("ECO-05 chọn quá số tiền, chọn trùng, hoặc mã lạ đều bị từ chối", () => {
    const b = computeBudget(0, day("d1"), "TRUNG_BINH", 5, 0); // 20 − 10 = 10
    expect(b.available).toBe(10);
    expect(payExpenses(b, day("d1"), ["gao", "than"])).toBeNull(); // 11 > 10
    expect(payExpenses(b, day("d1"), ["gao", "gao"])).toBeNull();
    expect(payExpenses(b, day("d1"), ["xe-dap"])).toBeNull();
  });

  it("ECO-06 mỗi khoản thiết yếu không trả làm hardship tăng 1", () => {
    const b = computeBudget(10, day("d1"), "XUAT_SAC", 0, 0);
    expect(payExpenses(b, day("d1"), ["gao", "than"])).toEqual({ money: 33 - 11, hardship: 2 });
  });

  it("ECO-07 tiền phong bì là một dòng riêng và được cộng vào tiền có thể chi", () => {
    const b = computeBudget(0, day("d5"), "KHA", 0, 120);
    expect(b.bribes).toBe(120);
    expect(b.available).toBe(420 + 120);
  });

  it("ECO-08 mức gia đình theo hardship cộng dồn: 2, 5, 8", () => {
    expect([0, 1, 2, 4, 5, 7, 8, 20].map(familyLevel)).toEqual([0, 0, 1, 1, 2, 2, 3, 3]);
  });

  it("ECO-09 mức 3: bỏ khoản của từng người, khoản chung còn phần một người", () => {
    const d = day("d6");
    expect(expensesFor(d, 7)).toBe(d.economy.expenses);
    const gone = expensesFor(d, 8);
    expect(gone.every((x) => !x.member)).toBe(true);
    for (const x of gone) {
      const full = d.economy.expenses.find((y) => y.id === x.id)!;
      expect(x.cost).toBe(Math.ceil(full.cost / 5));
    }
  });

  it("ECO-10 trả chi tiêu theo bảng đã lọc: khoản của người đã về quê không còn chọn được", () => {
    const d = day("d6");
    const member = d.economy.expenses.find((x) => x.member)!;
    const b = computeBudget(10000, d, "KHA", 0, 0);
    expect(payExpenses(b, d, [member.id], 8)).toBeNull();
  });
});
