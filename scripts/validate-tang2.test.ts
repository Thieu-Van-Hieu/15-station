/**
 * validate-tang2.test.ts — Kiểm tra đột biến (mutation testing) cho Tầng 2.
 * Theo đặc tả docs/08-cac-phase.md: V2-01 đến V2-15.
 */

import { describe, it, expect, beforeAll } from "vitest";
import {
  docTatCaDuLieu,
  kiemTraTang2,
  kiemTraDieu1,
  kiemTraDieu2,
  kiemTraDieu3,
  kiemTraDieu4,
  kiemTraDieu5,
  kiemTraDieu6,
  kiemTraDieu7,
  kiemTraDieu8,
  kiemTraDieu9,
  kiemTraDieu10,
  type TatCaDuLieu,
} from "./validate-data.js";

describe("Tầng 2 — Tham chiếu chéo (Mutation tests V2-01..V2-15)", () => {
  let realData: TatCaDuLieu;

  beforeAll(async () => {
    realData = await docTatCaDuLieu();
  });

  // V2-01: Dữ liệu thật, không sửa -> Không có lỗi
  it("V2-01: Dữ liệu thật không có lỗi", () => {
    const data = structuredClone(realData);
    const phatHien = kiemTraTang2(data);
    const loi = phatHien.filter((p) => p.muc === "loi");
    expect(loi).toHaveLength(0);
  });

  // V2-02: Xoá một lượt mà days đang trỏ tới -> Lỗi điều 1
  it("V2-02: Xoá một lượt mà days đang trỏ tới -> Lỗi điều 1", () => {
    const data = structuredClone(realData);
    // Xoá d1-t2 khỏi travelers.json nhưng vẫn giữ trong days[0].travelers
    data.travelers = data.travelers.filter((t) => t.id !== "d1-t2");

    const phatHien = kiemTraDieu1(data.days, data.travelers);
    const loiDieu1 = phatHien.filter((p) => p.muc === "loi" && p.dieu === 1);
    expect(loiDieu1.length).toBeGreaterThan(0);
    expect(loiDieu1.some((p) => p.noi_dung.includes("d1-t2"))).toBe(true);
  });

  // V2-03: Đổi order của một lượt lệch vị trí trong ngày -> Lỗi điều 1
  it("V2-03: Đổi order của một lượt lệch vị trí trong ngày -> Lỗi điều 1", () => {
    const data = structuredClone(realData);
    // Đổi order của d1-t1 từ 1 thành 2
    const t = data.travelers.find((x) => x.id === "d1-t1");
    if (t) t.order = 2;

    const phatHien = kiemTraDieu1(data.days, data.travelers);
    const loiDieu1 = phatHien.filter((p) => p.muc === "loi" && p.dieu === 1);
    expect(loiDieu1.length).toBeGreaterThan(0);
  });

  // V2-04: Bớt một lượt của d4 -> Điều 2: cảnh báo khi thường, lỗi khi --strict
  it("V2-04: Bớt một lượt của d4 -> Cảnh báo khi thường, lỗi khi --strict", () => {
    const data = structuredClone(realData);
    // Bớt d4-t5 khỏi cả days[3].travelers và data.travelers
    data.days[3].travelers = data.days[3].travelers.filter((id: string) => id !== "d4-t5");
    data.travelers = data.travelers.filter((t) => t.id !== "d4-t5");

    // Khi không strict -> cảnh báo, không có lỗi
    const phatHienThuong = kiemTraDieu2(data.days, data.travelers, false);
    expect(phatHienThuong.filter((p) => p.muc === "loi" && p.dieu === 2)).toHaveLength(0);
    expect(phatHienThuong.filter((p) => p.muc === "canh_bao" && p.dieu === 2).length).toBeGreaterThan(0);

    // Khi strict -> lỗi
    const phatHienStrict = kiemTraDieu2(data.days, data.travelers, true);
    expect(phatHienStrict.filter((p) => p.muc === "loi" && p.dieu === 2).length).toBeGreaterThan(0);
  });

  // V2-05: Đổi speaker thành mã không tồn tại -> Lỗi điều 3
  it("V2-05: Đổi speaker thành mã không tồn tại -> Lỗi điều 3", () => {
    const data = structuredClone(realData);
    data.travelers[0].dialogue[0].speaker = "nguoi-la-mat";

    const phatHien = kiemTraDieu3(data.days, data.travelers, data.characters, data.rules, data.reports);
    const loiDieu3 = phatHien.filter((p) => p.muc === "loi" && p.dieu === 3);
    expect(loiDieu3.length).toBeGreaterThan(0);
    expect(loiDieu3.some((p) => p.noi_dung.includes("nguoi-la-mat"))).toBe(true);
  });

  // V2-06: Xoá một mục trong appearances của ba-tu -> Lỗi điều 4
  it("V2-06: Xoá một mục trong appearances của ba-tu -> Lỗi điều 4", () => {
    const data = structuredClone(realData);
    const baTu = data.characters.find((c) => c.id === "ba-tu");
    expect(baTu).toBeDefined();
    if (baTu) {
      baTu.appearances.pop();
    }

    const phatHien = kiemTraDieu4(data.characters, data.travelers);
    const loiDieu4 = phatHien.filter((p) => p.muc === "loi" && p.dieu === 4);
    expect(loiDieu4.length).toBeGreaterThan(0);
    expect(loiDieu4.some((p) => p.noi_dung.includes("ba-tu"))).toBe(true);
  });

  // V2-07: Đổi ho_ten trên GDD của bà Tư ở một lượt không cài E2 -> Lỗi điều 5
  it("V2-07: Đổi ho_ten trên GDD của bà Tư ở một lượt không cài E2 -> Lỗi điều 5", () => {
    const data = structuredClone(realData);
    // d1-t2 là lượt của bà Tư không cài E2
    const d1t2 = data.travelers.find((t) => t.id === "d1-t2");
    expect(d1t2).toBeDefined();
    const gdd = d1t2.documents.find((d: any) => d.type === "GDD");
    expect(gdd).toBeDefined();
    gdd.fields.ho_ten = "Trần Thị Lãnh"; // Sai tên

    const phatHien = kiemTraDieu5(data.characters, data.travelers, data.documents);
    const loiDieu5 = phatHien.filter((p) => p.muc === "loi" && p.dieu === 5);
    expect(loiDieu5.length).toBeGreaterThan(0);
    expect(loiDieu5.some((p) => p.noi_dung.includes("Trần Thị Lãnh"))).toBe(true);
  });

  // V2-08: Như V2-07 nhưng lượt đó có E2 trong planted -> Không lỗi
  it("V2-08: Như V2-07 nhưng lượt đó có E2 trong planted -> Không lỗi", () => {
    const data = structuredClone(realData);
    const d1t2 = data.travelers.find((t) => t.id === "d1-t2");
    expect(d1t2).toBeDefined();
    const gdd = d1t2.documents.find((d: any) => d.type === "GDD");
    gdd.fields.ho_ten = "Trần Thị Lãnh";
    // Thêm E2 vào planted
    d1t2.planted.push({ error: "E2", doc: "GDD", field: "ho_ten", note: "Cố ý cài lệch tên" });

    const phatHien = kiemTraDieu5(data.characters, data.travelers, data.documents);
    const loiDieu5 = phatHien.filter((p) => p.muc === "loi" && p.dieu === 5);
    expect(loiDieu5).toHaveLength(0);
  });

  // V2-09: Đổi tên một trường trong documents.json -> Lỗi điều 6
  it("V2-09: Đổi tên một trường trong documents.json -> Lỗi điều 6", () => {
    const data = structuredClone(realData);
    // Đổi trường "ho_ten" trong GDD thành "ten_ho"
    const gddDef = data.documents.find((d) => d.code === "GDD");
    expect(gddDef).toBeDefined();
    const f = gddDef.fields.find((field: any) => field.key === "ho_ten");
    if (f) f.key = "ten_ho";

    const phatHien = kiemTraDieu6(data.documents, data.travelersSchema);
    const loiDieu6 = phatHien.filter((p) => p.muc === "loi" && p.dieu === 6);
    expect(loiDieu6.length).toBeGreaterThan(0);
  });

  // V2-10: Đặt một GXNK vào lượt d2 -> Lỗi điều 7
  it("V2-10: Đặt một GXNK vào lượt d2 -> Lỗi điều 7", () => {
    const data = structuredClone(realData);
    // Thêm GXNK vào d2-t1
    const d2t1 = data.travelers.find((t) => t.id === "d2-t1");
    expect(d2t1).toBeDefined();
    d2t1.documents.push({
      type: "GXNK",
      fields: {
        ho_ten: "Nguyễn Văn A",
        xa: "Phú Hoà",
        htx_ten: "HTX Phú Hoà",
        san_pham: "Gạo",
        san_pham_ma: "gao",
        so_luong_kg: 5,
        vu: "Vụ mùa 1980",
        ngay: "1981-03-01",
      },
      seal: { kind: "HTX", place: "Phú Hoà", legible: true },
    });

    const phatHien = kiemTraDieu7(data.days, data.travelers, data.documents);
    const loiDieu7 = phatHien.filter((p) => p.muc === "loi" && p.dieu === 7);
    expect(loiDieu7.length).toBeGreaterThan(0);
    expect(loiDieu7.some((p) => p.noi_dung.includes("GXNK") && p.noi_dung.includes("d2-t1"))).toBe(true);
  });

  // V2-11: Thêm thuốc mã vitamin-b1 vào cargo -> Thông tin điều 8, không phải lỗi
  it("V2-11: Thêm thuốc mã vitamin-b1 vào cargo -> Thông tin điều 8, không phải lỗi", () => {
    const data = structuredClone(realData);
    data.travelers[0].cargo.push({
      ma: "vitamin-b1",
      ten: "Vitamin B1",
      so_luong: 20,
      don_vi: "vien",
      category: "THUOC",
    });

    const phatHien = kiemTraDieu8(data.travelers, data.rules);
    const loiDieu8 = phatHien.filter((p) => p.muc === "loi" && p.dieu === 8);
    const thongTinDieu8 = phatHien.filter((p) => p.muc === "thong_tin" && p.dieu === 8);

    expect(loiDieu8).toHaveLength(0);
    expect(thongTinDieu8.length).toBeGreaterThan(0);
    expect(thongTinDieu8.some((p) => p.noi_dung.includes("vitamin-b1"))).toBe(true);
  });

  // V2-12: Dòng hàng HANG_CAM có mã không nằm trong danh mục R6 -> Lỗi điều 9
  it("V2-12: Dòng hàng HANG_CAM có mã không nằm trong danh mục R6 -> Lỗi điều 9", () => {
    const data = structuredClone(realData);
    data.travelers[0].cargo.push({
      ma: "sung-ngan",
      ten: "Súng ngắn",
      so_luong: 1,
      don_vi: "chiec",
      category: "HANG_CAM",
    });

    const phatHien = kiemTraDieu9(data.travelers, data.rules);
    const loiDieu9 = phatHien.filter((p) => p.muc === "loi" && p.dieu === 9);
    expect(loiDieu9.length).toBeGreaterThan(0);
    expect(loiDieu9.some((p) => p.noi_dung.includes("sung-ngan"))).toBe(true);
  });

  // V2-13: Dòng hàng mã thuoc-phien nhưng nhóm HANG_TIEU_DUNG -> Lỗi điều 9
  it("V2-13: Dòng hàng mã thuoc-phien nhưng nhóm HANG_TIEU_DUNG -> Lỗi điều 9", () => {
    const data = structuredClone(realData);
    data.travelers[0].cargo.push({
      ma: "thuoc-phien",
      ten: "Thuốc phiện",
      so_luong: 1,
      don_vi: "kg",
      category: "HANG_TIEU_DUNG",
    });

    const phatHien = kiemTraDieu9(data.travelers, data.rules);
    const loiDieu9 = phatHien.filter((p) => p.muc === "loi" && p.dieu === 9);
    expect(loiDieu9.length).toBeGreaterThan(0);
    expect(loiDieu9.some((p) => p.noi_dung.includes("thuoc-phien") && p.noi_dung.includes("HANG_TIEU_DUNG"))).toBe(
      true,
    );
  });

  // V2-14: Hai lượt cùng flag_key -> Lỗi điều 10
  it("V2-14: Hai lượt cùng flag_key -> Lỗi điều 10", () => {
    const data = structuredClone(realData);
    // d1-t1 và d1-t2 cùng gán flag_key
    data.travelers[0].flag_key = "co-trung.m1";
    data.travelers[1].flag_key = "co-trung.m1";

    const phatHien = kiemTraDieu10(data.days, data.travelers);
    const loiDieu10 = phatHien.filter((p) => p.muc === "loi" && p.dieu === 10);
    expect(loiDieu10.length).toBeGreaterThan(0);
    expect(loiDieu10.some((p) => p.noi_dung.includes("co-trung.m1"))).toBe(true);
  });

  // V2-15: Điều kiện when dùng cờ ba-tu.m3 trong lượt d3 -> Lỗi điều 10 (cờ dùng trước khi được ghi)
  it("V2-15: Điều kiện when dùng cờ ba-tu.m3 trong lượt d3 -> Lỗi điều 10", () => {
    const data = structuredClone(realData);
    // d3-t3 (bà Tư) dùng cờ ba-tu.m3 (vốn chỉ được ghi ở d5-t1)
    const d3t3 = data.travelers.find((t) => t.id === "d3-t3");
    expect(d3t3).toBeDefined();
    d3t3.dialogue[2].when = [{ flag: "ba-tu.m3", in: ["qua"] }];

    const phatHien = kiemTraDieu10(data.days, data.travelers);
    const loiDieu10 = phatHien.filter((p) => p.muc === "loi" && p.dieu === 10);
    expect(loiDieu10.length).toBeGreaterThan(0);
    expect(loiDieu10.some((p) => p.noi_dung.includes("ba-tu.m3"))).toBe(true);
  });
});
