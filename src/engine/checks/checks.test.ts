import { describe, expect, it } from "vitest";
import {
  book,
  cntb,
  dt,
  gdd,
  goods,
  gpvc,
  gxnk,
  hdhtx,
  item,
  runCheck,
  seal,
  shk,
  tp,
  traveler,
} from "../__fixtures__";
import { docDef } from "../compare";
import { evaluate } from "../evaluate";
import { GAME_DATE } from "../__fixtures__";

describe("R1-GDD — 03 mục 4.2 (ngày d1)", () => {
  const r1 = (t: Parameters<typeof runCheck>[1]) => runCheck("R1-GDD", t, "d1");

  it("R1-01 không có GDD thì chỉ E5, dừng R1", () => {
    expect(r1(traveler({ cargo: [goods("thuoc-la", 8, "HANG_TIEU_DUNG", "cay")] }))).toEqual(["E5"]);
  });

  it("R1-02 GDD hết hạn đúng một ngày", () => {
    expect(r1(traveler({ documents: [gdd({ co_gia_tri_den: "1979-10-14" })] }))).toEqual(["E1"]);
  });

  it("R1-03 GDD đóng dấu UBND huyện", () => {
    expect(r1(traveler({ documents: [gdd({}, seal("UBND_HUYEN"))] }))).toEqual(["E3"]);
  });

  it("R1-04 lý do thăm thân, không khai, mang 8 cây thuốc lá", () => {
    const t = traveler({
      documents: [gdd({ ly_do: "Thăm thân", hang_mang_theo: [] })],
      cargo: [goods("thuoc-la", 8, "HANG_TIEU_DUNG", "cay")],
    });
    expect(r1(t)).toEqual(["E6"]);
  });

  it("R1-05 đồ cá nhân không cần khai", () => {
    expect(r1(traveler({ documents: [gdd()], cargo: [goods("quan-ao", 2, "DO_CA_NHAN")] }))).toEqual([]);
  });

  it("R1-06 hàng giấu vẫn bị kiểm", () => {
    const t = traveler({ documents: [gdd()], cargo: [{ ...goods("thuoc-la", 8, "HANG_TIEU_DUNG", "cay"), an_giau: true }] });
    expect(r1(t)).toEqual(["E6"]);
  });

  it("R1-07 hai mặt hàng không khai chỉ sinh E6 một lần", () => {
    const t = traveler({
      documents: [gdd()],
      cargo: [goods("thuoc-la", 8, "HANG_TIEU_DUNG", "cay"), goods("vai", 10, "HANG_TIEU_DUNG", "met")],
    });
    expect(r1(t)).toEqual(["E6"]);
  });

  it("R1-08 hết hạn và sai dấu cùng lúc", () => {
    expect(r1(traveler({ documents: [gdd({ co_gia_tri_den: "1979-10-01" }, seal("UBND_XA", "Phú Mỹ"))] }))).toEqual([
      "E1",
      "E3",
    ]);
  });
});

describe("R2-DINH-MUC và R5K — 03 mục 4.3 (ngày d2 trừ khi ghi khác)", () => {
  const khai = (kg: number) => gdd({ hang_mang_theo: [item("gao", kg)] });

  it("R2-01 đúng 5 kg", () => {
    expect(runCheck("R2-DINH-MUC", traveler({ cargo: [goods("gao", 5, "LUONG_THUC")] }), "d2")).toEqual([]);
  });

  it("R2-02 5,5 kg là vượt", () => {
    expect(runCheck("R2-DINH-MUC", traveler({ cargo: [goods("gao", 5.5, "LUONG_THUC")] }), "d2")).toEqual(["E4"]);
  });

  it("R2-03 cộng mọi dòng lương thực", () => {
    const t = traveler({ cargo: [goods("gao", 3, "LUONG_THUC"), goods("ngo", 3, "LUONG_THUC")] });
    expect(runCheck("R2-DINH-MUC", t, "d2")).toEqual(["E4"]);
  });

  it("R2-04 chỉ cộng dòng có đơn vị kg", () => {
    expect(runCheck("R2-DINH-MUC", traveler({ cargo: [goods("gao", 2, "LUONG_THUC", "bao")] }), "d2")).toEqual([]);
  });

  it("R2-05 không mang lương thực thì bỏ qua", () => {
    expect(runCheck("R2-DINH-MUC", traveler({ cargo: [goods("vai", 5, "HANG_TIEU_DUNG", "met")] }), "d2")).toEqual([]);
  });

  it("R2-06 tem phiếu hợp lệ được cộng vào định mức", () => {
    const t = traveler({ documents: [tp({ thang: "1979-10", mat_hang: item("gao", 13) })], cargo: [goods("gao", 18, "LUONG_THUC")] });
    expect(runCheck("R2-DINH-MUC", t, "d2")).toEqual([]);
  });

  it("R2-07 tem phiếu tháng trước không được cộng, và không sinh E1", () => {
    const t = traveler({ documents: [tp({ thang: "1979-09", mat_hang: item("gao", 13) })], cargo: [goods("gao", 18, "LUONG_THUC")] });
    expect(runCheck("R2-DINH-MUC", t, "d2")).toEqual(["E4"]);
  });

  it("R2-08 tem phiếu khác mã hàng không được cộng", () => {
    const t = traveler({ documents: [tp({ mat_hang: item("ngo", 13) })], cargo: [goods("gao", 18, "LUONG_THUC")] });
    expect(runCheck("R2-DINH-MUC", t, "d2")).toEqual(["E4"]);
  });

  it("R2-09 d3: giấy khoán chưa được công nhận", () => {
    const t = traveler({ documents: [khai(18), gxnk()], cargo: [goods("gao", 18, "LUONG_THUC")] });
    expect(runCheck("R2-DINH-MUC", t, "d3")).toEqual(["E4"]);
  });

  it("R2-10 d5, R5K hiệu lực: giấy khoán hợp lệ nới hạn mức", () => {
    const t = traveler({ documents: [khai(18), gxnk()], cargo: [goods("gao", 18, "LUONG_THUC")] });
    expect(runCheck("R2-DINH-MUC", t, "d5", new Set(["KN-KHOAN"]))).toEqual([]);
  });

  it("R2-11 dấu giấy khoán đóng ở xã khác", () => {
    const t = traveler({ documents: [khai(18), gxnk({}, seal("HTX", "Phú Mỹ"))], cargo: [goods("gao", 18, "LUONG_THUC")] });
    expect(runCheck("R2-DINH-MUC", t, "d5", new Set(["KN-KHOAN"]))).toEqual(["E4"]);
  });

  it("R2-12 tên trên giấy khoán khác GDD", () => {
    const t = traveler({ documents: [khai(18), gxnk({ ho_ten: "Trần Thị Lãnh" })], cargo: [goods("gao", 18, "LUONG_THUC")] });
    expect(runCheck("R2-DINH-MUC", t, "d5", new Set(["KN-KHOAN"]))).toEqual(["E4"]);
  });

  it("R2-13 không có GDD thì giấy khoán không được cộng", () => {
    const t = traveler({ documents: [gxnk()], cargo: [goods("gao", 18, "LUONG_THUC")] });
    expect(runCheck("R2-DINH-MUC", t, "d5", new Set(["KN-KHOAN"]))).toEqual(["E4"]);
  });

  it("R2-14 giấy khoán cho sản phẩm khác", () => {
    const t = traveler({ documents: [khai(18), gxnk({ san_pham_ma: "ngo" })], cargo: [goods("gao", 18, "LUONG_THUC")] });
    expect(runCheck("R2-DINH-MUC", t, "d5", new Set(["KN-KHOAN"]))).toEqual(["E4"]);
  });
});

describe("R3-DON-THUOC — 03 mục 4.4 (ngày d3)", () => {
  const r3 = (t: Parameters<typeof runCheck>[1]) => runCheck("R3-DON-THUOC", t, "d3");
  const peni = (n: number) => goods("penicillin", n, "THUOC", "vien");

  it("R3-01 thuốc ngoài danh mục thì bỏ qua", () => {
    expect(r3(traveler({ cargo: [goods("vitamin-b1", 20, "THUOC", "vien")] }))).toEqual([]);
  });

  it("R3-02 thuốc quản lý không có đơn", () => {
    expect(r3(traveler({ cargo: [peni(10)] }))).toEqual(["E5"]);
  });

  it("R3-03 đơn thuốc hết hạn", () => {
    expect(r3(traveler({ documents: [dt({ thuoc: [item("penicillin", 10, "vien")], co_gia_tri_den: "1981-03-15" })], cargo: [peni(10)] }))).toEqual(["E1"]);
  });

  it("R3-04 đơn thuốc đóng dấu trạm y tế xã", () => {
    expect(r3(traveler({ documents: [dt({ thuoc: [item("penicillin", 10, "vien")] }, seal("TRAM_Y_TE"))], cargo: [peni(10)] }))).toEqual(["E3"]);
  });

  it("R3-05 mang nhiều hơn số lượng kê", () => {
    expect(r3(traveler({ documents: [dt({ thuoc: [item("penicillin", 10, "vien")] })], cargo: [peni(20)] }))).toEqual(["E6"]);
  });

  it("R3-06 người mang đơn không cần là bệnh nhân", () => {
    const t = traveler({
      character: "thang-ti",
      documents: [dt({ benh_nhan: "Nguyễn Văn Tám", thuoc: [item("penicillin", 10, "vien")] })],
      cargo: [peni(10)],
    });
    expect(r3(t)).toEqual([]);
  });
});

describe("R4-KHOP-TEN — 03 mục 4.5 (ngày d4)", () => {
  const r4 = (t: Parameters<typeof runCheck>[1]) => runCheck("R4-KHOP-TEN", t, "d4");

  it("R4-01 không có SHK", () => {
    expect(r4(traveler({ documents: [gdd()] }))).toEqual(["E5"]);
  });

  it("R4-02 lệch một dấu thanh giữa GDD và SHK", () => {
    expect(r4(traveler({ documents: [gdd({ ho_ten: "Trần Thị Lãnh" }), shk()] }))).toEqual(["E2"]);
  });

  it("R4-03 năm sinh trên CNTB lệch 1", () => {
    expect(r4(traveler({ documents: [gdd(), shk(), cntb({ nam_sinh: 1930 })] }))).toEqual(["E2"]);
  });

  it("R4-04 lệch cả tên lẫn năm sinh chỉ sinh E2 một lần", () => {
    expect(r4(traveler({ documents: [gdd({ ho_ten: "Trần Thị Lãnh", nam_sinh: 1930 }), shk()] }))).toEqual(["E2"]);
  });

  it("R4-05 DT và HDHTX không có trường chủ giấy nên không bị so", () => {
    expect(r4(traveler({ documents: [gdd(), shk(), dt({ benh_nhan: "Người khác" }), hdhtx({ nguoi_nhan: "HTX khác" })] }))).toEqual([]);
  });

  it("R4-06 cùng dữ liệu ở d3 thì lỗi còn ngủ", () => {
    const t = traveler({ documents: [gdd({ ho_ten: "Trần Thị Lãnh" }), shk()] });
    expect(evaluate(t, { id: "d3", game_date: GAME_DATE.d3 }, book, new Set()).violations).toEqual([]);
  });
});

describe("R5-CHUNG-TU — 03 mục 4.6 (ngày d5)", () => {
  const r5 = (t: Parameters<typeof runCheck>[1]) => runCheck("R5-CHUNG-TU", t, "d5");
  const duong = goods("duong", 200, "THUC_PHAM");
  const phuDuong = [item("duong", 200)];

  it("R5-01 chỉ mang gạo thì bỏ qua", () => {
    expect(r5(traveler({ cargo: [goods("gao", 5, "LUONG_THUC")] }))).toEqual([]);
  });

  it("R5-02 không có chứng từ nào", () => {
    expect(r5(traveler({ cargo: [duong] }))).toEqual(["E5"]);
  });

  it("R5-03 chỉ có giấy phép hết hạn: E1 và không được tính là phủ", () => {
    expect(r5(traveler({ documents: [gpvc({ mat_hang: phuDuong, co_gia_tri_den: "1986-04-13" })], cargo: [duong] }))).toEqual(["E1", "E6"]);
  });

  it("R5-04 chỉ có hoá đơn dấu mờ", () => {
    expect(r5(traveler({ documents: [hdhtx({ mat_hang: phuDuong }, seal("HTX", "Phú Hoà", false))], cargo: [duong] }))).toEqual(["E3", "E6"]);
  });

  it("R5-05 một hoá đơn dấu mờ và một giấy phép hợp lệ phủ đủ", () => {
    const t = traveler({
      documents: [hdhtx({ mat_hang: phuDuong }, seal("HTX", "Phú Hoà", false)), gpvc({ mat_hang: phuDuong })],
      cargo: [duong],
    });
    expect(r5(t)).toEqual(["E3"]);
  });

  it("R5-06 ông Quỳnh đủ giấy, dấu thật", () => {
    expect(r5(traveler({ character: "ong-quynh", documents: [gpvc({ mat_hang: phuDuong })], cargo: [duong] }))).toEqual([]);
  });
});

describe("R6-HANG-CAM — 03 mục 4.8 (ngày d6)", () => {
  it("R6-01 thuốc phiện vi phạm, không gắn mã lỗi", () => {
    expect(runCheck("R6-HANG-CAM", traveler({ cargo: [goods("thuoc-phien", 1, "HANG_CAM")] }), "d6")).toEqual([null]);
  });

  it("R6-02 d6 không cần giấy tờ", () => {
    const t = traveler({ cargo: [goods("gao", 18, "LUONG_THUC")] });
    expect(evaluate(t, { id: "d6", game_date: GAME_DATE.d6 }, book, new Set())).toEqual({ verdict: "CHO_QUA", violations: [] });
  });
});

describe("rules.json khớp documents.json", () => {
  it("dấu và nơi đóng dấu khai trong params trùng với loại giấy", () => {
    for (const rule of book.rules) {
      const p = rule.params as { doc?: string; seal_kinds?: string[]; seal_place_field?: string };
      if (p.doc === undefined || p.seal_kinds === undefined) continue;
      const def = docDef(book.documents, p.doc as "GDD");
      expect(p.seal_kinds, rule.id).toEqual(def.allowed_seal_kinds);
      if (p.seal_place_field !== undefined) expect(p.seal_place_field, rule.id).toBe(def.seal_place_field);
    }
  });
});
