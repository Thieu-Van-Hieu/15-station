/**
 * validate-data.ts — kiểm tra dữ liệu của game "Trạm 15".
 *
 * TẦNG 1 — Cấu trúc: mọi file trong data/ khớp schema trong data/schema/.
 * TẦNG 2 — Tham chiếu chéo: xem docs/03-rules-spec.md mục 10. Chưa hiện thực.
 * TẦNG 3 — Logic: chạy engine lên từng lượt, so với expected. Chưa hiện thực.
 *
 * Chạy:
 *   npx tsx scripts/validate-data.ts
 *   npx tsx scripts/validate-data.ts --data data/mau   (kiểm tra một thư mục khác)
 *   npx tsx scripts/validate-data.ts --loi 50          (in nhiều lỗi hơn cho mỗi file)
 *
 * Thoát với mã 0 nếu tất cả xanh, mã 1 nếu có bất kỳ lỗi nào.
 */

import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020, { type ErrorObject, type ValidateFunction } from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

// ---------------------------------------------------------------------------
// Cấu hình
// ---------------------------------------------------------------------------

/** Thứ tự kiểm tra: file nền tảng trước, file phụ thuộc vào chúng sau. */
const DATA_FILES = [
  "rules",
  "documents",
  "characters",
  "days",
  "travelers",
  "reports",
  "endings",
  "strings",
] as const;

type DataName = (typeof DATA_FILES)[number];

const SO_LOI_IN_MAC_DINH = 20;

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

interface CauHinh {
  thuMucData: string;
  thuMucSchema: string;
  soLoiIn: number;
}

function docThamSo(argv: string[]): CauHinh {
  let thuMucData = path.join(ROOT, "data");
  let soLoiIn = SO_LOI_IN_MAC_DINH;

  for (let i = 0; i < argv.length; i += 1) {
    const co = argv[i];
    if (co === "--data" || co === "--loi") {
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

  return { thuMucData, thuMucSchema: path.join(thuMucData, "schema"), soLoiIn };
}

// ---------------------------------------------------------------------------
// Kết quả
// ---------------------------------------------------------------------------

type TrangThai = "xanh" | "do";

interface KetQua {
  ten: DataName;
  trangThai: TrangThai;
  /** Số phần tử của mảng dữ liệu, hoặc số khoá nếu là object. Null khi không đọc được. */
  soPhanTu: number | null;
  /** Lỗi ở dạng đã rút gọn để in. */
  loi: string[];
  /** Tổng số lỗi trước khi cắt bớt. */
  tongSoLoi: number;
}

// ---------------------------------------------------------------------------
// Đọc file
// ---------------------------------------------------------------------------

/** Đọc một file JSON. Ném Error có thông điệp tiếng Việt, đã gắn đường dẫn. */
async function docJson(duongDan: string): Promise<unknown> {
  let noiDung: string;

  try {
    noiDung = await readFile(duongDan, "utf8");
  } catch (loi) {
    const ma = (loi as NodeJS.ErrnoException).code;
    if (ma === "ENOENT") throw new Error(`Không tìm thấy file: ${duongDan}`);
    if (ma === "EACCES") throw new Error(`Không có quyền đọc file: ${duongDan}`);
    throw new Error(`Không đọc được file ${duongDan}: ${(loi as Error).message}`);
  }

  // Bỏ BOM nếu file được lưu từ editor trên Windows.
  const sach = noiDung.charCodeAt(0) === 0xfeff ? noiDung.slice(1) : noiDung;

  if (sach.trim() === "") throw new Error(`File rỗng: ${duongDan}`);

  try {
    return JSON.parse(sach) as unknown;
  } catch (loi) {
    throw new Error(`JSON không hợp lệ trong ${duongDan}: ${(loi as Error).message}`);
  }
}

// ---------------------------------------------------------------------------
// Ajv
// ---------------------------------------------------------------------------

/**
 * Tạo một Ajv cho draft 2020-12.
 *
 * - strict: bắt lỗi schema viết ẩu ngay khi compile.
 * - allowMatchingProperties: strings.schema.json cố ý khai các khoá bắt buộc
 *   trong `properties` mà chúng cũng khớp `patternProperties`.
 * - ajv-formats: schema hiện dùng `pattern` cho ngày tháng, nhưng đăng ký sẵn
 *   để thêm `format` về sau không phải sửa file này.
 */
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

interface BoKiemTra {
  ajv: Ajv2020;
  validate: ValidateFunction;
  schemaId: string;
}

async function bienDichSchema(ten: DataName, cauHinh: CauHinh): Promise<BoKiemTra> {
  const duongDan = path.join(cauHinh.thuMucSchema, `${ten}.schema.json`);
  const schema = (await docJson(duongDan)) as { $id?: string };
  const schemaId = schema.$id ?? `${ten}.schema.json`;

  try {
    // Mỗi schema dùng một Ajv riêng: một schema hỏng không làm hỏng các schema khác.
    const ajv = taoAjv();
    ajv.addSchema(schema as object, schemaId);
    const validate = ajv.getSchema(schemaId);
    if (validate === undefined) throw new Error(`không lấy được validator cho $id "${schemaId}"`);
    return { ajv, validate, schemaId };
  } catch (loi) {
    throw new Error(`Schema không biên dịch được (${duongDan}): ${(loi as Error).message}`);
  }
}

// ---------------------------------------------------------------------------
// Định dạng lỗi
// ---------------------------------------------------------------------------

/** `/travelers/0/documents/1/fields/vu` → `[0].documents[1].fields.vu` */
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

/** Lấy giá trị tại một instancePath của Ajv, trả về undefined nếu không tới được. */
function layGiaTri(goc: unknown, instancePath: string): unknown {
  let hienTai: unknown = goc;
  for (const doan of instancePath.split("/").filter((x) => x !== "")) {
    if (hienTai === null || typeof hienTai !== "object") return undefined;
    const khoa = doan.replace(/~1/g, "/").replace(/~0/g, "~");
    hienTai = (hienTai as Record<string, unknown>)[khoa];
  }
  return hienTai;
}

/** Đường dẫn của một giấy tờ trong travelers.json, ví dụ `/3/documents/1`. */
const DUONG_DAN_GIAY = /^\/\d+\/documents\/\d+/;

interface LoiDep {
  instancePath: string;
  noiDung: string;
}

/**
 * Giấy tờ trong travelers.json là một `oneOf` tám nhánh. Khi một giấy sai, Ajv
 * báo lỗi cho cả tám nhánh, nên thông điệp gốc gần như vô dụng: một giấy đi
 * đường thiếu trường lại bị báo là thiếu trường của sổ hộ khẩu.
 *
 * Cách xử lý: với mỗi giấy có lỗi, đọc `type` của chính giấy đó rồi kiểm tra
 * lại nó với đúng nhánh `$defs/doc_<LOẠI>`, và chỉ giữ lỗi của nhánh ấy.
 */
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

/** Bỏ các lỗi trùng nhau về vị trí, từ khoá và thông điệp. */
function locTrung(danhSach: ErrorObject[]): ErrorObject[] {
  const daThay = new Set<string>();
  return danhSach.filter((loi) => {
    const khoa = `${loi.instancePath}|${loi.keyword}|${loi.message ?? ""}`;
    if (daThay.has(khoa)) return false;
    daThay.add(khoa);
    return true;
  });
}

/**
 * Ajv sinh nhiều lỗi phụ cho `oneOf` và `anyOf`: mỗi nhánh không khớp đều để
 * lại dấu vết. Giữ lại các lỗi cụ thể và bỏ các lỗi tổng hợp ở nhánh cha.
 */
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

// ---------------------------------------------------------------------------
// Kiểm tra một file
// ---------------------------------------------------------------------------

function demPhanTu(duLieu: unknown): number | null {
  if (Array.isArray(duLieu)) return duLieu.length;
  if (duLieu !== null && typeof duLieu === "object") return Object.keys(duLieu).length;
  return null;
}

async function kiemTraMotFile(ten: DataName, cauHinh: CauHinh): Promise<KetQua> {
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
// In báo cáo
// ---------------------------------------------------------------------------

const DAU = { xanh: "✓", do: "✗" } as const;

function inKetQua(ketQua: KetQua, soLoiIn: number): void {
  const soLuong = ketQua.soPhanTu === null ? "" : ` (${ketQua.soPhanTu} phần tử)`;
  console.log(`${DAU[ketQua.trangThai]} ${ketQua.ten}.json${soLuong}`);

  for (const dong of ketQua.loi) console.log(`    ${dong}`);

  if (ketQua.tongSoLoi > soLoiIn) {
    console.log(`    … và ${ketQua.tongSoLoi - soLoiIn} lỗi nữa. Chạy lại với --loi ${ketQua.tongSoLoi} để xem hết.`);
  }
}

function inTongKet(ketQua: KetQua[]): void {
  const hong = ketQua.filter((k) => k.trangThai === "do");
  console.log("");

  if (hong.length === 0) {
    console.log(`Tầng 1: tất cả ${ketQua.length} file khớp schema.`);
    console.log("Tầng 2 và 3 chưa được hiện thực (xem docs/03-rules-spec.md mục 10).");
    return;
  }

  const tongLoi = hong.reduce((tong, k) => tong + k.tongSoLoi, 0);
  console.log(
    `Tầng 1: ${ketQua.length - hong.length}/${ketQua.length} file xanh. ` +
      `${tongLoi} lỗi ở: ${hong.map((k) => `${k.ten}.json`).join(", ")}.`,
  );
}

// ---------------------------------------------------------------------------
// Điểm vào
// ---------------------------------------------------------------------------

async function main(): Promise<number> {
  let cauHinh: CauHinh;
  try {
    cauHinh = docThamSo(process.argv.slice(2));
  } catch (loi) {
    console.error(`Lỗi tham số: ${(loi as Error).message}`);
    return 1;
  }

  console.log(`Kiểm tra dữ liệu trong ${path.relative(ROOT, cauHinh.thuMucData) || "."}/\n`);

  const ketQua: KetQua[] = [];
  for (const ten of DATA_FILES) {
    const k = await kiemTraMotFile(ten, cauHinh);
    ketQua.push(k);
    inKetQua(k, cauHinh.soLoiIn);
  }

  inTongKet(ketQua);
  return ketQua.some((k) => k.trangThai === "do") ? 1 : 0;
}

try {
  process.exitCode = await main();
} catch (loi) {
  // Lưới an toàn: không để lộ stack trace thô cho người dùng cuối.
  console.error(`Lỗi không lường trước: ${(loi as Error).message}`);
  process.exitCode = 1;
}
