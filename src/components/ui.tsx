/**
 * Bộ thành phần giao diện dùng chung cho mọi màn — hệ thiết kế "Bureaucracy 1980" (stitch-design/DESIGN.md).
 * Mọi chữ hiển thị lấy từ data/strings.json qua hàm `s()`.
 */
import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { content } from "../content";
import { isMuted, onMuteChange, setMuted } from "../audio";
import type { Expression, Seal } from "../engine/types";

export function s(key: string): string {
  return content.strings[key] ?? key;
}

/** Tên đơn vị có dấu để hiển thị ("vien" → "viên"). */
export function unit(u: string): string {
  return content.strings[`unit.${u}`] ?? u;
}

export function cx(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(" ");
}

// ---------------------------------------------------------------------------
// Khung trang
// ---------------------------------------------------------------------------

export function Screen({ header, children, className }: { header?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <div className="mat-ban lop-nhieu min-h-screen flex flex-col text-chu-ban font-may-chu">
      {header}
      <div className={cx("flex-1 flex flex-col", className)}>{children}</div>
    </div>
  );
}

export function AppHeader({ center, right }: { center?: ReactNode; right?: ReactNode }) {
  return (
    <header className="sticky top-0 z-30 border-b border-vien/70 bg-ban/90 backdrop-blur-sm">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 px-4 md:px-6 py-2.5">
        <div className="flex items-center gap-3 min-w-0">
          <span className="w-2.5 h-2.5 rounded-full bg-son shadow-[0_0_8px_rgba(192,57,43,0.8)] animate-nhap-nhay" />
          <span className="font-tieu-de font-bold text-xl tracking-wide text-giay">{s("ui.brand")}</span>
          <Label className="hidden sm:inline text-chu-ban-phu/70">{s("ui.brand_sub")}</Label>
        </div>
        <div className="flex-1 flex justify-center min-w-0">{center}</div>
        <div className="flex items-center gap-3">
          {right}
          <SoundToggle />
        </div>
      </div>
    </header>
  );
}

export function SoundToggle() {
  const [muted, setM] = useState(isMuted());
  useEffect(() => onMuteChange(setM), []);
  const label = muted ? s("ui.sound_on") : s("ui.sound_off");
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={() => setMuted(!muted)}
      className="w-9 h-9 grid place-items-center border border-vien text-chu-ban-phu hover:bg-ban-3 hover:text-giay transition-colors"
    >
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor" />
        {muted ? <path d="M17 9l5 6M22 9l-5 6" /> : <path d="M16.5 8.5a5 5 0 010 7M19 6a8.5 8.5 0 010 12" />}
      </svg>
    </button>
  );
}

/** Ô thông tin nhỏ trên thanh đầu trang (ngày, giờ, tiền…). */
export function Chip({ label, value, tone = "mac-dinh" }: { label: string; value: ReactNode; tone?: "mac-dinh" | "xanh" | "son" | "ho-phach" }) {
  const color = {
    "mac-dinh": "text-giay",
    xanh: "text-xanh-so-nhat",
    son: "text-son-nhat",
    "ho-phach": "text-ho-phach",
  }[tone];
  return (
    <div className="border border-vien bg-ban-1 px-3 py-1 leading-tight">
      <Label className="block text-chu-ban-phu/60 text-[9px]">{label}</Label>
      <span className={cx("font-nhan font-bold text-sm tracking-wider", color)}>{value}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Chữ
// ---------------------------------------------------------------------------

export function Label({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cx("font-nhan uppercase tracking-[0.12em] text-[11px] font-bold", className)}>{children}</span>;
}

export function Heading({ children, className, as: Tag = "h2" }: { children: ReactNode; className?: string; as?: "h1" | "h2" | "h3" | "h4" }) {
  return <Tag className={cx("font-tieu-de font-bold tracking-wide", className)}>{children}</Tag>;
}

// ---------------------------------------------------------------------------
// Giấy và bảng
// ---------------------------------------------------------------------------

type PaperTone = "giay" | "than" | "bia";

export function Paper({
  tone = "giay",
  tilt = 0,
  raised = false,
  clip = false,
  className,
  children,
  style,
}: {
  tone?: PaperTone;
  tilt?: number;
  raised?: boolean;
  clip?: boolean;
  className?: string;
  children: ReactNode;
  style?: React.CSSProperties;
}) {
  const bg = { giay: "giay-hat", than: "giay-than-hat", bia: "bg-bia" }[tone];
  return (
    <div
      className={cx(
        "relative text-muc border",
        tone === "bia" ? "border-ke" : "border-giay-vien",
        raised ? "shadow-noi" : tone === "bia" ? "shadow-bia" : "shadow-giay",
        clip && "goc-cat",
        bg,
        className,
      )}
      style={{ transform: tilt ? `rotate(${tilt}deg)` : undefined, ...style }}
    >
      {children}
    </div>
  );
}

/** Bảng tối nằm trên mặt bàn (thẻ số liệu, hộp ghi chú). */
export function Panel({ children, className, title, icon }: { children: ReactNode; className?: string; title?: ReactNode; icon?: ReactNode }) {
  return (
    <section className={cx("border border-vien/80 bg-ban-2/90 shadow-bia", className)}>
      {title && (
        <div className="flex items-center gap-2 border-b border-vien/60 px-4 py-2.5 text-son-nhat">
          {icon}
          <Label>{title}</Label>
        </div>
      )}
      <div className="p-4">{children}</div>
    </section>
  );
}

export function PaperClip({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 52" className={cx("absolute w-4 h-11 drop-shadow-[1px_2px_1px_rgba(0,0,0,0.6)]", className)} aria-hidden>
      <path d="M6 44V10a4 4 0 018 0v30a6 6 0 01-12 0V14" fill="none" stroke="#7f8c8d" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

/** Đường kẻ kiểu máy chữ `=====`. */
export function TypeRule({ className }: { className?: string }) {
  return <div className={cx("h-[5px] border-y border-muc/40", className)} />;
}

// ---------------------------------------------------------------------------
// Nút
// ---------------------------------------------------------------------------

type StampTone = "xanh" | "son" | "muc-xanh" | "xam";

const STAMP_TONES: Record<StampTone, { idle: string; on: string; ring: string }> = {
  xanh: {
    idle: "border-xanh-so text-xanh-so-nhat hover:bg-xanh-so/15",
    on: "bg-xanh-so text-ban border-xanh-so-nhat",
    ring: "outline-xanh-so/60",
  },
  son: {
    idle: "border-son text-son-nhat hover:bg-son/15",
    on: "bg-son text-giay border-son-nhat",
    ring: "outline-son/60",
  },
  "muc-xanh": {
    idle: "border-muc-xanh-nhat/80 text-muc-xanh-nhat hover:bg-muc-xanh/25",
    on: "bg-muc-xanh text-giay border-muc-xanh-nhat",
    ring: "outline-muc-xanh-nhat/60",
  },
  xam: {
    idle: "border-vien-sang/60 text-chu-ban-phu hover:bg-ban-3",
    on: "bg-ban-4 text-giay border-vien-sang",
    ring: "outline-vien-sang/60",
  },
};

/** Nút quyết định dạng con dấu cao su: viền đôi, chữ in hoa giãn, hơi nghiêng. */
export function StampButton({
  tone,
  title,
  sub,
  selected,
  disabled,
  onClick,
  tilt = 0,
  icon,
}: {
  tone: StampTone;
  title: string;
  sub?: string;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  tilt?: number;
  icon?: ReactNode;
}) {
  const t = STAMP_TONES[tone];
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      style={{ ["--xoay" as string]: `${tilt}deg`, transform: `rotate(${tilt}deg)` }}
      className={cx(
        "group relative flex items-center gap-3 border-[3px] border-double px-4 py-2.5 text-left transition-[background-color,color,opacity,translate] min-w-0 min-h-[62px]",
        selected ? cx(t.on, "animate-dong-dau shadow-kep") : t.idle,
        disabled && !selected && "opacity-35 cursor-not-allowed grayscale-[40%] hover:bg-transparent",
        !disabled && !selected && "hover:-translate-y-0.5 active:translate-y-0 cursor-pointer",
        `focus-visible:outline-2 focus-visible:outline-offset-2 ${t.ring}`,
      )}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span className="min-w-0">
        <span className="block font-nhan font-bold text-[13px] tracking-[0.15em] uppercase leading-tight">{title}</span>
        {sub && <span className="block text-[10px] leading-snug opacity-80 mt-0.5 normal-case tracking-normal line-clamp-2">{sub}</span>}
      </span>
    </button>
  );
}

export function PrimaryButton({
  children,
  onClick,
  disabled,
  className,
  hint,
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  hint?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cx(
        "group inline-flex items-center justify-between gap-6 bg-son px-6 py-3.5 text-giay shadow-bia border border-son-nhat/40 transition-all",
        "hover:bg-[#d0463a] active:translate-x-px active:translate-y-px active:shadow-none",
        "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-son",
        className,
      )}
    >
      <span className="font-nhan font-bold text-sm tracking-[0.18em] uppercase">{children}</span>
      <span className="flex items-center gap-2 text-giay/80">
        {hint && <span className="font-nhan text-[10px] tracking-wider">[{hint}]</span>}
        <span className="transition-transform group-hover:translate-x-1" aria-hidden>
          →
        </span>
      </span>
    </button>
  );
}

export function TabButton({ children, onClick, className }: { children: ReactNode; onClick?: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        "border border-ke bg-bia px-4 py-2 font-nhan text-xs font-bold uppercase tracking-[0.12em] text-muc shadow-bia",
        "hover:bg-bia-dam active:translate-x-px active:translate-y-px active:shadow-[1px_1px_0_#000]",
        className,
      )}
    >
      {children}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Hình
// ---------------------------------------------------------------------------

export function portraitSrc(key: string, expression: Expression | string): string {
  return `/art/portraits/${key}_${expression}.svg`;
}

export function Portrait({
  charKey,
  expression,
  alt,
  className,
}: {
  charKey: string;
  expression: Expression | string;
  alt: string;
  className?: string;
}) {
  const [broken, setBroken] = useState(false);
  useEffect(() => setBroken(false), [charKey, expression]);
  return (
    <div className={cx("relative overflow-hidden bg-ban-3", className)}>
      {!broken && (
        <img
          src={portraitSrc(charKey, expression)}
          alt={alt}
          className="w-full h-full object-cover"
          draggable={false}
          onError={() => setBroken(true)}
        />
      )}
    </div>
  );
}

/** Con dấu tròn đỏ in trên giấy tờ. */
export function SealMark({ seal, className }: { seal: Seal; className?: string }) {
  const kind = seal.kind.replace(/_/g, " ");
  return (
    <div
      className={cx(
        "relative w-24 h-24 rounded-full border-[3px] border-son text-son grid place-items-center text-center -rotate-12 mix-blend-multiply",
        seal.legible ? "opacity-85" : "opacity-35 blur-[1.2px]",
        className,
      )}
      title={seal.legible ? undefined : s("desk.seal_illegible")}
    >
      <div className="absolute inset-1.5 rounded-full border border-son/80" />
      <div className="px-3 leading-tight">
        <div className="font-nhan font-bold text-[9px] tracking-wider uppercase">{kind}</div>
        <div className="text-[9px]">★</div>
        <div className="font-may-chu text-[9px] font-medium">{seal.place}</div>
      </div>
    </div>
  );
}

/** Lớp phủ toàn màn hình, gắn thẳng vào body để không bị ảnh hưởng bởi transform của phần tử cha. */
export function Modal({ children, onClose, className }: { children: ReactNode; onClose?: () => void; className?: string }) {
  useEffect(() => {
    if (!onClose) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return createPortal(
    <div
      className={cx("fixed inset-0 z-50 bg-ban/80 backdrop-blur-[2px] grid place-items-center p-4 overflow-y-auto", className)}
      onClick={onClose}
    >
      {children}
    </div>,
    document.body,
  );
}
