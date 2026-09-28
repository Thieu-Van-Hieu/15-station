/**
 * Sổ tay hướng dẫn: bảy trang giải thích thao tác, mở được từ màn mở đầu và từ nút "?" trên thanh đầu trang
 * (phím H). Chữ nằm trong strings.json dưới khoá `tutorial.*`.
 */
import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { content } from "../content";
import { playSfx } from "../audio";
import { InkMark, StampObject } from "./stamping";
import { QueueStrip } from "./QueueStrip";
import { Label, cx, s } from "./ui";

const PAGES = 7;

/** Các gạch đầu dòng của một trang: `tutorial.<trang>.b1`, `b2`… cho tới khoá đầu tiên không có. */
function bullets(page: number): string[] {
  const out: string[] = [];
  for (let i = 1; content.strings[`tutorial.${page}.b${i}`] !== undefined; i++) out.push(s(`tutorial.${page}.b${i}`));
  return out;
}

// ---------------------------------------------------------------------------
// Hình minh hoạ từng trang, dựng lại bằng chính các mảnh giao diện của bàn làm việc
// ---------------------------------------------------------------------------

function MiniStamp({ tone, children }: { tone: "xanh" | "son" | "xam"; children: ReactNode }) {
  const c = tone === "xanh" ? "border-xanh-so text-xanh-so-nhat" : tone === "son" ? "border-son text-son-nhat" : "border-vien-sang text-chu-ban-phu";
  return <span className={cx("border-[3px] border-double px-3 py-2 font-nhan font-bold text-[11px] tracking-[0.15em] uppercase", c)}>{children}</span>;
}

function MiniPaper({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <div className={cx("relative giay-hat border border-giay-vien shadow-giay text-muc p-3 text-[10px] leading-snug", className)}>
      {children}
    </div>
  );
}

function Line({ w = "100%" }: { w?: string }) {
  return <div className="h-1.5 bg-muc/15 my-1.5" style={{ width: w }} />;
}

function Illustration({ page }: { page: number }) {
  switch (page) {
    case 1:
      return (
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          <MiniStamp tone="xanh">{s("desk.stamp.approve")}</MiniStamp>
          <MiniStamp tone="son">{s("desk.stamp.reject")}</MiniStamp>
          <MiniStamp tone="xam">{s("desk.ignore")}</MiniStamp>
        </div>
      );
    case 2:
      return (
        <div className="flex items-start justify-center gap-4">
          <MiniPaper className="w-36 -rotate-2">
            <div className="font-bold uppercase text-son text-center text-[9px] tracking-wider">{content.documents[0]?.name}</div>
            <Line />
            <Line w="70%" />
            <Line w="85%" />
          </MiniPaper>
          <div className="w-40 space-y-2 text-[11px] text-chu-ban-phu">
            {[
              ["Gạo", "18 kg", ["Điều 1", "Điều 2"]],
              ["Vải", "15 m", ["Điều 1"]],
            ].map(([name, qty, tags]) => (
              <div key={name as string}>
                <div className="flex items-baseline gap-1.5">
                  <span>{name}</span>
                  <span className="flex-1 border-b border-dotted border-vien" />
                  <span className="font-nhan font-bold text-ho-phach">{qty}</span>
                </div>
                <div className="flex gap-1 mt-1">
                  {(tags as string[]).map((t) => (
                    <span key={t} className="font-nhan text-[9px] uppercase tracking-wider text-son-nhat border border-son/50 bg-son/10 px-1.5">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    case 3:
      return (
        <div className="relative flex items-center justify-center gap-6">
          <MiniPaper className="w-48 h-[88px] rotate-1">
            <div className="font-bold uppercase text-son text-center text-[9px] tracking-wider">{s("slip.title")}</div>
            <Line />
            <Line w="60%" />
            <div className="absolute inset-0 scale-[0.62]">
              <InkMark ink={{ target: "slip", x: 50, y: 70, rot: -6, opacity: 0.9, action: "CHO_QUA" }} />
            </div>
          </MiniPaper>
          <div className="relative mt-6 scale-[0.7] animate-tay-dong-dau">
            <StampObject action="CHO_QUA" />
          </div>
        </div>
      );
    case 4:
      return (
        <div className="flex items-center justify-center gap-3">
          {[
            ["Giấy thương binh · Năm sinh", "1951"],
            ["Sổ hộ khẩu · Năm sinh", "1952"],
          ].map(([label, value], i) => (
            <div key={i} className="relative border-2 border-son bg-giay px-3 py-2 text-muc w-36" style={{ order: i * 2 }}>
              <div className="font-nhan text-[8px] uppercase tracking-wider text-muc-nhat">{label}</div>
              <div className="font-bold text-[14px]">{value}</div>
              {/* Nét bút chì khoanh */}
              <svg className="absolute -inset-1.5 w-[calc(100%+12px)] h-[calc(100%+12px)] pointer-events-none" viewBox="0 0 100 50" preserveAspectRatio="none" aria-hidden>
                <ellipse cx="50" cy="25" rx="47" ry="21" fill="none" stroke="#4a423a" strokeWidth="1.2" strokeDasharray="160 8" transform="rotate(-2 50 25)" />
              </svg>
            </div>
          ))}
          <span className="order-1 border-4 border-double border-son text-son px-2 py-1 font-nhan font-bold text-[11px] uppercase tracking-widest -rotate-6">
            {s("confront.found")}
          </span>
        </div>
      );
    case 5:
      return (
        <div className="flex items-center justify-center gap-5">
          <MiniStamp tone="xam">{s("desk.ignore")}</MiniStamp>
          <div className="relative w-32 h-20 bg-[#d8c9a3] border border-[#a58f69] shadow-giay rotate-3" aria-hidden>
            <div className="absolute inset-x-0 top-0 h-10 bg-[#cbb98f] [clip-path:polygon(0_0,100%_0,50%_100%)] border-b border-[#a58f69]" />
            <div className="absolute right-3 bottom-2 font-nhan text-[9px] text-muc/60 italic">…</div>
          </div>
        </div>
      );
    case 6:
      return (
        <div className="flex items-center justify-center gap-4 font-nhan">
          <MiniStamp tone="xam">{s("desk.report")}</MiniStamp>
          <div className="border border-vien bg-ban-1 px-3 py-1.5 text-center">
            <Label className="block text-chu-ban-phu/60 text-[9px]">{s("desk.clock")}</Label>
            <span className="text-[18px] font-bold text-xanh-so-nhat">11:20</span>
          </div>
          <span className="text-son-nhat font-bold text-[13px]">+60′ →</span>
          <div className="border border-son bg-ban-1 px-3 py-1.5 text-center scale-110">
            <Label className="block text-chu-ban-phu/60 text-[9px]">{s("desk.clock")}</Label>
            <span className="text-[18px] font-bold text-son-nhat">12:20</span>
          </div>
        </div>
      );
    default:
      return (
        <div className="w-full max-w-sm mx-auto border border-vien">
          <QueueStrip waiting={4} dusk={0.5} />
        </div>
      );
  }
}

// ---------------------------------------------------------------------------
// Hộp sổ tay
// ---------------------------------------------------------------------------

export function Tutorial({ onClose }: { onClose: () => void }) {
  const [page, setPage] = useState(1);
  const dialogRef = useRef<HTMLDivElement>(null);

  function go(p: number) {
    if (p < 1 || p > PAGES) return;
    playSfx("paper");
    setPage(p);
  }

  useEffect(() => {
    dialogRef.current?.focus();
    // Bắt phím ở pha capture và chặn lại, để phím tắt của màn phía sau (1, 2, Enter, S) không chạy khi sổ tay đang mở.
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Tab") return;
      e.stopPropagation();
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") setPage((p) => Math.min(PAGES, p + 1));
      else if (e.key === "ArrowLeft") setPage((p) => Math.max(1, p - 1));
      else if (e.key === "Enter" && (e.target as HTMLElement | null)?.tagName !== "BUTTON") {
        e.preventDefault();
        setPage((p) => {
          if (p >= PAGES) onClose();
          return Math.min(PAGES, p + 1);
        });
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [onClose]);

  const last = page === PAGES;
  return createPortal(
    <div className="fixed inset-0 z-[80] bg-ban/85 backdrop-blur-[2px] grid place-items-center p-4 overflow-y-auto" onClick={onClose}>
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tutorial-title"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-ban-2 border border-vien shadow-noi animate-truot-vao outline-none"
      >
        <div className="flex items-center justify-between gap-3 border-b border-vien px-5 py-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2 h-2 bg-son shrink-0" />
            <Label className="text-ho-phach truncate">{s("tutorial.title")}</Label>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="font-nhan text-[10px] text-chu-ban-phu/60 tracking-wider">
              {s("tutorial.step")} {page}/{PAGES}
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label={s("tutorial.close")}
              className="w-8 h-8 grid place-items-center border border-vien text-chu-ban-phu hover:bg-ban-3 hover:text-giay"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>
        </div>

        <div key={page} className="px-5 sm:px-7 py-5 animate-truot-vao">
          <div className="mat-ban-cham border border-vien/60 h-36 grid place-items-center px-4 overflow-hidden">
            <Illustration page={page} />
          </div>
          <h2 id="tutorial-title" className="font-tieu-de font-bold text-xl text-giay mt-5">
            {s(`tutorial.${page}.title`)}
          </h2>
          <ul className="mt-3 space-y-2 text-[13px] leading-relaxed text-chu-ban">
            {bullets(page).map((b, i) => (
              <li key={i} className="flex gap-2.5">
                <span className="mt-[0.55em] w-1.5 h-1.5 bg-son shrink-0" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="border-t border-vien px-5 py-3 flex flex-wrap items-center gap-3">
          <div className="flex gap-1.5" role="tablist" aria-label={s("tutorial.title")}>
            {Array.from({ length: PAGES }, (_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={page === i + 1}
                aria-label={`${s("tutorial.step")} ${i + 1}: ${s(`tutorial.${i + 1}.title`)}`}
                onClick={() => go(i + 1)}
                className={cx("w-2.5 h-2.5 border border-ho-phach/70", page === i + 1 ? "bg-ho-phach" : "hover:bg-ho-phach/30")}
              />
            ))}
          </div>
          <div className="flex-1" />
          <button
            type="button"
            onClick={() => go(page - 1)}
            disabled={page === 1}
            className="border border-vien px-3 py-2 font-nhan text-[11px] uppercase tracking-wider text-chu-ban-phu hover:bg-ban-3 disabled:opacity-30 disabled:hover:bg-transparent"
          >
            ← {s("tutorial.prev")}
          </button>
          <button
            type="button"
            onClick={() => (last ? onClose() : go(page + 1))}
            className="bg-son text-giay px-4 py-2 font-nhan font-bold text-[11px] uppercase tracking-wider hover:bg-[#d0463a]"
          >
            {last ? s("tutorial.done") : `${s("tutorial.next")} →`}
          </button>
        </div>
        <p className="px-5 pb-3 -mt-1 font-nhan text-[9.5px] text-chu-ban-phu/50 tracking-wide">{s("tutorial.keys")}</p>
      </div>
    </div>,
    document.body,
  );
}

/**
 * Nút mở sổ tay, nghe cả phím H. `icon` là ô vuông "?" trên thanh đầu trang;
 * `wide` là nút ngang dùng ở màn mở đầu. Mỗi màn chỉ có một trong hai.
 */
export function TutorialButton({ variant = "icon", className }: { variant?: "icon" | "wide"; className?: string }) {
  const [open, setOpen] = useState(false);

  function show() {
    playSfx("paper");
    setOpen(true);
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey || (e.key !== "h" && e.key !== "H")) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) return;
      setOpen(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      {variant === "icon" ? (
        <button
          type="button"
          onClick={show}
          aria-label={s("tutorial.open")}
          title={`${s("tutorial.open")} (H)`}
          className={cx("w-9 h-9 grid place-items-center border border-vien text-chu-ban-phu hover:bg-ban-3 hover:text-giay font-nhan font-bold text-[15px]", className)}
        >
          ?
        </button>
      ) : (
        <button
          type="button"
          onClick={show}
          className={cx(
            "group inline-flex items-center justify-between gap-6 border border-vien-sang/60 bg-ban-2 px-6 py-3 max-sm:px-4 max-sm:gap-3 text-chu-ban hover:bg-ban-3 hover:text-giay transition-colors",
            className,
          )}
        >
          <span className="flex items-center gap-3">
            <span className="w-6 h-6 grid place-items-center border border-ho-phach/70 text-ho-phach font-nhan font-bold text-[12px]">?</span>
            <span className="font-nhan font-bold text-sm tracking-[0.18em] uppercase">{s("tutorial.open")}</span>
          </span>
          <span className="font-nhan text-[10px] tracking-wider text-chu-ban-phu/60 max-sm:hidden">{PAGES} {s("tutorial.step").toLowerCase()} · H</span>
        </button>
      )}
      {open && <Tutorial onClose={() => setOpen(false)} />}
    </>
  );
}
