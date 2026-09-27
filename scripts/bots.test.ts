/**
 * bots.test.ts — Kiểm tra 4 bot chơi thử theo docs/08-cac-phase.md: BOT-01 đến BOT-06.
 */

import { describe, it, expect } from "vitest";
import { content } from "../src/content.js";
import { botTheoSo, botKienNghi, botLamNgo, botAnTien } from "./bots.js";
import { hiddenStats } from "../src/engine/endings.js";
import { evaluate } from "../src/engine/evaluate.js";
import { currentDay, issuesActiveOn } from "../src/engine/state.js";

describe("P5 — Bot playtesting (BOT-01..BOT-06)", () => {
  // BOT-01: Bot Theo sổ -> END-GAC-CONG; true_compliance = 1
  it("BOT-01: Bot Theo sổ đạt END-GAC-CONG và true_compliance = 1", () => {
    const state = botTheoSo(content);
    expect(state.phase).toBe("ENDING");
    expect(state.ending).toBe("END-GAC-CONG");

    const stats = hiddenStats(state);
    expect(stats.true_compliance).toBe(1);
    expect(stats.bribes_accepted).toBe(0);
    expect(stats.valid_reports).toBe(0);
    expect(stats.lam_ngo_violations).toBe(0);
  });

  // BOT-02: Bot Kiến nghị -> END-KIEN-NGHI; KN-KHOAN kích hoạt trước d5
  it("BOT-02: Bot Kiến nghị đạt END-KIEN-NGHI và KN-KHOAN kích hoạt trước d5", () => {
    const state = botKienNghi(content);
    expect(state.phase).toBe("ENDING");
    expect(state.ending).toBe("END-KIEN-NGHI");

    const stats = hiddenStats(state);
    expect(stats.valid_reports).toBeGreaterThanOrEqual(4);
    expect(stats.issues_triggered).toBeGreaterThanOrEqual(1);
    expect(stats.lam_ngo_violations).toBeLessThanOrEqual(1);

    // KN-KHOAN kích hoạt trước d5 (tức là triggeredOn === 'd3' hoặc 'd4')
    const khoanIssue = state.issues["KN-KHOAN"];
    expect(khoanIssue).toBeDefined();
    expect(khoanIssue?.triggeredOn).toMatch(/^(d3|d4)$/);
  });

  // BOT-03: Bot Làm ngơ -> END-LAM-NGO
  it("BOT-03: Bot Làm ngơ đạt END-LAM-NGO", () => {
    const state = botLamNgo(content);
    expect(state.phase).toBe("ENDING");
    expect(state.ending).toBe("END-LAM-NGO");

    const stats = hiddenStats(state);
    expect(stats.bribes_accepted).toBeLessThan(2);
    expect(stats.lam_ngo_violations).toBeGreaterThanOrEqual(4);
  });

  // BOT-04: Bot Ăn tiền -> END-AN-TIEN
  it("BOT-04: Bot Ăn tiền đạt END-AN-TIEN", () => {
    const state = botAnTien(content);
    expect(state.phase).toBe("ENDING");
    expect(state.ending).toBe("END-AN-TIEN");

    const stats = hiddenStats(state);
    expect(stats.bribes_accepted).toBeGreaterThanOrEqual(2);
  });

  // BOT-05: Cả bốn bot -> Chỉ số huyện không âm; không bot nào bị kẹt; tiền không âm
  it("BOT-05: Cả 4 bot chỉ số không âm, tiền không âm, không bị kẹt", () => {
    const bots = [
      { name: "Theo sổ", state: botTheoSo(content) },
      { name: "Kiến nghị", state: botKienNghi(content) },
      { name: "Làm ngơ", state: botLamNgo(content) },
      { name: "Ăn tiền", state: botAnTien(content) },
    ];

    for (const { name, state } of bots) {
      expect(state.phase, `${name} phải kết thúc ở phase ENDING`).toBe("ENDING");
      expect(state.indicators.luong_thuc_vao_thi_xa, `${name} lương thực không âm`).toBeGreaterThanOrEqual(0);
      expect(state.indicators.ho_thieu_an, `${name} hộ thiếu ăn không âm`).toBeGreaterThanOrEqual(0);
      expect(state.indicators.gia_gao_index, `${name} giá gạo không âm`).toBeGreaterThanOrEqual(0);
      expect(state.money, `${name} tiền không âm`).toBeGreaterThanOrEqual(0);
    }
  });

  // BOT-06: Bot Kiến nghị ở d5 -> Lượt bà Tư mang giấy khoán ra CHO_QUA
  it("BOT-06: Bot Kiến nghị ở d5 đánh giá lượt bà Tư mang giấy khoán (d5-t1) là CHO_QUA", () => {
    // Lấy lượt bà Tư ở d5
    const d5t1 = content.travelers.find((t) => t.id === "d5-t1");
    expect(d5t1).toBeDefined();

    const d5 = content.days.find((d) => d.id === "d5");
    expect(d5).toBeDefined();

    // Trong Bot Kiến nghị, KN-KHOAN đã kích hoạt trước d5, nên ở d5 issuesActive có KN-KHOAN
    const evalWithKhoan = evaluate(d5t1!, d5!, content, new Set(["KN-KHOAN"]));
    expect(evalWithKhoan.verdict).toBe("CHO_QUA");
    expect(evalWithKhoan.violations).toHaveLength(0);

    // Ngược lại, nếu KN-KHOAN chưa kích hoạt, bà Tư d5-t1 bị GIU_LAI
    const evalWithoutKhoan = evaluate(d5t1!, d5!, content, new Set());
    expect(evalWithoutKhoan.verdict).toBe("GIU_LAI");
    expect(evalWithoutKhoan.violations.some((v) => v.rule === "R2-DINH-MUC" && v.error === "E4")).toBe(true);
  });
});
