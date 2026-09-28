/**
 * Sinh chân dung nhân vật dạng tranh phác thảo mực nâu đơn sắc (05-art-brief.md mục 1):
 * mỗi nhân vật có trang phục, tóc, mũ và nét mặt riêng theo `portrait.description` trong characters.json,
 * mỗi biểu cảm đổi lông mày, mắt, miệng. Ghi ra public/art/portraits/<key>_<biểu cảm>.svg.
 *
 * Chạy: pnpm art
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import characters from "../data/characters.json" with { type: "json" };
import travelers from "../data/travelers.json" with { type: "json" };

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "public", "art", "portraits");

// ---------------------------------------------------------------------------
// Bảng màu sepia
// ---------------------------------------------------------------------------

const C = {
  giay: "#efe3c8",
  da: "#dcc6a2",
  daBong: "#bfa27a",
  sang: "#cdb48c",
  vua: "#a88a62",
  tram: "#7a6247",
  sam: "#4f3f2e",
  denNau: "#2e251c",
  muc: "#1c1712",
  son: "#a83a2c",
};

type Expr = "binh-thuong" | "vui" | "lo-lang" | "buon" | "gian" | "ne-tranh" | "met-moi";

type Outfit =
  | "quan-phuc"
  | "ao-nau"
  | "ao-linh-cut-tay"
  | "dai-can"
  | "ao-coc-rach"
  | "so-mi-tui-vai"
  | "ao-hoa"
  | "hoc-sinh"
  | "ao-tre-nho"
  | "ba-ba-sam"
  | "so-mi-ba-lo"
  | "ao-mua-bao-tai"
  | "so-mi-tang"
  | "ao-ba-lo-co-bap"
  | "ao-nau-khoan"
  | "bao-bao"
  | "ao-cham";

type Head =
  | "mu-kepi"
  | "non-la"
  | "toc-ngan"
  | "toc-chai-muot"
  | "toc-choam"
  | "toc-buoc-thap"
  | "mu-coi"
  | "toc-bui"
  | "toc-tet"
  | "toc-be"
  | "toc-bac-bui"
  | "duoi-ga"
  | "toc-bu-xu"
  | "khan-tang"
  | "khan-ran"
  | "khan-cham";

interface Spec {
  outfit: Outfit;
  head: Head;
  /** Tỉ lệ cả người (trẻ em nhỏ hơn). */
  scale?: number;
  /** Nửa bề ngang vai. */
  shoulder?: number;
  headRx?: number;
  headRy?: number;
  features?: ("ria" | "rau-lom-chom" | "mat-ti-hi" | "nep-nhan" | "ma-hop" | "beo" | "mo-hoi" | "mat-to" | "gay")[];
  /** Tông da: người làm đồng da sẫm hơn. */
  skin?: "sang" | "sam";
}

const SPECS: Record<string, Spec> = {
  thanh: { outfit: "quan-phuc", head: "mu-kepi" },
  "ba-tu": { outfit: "ao-nau", head: "non-la", features: ["nep-nhan"], skin: "sam" },
  "anh-hung": { outfit: "ao-linh-cut-tay", head: "toc-ngan", features: ["ma-hop"] },
  "ong-quynh": { outfit: "dai-can", head: "toc-chai-muot", shoulder: 54, headRx: 33, headRy: 36, features: ["beo"] },
  "thang-ti": { outfit: "ao-coc-rach", head: "toc-choam", scale: 0.84, shoulder: 34, headRx: 29, headRy: 33, features: ["mat-to", "gay"], skin: "sam" },
  "chi-thu": { outfit: "so-mi-tui-vai", head: "toc-buoc-thap" },
  "tram-truong-doi": { outfit: "quan-phuc", head: "mu-coi", features: ["ria", "nep-nhan"], shoulder: 48 },
  hoa: { outfit: "ao-hoa", head: "toc-bui", headRx: 27 },
  "be-mai": { outfit: "hoc-sinh", head: "toc-tet", scale: 0.82, shoulder: 34, headRx: 28, headRy: 32, features: ["mat-to"] },
  "be-binh": { outfit: "ao-tre-nho", head: "toc-be", scale: 0.8, shoulder: 36, headRx: 34, headRy: 34, features: ["mat-to", "gay"] },
  "me-thanh": { outfit: "ba-ba-sam", head: "toc-bac-bui", features: ["nep-nhan", "ma-hop"], headRx: 27 },
  "np-sinh-vien": { outfit: "so-mi-ba-lo", head: "duoi-ga", headRx: 27 },
  "np-buon-thuoc-la": { outfit: "ao-mua-bao-tai", head: "toc-bu-xu", features: ["ma-hop", "gay"], skin: "sam" },
  "np-nguoi-dua-tang": { outfit: "so-mi-tang", head: "khan-tang", features: ["nep-nhan"] },
  "np-dau-co-gao": { outfit: "ao-ba-lo-co-bap", head: "toc-ngan", shoulder: 56, features: ["mo-hoi"], skin: "sam" },
  "np-dau-co-vai": { outfit: "ao-nau", head: "khan-ran", headRx: 27 },
  "np-nong-dan-khoan": { outfit: "ao-nau-khoan", head: "toc-bu-xu", features: ["rau-lom-chom", "nep-nhan"], skin: "sam" },
  "np-buon-chuyen-nghiep": { outfit: "bao-bao", head: "toc-chai-muot", features: ["mat-ti-hi", "ria"] },
  "np-nong-dan-gao": { outfit: "ao-nau", head: "toc-buoc-thap", features: ["ma-hop", "gay"], headRx: 27, skin: "sam" },
  "np-buon-thuoc-phien": { outfit: "ao-cham", head: "khan-cham", features: ["rau-lom-chom"], skin: "sam" },
  "np-hang-xom": { outfit: "so-mi-tui-vai", head: "toc-bui", features: ["nep-nhan"], headRx: 27 },

  // Nhánh đời (V3): cùng nhân vật, đổi dáng theo những gì đã xảy ra ở trạm.
  // Bà Tư sau hai lần bị giữ: không đội nón nữa, tóc bạc búi vội, má hóp.
  "ba-tu-khong-non": { outfit: "ao-nau", head: "toc-bac-bui", features: ["nep-nhan", "ma-hop", "gay"], skin: "sam" },
  // Thằng Tí năm 1987, mười tám tuổi, đi buôn chuyến.
  "thang-ti-lon": { outfit: "so-mi-ba-lo", head: "toc-ngan", features: ["gay"], shoulder: 40, headRx: 27, skin: "sam" },
  // Anh Hùng khi tổ sửa xe tan: gầy rộc, râu không cạo, tóc bù.
  "anh-hung-gay": { outfit: "ao-linh-cut-tay", head: "toc-bu-xu", features: ["ma-hop", "gay", "rau-lom-chom"] },
};

// ---------------------------------------------------------------------------
// Hình học
// ---------------------------------------------------------------------------

const HX = 100;
const HY = 96;
const INK = `stroke="${C.muc}" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"`;
const INK_THIN = `stroke="${C.muc}" stroke-width="1.4" stroke-linejoin="round" stroke-linecap="round"`;

function background(): string {
  return `
  <rect width="200" height="240" fill="${C.giay}"/>
  <rect width="200" height="240" fill="url(#kinh)"/>
  <g opacity="0.35" stroke="${C.tram}" stroke-width="1">
    <path d="M0 176 Q60 168 110 172 T200 166" fill="none"/>
    <path d="M14 176 v-22 M24 176 v-30 M150 170 v-26 M166 169 v-18" />
    <circle cx="24" cy="140" r="12" fill="${C.sang}" stroke="none"/>
    <circle cx="150" cy="138" r="14" fill="${C.sang}" stroke="none"/>
  </g>
  <g stroke="${C.sam}" stroke-width="1" opacity="0.18">
    ${Array.from({ length: 16 }, (_, i) => `<line x1="${-40 + i * 18}" y1="0" x2="${i * 18 + 40}" y2="240"/>`).join("")}
  </g>`;
}

function frame(): string {
  return `
  <rect x="3" y="3" width="194" height="234" fill="none" stroke="${C.denNau}" stroke-width="6"/>
  <line x1="3" y1="58" x2="197" y2="58" stroke="${C.denNau}" stroke-width="3" opacity="0.8"/>
  <rect x="0" y="222" width="200" height="18" fill="${C.sam}"/>
  <rect x="0" y="222" width="200" height="3" fill="${C.tram}"/>
  <path d="M0 230 H200 M0 235 H200" stroke="${C.denNau}" stroke-width="0.8" opacity="0.6"/>`;
}

function hatch(x: number, y: number, w: number, h: number, opacity = 0.35): string {
  const lines: string[] = [];
  for (let i = -h; i < w; i += 5) lines.push(`<line x1="${x + i}" y1="${y + h}" x2="${x + i + h}" y2="${y}"/>`);
  return `<g stroke="${C.muc}" stroke-width="0.8" opacity="${opacity}">${lines.join("")}</g>`;
}

// ---------------------------------------------------------------------------
// Thân và trang phục
// ---------------------------------------------------------------------------

function torsoPath(sw: number): string {
  const top = HY + 56;
  return `M${HX - sw - 30} 240 C${HX - sw - 26} ${top + 30} ${HX - sw} ${top + 4} ${HX - 18} ${top}
          L${HX + 18} ${top} C${HX + sw} ${top + 4} ${HX + sw + 26} ${top + 30} ${HX + sw + 30} 240 Z`;
}

function body(spec: Spec): string {
  const sw = spec.shoulder ?? 44;
  const top = HY + 56;
  const torso = torsoPath(sw);
  const shade = `<path d="M${HX + 10} ${top + 2} C${HX + sw} ${top + 6} ${HX + sw + 24} ${top + 32} ${HX + sw + 30} 240 L${HX + 30} 240 Z" fill="${C.muc}" opacity="0.18"/>`;
  const fill = (color: string) => `<path d="${torso}" fill="${color}" ${INK}/>${shade}`;
  const collarV = `<path d="M${HX - 16} ${top} L${HX} ${top + 26} L${HX + 16} ${top}" fill="none" ${INK}/>`;
  const buttons = (n: number, x = HX, y0 = top + 30) =>
    Array.from({ length: n }, (_, i) => `<circle cx="${x}" cy="${y0 + i * 14}" r="2.2" fill="${C.muc}"/>`).join("");
  const pocket = (x: number, y: number, w = 22, h = 18) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" ${INK_THIN}/><path d="M${x} ${y + 6} H${x + w}" ${INK_THIN}/>`;

  switch (spec.outfit) {
    case "quan-phuc":
      return `${fill(C.vua)}
        <path d="M${HX - 20} ${top - 2} L${HX - 6} ${top + 22} L${HX} ${top + 8} L${HX + 6} ${top + 22} L${HX + 20} ${top - 2}" fill="${C.sang}" ${INK}/>
        <path d="M${HX - sw + 2} ${top + 6} l22 -3 M${HX + sw - 2} ${top + 6} l-22 -3" stroke="${C.muc}" stroke-width="5"/>
        <rect x="${HX - 14}" y="${top + 6}" width="6" height="6" fill="${C.son}" ${INK_THIN}/>
        <rect x="${HX + 8}" y="${top + 6}" width="6" height="6" fill="${C.son}" ${INK_THIN}/>
        ${pocket(HX - 36, top + 30)}${pocket(HX + 14, top + 30)}
        <line x1="${HX}" y1="${top + 22}" x2="${HX}" y2="240" ${INK_THIN}/>${buttons(4, HX, top + 30)}`;

    case "ao-nau":
      return `${fill(C.tram)}
        <path d="M${HX - 18} ${top} Q${HX} ${top + 14} ${HX + 18} ${top}" fill="none" ${INK}/>
        <rect x="${HX - sw + 2}" y="${top + 12}" width="22" height="16" fill="${C.vua}" ${INK_THIN} transform="rotate(-8 ${HX - sw + 12} ${top + 20})"/>
        <rect x="${HX - sw + 5}" y="${top + 15}" width="16" height="10" fill="none" stroke="${C.giay}" stroke-width="0.8" stroke-dasharray="2 2" transform="rotate(-8 ${HX - sw + 12} ${top + 20})"/>
        <path d="M${HX + 16} ${top + 36} l8 10 M${HX + 30} ${top + 50} l-6 8" ${INK_THIN}/>
        ${hatch(HX + 20, top + 60, 40, 30, 0.25)}`;

    case "ao-nau-khoan":
      return `${fill(C.tram)}${collarV}${buttons(3, HX, top + 34)}
        <g transform="rotate(-6 ${HX - 30} 214)">
          <rect x="${HX - 62}" y="196" width="54" height="40" fill="${C.giay}" ${INK}/>
          <path d="M${HX - 56} 206 h40 M${HX - 56} 214 h34 M${HX - 56} 222 h38" stroke="${C.tram}" stroke-width="1.4"/>
          <circle cx="${HX - 20}" cy="226" r="6" fill="none" stroke="${C.son}" stroke-width="1.6"/>
        </g>
        <path d="M${HX - 70} 238 q4 -18 18 -20 q10 0 10 10" fill="${C.da}" ${INK}/>`;

    case "ao-linh-cut-tay":
      return `${fill(C.vua)}
        <path d="M${HX - 16} ${top - 4} L${HX} ${top + 10} L${HX + 16} ${top - 4} L${HX + 14} ${top + 6} L${HX} ${top + 18} L${HX - 14} ${top + 6} Z" fill="${C.sang}" ${INK}/>
        ${pocket(HX - 34, top + 28, 24, 20)}${pocket(HX + 10, top + 28, 24, 20)}
        <line x1="${HX}" y1="${top + 18}" x2="${HX}" y2="240" ${INK_THIN}/>${buttons(4, HX, top + 24)}
        <path d="M${HX - sw - 24} 240 C${HX - sw - 22} ${top + 44} ${HX - sw - 6} ${top + 22} ${HX - sw + 4} ${top + 30} L${HX - sw + 12} 240 Z" fill="${C.sang}" ${INK}/>
        <path d="M${HX - sw - 8} ${top + 48} q10 6 20 0" fill="none" ${INK_THIN}/>
        <rect x="${HX - sw - 2}" y="${top + 40}" width="3" height="10" fill="${C.tram}"/>
        <g transform="translate(${HX + 22} ${top + 8})"><circle r="5" fill="${C.son}" ${INK_THIN}/><path d="M0 -3 L1 -1 L3 -1 L1.5 0.5 L2 3 L0 1.5 L-2 3 L-1.5 0.5 L-3 -1 L-1 -1 Z" fill="${C.giay}"/></g>`;

    case "dai-can":
      return `${fill(C.sang)}
        <path d="M${HX - 20} ${top - 6} h40 v10 h-40 Z" fill="${C.sang}" ${INK}/>
        <line x1="${HX}" y1="${top + 4}" x2="${HX}" y2="240" ${INK_THIN}/>${buttons(5, HX, top + 12)}
        ${pocket(HX - 40, top + 22, 26, 16)}${pocket(HX + 14, top + 22, 26, 16)}
        ${pocket(HX - 44, top + 62, 30, 22)}${pocket(HX + 14, top + 62, 30, 22)}
        <rect x="${HX + 26}" y="206" width="70" height="36" rx="3" fill="${C.denNau}" ${INK}/>
        <rect x="${HX + 52}" y="200" width="18" height="8" rx="2" fill="none" ${INK}/>
        <line x1="${HX + 26}" y1="218" x2="${HX + 96}" y2="218" stroke="${C.tram}" stroke-width="1"/>`;

    case "ao-coc-rach":
      return `${fill(C.sang)}
        <path d="M${HX - 16} ${top} Q${HX} ${top + 10} ${HX + 16} ${top}" fill="none" ${INK}/>
        <path d="M${HX - 20} ${top + 40} l6 8 l-4 6 l8 4 M${HX + 24} ${top + 58} l-6 6 l6 4" fill="none" ${INK_THIN}/>
        <path d="M${HX - 30} 240 l4 -10 l6 6 l4 -8 l6 12" fill="${C.giay}" ${INK_THIN}/>
        ${hatch(HX - 40, top + 20, 30, 40, 0.18)}`;

    case "so-mi-tui-vai":
      return `${fill(C.vua)}
        <path d="M${HX - 20} ${top - 2} L${HX - 4} ${top + 18} L${HX} ${top + 6} L${HX + 4} ${top + 18} L${HX + 20} ${top - 2}" fill="${C.sang}" ${INK}/>
        ${buttons(4, HX, top + 26)}${pocket(HX + 12, top + 28)}
        <path d="M${HX - sw + 6} ${top + 4} L${HX + sw + 6} 236" stroke="${C.denNau}" stroke-width="9"/>
        <path d="M${HX - sw + 6} ${top + 4} L${HX + sw + 6} 236" stroke="${C.tram}" stroke-width="5"/>`;

    case "ao-hoa": {
      const dots: string[] = [];
      for (let y = top + 14; y < 236; y += 14)
        for (let x = HX - 60; x < HX + 64; x += 16) {
          const ox = ((y / 14) % 2) * 8;
          dots.push(`<g transform="translate(${x + ox} ${y})" opacity="0.55"><circle r="2.4" fill="${C.giay}"/><circle r="1" fill="${C.tram}"/></g>`);
        }
      return `<clipPath id="thanAo"><path d="${torsoPath(sw)}"/></clipPath>${fill(C.vua)}
        <g clip-path="url(#thanAo)">${dots.join("")}</g>
        <path d="M${HX - 16} ${top} Q${HX} ${top + 14} ${HX + 16} ${top}" fill="none" ${INK}/>`;
    }

    case "hoc-sinh":
      return `${fill(C.giay)}
        <path d="M${HX - 20} ${top - 2} L${HX - 4} ${top + 16} L${HX} ${top + 4} L${HX + 4} ${top + 16} L${HX + 20} ${top - 2}" fill="${C.giay}" ${INK}/>
        <path d="M${HX - 22} ${top - 2} Q${HX} ${top + 14} ${HX + 22} ${top - 2} L${HX + 10} ${top + 16} L${HX + 16} ${top + 48} L${HX + 4} ${top + 46} L${HX} ${top + 20} L${HX - 4} ${top + 46} L${HX - 16} ${top + 48} L${HX - 10} ${top + 16} Z" fill="${C.son}" ${INK}/>
        <path d="M${HX - 6} ${top + 14} h12 v8 h-12 Z" fill="${C.son}" ${INK_THIN}/>`;

    case "ao-tre-nho":
      return `${fill(C.sang)}
        <path d="M${HX - 14} ${top} Q${HX} ${top + 10} ${HX + 14} ${top}" fill="none" ${INK}/>
        <path d="M${HX - 30} ${top + 34} h60 M${HX - 34} ${top + 44} h68" stroke="${C.tram}" stroke-width="3" opacity="0.6"/>`;

    case "ba-ba-sam":
      return `${fill(C.sam)}
        <path d="M${HX - 14} ${top} Q${HX - 2} ${top + 20} ${HX + 20} ${top + 26} L${HX + 20} 240" fill="none" stroke="${C.giay}" stroke-width="1" opacity="0.5"/>
        ${buttons(3, HX + 20, top + 34).replaceAll(C.muc, C.sang)}
        <path d="M${HX - 16} ${top} Q${HX} ${top + 12} ${HX + 16} ${top}" fill="none" ${INK}/>`;

    case "so-mi-ba-lo":
      return `${fill(C.giay)}
        <path d="M${HX - 20} ${top - 2} L${HX - 4} ${top + 18} L${HX} ${top + 6} L${HX + 4} ${top + 18} L${HX + 20} ${top - 2}" fill="${C.giay}" ${INK}/>
        ${buttons(4, HX, top + 26)}
        <path d="M${HX - 34} ${top + 2} Q${HX - 40} ${top + 50} ${HX - 30} 240" fill="none" stroke="${C.tram}" stroke-width="9"/>
        <path d="M${HX + 34} ${top + 2} Q${HX + 40} ${top + 50} ${HX + 30} 240" fill="none" stroke="${C.tram}" stroke-width="9"/>
        <path d="M${HX - 10} ${top + 50} l5 4 M${HX + 24} ${top + 70} l-4 3" ${INK_THIN}/>`;

    case "ao-mua-bao-tai":
      return `${fill(C.tram)}
        <path d="M${HX - sw - 20} ${top + 10} C${HX - 30} ${top - 10} ${HX + 30} ${top - 10} ${HX + sw + 20} ${top + 10} L${HX + sw + 26} 240 L${HX - sw - 26} 240 Z" fill="${C.sam}" opacity="0.7" ${INK}/>
        <path d="M${HX - 30} ${top + 30} l10 30 l-6 20 M${HX + 30} ${top + 24} l-8 40" fill="none" stroke="${C.giay}" stroke-width="1" opacity="0.4"/>
        <path d="M${HX + 20} ${top - 10} C${HX + 60} ${top - 40} ${HX + 100} ${top - 10} ${HX + 104} ${top + 40} L${HX + 60} ${top + 44} Z" fill="${C.sang}" ${INK}/>
        ${hatch(HX + 40, top - 20, 60, 50, 0.3)}`;

    case "so-mi-tang":
      return `${fill(C.giay)}
        <path d="M${HX - 20} ${top - 2} L${HX - 4} ${top + 18} L${HX} ${top + 6} L${HX + 4} ${top + 18} L${HX + 20} ${top - 2}" fill="${C.giay}" ${INK}/>
        ${buttons(4, HX, top + 26)}
        <rect x="${HX + 12}" y="${top + 26}" width="24" height="12" fill="${C.muc}" ${INK_THIN}/>`;

    case "ao-ba-lo-co-bap":
      return `<path d="${torso}" fill="${C.daBong}" ${INK}/>${shade}
        <path d="M${HX - 30} ${top + 4} Q${HX} ${top + 40} ${HX + 30} ${top + 4} L${HX + 34} 240 L${HX - 34} 240 Z" fill="${C.giay}" ${INK}/>
        <path d="M${HX - sw - 10} ${top + 30} q12 -10 24 0 M${HX + sw + 10} ${top + 30} q-12 -10 -24 0" fill="none" ${INK_THIN}/>
        <path d="M${HX + 40} ${top + 10} q2 6 0 9" stroke="${C.tram}" stroke-width="1.4" fill="none"/>`;

    case "bao-bao":
      return `${fill(C.sam)}
        <path d="M${HX - 16} ${top - 4} L${HX} ${top + 30} L${HX + 16} ${top - 4}" fill="${C.giay}" ${INK}/>
        <path d="M${HX - 18} ${top - 4} L${HX - 30} ${top + 8} L${HX - 10} ${top + 50} M${HX + 18} ${top - 4} L${HX + 30} ${top + 8} L${HX + 10} ${top + 50}" fill="none" ${INK}/>
        <path d="M${HX - 4} ${top + 8} L${HX + 4} ${top + 8} L${HX + 6} ${top + 40} L${HX} ${top + 48} L${HX - 6} ${top + 40} Z" fill="${C.tram}" ${INK_THIN}/>
        <path d="M${HX + 26} ${top + 26} h14" stroke="${C.giay}" stroke-width="2"/>
        <circle cx="${HX - 8}" cy="${top + 64}" r="2" fill="${C.sang}"/><circle cx="${HX - 8}" cy="${top + 80}" r="2" fill="${C.sang}"/>`;

    case "ao-cham":
      return `${fill(C.denNau)}
        <path d="M${HX - 18} ${top - 2} L${HX + 26} ${top + 60} L${HX + 26} 240" fill="none" stroke="${C.tram}" stroke-width="4"/>
        <path d="M${HX - 18} ${top - 2} L${HX + 26} ${top + 60}" fill="none" ${INK}/>
        <path d="M${HX - 40} ${top + 70} h80 M${HX - 42} ${top + 76} h84" stroke="${C.vua}" stroke-width="1.4" stroke-dasharray="4 3"/>
        <path d="M${HX - sw - 20} 240 C${HX - sw - 20} 200 ${HX - sw + 10} 196 ${HX - sw + 14} 240 Z" fill="${C.sang}" ${INK}/>`;
  }
}

// ---------------------------------------------------------------------------
// Đầu, tóc, mũ
// ---------------------------------------------------------------------------

function hairBack(spec: Spec, rx: number, ry: number): string {
  switch (spec.head) {
    case "toc-bui":
    case "toc-bac-bui": {
      const color = spec.head === "toc-bac-bui" ? C.sang : C.denNau;
      return `<ellipse cx="${HX + rx - 2}" cy="${HY - 10}" rx="13" ry="12" fill="${color}" ${INK}/>`;
    }
    case "duoi-ga":
      return `<path d="M${HX + rx - 6} ${HY - 20} C${HX + rx + 22} ${HY - 10} ${HX + rx + 20} ${HY + 30} ${HX + rx + 8} ${HY + 50} C${HX + rx + 6} ${HY + 20} ${HX + rx} ${HY} ${HX + rx - 10} ${HY - 6} Z" fill="${C.denNau}" ${INK}/>`;
    case "toc-tet":
      return [-1, 1]
        .map((s) => {
          const x = HX + s * (rx + 2);
          return `<path d="M${x} ${HY - 4} q${s * 8} 18 ${s * 2} 40" stroke="${C.muc}" stroke-width="9" fill="none" stroke-linecap="round"/>
          <path d="M${x} ${HY + 4} l${s * 4} 6 M${x + s * 2} ${HY + 16} l${s * 4} 6 M${x + s * 3} ${HY + 28} l${s * 3} 6" stroke="${C.tram}" stroke-width="1"/>
          <circle cx="${x + s * 2}" cy="${HY + 38}" r="3.5" fill="${C.son}" ${INK_THIN}/>`;
        })
        .join("");
    case "toc-buoc-thap":
      return `<path d="M${HX - rx + 2} ${HY - 4} C${HX - rx - 6} ${HY + 30} ${HX - rx + 4} ${HY + 44} ${HX - rx + 14} ${HY + 50}" fill="none" stroke="${C.denNau}" stroke-width="8" stroke-linecap="round"/>`;
    case "khan-ran":
      return `<path d="M${HX - rx - 10} ${HY - 10} C${HX - rx - 16} ${HY + 40} ${HX - 20} ${HY + 64} ${HX} ${HY + 62} C${HX + 20} ${HY + 64} ${HX + rx + 16} ${HY + 40} ${HX + rx + 10} ${HY - 10} Z" fill="${C.vua}" ${INK}/>
        <path d="M${HX - rx - 10} ${HY + 10} H${HX + rx + 10} M${HX - rx - 6} ${HY + 30} H${HX + rx + 6} M${HX - 20} ${HY + 50} H${HX + 20}" stroke="${C.sam}" stroke-width="3" opacity="0.6"/>`;
    default:
      return "";
  }
}

function hairFront(spec: Spec, rx: number, ry: number): string {
  const top = HY - ry;
  switch (spec.head) {
    case "mu-kepi":
      return `<path d="M${HX - rx - 2} ${HY - 14} C${HX - rx} ${top - 12} ${HX + rx} ${top - 12} ${HX + rx + 2} ${HY - 14} Z" fill="${C.vua}" ${INK}/>
        <path d="M${HX - rx - 8} ${HY - 12} Q${HX} ${HY - 2} ${HX + rx + 8} ${HY - 12} Q${HX} ${HY - 18} ${HX - rx - 8} ${HY - 12} Z" fill="${C.denNau}" ${INK}/>
        <path d="M${HX - rx - 2} ${HY - 18} H${HX + rx + 2}" stroke="${C.denNau}" stroke-width="3"/>
        <circle cx="${HX}" cy="${top + 4}" r="7" fill="${C.son}" ${INK}/>
        <path d="M${HX} ${top} L${HX + 1.5} ${top + 3} L${HX + 4.5} ${top + 3} L${HX + 2} ${top + 5} L${HX + 3} ${top + 8} L${HX} ${top + 6} L${HX - 3} ${top + 8} L${HX - 2} ${top + 5} L${HX - 4.5} ${top + 3} L${HX - 1.5} ${top + 3} Z" fill="${C.giay}"/>`;
    case "mu-coi":
      return `<path d="M${HX - rx - 16} ${HY - 10} C${HX - rx - 10} ${top - 30} ${HX + rx + 10} ${top - 30} ${HX + rx + 16} ${HY - 10} Q${HX} ${HY - 2} ${HX - rx - 16} ${HY - 10} Z" fill="${C.vua}" ${INK}/>
        <path d="M${HX - rx - 16} ${HY - 10} Q${HX} ${HY - 22} ${HX + rx + 16} ${HY - 10}" fill="none" ${INK_THIN}/>
        <path d="M${HX} ${top - 16} Q${HX + 4} ${HY - 20} ${HX} ${HY - 14}" fill="none" ${INK_THIN}/>
        <circle cx="${HX}" cy="${top - 6}" r="6" fill="${C.son}" ${INK_THIN}/>
        ${hatch(HX + 6, top - 20, rx + 8, 20, 0.25)}`;
    case "non-la":
      return `<path d="M${HX - rx - 34} ${HY - 10} L${HX} ${top - 30} L${HX + rx + 34} ${HY - 10} Q${HX} ${HY - 2} ${HX - rx - 34} ${HY - 10} Z" fill="${C.sang}" ${INK}/>
        ${[1, 2, 3].map((i) => `<path d="M${HX - (rx + 34) * (i / 4)} ${top - 30 + (HY - 10 - top + 30) * (i / 4)} Q${HX} ${top - 30 + (HY - 10 - top + 30) * (i / 4) + 4} ${HX + (rx + 34) * (i / 4)} ${top - 30 + (HY - 10 - top + 30) * (i / 4)}" fill="none" stroke="${C.tram}" stroke-width="1"/>`).join("")}
        <path d="M${HX} ${top - 30} L${HX + rx + 34} ${HY - 10} Q${HX + 30} ${HY - 5} ${HX + 10} ${HY - 5} Z" fill="${C.muc}" opacity="0.15"/>
        <path d="M${HX - rx + 2} ${HY - 6} Q${HX - rx - 2} ${HY + 34} ${HX - 6} ${HY + 42} M${HX + rx - 2} ${HY - 6} Q${HX + rx + 2} ${HY + 34} ${HX + 6} ${HY + 42}" fill="none" stroke="${C.giay}" stroke-width="1.2" opacity="0.8"/>`;
    case "toc-ngan":
      return `<path d="M${HX - rx} ${HY - 4} C${HX - rx - 2} ${top - 6} ${HX + rx + 2} ${top - 6} ${HX + rx} ${HY - 4} C${HX + rx - 6} ${top + 12} ${HX - rx + 6} ${top + 10} ${HX - rx} ${HY - 4} Z" fill="${C.denNau}" ${INK}/>`;
    case "toc-chai-muot":
      return `<path d="M${HX - rx} ${HY - 2} C${HX - rx - 4} ${top - 8} ${HX + rx + 4} ${top - 8} ${HX + rx} ${HY - 2} C${HX + rx - 4} ${top + 14} ${HX - 4} ${top + 4} ${HX - 12} ${top + 10} C${HX - 20} ${top + 14} ${HX - rx + 4} ${top + 16} ${HX - rx} ${HY - 2} Z" fill="${C.muc}" ${INK}/>
        <path d="M${HX - 12} ${top + 2} Q${HX + 10} ${top - 4} ${HX + rx - 4} ${top + 10} M${HX - 8} ${top + 6} Q${HX + 10} ${top + 2} ${HX + rx - 6} ${top + 16}" stroke="${C.tram}" stroke-width="1" fill="none"/>`;
    case "toc-choam":
      return `<path d="M${HX - rx} ${HY - 2} C${HX - rx - 6} ${top - 4} ${HX + rx + 6} ${top - 4} ${HX + rx} ${HY - 2} L${HX + rx - 6} ${top + 16} L${HX + 10} ${top + 10} L${HX} ${top + 18} L${HX - 10} ${top + 10} L${HX - rx + 6} ${top + 16} Z" fill="${C.muc}" ${INK}/>
        <path d="M${HX - 4} ${top - 2} l-6 -12 M${HX + 2} ${top - 2} l4 -14 M${HX + 8} ${top} l10 -10" ${INK}/>`;
    case "toc-bu-xu":
      return `<path d="M${HX - rx - 2} ${HY} C${HX - rx - 10} ${top - 8} ${HX + rx + 10} ${top - 8} ${HX + rx + 2} ${HY} L${HX + rx - 4} ${top + 16} L${HX + 14} ${top + 8} L${HX + 4} ${top + 16} L${HX - 8} ${top + 8} L${HX - 18} ${top + 16} L${HX - rx + 4} ${top + 12} Z" fill="${C.sam}" ${INK}/>
        <path d="M${HX - 16} ${top} l-4 -8 M${HX} ${top - 4} l2 -8 M${HX + 16} ${top} l6 -6" ${INK_THIN}/>`;
    case "toc-buoc-thap":
      return `<path d="M${HX - rx} ${HY + 2} C${HX - rx - 4} ${top - 6} ${HX + rx + 4} ${top - 6} ${HX + rx} ${HY + 2} C${HX + rx - 2} ${top + 16} ${HX + 4} ${top + 8} ${HX} ${top + 6} C${HX - 4} ${top + 8} ${HX - rx + 2} ${top + 16} ${HX - rx} ${HY + 2} Z" fill="${C.denNau}" ${INK}/>`;
    case "toc-bui":
    case "toc-bac-bui": {
      const color = spec.head === "toc-bac-bui" ? C.sang : C.denNau;
      const streaks = spec.head === "toc-bac-bui" ? `<path d="M${HX - 16} ${top + 4} Q${HX} ${top} ${HX + 20} ${top + 8} M${HX - 20} ${top + 12} Q${HX} ${top + 6} ${HX + 24} ${top + 16}" stroke="${C.tram}" stroke-width="1" fill="none"/>` : "";
      return `<path d="M${HX - rx} ${HY + 2} C${HX - rx - 4} ${top - 6} ${HX + rx + 4} ${top - 6} ${HX + rx} ${HY + 2} C${HX + rx - 4} ${top + 16} ${HX + 6} ${top + 10} ${HX} ${top + 8} C${HX - 6} ${top + 10} ${HX - rx + 4} ${top + 16} ${HX - rx} ${HY + 2} Z" fill="${color}" ${INK}/>${streaks}`;
    }
    case "duoi-ga":
      return `<path d="M${HX - rx} ${HY + 2} C${HX - rx - 4} ${top - 6} ${HX + rx + 4} ${top - 6} ${HX + rx} ${HY + 2} C${HX + rx - 6} ${top + 14} ${HX - 10} ${top + 6} ${HX - rx} ${HY + 2} Z" fill="${C.denNau}" ${INK}/>
        <path d="M${HX - 10} ${top + 4} Q${HX + 2} ${top + 12} ${HX - 4} ${top + 22}" stroke="${C.muc}" stroke-width="3" fill="none"/>`;
    case "toc-tet":
      return `<path d="M${HX - rx} ${HY} C${HX - rx - 4} ${top - 6} ${HX + rx + 4} ${top - 6} ${HX + rx} ${HY} C${HX + rx - 2} ${top + 18} ${HX + 10} ${top + 14} ${HX} ${top + 10} C${HX - 10} ${top + 14} ${HX - rx + 2} ${top + 18} ${HX - rx} ${HY} Z" fill="${C.muc}" ${INK}/>
        <path d="M${HX} ${top - 2} V${top + 10}" stroke="${C.sang}" stroke-width="1"/>`;
    case "toc-be":
      return `<path d="M${HX - 10} ${top + 2} q4 -10 10 -4 q4 -8 10 0 q-2 6 -6 4" fill="none" ${INK}/>
        <path d="M${HX - rx + 6} ${top + 14} q8 -12 20 -12 M${HX + rx - 6} ${top + 14} q-8 -12 -20 -12" fill="none" stroke="${C.tram}" stroke-width="1.4"/>`;
    case "khan-tang":
      return `<path d="M${HX - rx} ${HY - 2} C${HX - rx - 2} ${top - 6} ${HX + rx + 2} ${top - 6} ${HX + rx} ${HY - 2} C${HX + rx - 6} ${top + 12} ${HX - rx + 6} ${top + 10} ${HX - rx} ${HY - 2} Z" fill="${C.sam}" ${INK}/>
        <path d="M${HX - rx - 2} ${HY - 18} Q${HX} ${HY - 28} ${HX + rx + 2} ${HY - 18} L${HX + rx + 2} ${HY - 8} Q${HX} ${HY - 18} ${HX - rx - 2} ${HY - 8} Z" fill="${C.giay}" ${INK}/>
        <path d="M${HX + rx} ${HY - 14} l14 26 l-6 2 Z M${HX + rx} ${HY - 12} l6 30 l-5 0 Z" fill="${C.giay}" ${INK_THIN}/>`;
    case "khan-ran":
      return `<path d="M${HX - rx - 10} ${HY - 4} C${HX - rx - 12} ${top - 14} ${HX + rx + 12} ${top - 14} ${HX + rx + 10} ${HY - 4} Q${HX} ${top + 8} ${HX - rx - 10} ${HY - 4} Z" fill="${C.vua}" ${INK}/>
        <g stroke="${C.sam}" stroke-width="3" opacity="0.6">
          <path d="M${HX - rx - 4} ${top + 6} H${HX + rx + 4} M${HX - rx + 4} ${top - 4} H${HX + rx - 4}"/>
          <path d="M${HX - 18} ${top - 8} V${HY - 8} M${HX} ${top - 10} V${top + 12} M${HX + 18} ${top - 8} V${HY - 8}"/>
        </g>`;
    case "khan-cham":
      return `<path d="M${HX - rx - 6} ${HY - 8} C${HX - rx - 8} ${top - 12} ${HX + rx + 8} ${top - 12} ${HX + rx + 6} ${HY - 8} Q${HX} ${HY - 18} ${HX - rx - 6} ${HY - 8} Z" fill="${C.denNau}" ${INK}/>
        <path d="M${HX - rx - 4} ${HY - 16} Q${HX} ${top - 2} ${HX + rx + 4} ${HY - 22} M${HX - rx} ${HY - 24} Q${HX} ${top - 10} ${HX + rx} ${HY - 28}" stroke="${C.tram}" stroke-width="1.4" fill="none"/>`;
  }
}

// ---------------------------------------------------------------------------
// Nét mặt
// ---------------------------------------------------------------------------

function face(spec: Spec, expr: Expr, rx: number, ry: number): string {
  const f = new Set(spec.features ?? []);
  const shift = expr === "ne-tranh" ? -4 : 0;
  const cx = HX + shift;
  const ey = HY + 2;
  const dx = rx * 0.4;
  const big = f.has("mat-to");
  const narrow = f.has("mat-ti-hi");
  const parts: string[] = [];

  // Lông mày
  const brow = (s: number) => {
    const x = cx + s * dx;
    const y = ey - 11;
    switch (expr) {
      case "vui":
        return `M${x - 7} ${y + 1} Q${x} ${y - 5} ${x + 7} ${y + 1}`;
      case "lo-lang":
      case "buon":
        return s < 0 ? `M${x - 7} ${y + 3} L${x + 7} ${y - 4}` : `M${x - 7} ${y - 4} L${x + 7} ${y + 3}`;
      case "gian":
        return s < 0 ? `M${x - 7} ${y - 3} L${x + 7} ${y + 4}` : `M${x - 7} ${y + 4} L${x + 7} ${y - 3}`;
      case "ne-tranh":
        return s < 0 ? `M${x - 7} ${y} L${x + 7} ${y - 2}` : `M${x - 7} ${y - 3} Q${x} ${y - 5} ${x + 7} ${y}`;
      case "met-moi":
        return `M${x - 7} ${y + 2} L${x + 7} ${y + 1}`;
      default:
        return `M${x - 7} ${y} Q${x} ${y - 3} ${x + 7} ${y}`;
    }
  };
  for (const s of [-1, 1]) parts.push(`<path d="${brow(s)}" fill="none" stroke="${C.muc}" stroke-width="${spec.head === "toc-be" ? 1.4 : 2.6}" stroke-linecap="round"/>`);
  if (expr === "gian") parts.push(`<path d="M${cx - 2} ${ey - 10} v5 M${cx + 2} ${ey - 10} v5" ${INK_THIN}/>`);

  // Mắt
  for (const s of [-1, 1]) {
    const x = cx + s * dx;
    if (expr === "vui") {
      parts.push(`<path d="M${x - 5} ${ey + 1} Q${x} ${ey - 5} ${x + 5} ${ey + 1}" fill="none" ${INK}/>`);
      continue;
    }
    const h = narrow ? 1.6 : big ? 4.8 : 3.4;
    const w = big ? 5.4 : 5;
    const lid = expr === "met-moi" ? 0.45 : expr === "buon" ? 0.7 : expr === "gian" ? 0.6 : 1;
    const look = expr === "ne-tranh" ? -2.5 : 0;
    parts.push(`<ellipse cx="${x}" cy="${ey}" rx="${w}" ry="${h * lid + 0.6}" fill="${C.giay}" ${INK_THIN}/>`);
    parts.push(`<circle cx="${x + look}" cy="${ey + (lid < 1 ? 0.8 : 0)}" r="${Math.min(big ? 3 : 2.3, h * lid + 0.4)}" fill="${C.muc}"/>`);
    if (big) parts.push(`<circle cx="${x + look + 1}" cy="${ey - 1}" r="0.9" fill="${C.giay}"/>`);
    parts.push(`<path d="M${x - w - 1} ${ey - h * lid} Q${x} ${ey - h * lid - 3} ${x + w + 1} ${ey - h * lid}" fill="none" stroke="${C.muc}" stroke-width="${expr === "met-moi" ? 2.4 : 1.6}"/>`);
    if (expr === "met-moi" || f.has("ma-hop")) parts.push(`<path d="M${x - 4} ${ey + 6} q4 3 8 0" fill="none" stroke="${C.tram}" stroke-width="1.2"/>`);
  }

  // Mũi
  parts.push(`<path d="M${cx + 1} ${ey + 4} q-3 8 -5 11 q4 3 8 0" fill="none" stroke="${C.tram}" stroke-width="1.6" stroke-linecap="round"/>`);

  // Miệng
  const my = HY + 24;
  const mouth = (() => {
    switch (expr) {
      case "vui":
        return `<path d="M${cx - 10} ${my - 2} Q${cx} ${my + 10} ${cx + 10} ${my - 2} Q${cx} ${my + 2} ${cx - 10} ${my - 2} Z" fill="${C.denNau}" ${INK_THIN}/>`;
      case "lo-lang":
        return `<path d="M${cx - 8} ${my + 1} q3 -3 6 0 q3 3 6 0 q2 -2 4 0" fill="none" ${INK}/>`;
      case "buon":
        return `<path d="M${cx - 8} ${my + 3} Q${cx} ${my - 4} ${cx + 8} ${my + 3}" fill="none" ${INK}/>`;
      case "gian":
        return `<path d="M${cx - 9} ${my + 2} L${cx + 9} ${my + 2}" ${INK}/><path d="M${cx - 9} ${my + 2} l-2 2 M${cx + 9} ${my + 2} l2 2" ${INK_THIN}/>`;
      case "ne-tranh":
        return `<path d="M${cx - 7} ${my + 1} Q${cx} ${my + 3} ${cx + 8} ${my - 2}" fill="none" ${INK}/>`;
      case "met-moi":
        return `<ellipse cx="${cx}" cy="${my + 1}" rx="4" ry="2.4" fill="${C.denNau}" ${INK_THIN}/>`;
      default:
        return `<path d="M${cx - 8} ${my} Q${cx} ${my + 3} ${cx + 8} ${my}" fill="none" ${INK}/>`;
    }
  })();
  parts.push(mouth);

  // Đặc điểm riêng
  if (f.has("ria")) parts.push(`<path d="M${cx - 11} ${my - 4} Q${cx} ${my - 9} ${cx + 11} ${my - 4} Q${cx} ${my - 5} ${cx - 11} ${my - 4} Z" fill="${C.muc}" ${INK_THIN}/>`);
  if (f.has("rau-lom-chom")) {
    const dots: string[] = [];
    for (let i = 0; i < 26; i++) {
      const a = Math.PI * (0.15 + (0.7 * i) / 26);
      const r = rx - 6 - (i % 3) * 3;
      dots.push(`<circle cx="${(cx + Math.cos(a) * r).toFixed(1)}" cy="${(HY + 8 + Math.sin(a) * (ry - 8)).toFixed(1)}" r="0.8" fill="${C.muc}"/>`);
    }
    parts.push(dots.join(""));
  }
  if (f.has("nep-nhan")) parts.push(`<path d="M${cx - 8} ${ey - 20} q8 -2 16 0 M${cx - 16} ${my - 4} q-2 6 2 10 M${cx + 16} ${my - 4} q2 6 -2 10 M${cx + dx + 8} ${ey - 2} l5 -2 M${cx + dx + 8} ${ey + 2} l5 1" fill="none" stroke="${C.tram}" stroke-width="1.1"/>`);
  if (f.has("ma-hop")) parts.push(`<path d="M${cx - rx + 6} ${HY + 6} q4 10 2 18 M${cx + rx - 6} ${HY + 6} q-4 10 -2 18" fill="none" stroke="${C.daBong}" stroke-width="3" opacity="0.8"/>`);
  if (f.has("beo")) parts.push(`<path d="M${cx - 14} ${HY + ry - 4} Q${cx} ${HY + ry + 6} ${cx + 14} ${HY + ry - 4}" fill="none" stroke="${C.tram}" stroke-width="1.4"/><circle cx="${cx - rx + 10}" cy="${my - 6}" r="5" fill="${C.son}" opacity="0.18"/><circle cx="${cx + rx - 10}" cy="${my - 6}" r="5" fill="${C.son}" opacity="0.18"/>`);
  if (f.has("mo-hoi") || expr === "lo-lang")
    parts.push(`<path d="M${cx + rx - 4} ${ey - 16} q-4 7 0 10 q4 -3 0 -10 Z" fill="${C.giay}" ${INK_THIN}/>`);
  if (expr === "buon" && f.has("mat-to")) parts.push(`<path d="M${cx + dx + 2} ${ey + 5} q-3 6 0 9 q3 -3 0 -9 Z" fill="${C.giay}" ${INK_THIN}/>`);

  return parts.join("\n    ");
}

// ---------------------------------------------------------------------------
// Ghép
// ---------------------------------------------------------------------------

function portrait(key: string, expr: Expr): string {
  const spec = SPECS[key];
  if (!spec) throw new Error(`Chưa có mô tả vẽ cho nhân vật "${key}" trong scripts/generate-portraits.ts`);
  const rx = spec.headRx ?? 29;
  const ry = spec.headRy ?? 36;
  const s = (spec.scale ?? 1) * 1.14;
  const skin = spec.skin === "sam" ? C.daBong : C.da;
  const skinShade = spec.skin === "sam" ? C.vua : C.daBong;
  const tilt = expr === "buon" || expr === "met-moi" ? 3 : expr === "ne-tranh" ? -4 : expr === "vui" ? -1 : 0;
  const neckW = spec.features?.includes("gay") ? 9 : spec.features?.includes("beo") ? 16 : 12;

  const headGroup = `
  <g transform="rotate(${tilt} ${HX} ${HY + 40})">
    ${hairBack(spec, rx, ry)}
    <ellipse cx="${HX - rx}" cy="${HY + 4}" rx="6" ry="9" fill="${skin}" ${INK}/>
    <ellipse cx="${HX + rx}" cy="${HY + 4}" rx="6" ry="9" fill="${skin}" ${INK}/>
    <path d="M${HX - rx} ${HY - 6} C${HX - rx} ${HY - ry - 4} ${HX + rx} ${HY - ry - 4} ${HX + rx} ${HY - 6} C${HX + rx} ${HY + ry * 0.6} ${HX + rx * 0.5} ${HY + ry} ${HX} ${HY + ry} C${HX - rx * 0.5} ${HY + ry} ${HX - rx} ${HY + ry * 0.6} ${HX - rx} ${HY - 6} Z" fill="${skin}" ${INK}/>
    <path d="M${HX + rx * 0.35} ${HY - ry + 6} C${HX + rx + 2} ${HY - ry + 10} ${HX + rx + 2} ${HY + ry * 0.5} ${HX + 4} ${HY + ry - 1} C${HX + rx * 0.7} ${HY + ry * 0.4} ${HX + rx * 0.8} ${HY - 10} ${HX + rx * 0.35} ${HY - ry + 6} Z" fill="${skinShade}" opacity="0.55"/>
    ${face(spec, expr, rx, ry)}
    ${hairFront(spec, rx, ry)}
  </g>`;

  const neck = `<path d="M${HX - neckW} ${HY + ry - 8} L${HX - neckW - 1} ${HY + 60} L${HX + neckW + 1} ${HY + 60} L${HX + neckW} ${HY + ry - 8} Z" fill="${skinShade}" ${INK}/>`;

  const drop = spec.head === "non-la" ? 14 : spec.head === "mu-coi" ? 6 : 0;
  const figure = `<g transform="translate(0 ${drop}) translate(${HX} 222) scale(${s}) translate(${-HX} -222)">${neck}${body(spec)}${headGroup}</g>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 240" width="200" height="240">
  <defs>
    <radialGradient id="kinh" cx="50%" cy="38%" r="70%">
      <stop offset="0%" stop-color="#f6ecd4" stop-opacity="0.9"/>
      <stop offset="70%" stop-color="${C.sang}" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="${C.sam}" stop-opacity="0.85"/>
    </radialGradient>
    <filter id="hat" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="${key.length * 7 + expr.length}"/>
      <feColorMatrix values="0 0 0 0 0.11  0 0 0 0 0.09  0 0 0 0 0.07  0 0 0 0.55 -0.12"/>
      <feComposite in2="SourceGraphic" operator="in"/>
    </filter>
    <filter id="net" x="-5%" y="-5%" width="110%" height="110%">
      <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="3" result="n"/>
      <feDisplacementMap in="SourceGraphic" in2="n" scale="1.6"/>
    </filter>
    <radialGradient id="toi" cx="50%" cy="45%" r="75%">
      <stop offset="60%" stop-color="${C.muc}" stop-opacity="0"/>
      <stop offset="100%" stop-color="${C.muc}" stop-opacity="0.45"/>
    </radialGradient>
  </defs>
  ${background()}
  <g filter="url(#net)">${figure}</g>
  <rect width="200" height="240" fill="url(#toi)"/>
  <rect width="200" height="240" fill="#000" filter="url(#hat)" opacity="0.5"/>
  ${frame()}
</svg>
`;
}

// ---------------------------------------------------------------------------
// Ghi file
// ---------------------------------------------------------------------------

const pairs = new Set<string>();
for (const c of characters) for (const e of c.portrait.expressions ?? []) pairs.add(`${c.portrait.key}_${e}`);
for (const t of travelers) {
  const c = characters.find((x) => x.id === t.character);
  if (!c) continue;
  const p = t.portrait as { expression: string; key?: string; variants?: { key?: string; expression?: string }[] };
  const baseKey = p.key ?? c.portrait.key;
  pairs.add(`${baseKey}_${p.expression}`);
  for (const v of p.variants ?? []) pairs.add(`${v.key ?? baseKey}_${v.expression ?? p.expression}`);
}

fs.mkdirSync(OUT, { recursive: true });
for (const f of fs.readdirSync(OUT)) if (f.endsWith(".svg")) fs.unlinkSync(path.join(OUT, f));
for (const pair of pairs) {
  const i = pair.lastIndexOf("_");
  fs.writeFileSync(path.join(OUT, `${pair}.svg`), portrait(pair.slice(0, i), pair.slice(i + 1) as Expr), "utf-8");
}
console.log(`Đã vẽ ${pairs.size} chân dung vào public/art/portraits/`);
