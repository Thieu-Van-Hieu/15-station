import { describe, expect, it } from "vitest";
import { book, gdd, item, seal, tp } from "./__fixtures__";
import { covers, docDef, isExpired, isPastDate, isSealValid, sameText } from "./compare";

describe("compare — 03 mục 2.2", () => {
  it("CMP-01 khác một dấu thanh là khác", () => {
    expect(sameText("Trần Thị Lành", "Trần Thị Lanh")).toBe(false);
  });

  it("CMP-02 NFC và NFD của cùng một chuỗi là bằng", () => {
    const nfd = "Trần Thị Lành".normalize("NFD");
    expect(nfd).not.toBe("Trần Thị Lành");
    expect(sameText(nfd, "Trần Thị Lành")).toBe(true);
  });

  it("CMP-03 bỏ khoảng trắng đầu cuối, gộp khoảng trắng giữa", () => {
    expect(sameText("  Trần  Thị Lành ", "Trần Thị Lành")).toBe(true);
  });

  it("CMP-04 giữ hoa thường", () => {
    expect(sameText("trần thị lành", "Trần Thị Lành")).toBe(false);
  });

  it("CMP-05 hạn đúng bằng hôm nay vẫn còn hạn", () => {
    expect(isPastDate("1981-03-20", "1981-03-20")).toBe(false);
  });

  it("CMP-06 quá hạn một ngày là hết hạn", () => {
    expect(isPastDate("1981-03-20", "1981-03-19")).toBe(true);
  });

  it("CMP-07 tem phiếu chỉ hợp lệ trong đúng tháng", () => {
    const def = docDef(book.documents, "TP");
    expect(isExpired(tp({ thang: "1981-03" }), def, "1981-03-16")).toBe(false);
    expect(isExpired(tp({ thang: "1981-02" }), def, "1981-03-16")).toBe(true);
  });

  it("CMP-08 cùng mã, cùng đơn vị, đủ số lượng là phủ", () => {
    expect(covers([item("gao", 18)], item("gao", 18))).toBe(true);
  });

  it("CMP-09 khai ít hơn hàng thực là không phủ", () => {
    expect(covers([item("gao", 18)], item("gao", 20))).toBe(false);
  });

  it("CMP-10 khác đơn vị là không phủ", () => {
    expect(covers([item("gao", 18)], item("gao", 18, "bao"))).toBe(false);
  });

  it("CMP-11 so theo mã, không theo tên hiển thị", () => {
    expect(covers([item("gao", 18, "kg", "Gạo tẻ")], item("gao", 18, "kg", "Gạo"))).toBe(true);
  });

  it("CMP-12 dấu null, dấu mờ, dấu sai cơ quan đều không hợp lệ", () => {
    expect(isSealValid(gdd({}, null), ["UBND_XA"], "noi_di")).toBe(false);
    expect(isSealValid(gdd({}, seal("UBND_XA", "Phú Hoà", false)), ["UBND_XA"], "noi_di")).toBe(false);
    expect(isSealValid(gdd({}, seal("UBND_HUYEN")), ["UBND_XA"], "noi_di")).toBe(false);
  });

  it("CMP-13 dấu đóng sai nơi là không hợp lệ", () => {
    expect(isSealValid(gdd({ noi_di: "Phú Hoà" }, seal("UBND_XA", "Phú Mỹ")), ["UBND_XA"], "noi_di")).toBe(false);
  });

  it("CMP-14 dấu đúng loại, đúng nơi, rõ là hợp lệ", () => {
    expect(isSealValid(gdd({ noi_di: "Phú Hoà" }, seal("UBND_XA", "Phú Hoà")), ["UBND_XA"], "noi_di")).toBe(true);
  });
});
