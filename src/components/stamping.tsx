/**
 * Con dấu là vật thể (V5): nhấn giữ, kéo xuống mặt giấy, thả mới ăn. Thả ngoài giấy thì bật về chỗ cũ.
 * Vệt mực in đúng chỗ thả, nghiêng và đậm nhạt ngẫu nhiên. CHO QUA mực đỏ, GIỮ LẠI mực đen (05-art-brief mục 4b).
 */
import { useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import type { Verdict } from "../engine/types";
import { cx, s } from "./ui";

/** Một vệt mực trên giấy. Toạ độ tính theo phần trăm khung giấy để không lệch khi giấy đổi cỡ. */
export interface Ink {
  /** `d<số giấy>` hoặc `slip` (phiếu kiểm soát). */
  target: string;
  x: number;
  y: number;
  rot: number;
  opacity: number;
  action: Verdict;
}

export function randomInk(action: Verdict, target: string, x: number, y: number): Ink {
  return {
    action,
    target,
    // Giữ vệt mực lọt trong khung giấy.
    x: Math.min(82, Math.max(18, x)),
    y: Math.min(88, Math.max(12, y)),
    rot: (Math.random() * 2 - 1) * 9,
    opacity: 0.72 + Math.random() * 0.23,
  };
}

const INK_COLOR: Record<Verdict, string> = { CHO_QUA: "#b3261e", GIU_LAI: "#1c1712" };

/** Vệt mực: khung chữ nhật viền đôi, chữ in hoa, hạt mực loang. */
export function InkMark({ ink }: { ink: Ink }) {
  const color = INK_COLOR[ink.action];
  const text = ink.action === "CHO_QUA" ? s("desk.stamp.approve") : s("desk.stamp.reject");
  return (
    <div
      className="pointer-events-none absolute z-10 animate-dong-dau mix-blend-multiply"
      style={{
        left: `${ink.x}%`,
        top: `${ink.y}%`,
        opacity: ink.opacity,
        ["--xoay" as string]: `${ink.rot}deg`,
        // `translate` tách khỏi `transform` để hoạt ảnh đóng dấu (đổi transform) không làm vệt mực nhảy chỗ.
        translate: "-50% -50%",
        transform: `rotate(${ink.rot}deg)`,
      }}
    >
      <svg width="148" height="70" viewBox="0 0 148 70" aria-hidden>
        <defs>
          <filter id={`loang-${ink.action}`} x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={Math.round(ink.rot * 10) + 50} />
            <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.6 1.25" />
            <feComposite in="SourceGraphic" operator="in" />
          </filter>
        </defs>
        <g filter={`url(#loang-${ink.action})`} fill="none" stroke={color}>
          <rect x="3" y="3" width="142" height="64" strokeWidth="4" />
          <rect x="10" y="10" width="128" height="50" strokeWidth="1.6" />
          <text
            x="74"
            y="42"
            textAnchor="middle"
            fill={color}
            stroke="none"
            fontFamily="Space Mono, monospace"
            fontWeight="700"
            fontSize="19"
            letterSpacing="3"
          >
            {text}
          </text>
          <text x="74" y="55" textAnchor="middle" fill={color} stroke="none" fontFamily="Space Mono, monospace" fontSize="7.5" letterSpacing="2">
            {s("ui.brand")}
          </text>
        </g>
      </svg>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Con dấu kéo thả
// ---------------------------------------------------------------------------

interface DraggableStampProps {
  action: Verdict;
  title: string;
  sub?: string;
  icon?: ReactNode;
  disabled?: boolean;
  selected?: boolean;
  /** Thả con dấu tại toạ độ màn hình. Trả `true` nếu thả trúng giấy (dấu ăn), `false` để con dấu bật về. */
  onDrop: (x: number, y: number) => boolean;
  /** Bấm mà không kéo. */
  onTap?: () => void;
}

type Drag = { x: number; y: number; homeX: number; homeY: number; returning: boolean };

export function DraggableStamp({ action, title, sub, icon, disabled, selected, onDrop, onTap }: DraggableStampProps) {
  const [drag, setDrag] = useState<Drag | null>(null);
  const start = useRef<{ x: number; y: number; moved: boolean } | null>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const tone = action === "CHO_QUA" ? "xanh" : "son";

  function onPointerDown(e: ReactPointerEvent<HTMLButtonElement>) {
    if (disabled || e.button !== 0) return;
    e.preventDefault();
    btn.current?.setPointerCapture(e.pointerId);
    const r = btn.current!.getBoundingClientRect();
    start.current = { x: e.clientX, y: e.clientY, moved: false };
    setDrag({ x: e.clientX, y: e.clientY, homeX: r.left + r.width / 2, homeY: r.top + r.height / 2, returning: false });
  }

  function onPointerMove(e: ReactPointerEvent<HTMLButtonElement>) {
    if (!start.current || !drag) return;
    if (Math.hypot(e.clientX - start.current.x, e.clientY - start.current.y) > 6) start.current.moved = true;
    setDrag({ ...drag, x: e.clientX, y: e.clientY });
  }

  function onPointerUp(e: ReactPointerEvent<HTMLButtonElement>) {
    const st = start.current;
    start.current = null;
    if (!st || !drag) return;
    if (!st.moved) {
      setDrag(null);
      onTap?.();
      return;
    }
    if (onDrop(e.clientX, e.clientY)) {
      setDrag(null);
    } else {
      // Thả ngoài giấy: con dấu bật về khay.
      setDrag({ ...drag, x: drag.homeX, y: drag.homeY, returning: true });
      setTimeout(() => setDrag(null), 260);
    }
  }

  const color =
    tone === "xanh"
      ? { idle: "border-xanh-so text-xanh-so-nhat", on: "bg-xanh-so text-ban border-xanh-so-nhat" }
      : { idle: "border-son text-son-nhat", on: "bg-son text-giay border-son-nhat" };

  return (
    <>
      <button
        ref={btn}
        type="button"
        disabled={disabled}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={() => {
          start.current = null;
          setDrag(null);
        }}
        title={s("desk.stamp_drag_hint")}
        className={cx(
          "group relative flex items-center gap-3 border-[3px] border-double px-4 py-2.5 text-left min-w-0 min-h-[62px] touch-none select-none",
          "transition-[background-color,color,opacity]",
          selected ? cx(color.on, "shadow-kep") : color.idle,
          disabled && !selected && "opacity-35 cursor-not-allowed grayscale-[40%]",
          !disabled && !selected && (drag ? "cursor-grabbing" : "cursor-grab hover:bg-white/5"),
          drag && !drag.returning && "opacity-40",
        )}
      >
        {/* Hình con dấu gỗ nhìn nghiêng */}
        <span className="shrink-0 relative w-7 h-9" aria-hidden>
          <span className="absolute left-1/2 -translate-x-1/2 top-0 w-3.5 h-4 rounded-t-full bg-[#6b4a2e] border border-black/40" />
          <span className="absolute left-1/2 -translate-x-1/2 top-3.5 w-2 h-2 bg-[#5a3d25]" />
          <span className="absolute left-0 right-0 bottom-1 h-2.5 bg-[#4a3525] border border-black/40" />
          <span className="absolute left-0.5 right-0.5 bottom-0 h-1" style={{ background: INK_COLOR[action] }} />
        </span>
        {icon && <span className="shrink-0 -ml-1">{icon}</span>}
        <span className="min-w-0">
          <span className="block font-nhan font-bold text-[13px] tracking-[0.15em] uppercase leading-tight">{title}</span>
          {sub && <span className="block text-[10px] leading-snug opacity-80 mt-0.5 line-clamp-2">{sub}</span>}
        </span>
      </button>

      {drag &&
        createPortal(
          <div
            className={cx("fixed z-[70] pointer-events-none", drag.returning && "transition-[left,top] duration-250 ease-out")}
            style={{ left: drag.x, top: drag.y, transform: "translate(-50%, -88%) rotate(-8deg)" }}
          >
            <StampObject action={action} />
          </div>,
          document.body,
        )}
    </>
  );
}

/** Con dấu cầm tay khi đang kéo: cán gỗ, đế cao su tẩm mực. */
function StampObject({ action }: { action: Verdict }) {
  return (
    <div className="flex flex-col items-center drop-shadow-[4px_10px_6px_rgba(0,0,0,0.55)]">
      <div className="w-9 h-11 rounded-t-[50%] bg-gradient-to-r from-[#5a3d25] via-[#8a6040] to-[#5a3d25] border border-black/50" />
      <div className="w-4 h-4 bg-[#4a3525] border-x border-black/50" />
      <div className="w-28 h-5 bg-gradient-to-b from-[#6b4a2e] to-[#3b281b] border border-black/60" />
      <div className="w-[104px] h-2" style={{ background: INK_COLOR[action] }} />
    </div>
  );
}
