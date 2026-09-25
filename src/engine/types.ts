/**
 * Kiểu dữ liệu của engine, viết tay theo data/schema/*.schema.json.
 * Sửa schema thì sửa file này trong cùng commit.
 */

// ---------------------------------------------------------------------------
// Mã (03 mục 1)
// ---------------------------------------------------------------------------

export type DayId = "d1" | "d2" | "d3" | "d4" | "d5" | "d6";
export type TravelerId = `d${number}-t${number}`;
export type RuleId =
  | "R1-GDD"
  | "R2-DINH-MUC"
  | "R3-DON-THUOC"
  | "R4-KHOP-TEN"
  | "R5-CHUNG-TU"
  | "R5K-KHOAN"
  | "R6-HANG-CAM";
export type CheckName =
  | "GDD_HOP_LE"
  | "DINH_MUC_LUONG_THUC"
  | "DON_THUOC"
  | "KHOP_TEN"
  | "CHUNG_TU_HANG_HOA"
  | "MIEN_DINH_MUC_KHOAN"
  | "HANG_CAM";
export type IssueId = "KN-KHOAN" | "KN-THUONG-BINH";
export type ErrorCode = "E1" | "E2" | "E3" | "E4" | "E5" | "E6";
export type DocType = "GDD" | "SHK" | "TP" | "HDHTX" | "GPVC" | "DT" | "CNTB" | "GXNK";
export type SealKind =
  | "UBND_XA"
  | "UBND_HUYEN"
  | "CONG_AN"
  | "PHONG_LUONG_THUC"
  | "HTX"
  | "CTY_THUONG_NGHIEP"
  | "BENH_VIEN"
  | "TRAM_Y_TE"
  | "TB_XH";
export type Category =
  | "LUONG_THUC"
  | "THUC_PHAM"
  | "THUOC"
  | "HANG_TIEU_DUNG"
  | "VAT_TU"
  | "DO_CA_NHAN"
  | "HANG_CAM";
export type Unit = "kg" | "cay" | "bao" | "hop" | "lo" | "vi" | "vien" | "met" | "chiec" | "lit";
export type Action = "CHO_QUA" | "GIU_LAI" | "LAM_NGO";
export type Verdict = "CHO_QUA" | "GIU_LAI";
export type FlagValue = "qua" | "giu" | "lam-ngo" | "qua-kn" | "giu-kn" | "qua-tien" | "lam-ngo-tien";
export type EndingId = "END-AN-TIEN" | "END-LAM-NGO" | "END-KIEN-NGHI" | "END-GAC-CONG" | "END-SONG-SOT";
export type Expression = "binh-thuong" | "vui" | "lo-lang" | "buon" | "gian" | "ne-tranh" | "met-moi";
export type TravelerTag = "huong-dan" | "buon-lau-that" | "luot-trung-tam" | "dung-trinh-bay" | "dong-cam";

// ---------------------------------------------------------------------------
// Hàng và giấy tờ (03 mục 1.4–1.6)
// ---------------------------------------------------------------------------

export interface Item {
  ma: string;
  ten: string;
  so_luong: number;
  don_vi: Unit;
}

export interface CargoItem extends Item {
  category: Category;
  an_giau?: boolean;
}

export interface Seal {
  kind: SealKind;
  place: string;
  legible: boolean;
}

interface DocBase<T extends DocType, F> {
  type: T;
  fields: F;
  seal: Seal | null;
  damaged?: boolean;
}

export type DocGDD = DocBase<
  "GDD",
  {
    ho_ten: string;
    nam_sinh: number;
    noi_di: string;
    noi_den: string;
    ly_do: string;
    hang_mang_theo: Item[];
    ngay_cap: string;
    co_gia_tri_den: string;
  }
>;
export type DocSHK = DocBase<
  "SHK",
  { so_so: string; chu_ho: string; ho_ten: string; nam_sinh: number; quan_he_chu_ho: string; dia_chi: string }
>;
export type DocTP = DocBase<"TP", { ho_ten: string; thang: string; mat_hang: Item }>;
export type DocHDHTX = DocBase<
  "HDHTX",
  { so_hd: string; htx_ten: string; nguoi_nhan: string; mat_hang: Item[]; ngay: string }
>;
export type DocGPVC = DocBase<
  "GPVC",
  {
    so_gp: string;
    don_vi_cap: string;
    nguoi_van_chuyen: string;
    mat_hang: Item[];
    tu: string;
    den: string;
    ngay_cap: string;
    co_gia_tri_den: string;
  }
>;
export type DocDT = DocBase<
  "DT",
  { benh_nhan: string; thuoc: Item[]; bac_si: string; ngay_ke: string; co_gia_tri_den: string }
>;
export type DocCNTB = DocBase<
  "CNTB",
  { ho_ten: string; nam_sinh: number; hang: string; so_the: string; don_vi_cap: string }
>;
export type DocGXNK = DocBase<
  "GXNK",
  {
    ho_ten: string;
    xa: string;
    htx_ten: string;
    san_pham: string;
    san_pham_ma: string;
    so_luong_kg: number;
    vu: string;
    ngay: string;
  }
>;

export type TravelerDocument = DocGDD | DocSHK | DocTP | DocHDHTX | DocGPVC | DocDT | DocCNTB | DocGXNK;
export type DocOf<T extends DocType> = Extract<TravelerDocument, { type: T }>;

/** Một loại giấy trong documents.json. */
export interface DocumentDef {
  code: DocType;
  name: string;
  description: string;
  introduced_day: DayId;
  fields: { key: string; label: string; kind: string }[];
  allowed_seal_kinds: SealKind[];
  seal_place_field: string | null;
  holder_field: string | null;
  birth_year_field: string | null;
  expiry_field: string | null;
  expiry_kind: "date" | "month" | "none";
  layout: string;
}

// ---------------------------------------------------------------------------
// Điều kiện và lời thoại (03 mục 1.10)
// ---------------------------------------------------------------------------

export interface FlagCondition {
  flag: string;
  in: FlagValue[];
}
export interface IssueCondition {
  issue_triggered: IssueId;
  value: boolean;
}
export type StatName =
  | "true_compliance"
  | "reported_compliance"
  | "valid_reports"
  | "invalid_reports"
  | "lam_ngo_violations"
  | "bribes_accepted"
  | "bribe_total"
  | "issues_triggered"
  | "hardship"
  | "overtime_days"
  | "reprimands";
export interface StatCondition {
  stat: StatName;
  op: ">=" | "<=" | "==" | ">" | "<";
  value: number;
}
export type Condition = FlagCondition | IssueCondition | StatCondition;

export interface Line {
  speaker: string;
  text: string;
  when?: Condition[];
}

// ---------------------------------------------------------------------------
// Lượt khách (travelers.json)
// ---------------------------------------------------------------------------

export type IndicatorName = "luong_thuc_vao_thi_xa" | "ho_thieu_an" | "gia_gao_index";
export type Indicators = Record<IndicatorName, number>;
export type Deltas = Partial<Indicators>;

export interface Outcome {
  deltas: Deltas;
  notes: string[];
}

export interface Violation {
  rule: RuleId;
  error: ErrorCode | null;
}

export interface Traveler {
  id: TravelerId;
  day: DayId;
  order: number;
  character: string;
  tags: TravelerTag[];
  portrait: { expression: Expression };
  dialogue: Line[];
  reactions?: Partial<Record<Action, Line[]>>;
  documents: TravelerDocument[];
  cargo: CargoItem[];
  planted: { error: ErrorCode; doc: DocType | null; field: string | null; note: string }[];
  expected: { verdict: Verdict; violations: Violation[] };
  kn: { issue: IssueId; note: string } | null;
  bribe: { amount: number; lines: Line[]; consequence_note: string } | null;
  flag_key: string | null;
  outcomes: { CHO_QUA: Outcome; GIU_LAI: Outcome; LAM_NGO?: Outcome };
  art_note: string;
}

// ---------------------------------------------------------------------------
// Ngày (days.json)
// ---------------------------------------------------------------------------

export interface Expense {
  id: string;
  label: string;
  cost: number;
  essential: boolean;
  member?: string;
}

export interface Day {
  id: DayId;
  act: number;
  label: string;
  game_date: string;
  transition_card?: { lines: string[] };
  new_rules: RuleId[];
  travelers: TravelerId[];
  kn_enabled: boolean;
  clock: { start: string; end: string; per_traveler_min: number; per_report_min: number };
  economy: {
    income: number;
    fine_per_error: number;
    bonus_xuat_sac: number;
    currency_reform_divisor?: number;
    expenses: Expense[];
  };
  other_factor: { text: string; deltas: Deltas };
  interludes: { at: "start" | "end" | TravelerId; lines: Line[]; when?: Condition[] }[];
  family_event: { text: string } | null;
  indicators_start?: Indicators;
  savings_start?: number;
}

// ---------------------------------------------------------------------------
// Sổ chỉ thị, kiến nghị, nhân vật, kết cục
// ---------------------------------------------------------------------------

export interface Rule {
  id: RuleId;
  article: string;
  title: string;
  page_text: string;
  day_from: DayId;
  day_to: DayId;
  condition: { issue_triggered: IssueId } | null;
  check: CheckName;
  /** Tham số riêng của từng hàm kiểm tra; mỗi hàm tự đọc phần mình cần. */
  params: Record<string, unknown>;
  emits: ErrorCode[];
  reprimand: string;
  note?: string;
}

export interface Issue {
  id: IssueId;
  title: string;
  description: string;
  unlock_day: DayId;
  threshold: number;
  delay: "next_day" | "next_act";
  effect: { type: "activate_rule" | "narrative"; rule: RuleId | null; text: string };
  reasons: { id: string; text: string }[];
  note?: string;
}

export interface Character {
  id: string;
  name: string;
  role: "nguoi-choi" | "chinh" | "phu" | "gia-dinh" | "mot-lan";
  age: number | null;
  home: string;
  background: string;
  voice: string;
  portrait: { key: string; expressions: Expression[]; description: string };
  fixed_fields: { ho_ten: string; nam_sinh: number; noi_o?: string; so_shk?: string } | null;
  appearances: TravelerId[];
}

export interface Ending {
  id: EndingId;
  title: string;
  priority: number;
  conditions: StatCondition[];
  scenes: { text: string; image?: string; when?: Condition[] }[];
  quote: { text: string; chapter: number; section: string };
  character_lines: { character: string; text: string; when?: Condition[] }[];
  closing_question: string | null;
}

export type Strings = Record<string, string>;

/** Toàn bộ nội dung game. Engine nhận cái này qua tham số, không tự import data/. */
export interface GameContent {
  rules: Rule[];
  documents: DocumentDef[];
  characters: Character[];
  days: Day[];
  travelers: Traveler[];
  reports: Issue[];
  endings: Ending[];
  strings: Strings;
}

/** Phần nội dung đủ để chấm một lượt. */
export type RuleBook = Pick<GameContent, "rules" | "documents">;
