import { describe, expect, it } from "vitest";
import { content } from "../content";
import { confront, confrontLines, factsOf } from "./confront";
import { reduce } from "./game";
import { simulate, followRulebook } from "./simulate";
import type { Traveler, TravelerId } from "./types";

const t = (id: string) => content.travelers.find((x) => x.id === id) as Traveler;
/** Mã chỗ khoanh của trường `key` trên giấy loại `type`. */
const doc = (tid: string, type: string, key: string) => `d${t(tid).documents.findIndex((d) => d.type === type)}.${key}`;
const cs = { flags: {}, issuesTriggered: new Set<never>() };

describe("confront — đối chất (V8)", () => {
  it("CFR-01 anh Hùng d4: năm sinh trên giấy thương binh lệch hộ khẩu", () => {
    const r = confront(t("d4-t2"), content.documents, doc("d4-t2", "CNTB", "nam_sinh"), doc("d4-t2", "SHK", "nam_sinh"));
    expect(r).toMatchObject({ comparable: true, found: true, kind: "year" });
    expect(confrontLines(t("d4-t2"), r, cs)[0].text).toContain("Năm 76");
  });

  it("CFR-02 gã đầu cơ d5: tên trên giấy đi đường lệch hộ khẩu", () => {
    const r = confront(t("d5-t5"), content.documents, doc("d5-t5", "GDD", "ho_ten"), doc("d5-t5", "SHK", "ho_ten"));
    expect(r).toMatchObject({ found: true, kind: "name" });
  });

  it("CFR-03 thằng Tí d3: số quinin mang theo lệch đơn thuốc", () => {
    const r = confront(t("d3-t1"), content.documents, "c0", `${doc("d3-t1", "DT", "thuoc")}.0`);
    expect(r).toMatchObject({ found: true, kind: "item" });
  });

  it("CFR-04 người buôn thuốc lá d1: hàng mang theo không có trên danh sách khai", () => {
    const cargo = t("d1-t3").cargo.findIndex((c) => c.ma === "thuoc-la");
    const r = confront(t("d1-t3"), content.documents, `c${cargo}`, doc("d1-t3", "GDD", "hang_mang_theo"));
    expect(r.found).toBe(true);
  });

  it("CFR-05 khoanh hai chỗ khớp nhau: đối chất sai, nhân vật đáp theo mục khop", () => {
    const r = confront(t("d5-t2"), content.documents, doc("d5-t2", "GDD", "ho_ten"), doc("d5-t2", "SHK", "ho_ten"));
    expect(r).toMatchObject({ comparable: true, mismatch: false, found: false });
    expect(confrontLines(t("d5-t2"), r, cs)[0].speaker).toBe("ong-quynh");
  });

  it("CFR-06 hai chỗ khác loại thì không so được", () => {
    const r = confront(t("d4-t2"), content.documents, doc("d4-t2", "CNTB", "nam_sinh"), doc("d4-t2", "SHK", "ho_ten"));
    expect(r.comparable).toBe(false);
    expect(r.found).toBe(false);
    // Không lấy câu "khoanh nhầm" của nhân vật: giao diện hiện câu chung giải thích cách khoanh.
    expect(confrontLines(t("d4-t2"), r, cs)).toEqual([]);
  });

  it("CFR-07 mọi chỗ khoanh có mã duy nhất", () => {
    for (const tr of content.travelers) {
      const ids = factsOf(tr, content.documents).map((f) => f.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it("CFR-08 reducer: đối chất đúng rồi vẫn cho qua thì tính là biết mà vẫn làm; đối chất sai tốn 15 phút", () => {
    let s = simulate(content, followRulebook, { stopAt: "d4-t2" as TravelerId });
    const clock = s.clockMin;
    s = reduce(s, { type: "DOI_CHAT", a: doc("d4-t2", "SHK", "ho_ten"), b: doc("d4-t2", "GDD", "ho_ten") }, content);
    expect(s.clockMin).toBe(clock + 15);
    expect(s.turnConfrontFound).toBe(false);
    s = reduce(s, { type: "DOI_CHAT", a: doc("d4-t2", "CNTB", "nam_sinh"), b: doc("d4-t2", "SHK", "nam_sinh") }, content);
    expect(s.clockMin).toBe(clock + 15);
    expect(s.total).toMatchObject({ doi_chat: 2, doi_chat_dung: 1 });
    s = reduce(s, { type: "QUYET_DINH", action: "CHO_QUA", reasonId: null }, content);
    expect(s.total).toMatchObject({ doi_chat_bo_qua: 1, doi_chat_hanh_dong: 0 });
    expect(s.turnConfrontFound).toBe(false);
  });
});
