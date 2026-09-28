import { describe, expect, it } from "vitest";
import { measure, normalizeGain } from "./audio";

const RATE = 8000;

function sine(amp: number, seconds: number, silenceBefore = 0): Float32Array {
  const pad = Math.floor(RATE * silenceBefore);
  const n = Math.floor(RATE * seconds);
  const out = new Float32Array(pad + n);
  for (let i = 0; i < n; i++) out[pad + i] = amp * Math.sin((2 * Math.PI * 440 * i) / RATE);
  return out;
}

const db = (g: number) => 20 * Math.log10(g);

describe("audio — chuẩn hoá âm lượng", () => {
  it("AUD-01 đo RMS đúng: sóng sin biên độ 0.5 là khoảng −9 dBFS", () => {
    const { rmsDb, peak } = measure([sine(0.5, 1)], RATE);
    expect(rmsDb).toBeCloseTo(-9.03, 1);
    expect(peak).toBeCloseTo(0.5, 2);
  });

  it("AUD-02 khoảng lặng đầu file không làm file bị coi là nhỏ", () => {
    const a = measure([sine(0.5, 1)], RATE).rmsDb;
    const b = measure([sine(0.5, 1, 2)], RATE).rmsDb;
    expect(Math.abs(a - b)).toBeLessThan(0.5);
  });

  it("AUD-03 hai file to nhỏ khác nhau được đưa về cùng mức", () => {
    const loud = measure([sine(0.8, 1)], RATE);
    const quiet = measure([sine(0.05, 1)], RATE);
    const outLoud = loud.rmsDb + db(normalizeGain(loud.rmsDb, loud.peak, "sfx"));
    const outQuiet = quiet.rmsDb + db(normalizeGain(quiet.rmsDb, quiet.peak, "sfx"));
    expect(Math.abs(outLoud - outQuiet)).toBeLessThan(0.1);
    expect(outLoud).toBeCloseTo(-16, 1);
  });

  it("AUD-04 không khuếch đại quá đỉnh −1 dBFS và không quá +18 dB", () => {
    const spiky = { rmsDb: -40, peak: 0.5 };
    expect(normalizeGain(spiky.rmsDb, spiky.peak, "sfx") * spiky.peak).toBeLessThanOrEqual(0.89 + 1e-9);
    expect(normalizeGain(-80, 0.001, "sfx")).toBeLessThanOrEqual(8);
  });

  it("AUD-05 âm nền và nhạc đặt thấp hơn hiệu ứng", () => {
    expect(normalizeGain(-20, 0.1, "amb")).toBeLessThan(normalizeGain(-20, 0.1, "sfx"));
    expect(normalizeGain(-20, 0.1, "mus")).toBeLessThan(normalizeGain(-20, 0.1, "sfx"));
  });
});
