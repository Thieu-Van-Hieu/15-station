/**
 * Hàm dựng dữ liệu cho unit test của engine.
 *
 * Mỗi hàm điền sẵn giá trị HỢP LỆ; test chỉ ghi phần khác biệt. Luật và loại
 * giấy dùng rules.json và documents.json THẬT, để ai sửa sổ lệch với 03 thì test đỏ.
 */

import { content } from "../../content";
import { activeRules } from "../active";
import { CHECKS } from "../checks";
import type {
  CargoItem,
  Category,
  Day,
  DayId,
  DocCNTB,
  DocDT,
  DocGDD,
  DocGPVC,
  DocGXNK,
  DocHDHTX,
  DocSHK,
  DocTP,
  ErrorCode,
  IssueId,
  Item,
  RuleBook,
  RuleId,
  Seal,
  SealKind,
  Traveler,
  TravelerId,
  Unit,
} from "../types";
import sampleD3T3 from "./d3-t3.json";

export const book: RuleBook = { rules: content.rules, documents: content.documents };

/** Lượt mẫu bà Tư mang giấy khoán, chép nguyên từ 03 mục 11. Trả về bản sao mới mỗi lần gọi. */
export function sampleTraveler(): Traveler {
  return structuredClone(sampleD3T3) as unknown as Traveler;
}

// ---------------------------------------------------------------------------
// Ngày
// ---------------------------------------------------------------------------

export const GAME_DATE: Record<DayId, string> = {
  d1: "1979-10-15",
  d2: "1979-10-22",
  d3: "1981-03-16",
  d4: "1981-03-23",
  d5: "1986-04-14",
  d6: "1987-06-15",
};

const ACT: Record<DayId, number> = { d1: 1, d2: 1, d3: 2, d4: 2, d5: 3, d6: 4 };

/** Kinh tế mặc định theo 03 mục 8.2. */
const ECONOMY: Record<DayId, Day["economy"]> = {
  d1: economy(20, 2, 3, [8, 3, 4, 2]),
  d2: economy(20, 2, 3, [8, 3, 4, 2]),
  d3: economy(22, 3, 3, [11, 4, 6, 2]),
  d4: economy(22, 3, 3, [11, 4, 6, 2]),
  d5: { ...economy(420, 40, 30, [230, 60, 90, 20]), currency_reform_divisor: 10 },
  d6: economy(1500, 0, 0, [800, 180, 300, 80]),
};

function economy(income: number, fine: number, bonus: number, [gao, than, thuocMe, hocPhi]: number[]): Day["economy"] {
  return {
    income,
    fine_per_error: fine,
    bonus_xuat_sac: bonus,
    expenses: [
      { id: "gao", label: "Gạo", cost: gao, essential: true },
      { id: "than", label: "Than", cost: than, essential: true },
      { id: "thuoc-me", label: "Thuốc cho mẹ", cost: thuocMe, essential: true, member: "me-thanh" },
      { id: "hoc-phi", label: "Học phí bé Mai", cost: hocPhi, essential: true, member: "be-mai" },
    ],
  };
}

export function day(id: DayId, over: Partial<Day> = {}): Day {
  return {
    id,
    act: ACT[id],
    label: id,
    game_date: GAME_DATE[id],
    new_rules: [],
    travelers: [],
    kn_enabled: id === "d3" || id === "d4" || id === "d5",
    clock: { start: "07:00", end: "17:00", per_traveler_min: 100, per_report_min: 60 },
    economy: structuredClone(ECONOMY[id]),
    other_factor: { text: "Yếu tố khác", deltas: {} },
    interludes: [],
    family_event: null,
    ...(id === "d1"
      ? { indicators_start: { luong_thuc_vao_thi_xa: 100, ho_thieu_an: 210, gia_gao_index: 100 }, savings_start: 10 }
      : {}),
    ...over,
  };
}

// ---------------------------------------------------------------------------
// Hàng và dấu
// ---------------------------------------------------------------------------

export function item(ma: string, so_luong: number, don_vi: Unit = "kg", ten = ma): Item {
  return { ma, ten, so_luong, don_vi };
}

export function goods(ma: string, so_luong: number, category: Category, don_vi: Unit = "kg"): CargoItem {
  return { ma, ten: ma, so_luong, don_vi, category };
}

export function seal(kind: SealKind, place = "Phú Hoà", legible = true): Seal {
  return { kind, place, legible };
}

// ---------------------------------------------------------------------------
// Giấy tờ. Mặc định: chủ giấy bà Tư, xã Phú Hoà, hạn rất xa, dấu đúng.
// ---------------------------------------------------------------------------

const TEN = "Trần Thị Lành";
const NAM_SINH = 1929;
const HAN_XA = "1999-12-31";

export function gdd(f: Partial<DocGDD["fields"]> = {}, s: Seal | null = seal("UBND_XA")): DocGDD {
  return {
    type: "GDD",
    fields: {
      ho_ten: TEN,
      nam_sinh: NAM_SINH,
      noi_di: "Phú Hoà",
      noi_den: "Thị xã",
      ly_do: "Thăm thân",
      hang_mang_theo: [],
      ngay_cap: "1979-01-01",
      co_gia_tri_den: HAN_XA,
      ...f,
    },
    seal: s,
  };
}

export function shk(f: Partial<DocSHK["fields"]> = {}, s: Seal | null = seal("CONG_AN")): DocSHK {
  return {
    type: "SHK",
    fields: {
      so_so: "PH-001",
      chu_ho: TEN,
      ho_ten: TEN,
      nam_sinh: NAM_SINH,
      quan_he_chu_ho: "Chủ hộ",
      dia_chi: "Phú Hoà",
      ...f,
    },
    seal: s,
  };
}

export function tp(f: Partial<DocTP["fields"]> = {}, s: Seal | null = seal("PHONG_LUONG_THUC")): DocTP {
  return { type: "TP", fields: { ho_ten: TEN, thang: "1979-10", mat_hang: item("gao", 13), ...f }, seal: s };
}

export function hdhtx(f: Partial<DocHDHTX["fields"]> = {}, s: Seal | null = seal("HTX")): DocHDHTX {
  return {
    type: "HDHTX",
    fields: { so_hd: "HD-01", htx_ten: "HTX Phú Hoà", nguoi_nhan: TEN, mat_hang: [], ngay: "1986-04-01", ...f },
    seal: s,
  };
}

export function gpvc(f: Partial<DocGPVC["fields"]> = {}, s: Seal | null = seal("CTY_THUONG_NGHIEP", "Tỉnh")): DocGPVC {
  return {
    type: "GPVC",
    fields: {
      so_gp: "GP-01",
      don_vi_cap: "Công ty Thương nghiệp tỉnh",
      nguoi_van_chuyen: TEN,
      mat_hang: [],
      tu: "Phú Hoà",
      den: "Thị xã",
      ngay_cap: "1986-04-01",
      co_gia_tri_den: HAN_XA,
      ...f,
    },
    seal: s,
  };
}

export function dt(f: Partial<DocDT["fields"]> = {}, s: Seal | null = seal("BENH_VIEN", "Huyện")): DocDT {
  return {
    type: "DT",
    fields: { benh_nhan: TEN, thuoc: [], bac_si: "BS. Hải", ngay_ke: "1981-03-10", co_gia_tri_den: HAN_XA, ...f },
    seal: s,
  };
}

export function cntb(f: Partial<DocCNTB["fields"]> = {}, s: Seal | null = seal("TB_XH", "Tỉnh")): DocCNTB {
  return {
    type: "CNTB",
    fields: { ho_ten: TEN, nam_sinh: NAM_SINH, hang: "2/4", so_the: "TB-01", don_vi_cap: "Sở TB-XH", ...f },
    seal: s,
  };
}

export function gxnk(f: Partial<DocGXNK["fields"]> = {}, s: Seal | null = seal("HTX")): DocGXNK {
  return {
    type: "GXNK",
    fields: {
      ho_ten: TEN,
      xa: "Phú Hoà",
      htx_ten: "HTX nông nghiệp Phú Hoà",
      san_pham: "Gạo",
      san_pham_ma: "gao",
      so_luong_kg: 13,
      vu: "Vụ mùa 1980",
      ngay: "1981-03-10",
      ...f,
    },
    seal: s,
  };
}

// ---------------------------------------------------------------------------
// Lượt khách
// ---------------------------------------------------------------------------

export function traveler(over: Partial<Traveler> = {}): Traveler {
  return {
    id: "d1-t1",
    day: "d1",
    order: 1,
    character: "np-thu-nghiem",
    tags: [],
    portrait: { expression: "binh-thuong" },
    dialogue: [{ speaker: "traveler", text: "Chào anh." }],
    documents: [],
    cargo: [],
    planted: [],
    expected: { verdict: "CHO_QUA", violations: [] },
    kn: null,
    bribe: null,
    flag_key: null,
    outcomes: { CHO_QUA: { deltas: {}, notes: [] }, GIU_LAI: { deltas: {}, notes: [] } },
    art_note: "",
    ...over,
  };
}

export function travelerId(dayId: DayId, order: number): TravelerId {
  return `${dayId}-t${order}` as TravelerId;
}

// ---------------------------------------------------------------------------
// Gọi thẳng một hàm kiểm tra, không qua evaluate (quy ước test 4 trong 08)
// ---------------------------------------------------------------------------

export function runCheck(
  ruleId: RuleId,
  t: Traveler,
  dayId: DayId,
  issuesActive: ReadonlySet<IssueId> = new Set(),
): (ErrorCode | null)[] {
  const rule = book.rules.find((r) => r.id === ruleId);
  if (rule === undefined) throw new Error(`rules.json không có ${ruleId}`);
  const active = new Set(activeRules(book.rules, dayId, issuesActive).map((r) => r.id));
  return CHECKS[rule.check]({ traveler: t, today: GAME_DATE[dayId], params: rule.params, book, active });
}
