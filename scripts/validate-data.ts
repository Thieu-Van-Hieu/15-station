/**
 * validate-data.ts — kiểm tra dữ liệu của game "Trạm 15".
 *
 * TẦNG 1 — Cấu trúc: mọi file trong data/ khớp schema trong data/schema/.
 * TẦNG 2 — Tham chiếu chéo: xem docs/03-rules-spec.md mục 10.
 * TẦNG 3 — Logic: chạy engine lên từng lượt, so với expected và luật thiết kế.
 *
 * Chạy:
 *   npx tsx scripts/validate-data.ts
 *   npx tsx scripts/validate-data.ts --strict
 *   npx tsx scripts/validate-data.ts --data data/mau   (kiểm tra một thư mục khác)
 *   npx tsx scripts/validate-data.ts --loi 50          (in nhiều lỗi hơn cho mỗi file)
 *
 * Thoát với mã 0 nếu tất cả xanh, mã 1 nếu có bất kỳ lỗi nào (hoặc có cảnh báo khi --strict).
 */

import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020, { type ErrorObject, type ValidateFunction } from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { evaluate } from "../src/engine/evaluate.js";
import { activeRules } from "../src/engine/active.js";
import { listVariables } from "../src/engine/text.js";
import type { IssueId } from "../src/engine/types.js";

// ---------------------------------------------------------------------------
// Cấu hình
// ---------------------------------------------------------------------------

export const DATA_FILES = [
  "rules",
  "documents",
  "characters",
  "days",
  "travelers",
  "reports",
  "endings",
  "strings",
] as const;

export type DataName = (typeof DATA_FILES)[number];

const SO_LOI_IN_MAC_DINH = 20;

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export interface CauHinh {
  thuMucData: string;
  thuMucSchema: string;
  soLoiIn: number;
  strict: boolean;
}

export function docThamSo(argv: string[]): CauHinh {
  let thuMucData = path.join(ROOT, "data");
  let soLoiIn = SO_LOI_IN_MAC_DINH;
  let strict = false;

  for (let i = 0; i < argv.length; i += 1) {
    const co = argv[i];
    if (co === "--strict") {
      strict = true;
    } else if (co === "--data" || co === "--loi") {
      const giaTri = argv[i + 1];
      if (giaTri === undefined) throw new Error(`Thiếu giá trị cho tham số ${co}.`);
      if (co === "--data") {
        thuMucData = path.resolve(ROOT, giaTri);
      } else {
        const n = Number.parseInt(giaTri, 10);
        if (!Number.isFinite(n) || n < 1) throw new Error(`Giá trị --loi không hợp lệ: ${giaTri}`);
        soLoiIn = n;
      }
      i += 1;
    } else {
      throw new Error(`Tham số không nhận ra: ${co}`);
    }
  }

  return { thuMucData, thuMucSchema: path.join(thuMucData, "schema"), soLoiIn, strict };
}

// ---------------------------------------------------------------------------
// Kiểu kết quả
// ---------------------------------------------------------------------------

export type TrangThai = "xanh" | "do";

export interface KetQuaTang1 {
  ten: DataName;
  trangThai: TrangThai;
  soPhanTu: number | null;
  loi: string[];
  tongSoLoi: number;
}

export type MucDo = "loi" | "canh_bao" | "thong_tin";

export interface PhatHien {
  muc: MucDo;
  dieu: number;
  noi_dung: string;
}

// ---------------------------------------------------------------------------
// Đọc file
// ---------------------------------------------------------------------------

export async function docJson(duongDan: string): Promise<unknown> {
  let noiDung: string;

  try {
    noiDung = await readFile(duongDan, "utf8");
  } catch (loi) {
    const ma = (loi as NodeJS.ErrnoException).code;
    if (ma === "ENOENT") throw new Error(`Không tìm thấy file: ${duongDan}`);
    if (ma === "EACCES") throw new Error(`Không có quyền đọc file: ${duongDan}`);
    throw new Error(`Không đọc được file ${duongDan}: ${(loi as Error).message}`);
  }

  const sach = noiDung.charCodeAt(0) === 0xfeff ? noiDung.slice(1) : noiDung;
  if (sach.trim() === "") throw new Error(`File rỗng: ${duongDan}`);

  try {
    return JSON.parse(sach) as unknown;
  } catch (loi) {
    throw new Error(`JSON không hợp lệ trong ${duongDan}: ${(loi as Error).message}`);
  }
}

export interface TatCaDuLieu {
  rules: any[];
  documents: any[];
  characters: any[];
  days: any[];
  travelers: any[];
  reports: any[];
  endings: any;
  strings: Record<string, string>;
  travelersSchema?: any;
}

export async function docTatCaDuLieu(thuMucData = path.join(ROOT, "data")): Promise<TatCaDuLieu> {
  const [rules, documents, characters, days, travelers, reports, endings, strings, travelersSchema] =
    await Promise.all([
      docJson(path.join(thuMucData, "rules.json")) as Promise<any[]>,
      docJson(path.join(thuMucData, "documents.json")) as Promise<any[]>,
      docJson(path.join(thuMucData, "characters.json")) as Promise<any[]>,
      docJson(path.join(thuMucData, "days.json")) as Promise<any[]>,
      docJson(path.join(thuMucData, "travelers.json")) as Promise<any[]>,
      docJson(path.join(thuMucData, "reports.json")) as Promise<any[]>,
      docJson(path.join(thuMucData, "endings.json")) as Promise<any>,
      docJson(path.join(thuMucData, "strings.json")) as Promise<Record<string, string>>,
      docJson(path.join(thuMucData, "schema", "travelers.schema.json")).catch(() => undefined),
    ]);

  return { rules, documents, characters, days, travelers, reports, endings, strings, travelersSchema };
}

// ---------------------------------------------------------------------------
// TẦNG 1 — Cấu trúc (Ajv)
// ---------------------------------------------------------------------------

function taoAjv(): Ajv2020 {
  const ajv = new Ajv2020({
    strict: true,
    allErrors: true,
    allowUnionTypes: true,
    allowMatchingProperties: true,
    verbose: true,
  });
  addFormats(ajv);
  return ajv;
}

export interface BoKiemTra {
  ajv: Ajv2020;
  validate: ValidateFunction;
  schemaId: string;
}

export async function bienDichSchema(ten: DataName, cauHinh: CauHinh): Promise<BoKiemTra> {
  const duongDan = path.join(cauHinh.thuMucSchema, `${ten}.schema.json`);
  const schema = (await docJson(duongDan)) as { $id?: string };
  const schemaId = schema.$id ?? `${ten}.schema.json`;

  try {
    const ajv = taoAjv();
    ajv.addSchema(schema as object, schemaId);
    const validate = ajv.getSchema(schemaId);
    if (validate === undefined) throw new Error(`không lấy được validator cho $id "${schemaId}"`);
    return { ajv, validate, schemaId };
  } catch (loi) {
    throw new Error(`Schema không biên dịch được (${duongDan}): ${(loi as Error).message}`);
  }
}

function duongDanDep(instancePath: string): string {
  if (instancePath === "") return "(gốc)";
  return instancePath
    .split("/")
    .filter((doan) => doan !== "")
    .map((doan) => (/^\d+$/.test(doan) ? `[${doan}]` : `.${doan}`))
    .join("")
    .replace(/^\./, "");
}

function rutGonGiaTri(giaTri: unknown): string {
  if (giaTri === undefined) return "không có";
  const chuoi = typeof giaTri === "string" ? `"${giaTri}"` : JSON.stringify(giaTri);
  if (chuoi === undefined) return String(giaTri);
  return chuoi.length > 80 ? `${chuoi.slice(0, 77)}…` : chuoi;
}

function layGiaTri(goc: unknown, instancePath: string): unknown {
  let hienTai: unknown = goc;
  for (const doan of instancePath.split("/").filter((x) => x !== "")) {
    if (hienTai === null || typeof hienTai !== "object") return undefined;
    const khoa = doan.replace(/~1/g, "/").replace(/~0/g, "~");
    hienTai = (hienTai as Record<string, unknown>)[khoa];
  }
  return hienTai;
}

const DUONG_DAN_GIAY = /^\/\d+\/documents\/\d+/;

interface LoiDep {
  instancePath: string;
  noiDung: string;
}

function soiLaiGiayTo(
  bo: BoKiemTra,
  duLieu: unknown,
  danhSach: ErrorObject[],
): { giuLai: ErrorObject[]; themVao: LoiDep[] } {
  const duongDanGiay = new Set<string>();
  for (const loi of danhSach) {
    const khop = DUONG_DAN_GIAY.exec(loi.instancePath);
    if (khop !== null) duongDanGiay.add(khop[0]);
  }

  if (duongDanGiay.size === 0) return { giuLai: danhSach, themVao: [] };

  const themVao: LoiDep[] = [];

  for (const duongDan of duongDanGiay) {
    const giay = layGiaTri(duLieu, duongDan);
    const loai =
      giay !== null && typeof giay === "object" && typeof (giay as { type?: unknown }).type === "string"
        ? (giay as { type: string }).type
        : null;

    if (loai === null) {
      themVao.push({
        instancePath: duongDan,
        noiDung: `${duongDanDep(duongDan)}: thiếu trường "type" hoặc type không phải chuỗi, chưa xác định được loại giấy`,
      });
      continue;
    }

    const nhanh = bo.ajv.getSchema(`${bo.schemaId}#/$defs/doc_${loai}`);
    if (nhanh === undefined) {
      themVao.push({
        instancePath: duongDan,
        noiDung: `${duongDanDep(duongDan)}.type: "${loai}" không phải loại giấy có thật`,
      });
      continue;
    }

    if (nhanh(giay)) {
      themVao.push({
        instancePath: duongDan,
        noiDung: `${duongDanDep(duongDan)}: giấy hợp lệ với nhánh ${loai} nhưng vẫn bị oneOf từ chối — kiểm tra lại schema`,
      });
      continue;
    }

    for (const loi of locTrung(nhanh.errors ?? [])) {
      const dayDu = { ...loi, instancePath: duongDan + loi.instancePath };
      themVao.push({ instancePath: dayDu.instancePath, noiDung: taLoi(dayDu) });
    }
  }

  const giuLai = danhSach.filter((loi) => !DUONG_DAN_GIAY.test(loi.instancePath));
  return { giuLai, themVao };
}

function locTrung(danhSach: ErrorObject[]): ErrorObject[] {
  const daThay = new Set<string>();
  return danhSach.filter((loi) => {
    const khoa = `${loi.instancePath}|${loi.keyword}|${loi.message ?? ""}`;
    if (daThay.has(khoa)) return false;
    daThay.add(khoa);
    return true;
  });
}

function locLoi(danhSach: ErrorObject[]): ErrorObject[] {
  const loiCon = danhSach.filter((loi) => loi.keyword !== "oneOf" && loi.keyword !== "anyOf");
  return locTrung(loiCon.length > 0 ? loiCon : danhSach);
}

function taLoi(loi: ErrorObject): string {
  const viTri = duongDanDep(loi.instancePath);

  switch (loi.keyword) {
    case "required":
      return `${viTri}: thiếu trường bắt buộc "${(loi.params as { missingProperty: string }).missingProperty}"`;
    case "additionalProperties":
      return `${viTri}: có trường lạ "${(loi.params as { additionalProperty: string }).additionalProperty}"`;
    case "enum": {
      const choPhep = (loi.params as { allowedValues: unknown[] }).allowedValues;
      return `${viTri}: giá trị ${rutGonGiaTri(loi.data)} không nằm trong danh sách cho phép [${choPhep.join(", ")}]`;
    }
    case "type":
      return `${viTri}: phải là kiểu ${(loi.params as { type: string }).type}, đang là ${rutGonGiaTri(loi.data)}`;
    case "pattern":
      return `${viTri}: ${rutGonGiaTri(loi.data)} không đúng khuôn dạng ${(loi.params as { pattern: string }).pattern}`;
    case "const":
      return `${viTri}: phải đúng bằng ${rutGonGiaTri((loi.params as { allowedValue: unknown }).allowedValue)}`;
    case "minItems":
      return `${viTri}: phải có ít nhất ${(loi.params as { limit: number }).limit} phần tử, đang có ${
        Array.isArray(loi.data) ? loi.data.length : "?"
      }`;
    case "maxItems":
      return `${viTri}: chỉ được tối đa ${(loi.params as { limit: number }).limit} phần tử, đang có ${
        Array.isArray(loi.data) ? loi.data.length : "?"
      }`;
    case "minimum":
    case "exclusiveMinimum":
      return `${viTri}: phải lớn hơn${loi.keyword === "minimum" ? " hoặc bằng" : ""} ${
        (loi.params as { limit: number }).limit
      }, đang là ${rutGonGiaTri(loi.data)}`;
    case "maximum":
    case "exclusiveMaximum":
      return `${viTri}: phải nhỏ hơn${loi.keyword === "maximum" ? " hoặc bằng" : ""} ${
        (loi.params as { limit: number }).limit
      }, đang là ${rutGonGiaTri(loi.data)}`;
    case "minLength":
      return `${viTri}: chuỗi phải dài ít nhất ${(loi.params as { limit: number }).limit} ký tự`;
    case "maxLength":
      return `${viTri}: chuỗi chỉ được dài tối đa ${(loi.params as { limit: number }).limit} ký tự`;
    case "uniqueItems":
      return `${viTri}: có phần tử trùng nhau`;
    default:
      return `${viTri}: ${loi.message ?? loi.keyword}${
        loi.data === undefined ? "" : ` (đang là ${rutGonGiaTri(loi.data)})`
      }`;
  }
}

function demPhanTu(duLieu: unknown): number | null {
  if (Array.isArray(duLieu)) return duLieu.length;
  if (duLieu !== null && typeof duLieu === "object") return Object.keys(duLieu).length;
  return null;
}

export async function kiemTraMotFile(ten: DataName, cauHinh: CauHinh): Promise<KetQuaTang1> {
  let bo: BoKiemTra;
  try {
    bo = await bienDichSchema(ten, cauHinh);
  } catch (loi) {
    return { ten, trangThai: "do", soPhanTu: null, loi: [(loi as Error).message], tongSoLoi: 1 };
  }

  let duLieu: unknown;
  try {
    duLieu = await docJson(path.join(cauHinh.thuMucData, `${ten}.json`));
  } catch (loi) {
    return { ten, trangThai: "do", soPhanTu: null, loi: [(loi as Error).message], tongSoLoi: 1 };
  }

  const soPhanTu = demPhanTu(duLieu);

  if (bo.validate(duLieu)) {
    return { ten, trangThai: "xanh", soPhanTu, loi: [], tongSoLoi: 0 };
  }

  const { giuLai, themVao } = soiLaiGiayTo(bo, duLieu, bo.validate.errors ?? []);

  const tatCa: LoiDep[] = [
    ...locLoi(giuLai).map((loi) => ({ instancePath: loi.instancePath, noiDung: taLoi(loi) })),
    ...themVao,
  ].sort((a, b) => a.instancePath.localeCompare(b.instancePath));

  return {
    ten,
    trangThai: "do",
    soPhanTu,
    loi: tatCa.slice(0, cauHinh.soLoiIn).map((x) => x.noiDung),
    tongSoLoi: tatCa.length,
  };
}

// ---------------------------------------------------------------------------
// TẦNG 2 — Tham chiếu chéo (docs/03-rules-spec.md mục 10)
// ---------------------------------------------------------------------------

const SO_LUOT_NGAY_QUY_DINH: Record<string, number> = {
  d1: 3,
  d2: 4,
  d3: 4,
  d4: 5,
  d5: 5,
  d6: 5,
};
const TONG_SO_LUOT_QUY_DINH = 26;

const DAY_ORDER: Record<string, number> = {
  d1: 1,
  d2: 2,
  d3: 3,
  d4: 4,
  d5: 5,
  d6: 6,
};

/** Điều 1: Mỗi days[i].travelers trỏ đến lượt có thật; mỗi lượt thuộc đúng một ngày, day và order khớp vị trí. */
export function kiemTraDieu1(days: any[], travelers: any[]): PhatHien[] {
  const phatHien: PhatHien[] = [];
  const travelersMap = new Map<string, any>(travelers.map((t) => [t.id, t]));
  const travelerDayCount = new Map<string, string[]>();

  for (const day of days) {
    if (!Array.isArray(day.travelers)) continue;
    for (let i = 0; i < day.travelers.length; i += 1) {
      const tid = day.travelers[i];
      const danhSach = travelerDayCount.get(tid) ?? [];
      danhSach.push(day.id);
      travelerDayCount.set(tid, danhSach);

      const t = travelersMap.get(tid);
      if (!t) {
        phatHien.push({
          muc: "loi",
          dieu: 1,
          noi_dung: `Ngày ${day.id} trỏ đến lượt không tồn tại trong travelers.json: "${tid}"`,
        });
      } else {
        if (t.day !== day.id) {
          phatHien.push({
            muc: "loi",
            dieu: 1,
            noi_dung: `Lượt "${tid}" có thuộc tính day="${t.day}" nhưng nằm trong danh sách travelers của ngày ${day.id}`,
          });
        }
        if (t.order !== i + 1) {
          phatHien.push({
            muc: "loi",
            dieu: 1,
            noi_dung: `Lượt "${tid}" có order=${t.order} nhưng ở vị trí ${i + 1} trong ngày ${day.id}`,
          });
        }
      }
    }
  }

  for (const t of travelers) {
    const usages = travelerDayCount.get(t.id) ?? [];
    if (usages.length === 0) {
      phatHien.push({
        muc: "loi",
        dieu: 1,
        noi_dung: `Lượt "${t.id}" không được ngày nào trong days.json trỏ tới`,
      });
    } else if (usages.length > 1) {
      phatHien.push({
        muc: "loi",
        dieu: 1,
        noi_dung: `Lượt "${t.id}" xuất hiện trong nhiều ngày: [${usages.join(", ")}]`,
      });
    }
  }

  return phatHien;
}

/** Điều 2: Số lượt mỗi ngày đúng 3, 4, 4, 5, 5, 5. Tổng cộng 26 lượt. */
export function kiemTraDieu2(days: any[], travelers: any[], strict = false): PhatHien[] {
  const phatHien: PhatHien[] = [];
  const muc: MucDo = strict ? "loi" : "canh_bao";

  for (const day of days) {
    const mongDoi = SO_LUOT_NGAY_QUY_DINH[day.id];
    const thucTe = Array.isArray(day.travelers) ? day.travelers.length : 0;
    if (mongDoi !== undefined && thucTe !== mongDoi) {
      phatHien.push({
        muc,
        dieu: 2,
        noi_dung: `Ngày ${day.id} có ${thucTe} lượt, mong đợi đúng ${mongDoi} lượt`,
      });
    }
  }

  if (travelers.length !== TONG_SO_LUOT_QUY_DINH) {
    phatHien.push({
      muc,
      dieu: 2,
      noi_dung: `travelers.json có ${travelers.length} lượt, mong đợi đúng ${TONG_SO_LUOT_QUY_DINH} lượt`,
    });
  }

  return phatHien;
}

/** Điều 3: Mọi character, speaker, member, ruleId, issueId đều tồn tại. */
export function kiemTraDieu3(
  days: any[],
  travelers: any[],
  characters: any[],
  rules: any[],
  reports: any[],
): PhatHien[] {
  const phatHien: PhatHien[] = [];

  const characterIds = new Set(characters.map((c) => c.id));
  const allowedSpeakers = new Set([...characterIds, "traveler", "radio", "narrator"]);
  const ruleIds = new Set(rules.map((r) => r.id));
  const issueIds = new Set(reports.map((rp) => rp.id));

  for (const day of days) {
    if (Array.isArray(day.new_rules)) {
      for (const rid of day.new_rules) {
        if (!ruleIds.has(rid)) {
          phatHien.push({
            muc: "loi",
            dieu: 3,
            noi_dung: `Ngày ${day.id} new_rules chứa mã quy định không tồn tại: "${rid}"`,
          });
        }
      }
    }

    if (Array.isArray(day.economy?.expenses)) {
      for (const exp of day.economy.expenses) {
        if (exp.member && !characterIds.has(exp.member)) {
          phatHien.push({
            muc: "loi",
            dieu: 3,
            noi_dung: `Ngày ${day.id} khoản chi "${exp.id}" gán member không tồn tại: "${exp.member}"`,
          });
        }
      }
    }

    if (Array.isArray(day.interludes)) {
      for (const inter of day.interludes) {
        if (Array.isArray(inter.lines)) {
          for (const line of inter.lines) {
            if (line.speaker && !allowedSpeakers.has(line.speaker)) {
              phatHien.push({
                muc: "loi",
                dieu: 3,
                noi_dung: `Ngày ${day.id} interlude có speaker không tồn tại: "${line.speaker}"`,
              });
            }
          }
        }
      }
    }
  }

  for (const t of travelers) {
    if (t.character && !characterIds.has(t.character)) {
      phatHien.push({
        muc: "loi",
        dieu: 3,
        noi_dung: `Lượt "${t.id}" khai báo character không tồn tại: "${t.character}"`,
      });
    }

    if (Array.isArray(t.dialogue)) {
      for (const line of t.dialogue) {
        if (line.speaker && !allowedSpeakers.has(line.speaker)) {
          phatHien.push({
            muc: "loi",
            dieu: 3,
            noi_dung: `Lượt "${t.id}" thoại có speaker không tồn tại: "${line.speaker}"`,
          });
        }
      }
    }

    if (t.reactions) {
      for (const act of ["CHO_QUA", "GIU_LAI"] as const) {
        if (Array.isArray(t.reactions[act])) {
          for (const line of t.reactions[act]) {
            if (line.speaker && !allowedSpeakers.has(line.speaker)) {
              phatHien.push({
                muc: "loi",
                dieu: 3,
                noi_dung: `Lượt "${t.id}" reaction ${act} có speaker không tồn tại: "${line.speaker}"`,
              });
            }
          }
        }
      }
    }

    if (t.bribe && Array.isArray(t.bribe.lines)) {
      for (const line of t.bribe.lines) {
        if (line.speaker && !allowedSpeakers.has(line.speaker)) {
          phatHien.push({
            muc: "loi",
            dieu: 3,
            noi_dung: `Lượt "${t.id}" bribe line có speaker không tồn tại: "${line.speaker}"`,
          });
        }
      }
    }

    if (t.kn?.issue && !issueIds.has(t.kn.issue)) {
      phatHien.push({
        muc: "loi",
        dieu: 3,
        noi_dung: `Lượt "${t.id}" kn.issue trỏ đến vấn đề không tồn tại: "${t.kn.issue}"`,
      });
    }

    if (Array.isArray(t.expected?.violations)) {
      for (const v of t.expected.violations) {
        if (v.rule && !ruleIds.has(v.rule)) {
          phatHien.push({
            muc: "loi",
            dieu: 3,
            noi_dung: `Lượt "${t.id}" expected.violations chứa mã rule không tồn tại: "${v.rule}"`,
          });
        }
      }
    }
  }

  return phatHien;
}

/** Điều 4: characters[].appearances khớp đúng các lượt có character đó. */
export function kiemTraDieu4(characters: any[], travelers: any[]): PhatHien[] {
  const phatHien: PhatHien[] = [];

  const actualAppearances = new Map<string, string[]>();
  for (const t of travelers) {
    if (!t.character) continue;
    const list = actualAppearances.get(t.character) ?? [];
    list.push(t.id);
    actualAppearances.set(t.character, list);
  }

  for (const c of characters) {
    const declared = c.appearances ?? [];
    const actual = actualAppearances.get(c.id) ?? [];

    const declaredStr = declared.join(",");
    const actualStr = actual.join(",");

    if (declaredStr !== actualStr) {
      phatHien.push({
        muc: "loi",
        dieu: 4,
        noi_dung: `Nhân vật "${c.id}" khai báo appearances là [${declared.join(", ")}] nhưng thực tế xuất hiện ở [${actual.join(", ")}]`,
      });
    }
  }

  return phatHien;
}

/** Điều 5: Với nhân vật có fixed_fields: mọi giấy có trường chủ giấy của họ ghi đúng ho_ten, mọi giấy có trường năm sinh ghi đúng nam_sinh — trừ khi lượt đó cài E2 có chủ đích trong planted. */
export function kiemTraDieu5(characters: any[], travelers: any[], documents: any[]): PhatHien[] {
  const phatHien: PhatHien[] = [];

  const charMap = new Map<string, any>(characters.map((c) => [c.id, c]));
  const docDefMap = new Map<string, any>(documents.map((d) => [d.code, d]));

  for (const t of travelers) {
    const char = charMap.get(t.character);
    if (!char?.fixed_fields) continue;

    const hasPlantedE2 = Array.isArray(t.planted) && t.planted.some((p: any) => p.error === "E2");
    if (hasPlantedE2) continue;

    if (!Array.isArray(t.documents)) continue;

    for (const doc of t.documents) {
      const docDef = docDefMap.get(doc.type);
      if (!docDef || !doc.fields) continue;

      if (docDef.holder_field && doc.fields[docDef.holder_field] !== undefined) {
        const val = doc.fields[docDef.holder_field];
        if (val !== char.fixed_fields.ho_ten) {
          phatHien.push({
            muc: "loi",
            dieu: 5,
            noi_dung: `Lượt "${t.id}" nhân vật "${char.id}": giấy ${doc.type} có trường chủ giấy ${docDef.holder_field}="${val}" không khớp fixed_fields.ho_ten="${char.fixed_fields.ho_ten}" (không cài E2)`,
          });
        }
      }

      if (docDef.birth_year_field && doc.fields[docDef.birth_year_field] !== undefined) {
        const val = doc.fields[docDef.birth_year_field];
        if (val !== char.fixed_fields.nam_sinh) {
          phatHien.push({
            muc: "loi",
            dieu: 5,
            noi_dung: `Lượt "${t.id}" nhân vật "${char.id}": giấy ${doc.type} có trường năm sinh ${docDef.birth_year_field}=${val} không khớp fixed_fields.nam_sinh=${char.fixed_fields.nam_sinh} (không cài E2)`,
          });
        }
      }
    }
  }

  return phatHien;
}

/** Điều 6: documents.json có đúng 8 loại, trường trùng khớp $defs/doc_* của travelers.schema.json. */
export function kiemTraDieu6(documents: any[], travelersSchema: any): PhatHien[] {
  const phatHien: PhatHien[] = [];

  if (documents.length !== 8) {
    phatHien.push({
      muc: "loi",
      dieu: 6,
      noi_dung: `documents.json có ${documents.length} loại giấy, mong đợi đúng 8 loại`,
    });
  }

  if (!travelersSchema?.$defs) {
    phatHien.push({
      muc: "canh_bao",
      dieu: 6,
      noi_dung: "Không tìm thấy travelers.schema.json để đối chiếu trường giấy tờ",
    });
    return phatHien;
  }

  for (const doc of documents) {
    const schemaDef = travelersSchema.$defs[`doc_${doc.code}`];
    if (!schemaDef) {
      phatHien.push({
        muc: "loi",
        dieu: 6,
        noi_dung: `Không tìm thấy $defs/doc_${doc.code} trong travelers.schema.json`,
      });
      continue;
    }

    const schemaFields = schemaDef.properties?.fields?.properties;
    if (!schemaFields) {
      phatHien.push({
        muc: "loi",
        dieu: 6,
        noi_dung: `$defs/doc_${doc.code} thiếu properties.fields.properties trong schema`,
      });
      continue;
    }

    const docKeys = new Set<string>((doc.fields ?? []).map((f: any) => String(f.key)));
    const schemaKeys = new Set(Object.keys(schemaFields));

    for (const k of schemaKeys) {
      if (!docKeys.has(k)) {
        phatHien.push({
          muc: "loi",
          dieu: 6,
          noi_dung: `Giấy ${doc.code} trong documents.json thiếu trường "${k}" theo travelers.schema.json`,
        });
      }
    }

    for (const k of docKeys) {
      if (!schemaKeys.has(k)) {
        phatHien.push({
          muc: "loi",
          dieu: 6,
          noi_dung: `Giấy ${doc.code} trong documents.json có trường lạ "${k}" không khớp travelers.schema.json`,
        });
      }
    }
  }

  return phatHien;
}

/** Điều 7: Không giấy nào xuất hiện trước introduced_day của loại đó. */
export function kiemTraDieu7(days: any[], travelers: any[], documents: any[]): PhatHien[] {
  const phatHien: PhatHien[] = [];
  const docDefMap = new Map<string, any>(documents.map((d) => [d.code, d]));

  for (const t of travelers) {
    const tDayOrder = DAY_ORDER[t.day];
    if (!tDayOrder || !Array.isArray(t.documents)) continue;

    for (const doc of t.documents) {
      const docDef = docDefMap.get(doc.type);
      if (!docDef?.introduced_day) continue;

      const introDayOrder = DAY_ORDER[docDef.introduced_day];
      if (introDayOrder !== undefined && tDayOrder < introDayOrder) {
        phatHien.push({
          muc: "loi",
          dieu: 7,
          noi_dung: `Lượt "${t.id}" (ngày ${t.day}) có giấy ${doc.type} xuất hiện trước introduced_day="${docDef.introduced_day}"`,
        });
      }
    }
  }

  return phatHien;
}

/** Điều 8: Mã thuốc trong cargo không có trong danh mục R3 được coi là thuốc không quản lý. Validate liệt kê chúng dạng thông tin để KB xác nhận là cố ý. */
export function kiemTraDieu8(travelers: any[], rules: any[]): PhatHien[] {
  const phatHien: PhatHien[] = [];

  const r3 = rules.find((r) => r.id === "R3-DON-THUOC");
  const danhMucThuoc = new Set((r3?.params?.danh_muc_thuoc ?? []).map((t: any) => t.ma));

  for (const t of travelers) {
    if (!Array.isArray(t.cargo)) continue;
    for (const item of t.cargo) {
      if (item.category === "THUOC") {
        if (!danhMucThuoc.has(item.ma)) {
          phatHien.push({
            muc: "thong_tin",
            dieu: 8,
            noi_dung: `Lượt "${t.id}" có mặt hàng thuốc mã "${item.ma}" không nằm trong danh mục quản lý của R3-DON-THUOC (thuốc không quản lý)`,
          });
        }
      }
    }
  }

  return phatHien;
}

/** Điều 9: Mọi dòng hàng HANG_CAM phải có mã trong danh mục R6, và ngược lại mọi dòng hàng có mã trong danh mục R6 phải thuộc nhóm HANG_CAM. */
export function kiemTraDieu9(travelers: any[], rules: any[]): PhatHien[] {
  const phatHien: PhatHien[] = [];

  const r6 = rules.find((r) => r.id === "R6-HANG-CAM");
  const danhMucHangCam = new Set((r6?.params?.danh_muc ?? []).map((d: any) => d.ma));

  for (const t of travelers) {
    if (!Array.isArray(t.cargo)) continue;
    for (const item of t.cargo) {
      if (item.category === "HANG_CAM") {
        if (!danhMucHangCam.has(item.ma)) {
          phatHien.push({
            muc: "loi",
            dieu: 9,
            noi_dung: `Lượt "${t.id}" có hàng nhóm HANG_CAM với mã "${item.ma}" không nằm trong danh mục R6`,
          });
        }
      }

      if (danhMucHangCam.has(item.ma)) {
        if (item.category !== "HANG_CAM") {
          phatHien.push({
            muc: "loi",
            dieu: 9,
            noi_dung: `Lượt "${t.id}" có hàng mã "${item.ma}" (thuộc danh mục hàng cấm R6) nhưng lại ghi category="${item.category}" thay vì HANG_CAM`,
          });
        }
      }
    }
  }

  return phatHien;
}

/** Điều 10: Mỗi flag_key chỉ dùng cho một lượt. Mọi cờ được nhắc trong when phải được ghi ở một lượt trước chỗ dùng. */
export function kiemTraDieu10(days: any[], travelers: any[]): PhatHien[] {
  const phatHien: PhatHien[] = [];

  const seenFlagKeys = new Map<string, string>();
  for (const t of travelers) {
    if (t.flag_key) {
      if (seenFlagKeys.has(t.flag_key)) {
        phatHien.push({
          muc: "loi",
          dieu: 10,
          noi_dung: `flag_key "${t.flag_key}" bị dùng trùng ở hai lượt "${seenFlagKeys.get(t.flag_key)}" và "${t.id}"`,
        });
      } else {
        seenFlagKeys.set(t.flag_key, t.id);
      }
    }
  }

  const definedFlagsSoFar = new Set<string>();

  for (let i = 0; i < travelers.length; i += 1) {
    const t = travelers[i];

    function checkCondition(cond: any, viTri: string) {
      if (cond && typeof cond === "object" && typeof cond.flag === "string") {
        if (!definedFlagsSoFar.has(cond.flag)) {
          phatHien.push({
            muc: "loi",
            dieu: 10,
            noi_dung: `Lượt "${t.id}" (${viTri}) sử dụng cờ "${cond.flag}" trong điều kiện when trước khi cờ này được ghi`,
          });
        }
      }
    }

    if (Array.isArray(t.dialogue)) {
      for (const line of t.dialogue) {
        if (Array.isArray(line.when)) {
          for (const cond of line.when) checkCondition(cond, "dialogue");
        }
      }
    }

    if (t.reactions) {
      for (const act of ["CHO_QUA", "GIU_LAI"] as const) {
        if (Array.isArray(t.reactions[act])) {
          for (const line of t.reactions[act]) {
            if (Array.isArray(line.when)) {
              for (const cond of line.when) checkCondition(cond, `reaction ${act}`);
            }
          }
        }
      }
    }

    if (t.flag_key) {
      definedFlagsSoFar.add(t.flag_key);
    }
  }

  return phatHien;
}

/** Chạy toàn bộ 10 điều kiểm tra của Tầng 2. */
export function kiemTraTang2(duLieu: TatCaDuLieu, options: { strict?: boolean } = {}): PhatHien[] {
  const strict = options.strict ?? false;

  return [
    ...kiemTraDieu1(duLieu.days, duLieu.travelers),
    ...kiemTraDieu2(duLieu.days, duLieu.travelers, strict),
    ...kiemTraDieu3(duLieu.days, duLieu.travelers, duLieu.characters, duLieu.rules, duLieu.reports),
    ...kiemTraDieu4(duLieu.characters, duLieu.travelers),
    ...kiemTraDieu5(duLieu.characters, duLieu.travelers, duLieu.documents),
    ...kiemTraDieu6(duLieu.documents, duLieu.travelersSchema),
    ...kiemTraDieu7(duLieu.days, duLieu.travelers, duLieu.documents),
    ...kiemTraDieu8(duLieu.travelers, duLieu.rules),
    ...kiemTraDieu9(duLieu.travelers, duLieu.rules),
    ...kiemTraDieu10(duLieu.days, duLieu.travelers),
  ];
}

// ---------------------------------------------------------------------------
// TẦNG 3 — Logic (docs/03-rules-spec.md mục 10)
// ---------------------------------------------------------------------------

/** Tầng 3 - Điều 1: evaluate phải ra đúng expected (xét cả 2 trạng thái KN-KHOAN ở d5). */
export function kiemTraTang3Dieu1(duLieu: TatCaDuLieu): PhatHien[] {
  const phatHien: PhatHien[] = [];
  const book = { rules: duLieu.rules, documents: duLieu.documents };

  for (const t of duLieu.travelers) {
    const day = duLieu.days.find((d) => d.id === t.day);
    if (!day) continue;

    if (t.day === "d5") {
      const evalOff = evaluate(t, day, book, new Set<IssueId>());
      const evalOn = evaluate(t, day, book, new Set<IssueId>(["KN-KHOAN"]));

      if (evalOff.verdict !== evalOn.verdict) {
        phatHien.push({
          muc: "thong_tin",
          dieu: 1,
          noi_dung: `Lượt "${t.id}" ở ngày d5 cho kết quả khác nhau giữa hai trạng thái KN-KHOAN (tắt: ${evalOff.verdict}, bật: ${evalOn.verdict})`,
        });
      }

      if (t.expected?.verdict !== evalOff.verdict) {
        phatHien.push({
          muc: "loi",
          dieu: 1,
          noi_dung: `Lượt "${t.id}" có expected.verdict="${t.expected?.verdict}" nhưng evaluate ra "${evalOff.verdict}" (xét trạng thái KN-KHOAN chưa kích hoạt)`,
        });
      }
    } else {
      const evalResult = evaluate(t, day, book, new Set<IssueId>());
      if (t.expected?.verdict !== evalResult.verdict) {
        phatHien.push({
          muc: "loi",
          dieu: 1,
          noi_dung: `Lượt "${t.id}" có expected.verdict="${t.expected?.verdict}" nhưng evaluate ra "${evalResult.verdict}"`,
        });
      }
    }
  }

  return phatHien;
}

/** Tầng 3 - Điều 2 và 3: So khớp planted và vi phạm evaluate (báo lỗi ngủ và lỗi vô tình). */
export function kiemTraTang3Dieu2Va3(duLieu: TatCaDuLieu): PhatHien[] {
  const phatHien: PhatHien[] = [];
  const book = { rules: duLieu.rules, documents: duLieu.documents };

  for (const t of duLieu.travelers) {
    const day = duLieu.days.find((d) => d.id === t.day);
    if (!day) continue;

    const evalResult = evaluate(t, day, book, new Set<IssueId>());
    const active = activeRules(duLieu.rules, t.day, new Set<IssueId>());

    const activeEmits = new Set<string>();
    for (const r of active) {
      for (const e of r.emits ?? []) activeEmits.add(e);
    }

    // Điều 2: Lỗi trong planted
    for (const p of t.planted ?? []) {
      if (!activeEmits.has(p.error)) {
        phatHien.push({
          muc: "thong_tin",
          dieu: 2,
          noi_dung: `Lượt "${t.id}" có lỗi ngủ [${p.error}]: quy định kiểm tra lỗi này chưa có hiệu lực ở ngày ${t.day}`,
        });
      } else {
        const found = evalResult.violations.some((v) => v.error === p.error);
        if (!found) {
          phatHien.push({
            muc: "loi",
            dieu: 2,
            noi_dung: `Lượt "${t.id}" cài lỗi [${p.error}] trong planted nhưng evaluate không tìm thấy vi phạm này`,
          });
        }
      }
    }

    // Điều 3: Vi phạm vô tình
    for (const v of evalResult.violations) {
      if (v.error !== null) {
        const inPlanted = (t.planted ?? []).some((p: any) => p.error === v.error);
        if (!inPlanted) {
          phatHien.push({
            muc: "canh_bao",
            dieu: 3,
            noi_dung: `Lượt "${t.id}" có vi phạm vô tình [${v.rule}: ${v.error}]: evaluate phát hiện nhưng không có trong planted`,
          });
        }
      }
    }
  }

  return phatHien;
}

/** Tầng 3 - Điều 4: Ít nhất 5 lượt có nhãn buon-lau-that, và tất cả đều có expected.verdict = GIU_LAI. */
export function kiemTraTang3Dieu4(travelers: any[]): PhatHien[] {
  const phatHien: PhatHien[] = [];
  const buonLau = travelers.filter((t) => Array.isArray(t.tags) && t.tags.includes("buon-lau-that"));

  if (buonLau.length < 5) {
    phatHien.push({
      muc: "loi",
      dieu: 4,
      noi_dung: `Chỉ có ${buonLau.length} lượt mang nhãn "buon-lau-that", yêu cầu ít nhất 5 lượt`,
    });
  }

  for (const t of buonLau) {
    if (t.expected?.verdict !== "GIU_LAI") {
      phatHien.push({
        muc: "loi",
        dieu: 4,
        noi_dung: `Lượt buôn lậu thật "${t.id}" có expected.verdict="${t.expected?.verdict}" thay vì "GIU_LAI"`,
      });
    }
  }

  return phatHien;
}

/** Tầng 3 - Điều 5: d3–d4 có ít nhất 3 lượt kn.issue = KN-KHOAN. */
export function kiemTraTang3Dieu5(travelers: any[]): PhatHien[] {
  const phatHien: PhatHien[] = [];
  const count = travelers.filter(
    (t) => (t.day === "d3" || t.day === "d4") && t.kn?.issue === "KN-KHOAN",
  ).length;

  if (count < 3) {
    phatHien.push({
      muc: "loi",
      dieu: 5,
      noi_dung: `Ngày d3–d4 chỉ có ${count} lượt có kn.issue = "KN-KHOAN", yêu cầu ít nhất 3 lượt`,
    });
  }

  return phatHien;
}

/** Tầng 3 - Điều 6: anh-hung có ít nhất 3 lượt trong d3–d5 với kn.issue = KN-THUONG-BINH. */
export function kiemTraTang3Dieu6(travelers: any[]): PhatHien[] {
  const phatHien: PhatHien[] = [];
  const count = travelers.filter(
    (t) =>
      (t.day === "d3" || t.day === "d4" || t.day === "d5") &&
      t.character === "anh-hung" &&
      t.kn?.issue === "KN-THUONG-BINH",
  ).length;

  if (count < 3) {
    phatHien.push({
      muc: "loi",
      dieu: 6,
      noi_dung: `Nhân vật anh-hung chỉ có ${count} lượt mang kn.issue = "KN-THUONG-BINH" trong d3–d5, yêu cầu ít nhất 3 lượt`,
    });
  }

  return phatHien;
}

/** Tầng 3 - Điều 7: d6 có đúng 5 lượt, ít nhất 1 lượt vi phạm R6. */
export function kiemTraTang3Dieu7(travelers: any[]): PhatHien[] {
  const phatHien: PhatHien[] = [];
  const d6 = travelers.filter((t) => t.day === "d6");

  if (d6.length !== 5) {
    phatHien.push({
      muc: "loi",
      dieu: 7,
      noi_dung: `Ngày d6 có ${d6.length} lượt, yêu cầu đúng 5 lượt`,
    });
  }

  const coViPhamR6 = d6.some((t) => t.expected?.violations?.some((v: any) => v.rule === "R6-HANG-CAM"));
  if (!coViPhamR6) {
    phatHien.push({
      muc: "loi",
      dieu: 7,
      noi_dung: `Ngày d6 không có lượt nào vi phạm R6-HANG-CAM, yêu cầu ít nhất 1 lượt`,
    });
  }

  return phatHien;
}

/** Tầng 3 - Điều 8: Ít nhất 2 lượt có bribe. */
export function kiemTraTang3Dieu8(travelers: any[]): PhatHien[] {
  const phatHien: PhatHien[] = [];
  const count = travelers.filter((t) => t.bribe !== null && t.bribe !== undefined).length;

  if (count < 2) {
    phatHien.push({
      muc: "loi",
      dieu: 8,
      noi_dung: `Chỉ có ${count} lượt có phong bì (bribe), yêu cầu ít nhất 2 lượt`,
    });
  }

  return phatHien;
}

/** Tầng 3 - Điều 9: Tổng số dịp kiến nghị hợp lệ trong d3–d5 ≥ 4. */
export function kiemTraTang3Dieu9(travelers: any[]): PhatHien[] {
  const phatHien: PhatHien[] = [];
  const count = travelers.filter(
    (t) => (t.day === "d3" || t.day === "d4" || t.day === "d5") && t.kn !== null && t.kn !== undefined,
  ).length;

  if (count < 4) {
    phatHien.push({
      muc: "loi",
      dieu: 9,
      noi_dung: `Tổng số dịp kiến nghị trong d3–d5 là ${count}, yêu cầu ít nhất 4`,
    });
  }

  return phatHien;
}

/** Tầng 3 - Điều 10: Mỗi nhân vật chinh xuất hiện ít nhất 3 lần. */
export function kiemTraTang3Dieu10(characters: any[], travelers: any[]): PhatHien[] {
  const phatHien: PhatHien[] = [];
  const mainChars = characters.filter((c) => c.role === "chinh");

  for (const c of mainChars) {
    const count = travelers.filter((t) => t.character === c.id).length;
    if (count < 3) {
      phatHien.push({
        muc: "loi",
        dieu: 10,
        noi_dung: `Nhân vật chính "${c.id}" chỉ xuất hiện ${count} lần, yêu cầu ít nhất 3 lần`,
      });
    }
  }

  return phatHien;
}

/** Tầng 3 - Điều 11: Không lượt nào vừa có bribe vừa có kn. */
export function kiemTraTang3Dieu11(travelers: any[]): PhatHien[] {
  const phatHien: PhatHien[] = [];

  for (const t of travelers) {
    if (t.bribe !== null && t.bribe !== undefined && t.kn !== null && t.kn !== undefined) {
      phatHien.push({
        muc: "loi",
        dieu: 11,
        noi_dung: `Lượt "${t.id}" vừa có bribe vừa có kn`,
      });
    }
  }

  return phatHien;
}

/** Kiểm tra biến {{…}} trong strings.json và endings.json (TXT-04). */
export function kiemTraBienChu(strings: Record<string, string>, endings: any, reports: any[]): PhatHien[] {
  const phatHien: PhatHien[] = [];
  const validVars = new Set<string>(["bribe_total", "valid_reports", "hang_tich_thu_kg", "day_label"]);

  for (const r of reports) {
    validVars.add(`kn_remaining:${r.id}`);
  }

  function checkString(s: string, source: string) {
    const vars = listVariables(s);
    for (const v of vars) {
      if (!validVars.has(v)) {
        phatHien.push({
          muc: "canh_bao",
          dieu: 12,
          noi_dung: `Biến không tồn tại "{{${v}}}" trong ${source}`,
        });
      }
    }
  }

  for (const [k, v] of Object.entries(strings)) {
    if (typeof v === "string") checkString(v, `strings.json key "${k}"`);
  }

  const endingsStr = JSON.stringify(endings);
  for (const v of listVariables(endingsStr)) {
    if (!validVars.has(v)) {
      phatHien.push({
        muc: "canh_bao",
        dieu: 12,
        noi_dung: `Biến không tồn tại "{{${v}}}" trong endings.json`,
      });
    }
  }

  return phatHien;
}

/** Chạy toàn bộ kiểm tra của Tầng 3. */
export function kiemTraTang3(duLieu: TatCaDuLieu): PhatHien[] {
  return [
    ...kiemTraTang3Dieu1(duLieu),
    ...kiemTraTang3Dieu2Va3(duLieu),
    ...kiemTraTang3Dieu4(duLieu.travelers),
    ...kiemTraTang3Dieu5(duLieu.travelers),
    ...kiemTraTang3Dieu6(duLieu.travelers),
    ...kiemTraTang3Dieu7(duLieu.travelers),
    ...kiemTraTang3Dieu8(duLieu.travelers),
    ...kiemTraTang3Dieu9(duLieu.travelers),
    ...kiemTraTang3Dieu10(duLieu.characters, duLieu.travelers),
    ...kiemTraTang3Dieu11(duLieu.travelers),
    ...kiemTraBienChu(duLieu.strings, duLieu.endings, duLieu.reports),
  ];
}

// ---------------------------------------------------------------------------
// In báo cáo
// ---------------------------------------------------------------------------

const DAU = { xanh: "✓", do: "✗" } as const;

function inKetQuaTang1(ketQua: KetQuaTang1, soLoiIn: number): void {
  const soLuong = ketQua.soPhanTu === null ? "" : ` (${ketQua.soPhanTu} phần tử)`;
  console.log(`${DAU[ketQua.trangThai]} ${ketQua.ten}.json${soLuong}`);

  for (const dong of ketQua.loi) console.log(`    ${dong}`);

  if (ketQua.tongSoLoi > soLoiIn) {
    console.log(`    … và ${ketQua.tongSoLoi - soLoiIn} lỗi nữa. Chạy lại với --loi ${ketQua.tongSoLoi} để xem hết.`);
  }
}

function inKetQuaTang2(phatHien: PhatHien[]): void {
  console.log("\nTẦNG 2 — Tham chiếu chéo:");

  const loi = phatHien.filter((p) => p.muc === "loi");
  const canhBao = phatHien.filter((p) => p.muc === "canh_bao");
  const thongTin = phatHien.filter((p) => p.muc === "thong_tin");

  if (phatHien.length === 0) {
    console.log("✓ Đạt toàn bộ 10 điều kiểm tra tham chiếu chéo.");
    return;
  }

  for (const p of loi) console.log(`  ✗ [Điều ${p.dieu}] Lỗi: ${p.noi_dung}`);
  for (const p of canhBao) console.log(`  ⚠ [Điều ${p.dieu}] Cảnh báo: ${p.noi_dung}`);
  for (const p of thongTin) console.log(`  ℹ [Điều ${p.dieu}] Thông tin: ${p.noi_dung}`);

  console.log(`Tổng kết Tầng 2: ${loi.length} lỗi, ${canhBao.length} cảnh báo, ${thongTin.length} thông tin.`);
}

function inKetQuaTang3(phatHien: PhatHien[], duLieu: TatCaDuLieu): void {
  console.log("\nTẦNG 3 — Logic game:");

  const loi = phatHien.filter((p) => p.muc === "loi");
  const canhBao = phatHien.filter((p) => p.muc === "canh_bao");
  const thongTin = phatHien.filter((p) => p.muc === "thong_tin");

  for (const p of loi) console.log(`  ✗ [Điều ${p.dieu}] Lỗi: ${p.noi_dung}`);
  for (const p of canhBao) console.log(`  ⚠ [Điều ${p.dieu}] Cảnh báo: ${p.noi_dung}`);
  for (const p of thongTin) console.log(`  ℹ [Điều ${p.dieu}] Thông tin: ${p.noi_dung}`);

  if (loi.length === 0) {
    console.log("✓ Đạt toàn bộ 11 điều kiểm tra logic.");
  }

  console.log(`Tổng kết Tầng 3: ${loi.length} lỗi, ${canhBao.length} cảnh báo, ${thongTin.length} thông tin.`);

  // Bảng tóm tắt 26 lượt
  console.log("\nBẢNG TÓM TẮT 26 LƯỢT:");
  console.log("Mã lượt | Nhân vật           | Dự kiến   | Cài cắm | Ghi chú");
  console.log("-------+--------------------+-----------+---------+----------------------------");
  for (const t of duLieu.travelers) {
    const id = t.id.padEnd(6);
    const char = (t.character ?? "").padEnd(18);
    const verdict = (t.expected?.verdict ?? "").padEnd(9);
    const planted = (t.planted ?? []).map((p: any) => p.error).join(",") || "—";
    const tags = (t.tags ?? []).join(", ");
    console.log(`${id} | ${char} | ${verdict} | ${planted.padEnd(7)} | ${tags}`);
  }
}

// ---------------------------------------------------------------------------
// Điểm vào CLI
// ---------------------------------------------------------------------------

export async function main(argv = process.argv.slice(2)): Promise<number> {
  let cauHinh: CauHinh;
  try {
    cauHinh = docThamSo(argv);
  } catch (loi) {
    console.error(`Lỗi tham số: ${(loi as Error).message}`);
    return 1;
  }

  console.log(`Kiểm tra dữ liệu trong ${path.relative(ROOT, cauHinh.thuMucData) || "."}/\n`);

  console.log("TẦNG 1 — Cấu trúc schema:");
  const ketQuaTang1: KetQuaTang1[] = [];
  for (const ten of DATA_FILES) {
    const k = await kiemTraMotFile(ten, cauHinh);
    ketQuaTang1.push(k);
    inKetQuaTang1(k, cauHinh.soLoiIn);
  }

  const tang1Hong = ketQuaTang1.some((k) => k.trangThai === "do");

  let tatCaDuLieu: TatCaDuLieu;
  try {
    tatCaDuLieu = await docTatCaDuLieu(cauHinh.thuMucData);
  } catch (loi) {
    console.error(`\nKhông thể tiếp tục Tầng 2 & 3: ${(loi as Error).message}`);
    return 1;
  }

  const phatHienTang2 = kiemTraTang2(tatCaDuLieu, { strict: cauHinh.strict });
  inKetQuaTang2(phatHienTang2);

  const phatHienTang3 = kiemTraTang3(tatCaDuLieu);
  inKetQuaTang3(phatHienTang3, tatCaDuLieu);

  const tang2CoLoi = phatHienTang2.some((p) => p.muc === "loi");
  const tang2CoCanhBao = phatHienTang2.some((p) => p.muc === "canh_bao");
  const tang3CoLoi = phatHienTang3.some((p) => p.muc === "loi");
  const tang3CoCanhBao = phatHienTang3.some((p) => p.muc === "canh_bao");

  const coLoi = tang1Hong || tang2CoLoi || tang3CoLoi;
  const coCanhBao = tang2CoCanhBao || tang3CoCanhBao;

  if (coLoi || (cauHinh.strict && coCanhBao)) {
    return 1;
  }

  console.log("\nTất cả các tầng kiểm tra đều đạt yêu cầu!");
  return 0;
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isMain) {
  try {
    process.exitCode = await main();
  } catch (loi) {
    console.error(`Lỗi không lường trước: ${(loi as Error).message}`);
    process.exitCode = 1;
  }
}
