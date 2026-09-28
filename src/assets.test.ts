import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { content } from "./content";
import { SOUNDS, fileBase } from "./audio";
import { botTheoSo, botKienNghi, botLamNgo, botAnTien } from "../scripts/bots";

const ROOT = path.resolve(__dirname, "..");
const PORTRAITS_DIR = path.join(ROOT, "public", "art", "portraits");

describe("Asset tests (P7: ART-01 to ART-07)", () => {
  // ART-01: Kiểm tra đủ file chân dung cho mọi portrait.key và biểu cảm trong characters.json và travelers.json
  it("ART-01 mọi portrait.key và biểu cảm trong dữ liệu đều có file chân dung tại public/art/portraits/", () => {
    const requiredPortraits = new Set<string>();

    for (const c of content.characters) {
      for (const expr of c.portrait.expressions ?? []) {
        requiredPortraits.add(`${c.portrait.key}_${expr}`);
      }
    }

    for (const t of content.travelers) {
      const char = content.characters.find((c) => c.id === t.character);
      if (char) {
        const baseKey = t.portrait.key ?? char.portrait.key;
        requiredPortraits.add(`${baseKey}_${t.portrait.expression}`);
        for (const v of t.portrait.variants ?? []) {
          requiredPortraits.add(`${v.key ?? baseKey}_${v.expression ?? t.portrait.expression}`);
        }
      }
    }

    expect(requiredPortraits.size).toBeGreaterThan(0);

    for (const pair of requiredPortraits) {
      const svgPath = path.join(PORTRAITS_DIR, `${pair}.svg`);
      const exists = fs.existsSync(svgPath);
      expect(exists, `Thiếu file chân dung ${pair}.svg trong public/art/portraits/`).toBe(true);
      if (exists) {
        const stat = fs.statSync(svgPath);
        expect(stat.size).toBeGreaterThan(50);
      }
    }
  });

  // ART-02: Mọi âm trong danh mục đều có âm tổng hợp dự phòng hoặc là âm nền; font tự host có bộ chữ tiếng Việt
  it("ART-02 danh mục âm thanh đầy đủ và font tự host có tiếng Việt", () => {
    const audioSrc = fs.readFileSync(path.join(ROOT, "src", "audio.ts"), "utf-8");
    const doc = fs.readFileSync(path.join(ROOT, "docs", "09-am-thanh.md"), "utf-8");
    for (const name of Object.keys(SOUNDS) as (keyof typeof SOUNDS)[]) {
      if (SOUNDS[name].category === "sfx") {
        expect(audioSrc, `Thiếu âm tổng hợp dự phòng cho ${name}`).toMatch(new RegExp(`\\n  ${name}\\(ac, out, t\\)`));
      }
      expect(doc, `docs/09-am-thanh.md chưa mô tả file ${fileBase(name)}`).toContain(fileBase(name));
    }

    const mainSrc = fs.readFileSync(path.join(ROOT, "src", "main.tsx"), "utf-8");
    for (const font of ["noto-serif", "ibm-plex-mono", "space-mono"]) {
      expect(mainSrc).toContain(`@fontsource/${font}/`);
      const css = fs.readFileSync(path.join(ROOT, "node_modules", "@fontsource", font, "400.css"), "utf-8");
      expect(css, `Font ${font} thiếu bộ chữ tiếng Việt`).toContain("vietnamese");
    }
  });

  // ART-03: Kiểm tra không gọi CDN ngoài (Google Fonts, unpkg, v.v.)
  it("ART-03 mã nguồn không phụ thuộc CDN hay Google Fonts ngoài", () => {
    const indexHtml = fs.readFileSync(path.join(ROOT, "index.html"), "utf-8");
    const indexCss = fs.readFileSync(path.join(ROOT, "src", "index.css"), "utf-8");

    expect(indexHtml).not.toContain("fonts.googleapis.com");
    expect(indexHtml).not.toContain("fonts.gstatic.com");
    expect(indexHtml).not.toContain("cdn.jsdelivr.net");
    expect(indexHtml).not.toContain("unpkg.com");

    expect(indexCss).not.toContain("fonts.googleapis.com");
    expect(indexCss).not.toContain("fonts.gstatic.com");
  });

  // ART-05: Kiểm tra chân dung không dùng ảnh người thật
  it("ART-05 toàn bộ chân dung là vector silhouette không vi phạm bản quyền người thật", () => {
    const files = fs.readdirSync(PORTRAITS_DIR).filter((f) => f.endsWith(".svg"));
    expect(files.length).toBeGreaterThanOrEqual(51);

    for (const file of files) {
      const contentSvg = fs.readFileSync(path.join(PORTRAITS_DIR, file), "utf-8");
      // Phải là file vector svg với silhouette
      expect(contentSvg).toContain("<svg");
      expect(contentSvg).toContain("</svg>");
      expect(contentSvg).not.toContain("<image"); // Không nhúng ảnh chụp
    }
  });

  // ART-06: Vào từng kết cục có đủ cảnh, số phận nhân vật, câu trích có ghi chương, câu hỏi cuối
  it("ART-06 mọi kết cục đều có đủ cảnh, câu trích với chương, số phận nhân vật", () => {
    for (const ending of content.endings) {
      expect(ending.scenes.length).toBeGreaterThan(0);
      for (const scene of ending.scenes) {
        expect(scene.text.trim().length).toBeGreaterThan(10);
      }

      // Trích dẫn giáo trình có chương
      expect(ending.quote).toBeDefined();
      expect(ending.quote.chapter).toBeGreaterThan(0);
      expect(ending.quote.text.trim().length).toBeGreaterThan(10);

      // Số phận nhân vật
      expect(ending.character_lines.length).toBeGreaterThanOrEqual(1);

      // Thẻ lịch sử hoặc câu hỏi kết thúc
      expect(ending.title.trim().length).toBeGreaterThan(0);
    }

    // Chạy bot thử để kiểm tra các kết cục thực sự đạt được
    const endTheoSo = botTheoSo(content);
    expect(endTheoSo.ending).toBe("END-GAC-CONG");

    const endKienNghi = botKienNghi(content);
    expect(endKienNghi.ending).toBe("END-KIEN-NGHI");

    const endLamNgo = botLamNgo(content);
    expect(endLamNgo.ending).toBe("END-LAM-NGO");

    const endAnTien = botAnTien(content);
    expect(endAnTien.ending).toBe("END-AN-TIEN");
  });

  // ART-07: File âm thanh không dài quá giới hạn. Game đã cắt khi phát, nhưng file quá dài vẫn phải tải và giải mã trọn:
  // một file âm nền 15 phút giải mã ra hơn 300 MB bộ nhớ.
  it("ART-07 file âm thanh trong public/audio/ không dài quá giới hạn của từng âm", () => {
    const AUDIO_DIR = path.join(ROOT, "public", "audio");
    for (const name of Object.keys(SOUNDS) as (keyof typeof SOUNDS)[]) {
      const file = path.join(AUDIO_DIR, `${fileBase(name)}.mp3`);
      if (!fs.existsSync(file)) continue;
      const def = SOUNDS[name];
      // Cho phép khoảng lặng đầu và đuôi tắt dần: hiệu ứng thêm 2 giây, âm nền và nhạc thêm 10 giây.
      const limit = def.maxS + (def.category === "sfx" ? 2 : 10);
      const seconds = mp3Duration(fs.readFileSync(file));
      expect(seconds, `${fileBase(name)}.mp3 dài ${seconds.toFixed(1)} s, quá ${limit} s. Cắt bớt theo docs/09-am-thanh.md`).toBeLessThanOrEqual(limit);
    }
  });
});

/** Thời lượng MP3 (MPEG Layer III) tính bằng cách đếm khung. */
function mp3Duration(b: Buffer): number {
  const BR1 = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320];
  const BR2 = [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160];
  const SR: Record<number, number[]> = { 3: [44100, 48000, 32000], 2: [22050, 24000, 16000], 0: [11025, 12000, 8000] };
  let i = 0;
  if (b.toString("latin1", 0, 3) === "ID3") i = 10 + ((b[6] << 21) | (b[7] << 14) | (b[8] << 7) | b[9]);
  let seconds = 0;
  while (i + 4 <= b.length) {
    const h = b.readUInt32BE(i);
    const ver = (h >>> 19) & 3;
    const layer = (h >>> 17) & 3;
    const bri = (h >>> 12) & 15;
    const sri = (h >>> 10) & 3;
    if ((h >>> 21) !== 0x7ff || layer !== 1 || ver === 1 || bri === 0 || bri === 15 || sri === 3) {
      i++;
      continue;
    }
    const rate = SR[ver][sri];
    const kbps = (ver === 3 ? BR1 : BR2)[bri];
    i += Math.floor(((ver === 3 ? 144 : 72) * kbps * 1000) / rate) + ((h >>> 9) & 1);
    seconds += (ver === 3 ? 1152 : 576) / rate;
  }
  return seconds;
}
