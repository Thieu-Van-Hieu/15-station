import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { content } from "./content";
import { SOUNDS, fileBase } from "./audio";
import { botTheoSo, botKienNghi, botLamNgo, botAnTien } from "../scripts/bots";

const ROOT = path.resolve(__dirname, "..");
const PORTRAITS_DIR = path.join(ROOT, "public", "art", "portraits");

describe("Asset tests (P7: ART-01 to ART-06)", () => {
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
});
