/**
 * Hàng người chờ ngoài cửa sổ trạm (V6). Số bóng người bằng số lượt còn lại trong ngày.
 * Gần hết ca trời tối dần; quá giờ thì bóng người co lại vì rét. Thuần hình, không đụng cơ chế.
 */
import { cx, s } from "./ui";

interface QueueStripProps {
  /** Số người còn đứng chờ sau người đang ở ô cửa. */
  waiting: number;
  /** 0 = ban ngày, 1 = tối hẳn (đã quá giờ hết ca). */
  dusk: number;
  /** Đổi giá trị để hàng người nhúc nhích (khi người chơi lập biên bản, đồng hồ nhảy giờ). */
  stir?: number;
}

/** Ba dáng người: gánh hàng, đội nón, dắt xe đạp. */
const FIGURES = [
  // gánh hàng
  "M11 6a3 3 0 1 1 0 .01M8 11h6l1 9h-2l-1 8h-2l-1-8H7zM0 12h22v1.4H0zM1 13l-1 6h5l-1-6M18 13l-1 6h5l-1-6",
  // đội nón
  "M3 8l8-5 8 5zM11 9a2.6 2.6 0 1 1 0 .01M7.5 13h7l.8 9h-1.8l-.8 7h-2.4l-.8-7H6.7z",
  // dắt xe đạp
  "M10 5a3 3 0 1 1 0 .01M7 10h6l1 9h-2l-1 8H9l-1-8H6zM14 14h8M4 26a3 3 0 1 0 .01 0M22 26a3 3 0 1 0 .01 0M4 26l6-8h8l4 8",
];

export function QueueStrip({ waiting, dusk, stir = 0 }: QueueStripProps) {
  const n = Math.max(0, Math.min(waiting, 8));
  const cold = dusk >= 1;
  const sky = dusk <= 0 ? "from-[#d9c9a6] to-[#b89f76]" : dusk < 1 ? "from-[#8f7a60] to-[#5e4c3a]" : "from-[#1d2230] to-[#2c2a2a]";
  return (
    <div
      className={cx("relative h-12 overflow-hidden border-t border-vien bg-gradient-to-b transition-colors duration-[1500ms]", sky)}
      title={`${s("queue.waiting")}: ${waiting}`}
    >
      {/* Mặt đường */}
      <div className="absolute inset-x-0 bottom-0 h-2 bg-black/25" />
      <div key={stir} className={cx("absolute inset-x-2 bottom-1 flex items-end gap-1.5", stir > 0 && "animate-nhuc-nhich")}>
        {Array.from({ length: n }, (_, i) => (
          <svg
            key={i}
            viewBox="0 0 26 30"
            className={cx("shrink-0 transition-transform duration-700", cold && "animate-run-ret")}
            style={{
              width: 20 + ((i * 7) % 5),
              height: 26 + ((i * 5) % 6),
              opacity: 0.85 - i * 0.06,
              transform: cold ? "scaleY(0.88) translateY(2px)" : undefined,
              transformOrigin: "bottom",
              animationDelay: `${i * 130}ms`,
            }}
            aria-hidden
          >
            <path d={FIGURES[i % FIGURES.length]} fill={dusk >= 1 ? "#0c0a09" : "#2a2119"} />
          </svg>
        ))}
      </div>
      <span className="absolute right-2 top-1 font-nhan text-[9px] uppercase tracking-wider text-black/55 mix-blend-multiply">
        {s("queue.waiting")}: {waiting}
      </span>
    </div>
  );
}
