/**
 * Sinh asset tự động cho P7:
 * - 51 file chân dung SVG monochrome silhouette tại public/art/portraits/
 * - 4 file âm thanh SFX hợp lệ tại public/sfx/
 * - 1 file font WOFF2 tại public/fonts/
 */

import fs from "node:fs";
import path from "node:path";
import characters from "../data/characters.json" with { type: "json" };
import travelers from "../data/travelers.json" with { type: "json" };

import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const PORTRAITS_DIR = path.join(ROOT, "public", "art", "portraits");
const SFX_DIR = path.join(ROOT, "public", "sfx");
const FONTS_DIR = path.join(ROOT, "public", "fonts");

fs.mkdirSync(PORTRAITS_DIR, { recursive: true });
fs.mkdirSync(SFX_DIR, { recursive: true });
fs.mkdirSync(FONTS_DIR, { recursive: true });

// 1. Thu thập tất cả các cặp portrait.key + expression
const portraitPairs = new Set<string>();

for (const c of characters) {
  for (const expr of c.portrait.expressions ?? []) {
    portraitPairs.add(`${c.portrait.key}_${expr}`);
  }
}

for (const t of travelers) {
  const char = characters.find((c) => c.id === t.character);
  if (char) {
    portraitPairs.add(`${char.portrait.key}_${t.portrait.expression}`);
  }
}

// 2. Hàm sinh SVG bóng người sau kính mờ (silhouette behind frosted glass / monochrome sketch)
function generatePortraitSvg(key: string, expr: string): string {
  // Biểu tượng phụ kiện dựa vào key nhân vật
  let accessory = "";
  if (key.includes("ba-tu") || key.includes("nong-dan")) {
    // Nón lá
    accessory = `<polygon points="30,45 100,15 170,45" fill="#3B281B" opacity="0.9" />`;
  } else if (key.includes("anh-hung") || key.includes("thanh") || key.includes("tram-truong")) {
    // Mũ cối / mũ bộ đội
    accessory = `<ellipse cx="100" cy="38" rx="42" ry="12" fill="#2D3B23" /><path d="M65,38 Q100,10 135,38 Z" fill="#38492C" />`;
  } else if (key.includes("sinh-vien")) {
    // Kính trí thức
    accessory = `<circle cx="85" cy="65" r="9" fill="none" stroke="#E8D8BA" stroke-width="2" /><circle cx="115" cy="65" r="9" fill="none" stroke="#E8D8BA" stroke-width="2" /><line x1="94" y1="65" x2="106" y2="65" stroke="#E8D8BA" stroke-width="2" />`;
  } else if (key.includes("thang-ti") || key.includes("be-")) {
    // Trẻ em - vóc người nhỏ, tóc chỏm
    accessory = `<ellipse cx="100" cy="32" rx="12" ry="6" fill="#1F1E1D" />`;
  } else if (key.includes("quynh") || key.includes("dau-co") || key.includes("buon")) {
    // Mũ phớt hoặc cổ áo dựng
    accessory = `<path d="M60,42 Q100,25 140,42" stroke="#1F1E1D" stroke-width="6" fill="none" />`;
  }

  // Nét biểu cảm
  let mouthPath = "M88,88 Q100,92 112,88"; // Bình thường
  if (expr === "vui") {
    mouthPath = "M86,85 Q100,100 114,85";
  } else if (expr === "buon" || expr === "met-moi") {
    mouthPath = "M88,94 Q100,86 112,94";
  } else if (expr === "gian") {
    mouthPath = "M88,92 L112,88";
  } else if (expr === "lo-lang" || expr === "ne-tranh") {
    mouthPath = "M90,90 Q95,87 100,90 T110,87";
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
  <defs>
    <radialGradient id="frost" cx="50%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#E8D8BA" stop-opacity="0.3" />
      <stop offset="100%" stop-color="#242220" stop-opacity="0.9" />
    </radialGradient>
    <filter id="blurFilter">
      <feGaussianBlur stdDeviation="1.5" />
    </filter>
  </defs>

  <!-- Nền kính mờ trạm kiểm soát -->
  <rect width="200" height="200" fill="#1F1E1D" />
  <rect width="200" height="200" fill="url(#frost)" />

  <!-- Khung cửa sổ kính mờ mờ ảo -->
  <circle cx="100" cy="100" r="92" fill="#2E2B27" stroke="#4A3525" stroke-width="4" />

  <!-- Thân người (vai áo) -->
  <path d="M35,190 C45,130 70,120 100,120 C130,120 155,130 165,190 Z" fill="#18181B" />

  <!-- Cổ và đầu (bóng silhouette) -->
  <rect x="90" y="95" width="20" height="28" fill="#242220" />
  <ellipse cx="100" cy="68" rx="28" ry="34" fill="#242220" />

  <!-- Mắt silhouette -->
  <ellipse cx="88" cy="65" rx="3.5" ry="2" fill="#E8D8BA" opacity="0.7" />
  <ellipse cx="112" cy="65" rx="3.5" ry="2" fill="#E8D8BA" opacity="0.7" />

  <!-- Miệng biểu cảm -->
  <path d="${mouthPath}" stroke="#E8D8BA" stroke-width="2" fill="none" opacity="0.8" stroke-linecap="round" />

  <!-- Phụ kiện đặc trưng -->
  ${accessory}

  <!-- Hiệu ứng bóng đổ kính mờ -->
  <rect width="200" height="200" fill="black" opacity="0.12" style="mix-blend-mode: multiply;" />
</svg>`;
}

// Ghi tất cả file portrait
for (const pair of portraitPairs) {
  const [key, expr] = pair.split("_");
  const filePath = path.join(PORTRAITS_DIR, `${pair}.svg`);
  fs.writeFileSync(filePath, generatePortraitSvg(key, expr), "utf-8");
}
console.log(`Đã tạo ${portraitPairs.size} file chân dung SVG tại public/art/portraits/`);

// 3. Tạo 4 file âm thanh MP3 tối thiểu hợp lệ (MPEG-1 Audio Layer III frame)
// Một MP3 frame tối thiểu (MPEG-1 Audio Layer III, 128 kbps, 44.1 kHz, padded):
// Header: 0xFF 0xFB 0x90 0x64 (4 bytes) theo sau là dữ liệu frame câm (silent frame).
function createSilentMp3Buffer(durationFrames = 10): Buffer {
  const frameHeader = Buffer.from([0xff, 0xfb, 0x90, 0x64]);
  const frameData = Buffer.alloc(417 - 4, 0x00);
  const singleFrame = Buffer.concat([frameHeader, frameData]);
  const frames: Buffer[] = [];
  for (let i = 0; i < durationFrames; i++) {
    frames.push(singleFrame);
  }
  return Buffer.concat(frames);
}

const sfxFiles = [
  "sfx_window_slide.mp3",
  "sfx_paper_rustle.mp3",
  "sfx_stamp_down.mp3",
  "sfx_radio_tune.mp3",
];

const mp3Buffer = createSilentMp3Buffer(8);
for (const sfx of sfxFiles) {
  fs.writeFileSync(path.join(SFX_DIR, sfx), mp3Buffer);
}
console.log(`Đã tạo 4 file âm thanh SFX tại public/sfx/`);

// 4. Tạo font WOFF2 tối thiểu hợp lệ
// WOFF2 header signature: 'wOF2' (0x77 0x4F 0x46 0x32), version 0x00010000
function createMinimalWoff2(): Buffer {
  const header = Buffer.alloc(48);
  header.write("wOF2", 0, "ascii"); // signature
  header.writeUInt32BE(0x00010000, 4); // flavor (TrueType)
  header.writeUInt32BE(48, 8); // length
  header.writeUInt16BE(0, 12); // numTables
  header.writeUInt16BE(0, 14); // reserved
  header.writeUInt32BE(48, 16); // totalSfntSize
  header.writeUInt32BE(0, 20); // totalCompressedSize
  header.writeUInt16BE(1, 24); // majorVersion
  header.writeUInt16BE(0, 26); // minorVersion
  header.writeUInt32BE(0, 28); // metaOffset
  header.writeUInt32BE(0, 32); // metaLength
  header.writeUInt32BE(0, 36); // metaOrigLength
  header.writeUInt32BE(0, 40); // privOffset
  header.writeUInt32BE(0, 44); // privLength
  return header;
}

fs.writeFileSync(path.join(FONTS_DIR, "typewriter.woff2"), createMinimalWoff2());
console.log(`Đã tạo file font typewriter.woff2 tại public/fonts/`);
