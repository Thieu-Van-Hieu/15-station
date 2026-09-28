/**
 * validate-tang3.test.ts — Kiểm tra đột biến (mutation testing) cho Tầng 3.
 * Theo đặc tả docs/08-cac-phase.md: V3-01 đến V3-15.
 */

import { describe, it, expect, beforeAll } from "vitest";
import {
  docTatCaDuLieu,
  kiemTraTang3,
  kiemTraTang3Dieu1,
  kiemTraTang3Dieu2Va3,
  kiemTraTang3Dieu4,
  kiemTraTang3Dieu5,
  kiemTraTang3Dieu6,
  kiemTraTang3Dieu7,
  kiemTraTang3Dieu8,
  kiemTraTang3Dieu9,
  kiemTraTang3Dieu10,
  kiemTraTang3Dieu11,
  type TatCaDuLieu,
} from "./validate-data.js";

describe("Tầng 3 — Logic game (Mutation tests V3-01..V3-15)", () => {
  let realData: TatCaDuLieu;

  beforeAll(async () => {
    realData = await docTatCaDuLieu();
  });

  // V3-01: Dữ liệu thật, không sửa -> Không có lỗi
  it("V3-01: Dữ liệu thật không có lỗi", () => {
    const data = structuredClone(realData);
    const phatHien = kiemTraTang3(data);
    const loi = phatHien.filter((p) => p.muc === "loi");
    expect(loi).toHaveLength(0);
  });

  // V3-02: Đổi expected.verdict của một lượt -> Lỗi điều 1
  it("V3-02: Đổi expected.verdict của một lượt -> Lỗi điều 1", () => {
    const data = structuredClone(realData);
    // d1-t1 ban đầu là CHO_QUA, đổi thành GIU_LAI
    data.travelers[0].expected.verdict = "GIU_LAI";

    const phatHien = kiemTraTang3Dieu1(data);
    const loiDieu1 = phatHien.filter((p) => p.muc === "loi" && p.dieu === 1);
    expect(loiDieu1.length).toBeGreaterThan(0);
    expect(loiDieu1.some((p) => p.noi_dung.includes("d1-t1"))).toBe(true);
  });

  // V3-03: Lượt d5 có GXNK: đáp án khác nhau giữa hai trạng thái KN-KHOAN -> Thông tin, không phải lỗi
  it("V3-03: Lượt d5 có GXNK đáp án khác nhau giữa 2 trạng thái KN-KHOAN -> Thông tin, không phải lỗi", () => {
    const data = structuredClone(realData);
    const phatHien = kiemTraTang3Dieu1(data);
    const thongTin = phatHien.filter((p) => p.muc === "thong_tin" && p.dieu === 1);
    expect(thongTin.length).toBeGreaterThan(0);
    expect(thongTin.some((p) => p.noi_dung.includes("d5-t1"))).toBe(true);

    const loi = phatHien.filter((p) => p.muc === "loi" && p.dieu === 1);
    expect(loi).toHaveLength(0);
  });

  // V3-04: Thêm E1 vào planted của một lượt mà GDD vẫn còn hạn -> Lỗi điều 2
  it("V3-04: Thêm E1 vào planted của một lượt mà GDD vẫn còn hạn -> Lỗi điều 2", () => {
    const data = structuredClone(realData);
    // d1-t1 GDD còn hạn, thêm E1 vào planted
    data.travelers[0].planted.push({
      error: "E1",
      doc: "GDD",
      field: "co_gia_tri_den",
      note: "Cố ý gắn E1 dù giấy còn hạn",
    });

    const phatHien = kiemTraTang3Dieu2Va3(data);
    const loiDieu2 = phatHien.filter((p) => p.muc === "loi" && p.dieu === 2);
    expect(loiDieu2.length).toBeGreaterThan(0);
    expect(loiDieu2.some((p) => p.noi_dung.includes("E1"))).toBe(true);
  });

  // V3-05: Cài E2 ở một lượt d3 -> Thông tin "lỗi ngủ"
  it("V3-05: Cài E2 ở một lượt d3 -> Thông tin 'lỗi ngủ'", () => {
    const data = structuredClone(realData);
    // d3-t1 thuộc d3, chưa có R4-KHOP-TEN (R4 bắt đầu từ d4)
    const d3t1 = data.travelers.find((t) => t.id === "d3-t1");
    expect(d3t1).toBeDefined();
    d3t1.planted.push({
      error: "E2",
      doc: "GDD",
      field: "ho_ten",
      note: "Cài E2 ở d3 khi R4 chưa có hiệu lực",
    });

    const phatHien = kiemTraTang3Dieu2Va3(data);
    const thongTinLoiNgu = phatHien.filter((p) => p.muc === "thong_tin" && p.dieu === 2);
    expect(thongTinLoiNgu.length).toBeGreaterThan(0);
    expect(thongTinLoiNgu.some((p) => p.noi_dung.includes("lỗi ngủ") && p.noi_dung.includes("E2"))).toBe(true);

    const loi = phatHien.filter((p) => p.muc === "loi" && p.dieu === 2);
    expect(loi).toHaveLength(0);
  });

  // V3-06: Cho GDD của một lượt đúng ra hết hạn, không ghi vào planted -> Cảnh báo điều 3 "lỗi vô tình"
  it("V3-06: Cho GDD của một lượt đúng ra hết hạn, không ghi vào planted -> Cảnh báo điều 3 'lỗi vô tình'", () => {
    const data = structuredClone(realData);
    // d1-t1 sửa ngày hết hạn thành quá khứ
    const gdd = data.travelers[0].documents.find((d: any) => d.type === "GDD");
    expect(gdd).toBeDefined();
    gdd.fields.co_gia_tri_den = "1979-10-01"; // Trước 1979-10-14 -> hết hạn sinh E1

    const phatHien = kiemTraTang3Dieu2Va3(data);
    const canhBaoDieu3 = phatHien.filter((p) => p.muc === "canh_bao" && p.dieu === 3);
    expect(canhBaoDieu3.length).toBeGreaterThan(0);
    expect(canhBaoDieu3.some((p) => p.noi_dung.includes("vi phạm vô tình") && p.noi_dung.includes("E1"))).toBe(true);
  });

  // V3-07: Bỏ nhãn buon-lau-that khỏi một lượt, còn 4 -> Lỗi điều 4
  it("V3-07: Bỏ nhãn buon-lau-that khỏi một lượt, còn 4 -> Lỗi điều 4", () => {
    const data = structuredClone(realData);
    const blTurn = data.travelers.find((t) => t.tags?.includes("buon-lau-that"));
    expect(blTurn).toBeDefined();
    blTurn.tags = blTurn.tags.filter((tag: string) => tag !== "buon-lau-that");

    const phatHien = kiemTraTang3Dieu4(data.travelers);
    const loiDieu4 = phatHien.filter((p) => p.muc === "loi" && p.dieu === 4);
    expect(loiDieu4.length).toBeGreaterThan(0);
  });

  // V3-08: Lượt buon-lau-that có đáp án CHO_QUA -> Lỗi điều 4
  it("V3-08: Lượt buon-lau-that có đáp án CHO_QUA -> Lỗi điều 4", () => {
    const data = structuredClone(realData);
    const blTurn = data.travelers.find((t) => t.tags?.includes("buon-lau-that"));
    expect(blTurn).toBeDefined();
    blTurn.expected.verdict = "CHO_QUA";

    const phatHien = kiemTraTang3Dieu4(data.travelers);
    const loiDieu4 = phatHien.filter((p) => p.muc === "loi" && p.dieu === 4);
    expect(loiDieu4.length).toBeGreaterThan(0);
  });

  // V3-09: Bỏ kn của một lượt KN-KHOAN ở d3–d4, còn 2 -> Lỗi điều 5
  it("V3-09: Bỏ kn của một lượt KN-KHOAN ở d3–d4, còn 2 -> Lỗi điều 5", () => {
    const data = structuredClone(realData);
    const tKhoan = data.travelers.find(
      (t) => (t.day === "d3" || t.day === "d4") && t.kn?.issue === "KN-KHOAN",
    );
    expect(tKhoan).toBeDefined();
    tKhoan.kn = null;

    const phatHien = kiemTraTang3Dieu5(data.travelers);
    const loiDieu5 = phatHien.filter((p) => p.muc === "loi" && p.dieu === 5);
    expect(loiDieu5.length).toBeGreaterThan(0);
  });

  // V3-10: Bỏ kn của một lượt Anh Hùng, còn 2 -> Lỗi điều 6
  it("V3-10: Bỏ kn của một lượt Anh Hùng, còn 2 -> Lỗi điều 6", () => {
    const data = structuredClone(realData);
    const tHung = data.travelers.find(
      (t) =>
        (t.day === "d3" || t.day === "d4" || t.day === "d5") &&
        t.character === "anh-hung" &&
        t.kn?.issue === "KN-THUONG-BINH",
    );
    expect(tHung).toBeDefined();
    tHung.kn = null;

    const phatHien = kiemTraTang3Dieu6(data.travelers);
    const loiDieu6 = phatHien.filter((p) => p.muc === "loi" && p.dieu === 6);
    expect(loiDieu6.length).toBeGreaterThan(0);
  });

  // V3-11: Bỏ lượt vi phạm R6 ở d6 -> Lỗi điều 7
  it("V3-11: Bỏ lượt vi phạm R6 ở d6 -> Lỗi điều 7", () => {
    const data = structuredClone(realData);
    const d6t5 = data.travelers.find((t) => t.id === "d6-t5");
    expect(d6t5).toBeDefined();
    d6t5.expected.violations = [];

    const phatHien = kiemTraTang3Dieu7(data.travelers);
    const loiDieu7 = phatHien.filter((p) => p.muc === "loi" && p.dieu === 7);
    expect(loiDieu7.length).toBeGreaterThan(0);
  });

  // V3-12: Chỉ còn 1 lượt có phong bì -> Lỗi điều 8
  it("V3-12: Chỉ còn 1 lượt có phong bì -> Lỗi điều 8", () => {
    const data = structuredClone(realData);
    const d3t4 = data.travelers.find((t) => t.id === "d3-t4");
    expect(d3t4).toBeDefined();
    d3t4.bribe = null;

    const phatHien = kiemTraTang3Dieu8(data.travelers);
    const loiDieu8 = phatHien.filter((p) => p.muc === "loi" && p.dieu === 8);
    expect(loiDieu8.length).toBeGreaterThan(0);
  });

  // V3-13: Tổng dịp kiến nghị d3–d5 còn 3 -> Lỗi điều 9
  it("V3-13: Tổng dịp kiến nghị d3–d5 còn 3 -> Lỗi điều 9", () => {
    const data = structuredClone(realData);
    // Bỏ kn ở nhiều lượt sao cho tổng còn 3
    let count = 0;
    for (const t of data.travelers) {
      if ((t.day === "d3" || t.day === "d4" || t.day === "d5") && t.kn !== null) {
        count += 1;
        if (count > 3) {
          t.kn = null;
        }
      }
    }

    const phatHien = kiemTraTang3Dieu9(data.travelers);
    const loiDieu9 = phatHien.filter((p) => p.muc === "loi" && p.dieu === 9);
    expect(loiDieu9.length).toBeGreaterThan(0);
  });

  // V3-14: Một nhân vật chinh còn 2 lần xuất hiện -> Lỗi điều 10
  it("V3-14: Một nhân vật chính còn 2 lần xuất hiện -> Lỗi điều 10", () => {
    const data = structuredClone(realData);
    // Đổi bớt 2 lượt của ong-quynh thành nhân vật khác
    let count = 0;
    for (const t of data.travelers) {
      if (t.character === "ong-quynh") {
        count += 1;
        if (count > 2) {
          t.character = "chi-thu";
        }
      }
    }

    const phatHien = kiemTraTang3Dieu10(data.characters, data.travelers);
    const loiDieu10 = phatHien.filter((p) => p.muc === "loi" && p.dieu === 10);
    expect(loiDieu10.length).toBeGreaterThan(0);
    expect(loiDieu10.some((p) => p.noi_dung.includes("ong-quynh"))).toBe(true);
  });

  // V3-15: Một lượt vừa có bribe vừa có kn -> Lỗi điều 11
  it("V3-15: Một lượt vừa có bribe vừa có kn -> Lỗi điều 11", () => {
    const data = structuredClone(realData);
    // Gán cả kn cho d5-t4 (vốn đã có bribe)
    const d5t4 = data.travelers.find((t) => t.id === "d5-t4");
    expect(d5t4).toBeDefined();
    d5t4.kn = { issue: "KN-KHOAN", note: "Thử vừa có bribe vừa có kn" };

    const phatHien = kiemTraTang3Dieu11(data.travelers);
    const loiDieu11 = phatHien.filter((p) => p.muc === "loi" && p.dieu === 11);
    expect(loiDieu11.length).toBeGreaterThan(0);
    expect(loiDieu11.some((p) => p.noi_dung.includes("d5-t4"))).toBe(true);
  });
});
