/**
 * Hàng người chờ ngoài cửa sổ trạm (V6). Số bóng người bằng số lượt còn lại trong ngày.
 * Gần hết ca trời tối dần; quá giờ thì bóng người co lại vì rét. Thuần hình, không đụng cơ chế.
 *
 * Cảnh nhìn qua ô cửa: con đường đất chạy xa dần về phía luỹ tre, người đứng xếp hàng quay mặt về phía trạm
 * (bên trái). Người đứng đầu hàng gần nhất nên to nhất, càng về cuối càng nhỏ và cao dần theo mặt đường.
 */
import { useId, type ReactNode } from "react";
import { cx, s } from "./ui";

interface QueueStripProps {
  /** Số người còn đứng chờ sau người đang ở ô cửa. */
  waiting: number;
  /** 0 = ban ngày, 1 = tối hẳn (đã quá giờ hết ca). */
  dusk: number;
  /** Đổi giá trị để hàng người nhúc nhích (khi người chơi lập biên bản, đồng hồ nhảy giờ). */
  stir?: number;
}

const W = 320;
const H = 96;
/** Tối đa số bóng người vẽ ra. Ngày đông nhất có 6 lượt nên hàng chờ không quá 5. */
const MAX_SHOWN = 6;

/**
 * Năm dáng người, vẽ trong khung cao 64 đơn vị, chân chạm y = 64, quay mặt sang trái.
 * `w` là bề rộng khung để xếp hàng cho khít.
 */
const FIGURES: { w: number; draw: ReactNode }[] = [
  // Người đàn bà đội nón lá, gánh đòn gánh với hai quang thúng
  {
    w: 48,
    draw: (
      <>
        <path d="M11 13.5 L24 3 L37 13.5 Q24 16 11 13.5Z" />
        <circle cx="23" cy="16" r="3.4" />
        <path d="M19 19 Q24 17.5 29 19 L30.5 38 H17.5Z" />
        <path d="M18 38 H23 L22.5 63.5 H19Z M25 38 H30 L29 63.5 H25.5Z" />
        <rect x="2" y="20.2" width="44" height="1.6" rx="0.8" />
        <path d="M19.5 21 L17 29 L18.8 29.6 L21.5 22Z" />
        <path d="M5 21.5 L1.5 41 M5 21.5 L8.5 41 M43 21.5 L39.5 41 M43 21.5 L46.5 41" stroke="currentColor" strokeWidth="0.8" fill="none" />
        <path d="M0 41 H10 L9 50 Q5 52 1 50Z M38 41 H48 L47 50 Q43 52 39 50Z" />
      </>
    ),
  },
  // Người đàn ông đội mũ cối, đeo túi dết
  {
    w: 36,
    draw: (
      <>
        <path d="M10.5 12 Q10.5 3 18 3 Q25.5 3 25.5 12 L28 13.2 H8Z" />
        <circle cx="17.5" cy="15" r="3.8" />
        <path d="M12 19.5 Q18 17.5 24 19.5 L25.5 39 H10.5Z" />
        <path d="M11 20.5 L8.5 36 L10.6 36.4 L13.5 23Z" />
        <path d="M24 20.5 L26 35 L24 35.4 L22 23Z" />
        <path d="M12.5 19.8 L27 30" stroke="currentColor" strokeWidth="1" fill="none" />
        <rect x="24" y="29" width="8" height="8" rx="1" />
        <path d="M11.5 39 H17 L16.6 63.5 H12.8Z M19 39 H24.5 L23.4 63.5 H19.6Z" />
      </>
    ),
  },
  // Người dắt xe đạp chở bao hàng trên yên sau
  {
    w: 64,
    draw: (
      <>
        <path d="M22 14 L31 6.5 L40 14 Q31 15.8 22 14Z" />
        <circle cx="31" cy="16.5" r="3.2" />
        <path d="M27 19.5 Q31 18 35 19.5 L36 38 H26Z" />
        <path d="M27.5 21 L17 28.5 L18 30 L29 24Z" />
        <path d="M26.8 38 H31 L30.6 63.5 H27.4Z M32 38 H36 L35.2 63.5 H32.2Z" />
        <g fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="53" r="10" />
          <circle cx="52" cy="53" r="10" />
          <path d="M52 53 L43 36 L30 53 Z M43 36 H19.5 L30 53 M19.5 34 L11 53 M19.5 34 L18 28.5 H13.5 M40 34.5 H46" />
        </g>
        <rect x="44" y="31" width="14" height="2" />
        <rect x="45" y="21" width="12" height="10" rx="2" />
      </>
    ),
  },
  // Cụ già đội khăn xếp, chống gậy, lưng hơi còng
  {
    w: 36,
    draw: (
      <>
        <ellipse cx="15" cy="10.5" rx="5.2" ry="2.6" />
        <circle cx="15.5" cy="13.5" r="3.6" />
        <path d="M11.5 17.5 Q18 15.5 24 21 L25 40 H12.5 Q10.5 28 11.5 17.5Z" />
        <path d="M12.5 20 L7 33 L8.8 34 L14.5 23Z" />
        <path d="M7.6 32.5 L5.5 63.5" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round" />
        <path d="M13 40 H18 L17.2 63.5 H13.8Z M19.5 40 H24.5 L23.2 63.5 H19.8Z" />
      </>
    ),
  },
  // Người phụ nữ đội nón bế con, tay xách làn
  {
    w: 38,
    draw: (
      <>
        <path d="M6 13.5 L19 3.5 L32 13.5 Q19 15.8 6 13.5Z" />
        <circle cx="18.5" cy="16" r="3.4" />
        <path d="M14 19 Q19 17.5 24 19 L26 40 H12.5Z" />
        <circle cx="12" cy="24" r="3" />
        <path d="M9 26 Q12 24.5 16 26.5 L15 33 H9.5Z" />
        <path d="M23.5 21 L27 36 L25.2 36.4 L22 24Z" />
        <path d="M24 36 Q28 33 32 36 L31 43 H25Z" />
        <path d="M14 40 H19 L18.4 63.5 H14.8Z M20.5 40 H25.5 L24.4 63.5 H21Z" />
      </>
    ),
  },
];

/** Bảng màu theo độ tối: ban ngày, chạng vạng, đêm. */
const PALETTE = [
  { sky: ["#e4d6b4", "#c9b187"], far: "#a8946c", ground: "#b39c74", road: "#c2ab82", figure: "#2a2119", label: "#2a2119" },
  { sky: ["#a88d6c", "#6f5a44"], far: "#584836", ground: "#5e4c39", road: "#6d5942", figure: "#1e1812", label: "#1e1812" },
  { sky: ["#161b28", "#2a2c3a"], far: "#0f1219", ground: "#1b1c22", road: "#24252c", figure: "#07080a", label: "#07080a" },
];

function paletteFor(dusk: number) {
  return dusk <= 0 ? PALETTE[0] : dusk < 1 ? PALETTE[1] : PALETTE[2];
}

/** Vị trí từng người trong hàng: người đầu hàng gần và to nhất, về sau nhỏ dần, cao dần theo mặt đường. */
function layout(n: number) {
  const out: { x: number; y: number; k: number; fig: number }[] = [];
  let x = 14;
  for (let i = 0; i < n; i++) {
    const k = 1.02 - i * 0.1;
    // Dáng xoay vòng nhưng không để hai người đứng liền nhau cùng dáng.
    const fig = [0, 1, 2, 4, 3, 1][i % 6];
    out.push({ x, y: H - 6 - i * 3.2, k, fig });
    x += FIGURES[fig].w * k * 0.92;
  }
  return out;
}

export function QueueStrip({ waiting, dusk, stir = 0 }: QueueStripProps) {
  const n = Math.max(0, Math.min(waiting, MAX_SHOWN));
  const cold = dusk >= 1;
  const c = paletteFor(dusk);
  const people = layout(n);
  // Mã gradient riêng cho từng dải, để nhiều dải trên cùng trang (test, xem thử) không lấy nhầm màu của nhau.
  const id = useId();
  return (
    <div className="relative h-24 overflow-hidden border-t border-vien" title={`${s("queue.waiting")}: ${waiting}`}>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMinYMax slice" className="absolute inset-0 w-full h-full" aria-hidden>
        <defs>
          <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={c.sky[0]} style={{ transition: "stop-color 1.5s" }} />
            <stop offset="1" stopColor={c.sky[1]} style={{ transition: "stop-color 1.5s" }} />
          </linearGradient>
          {/* Ánh đèn trong trạm hắt ra mặt đường lúc trời tối. */}
          <radialGradient id={`${id}-lamp`} cx="0" cy="1" r="1">
            <stop offset="0" stopColor="#f2c46b" stopOpacity="0.55" />
            <stop offset="0.55" stopColor="#f2c46b" stopOpacity="0.12" />
            <stop offset="1" stopColor="#f2c46b" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect width={W} height={H} fill={`url(#${id}-sky)`} />
        {cold && [[40, 12], [96, 20], [150, 8], [212, 16], [268, 10], [300, 24]].map(([x, y]) => <circle key={x} cx={x} cy={y} r="0.7" fill="#d9d4c4" opacity="0.7" />)}

        {/* Luỹ tre và mái nhà xa ở chân trời */}
        <path
          fill={c.far}
          style={{ transition: "fill 1.5s" }}
          d="M0 58 Q6 50 10 55 Q14 44 20 52 Q25 47 30 56 L44 56 L52 50 L60 56 L70 56 Q76 46 82 53 Q88 42 95 50 Q100 45 106 55 L150 57 Q156 49 161 54 Q166 41 173 50 Q179 45 184 56 L205 56 L213 51 L221 56 Q228 47 234 53 Q240 43 247 51 Q253 46 258 56 L290 57 Q296 50 301 55 Q306 45 312 52 L320 51 V62 H0Z"
        />
        {/* Đồng ruộng và con đường đất chạy xa dần về bên phải */}
        <rect y="60" width={W} height={H - 60} fill={c.ground} style={{ transition: "fill 1.5s" }} />
        <path d={`M0 ${H} L0 80 Q160 66 ${W} 61 L${W} 67 Q170 78 60 ${H}Z`} fill={c.road} style={{ transition: "fill 1.5s" }} />
        {cold && <rect width={W * 0.55} height={H} fill={`url(#${id}-lamp)`} />}

        <g key={stir} className={cx(stir > 0 && "animate-nhuc-nhich")} fill={c.figure} color={c.figure} style={{ transition: "fill 1.5s, color 1.5s" }}>
          {/* Vẽ từ cuối hàng lên đầu hàng để người gần đè lên người xa. */}
          {people
            .map((p, i) => (
              <g key={i} transform={`translate(${p.x} ${p.y - 64 * p.k}) scale(${p.k})`}>
                {/* Bóng đổ dưới chân */}
                <ellipse cx={FIGURES[p.fig].w / 2} cy="64" rx={FIGURES[p.fig].w * 0.42} ry="2" opacity="0.28" />
                <g
                  className={cold ? "animate-run-ret" : "animate-cho-doi"}
                  style={{
                    transformBox: "fill-box",
                    transformOrigin: "bottom",
                    transform: cold ? "scaleY(0.9)" : undefined,
                    animationDelay: `${-i * 0.7}s`,
                  }}
                >
                  {FIGURES[p.fig].draw}
                </g>
              </g>
            ))
            .reverse()}
        </g>
      </svg>

      <span className="absolute right-1.5 top-1.5 bg-giay/85 border border-muc/40 px-1.5 py-0.5 font-nhan text-[9px] font-bold uppercase tracking-wider text-muc shadow-sm">
        {s("queue.waiting")}: {waiting}
      </span>
    </div>
  );
}
