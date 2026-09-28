/**
 * Thẻ kết quả cuối game (V7): ảnh vuông 1200×1200 vẽ bằng canvas, tải về hoặc chụp màn hình được.
 * Bố cục ở 05-art-brief.md mục 4d. Hai tỷ lệ chấp hành (theo báo cáo và thực tế) đặt cạnh nhau là chi tiết chính.
 */
import { useEffect, useRef, useState } from "react";
import { Label, PrimaryButton, s } from "./ui";

export interface CardData {
  endingId: string;
  title: string;
  cardLine: string;
  reported: number;
  actual: number;
  reports: number;
  /** Số lượt đã chỉ ra chỗ lệch và số lượt hành động theo (V8). Null nếu chưa đối chất lần nào. */
  confront: { found: number; acted: number } | null;
  character: { name: string; text: string } | null;
  quote: { text: string; chapter: number; section: string };
}

const SIZE = 1200;
const INK = "#181513";
const RED = "#b3261e";
const MUTED = "#5b5047";

const F = {
  serif: (w: number, px: number, italic = false) => `${italic ? "italic " : ""}${w} ${px}px "Noto Serif", serif`,
  mono: (w: number, px: number, italic = false) => `${italic ? "italic " : ""}${w} ${px}px "IBM Plex Mono", monospace`,
  label: (px: number) => `700 ${px}px "Space Mono", monospace`,
};

/** Tách chữ thành các dòng vừa `width`. */
function wrap(ctx: CanvasRenderingContext2D, text: string, width: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > width && line) {
      lines.push(line);
      line = w;
    } else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

function spaced(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, spacing: number, align: "left" | "center" = "left") {
  const chars = [...text];
  const total = chars.reduce((sum, c) => sum + ctx.measureText(c).width + spacing, -spacing);
  let cx = align === "center" ? x - total / 2 : x;
  for (const c of chars) {
    ctx.fillText(c, cx, y);
    cx += ctx.measureText(c).width + spacing;
  }
}

export function drawCard(ctx: CanvasRenderingContext2D, d: CardData, player: string) {
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";

  // Giấy cũ: nền, vệt ố, hạt
  ctx.fillStyle = "#efe6cf";
  ctx.fillRect(0, 0, SIZE, SIZE);
  const g = ctx.createRadialGradient(SIZE / 2, SIZE / 2, 300, SIZE / 2, SIZE / 2, 860);
  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(1, "rgba(120,85,40,0.28)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, SIZE, SIZE);
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 9000; i++) {
    ctx.fillStyle = `rgba(60,40,20,${rnd() * 0.07})`;
    ctx.fillRect(rnd() * SIZE, rnd() * SIZE, 1.4, 1.4);
  }
  ctx.strokeStyle = INK;
  ctx.lineWidth = 4;
  ctx.strokeRect(44, 44, SIZE - 88, SIZE - 88);
  ctx.lineWidth = 1.2;
  ctx.strokeRect(56, 56, SIZE - 112, SIZE - 112);

  const L = 100;
  const W = SIZE - 2 * L;

  // Đầu thẻ
  ctx.fillStyle = INK;
  ctx.font = F.serif(700, 46);
  spaced(ctx, s("ui.brand"), L, 128, 6);
  ctx.font = F.label(17);
  ctx.fillStyle = MUTED;
  ctx.textAlign = "right";
  ctx.fillText(s("card.header_sub").toUpperCase(), SIZE - L, 124);
  ctx.textAlign = "left";
  ctx.fillStyle = INK;
  ctx.fillRect(L, 152, W, 3);
  ctx.fillRect(L, 160, W, 1);

  // Kết cục
  ctx.fillStyle = RED;
  ctx.font = F.label(20);
  spaced(ctx, s("card.label_ending").toUpperCase(), L, 222, 5);
  ctx.fillStyle = INK;
  ctx.font = F.serif(700, 70);
  let y = 300;
  for (const line of wrap(ctx, d.title.toUpperCase(), W)) {
    ctx.fillText(line, L, y);
    y += 78;
  }
  ctx.font = F.mono(400, 27, true);
  ctx.fillStyle = MUTED;
  y += 4;
  for (const line of wrap(ctx, d.cardLine, W)) {
    ctx.fillText(line, L, y);
    y += 38;
  }

  // Ba con số
  y += 30;
  const boxW = (W - 40) / 3;
  const stats: [string, string, boolean][] = [
    [s("card.reported"), `${Math.round(d.reported * 100)}%`, false],
    [s("card.actual"), `${Math.round(d.actual * 100)}%`, Math.round(d.reported * 100) !== Math.round(d.actual * 100)],
    [s("card.reports"), String(d.reports), false],
  ];
  stats.forEach(([label, value, warn], i) => {
    const x = L + i * (boxW + 20);
    ctx.strokeStyle = warn ? RED : INK;
    ctx.lineWidth = warn ? 3 : 1.5;
    ctx.strokeRect(x, y, boxW, 150);
    ctx.fillStyle = MUTED;
    ctx.font = F.label(16);
    wrap(ctx, label.toUpperCase(), boxW - 40).forEach((ln, j) => ctx.fillText(ln, x + 20, y + 34 + j * 20));
    ctx.fillStyle = warn ? RED : INK;
    ctx.font = F.serif(700, 62);
    ctx.fillText(value, x + 20, y + 128);
  });
  // Dấu "≠" giữa hai tỷ lệ khi chúng không khớp
  if (stats[1][2]) {
    ctx.fillStyle = RED;
    ctx.font = F.serif(700, 44);
    ctx.textAlign = "center";
    ctx.fillText("≠", L + boxW + 10, y + 92);
    ctx.textAlign = "left";
  }
  y += 150;

  if (d.confront) {
    y += 44;
    ctx.fillStyle = INK;
    ctx.font = F.mono(700, 24);
    const line = `${s("card.confront_found")} ${d.confront.found} · ${s("card.confront_acted")} ${d.confront.acted}`;
    ctx.fillText(line, L, y);
  }

  // Một dòng về một nhân vật
  if (d.character) {
    y += 56;
    ctx.fillStyle = INK;
    ctx.font = F.serif(400, 27, true);
    for (const line of wrap(ctx, `“${d.character.text}”`, W).slice(0, 3)) {
      ctx.fillText(line, L, y);
      y += 38;
    }
    ctx.font = F.label(16);
    ctx.fillStyle = MUTED;
    ctx.fillText(`— ${d.character.name.toUpperCase()}`, L, y + 2);
    y += 20;
  }

  // Câu trích giáo trình
  y += 46;
  ctx.fillStyle = RED;
  ctx.fillRect(L, y - 30, 6, 130);
  ctx.fillStyle = INK;
  ctx.font = F.serif(700, 30);
  let qy = y;
  for (const line of wrap(ctx, `“${d.quote.text}”`, W - 40).slice(0, 3)) {
    ctx.fillText(line, L + 28, qy);
    qy += 40;
  }
  ctx.font = F.label(15);
  ctx.fillStyle = MUTED;
  ctx.fillText(`${s("card.quote_source").toUpperCase()} · ${s("end.chapter_prefix").toUpperCase()} ${d.quote.chapter} (${d.quote.section})`, L + 28, qy + 4);

  // Con dấu đỏ góc phải
  ctx.save();
  ctx.translate(SIZE - 230, SIZE - 250);
  ctx.rotate(-0.22);
  ctx.globalAlpha = 0.82;
  ctx.strokeStyle = RED;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(0, 0, 92, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, 78, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = RED;
  ctx.textAlign = "center";
  ctx.font = F.label(22);
  ctx.fillText(s("ui.brand"), 0, -18);
  ctx.font = F.serif(700, 20);
  ctx.fillText("★", 0, 8);
  ctx.font = F.label(16);
  ctx.fillText(s("card.stamp"), 0, 34);
  ctx.restore();

  // Chân thẻ
  ctx.textAlign = "left";
  ctx.fillStyle = INK;
  ctx.fillRect(L, SIZE - 150, W, 1);
  ctx.font = F.mono(700, 20);
  if (player.trim()) ctx.fillText(`${s("card.player")}: ${player.trim()}`, L, SIZE - 112);
  ctx.font = F.label(15);
  ctx.fillStyle = MUTED;
  ctx.fillText(`${s("card.game")} · ${s("card.team")} · ${s("card.class")}`.toUpperCase(), L, SIZE - 84);
}

export function ResultCard({ data }: { data: CardData }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [player, setPlayer] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fonts = [F.serif(700, 70), F.serif(400, 27, true), F.mono(400, 27, true), F.mono(700, 20), F.label(20)];
    Promise.all(fonts.map((f) => document.fonts?.load(f).catch(() => null)))
      .catch(() => null)
      .then(() => {
        if (cancelled) return;
        const ctx = canvas.current?.getContext("2d");
        if (!ctx) return;
        drawCard(ctx, data, player);
        setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [data, player]);

  function download() {
    canvas.current?.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `tram15-${data.endingId.toLowerCase()}.png`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    }, "image/png");
  }

  return (
    <section className="grid grid-cols-1 md:grid-cols-[minmax(0,420px)_1fr] gap-6 items-center border border-vien bg-ban-2/80 p-5">
      <canvas ref={canvas} width={SIZE} height={SIZE} className="w-full h-auto shadow-noi border border-giay-vien" aria-label={s("card.title")} />
      <div className="space-y-4">
        <div>
          <Label className="text-ho-phach">{s("card.title")}</Label>
          <p className="text-[13px] text-chu-ban leading-relaxed mt-1">{s("card.hint")}</p>
        </div>
        <label className="block">
          <Label className="text-chu-ban-phu/70 text-[10px]">{s("card.name_label")}</Label>
          <input
            value={player}
            onChange={(e) => setPlayer(e.target.value.slice(0, 40))}
            placeholder={s("card.name_placeholder")}
            className="mt-1 w-full bg-transparent border-b border-chu-ban-phu/60 py-1.5 text-giay placeholder:text-chu-ban-phu/40 focus:outline-none focus:border-ho-phach"
          />
        </label>
        <PrimaryButton onClick={download} disabled={!ready} className="w-full">
          {s("card.download")}
        </PrimaryButton>
      </div>
    </section>
  );
}
