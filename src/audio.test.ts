import { describe, expect, it } from "vitest";
import { SOUNDS, clipLoop, clipSfx, findOnset, measure, normalizeGain } from "./audio";

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

describe("audio — giới hạn thời lượng từng âm", () => {
  it("AUD-06 bỏ khoảng lặng đầu file: âm bắt đầu gần như ngay lập tức", () => {
    const x = sine(0.5, 1, 0.5);
    const onset = findOnset([x], RATE);
    expect(onset / RATE).toBeGreaterThan(0.48);
    expect(onset / RATE).toBeLessThan(0.5);
    const [clip] = clipSfx([x], RATE, 0.3);
    expect(Math.abs(clip[Math.floor(RATE * 0.02)])).toBeGreaterThan(0);
  });

  it("AUD-07 file dài hơn maxS bị cắt đúng maxS và đuôi nhỏ dần về 0", () => {
    const [clip] = clipSfx([sine(0.5, 20, 0.5)], RATE, 0.5);
    expect(clip.length).toBe(Math.floor(RATE * 0.5));
    expect(Math.abs(clip[clip.length - 1])).toBeLessThan(1e-3);
    // Phần giữa không bị làm nhỏ
    expect(measure([clip.slice(0, RATE * 0.3)], RATE).rmsDb).toBeCloseTo(-9.03, 0);
  });

  it("AUD-08 file ngắn hơn maxS giữ nguyên phần có tiếng, không làm nhỏ đuôi", () => {
    const x = sine(0.5, 0.2);
    const [clip] = clipSfx([x], RATE, 1);
    expect(clip.length).toBe(x.length);
    expect(clip[clip.length - 5]).toBe(x[x.length - 5]);
  });

  it("AUD-09 âm nền dài bị cắt về maxS và điểm nối cuối–đầu liền mạch", () => {
    const x = sine(0.5, 10);
    const [loop] = clipLoop([x], RATE, 4);
    expect(loop.length).toBe(RATE * 4);
    // Mẫu kế tiếp sau mẫu cuối (tức mẫu đầu khi lặp) phải xấp xỉ mẫu gốc ngay sau điểm cắt.
    expect(Math.abs(loop[0] - x[RATE * 4])).toBeLessThan(0.02);
    const [short] = clipLoop([x], RATE, 20);
    expect(short).toBe(x);
  });

  it("AUD-10 mọi âm đều có giới hạn thời lượng hợp lý", () => {
    for (const [name, def] of Object.entries(SOUNDS)) {
      const cap = def.category === "sfx" ? 3 : 180;
      expect(def.maxS, name).toBeGreaterThan(0);
      expect(def.maxS, name).toBeLessThanOrEqual(cap);
    }
  });
});
