/**
 * Âm thanh — danh sách file và mô tả ở docs/09-am-thanh.md.
 *
 * Mỗi âm là một file trong public/audio/<tên>.mp3 (hoặc .ogg). Khi nạp, file được phân tích để
 * chuẩn hoá âm lượng: đo độ to (RMS của phần có tiếng) rồi tính hệ số khuếch đại để mọi file cùng
 * đạt mức mục tiêu của nhóm (hiệu ứng, âm nền, nhạc), có chặn đỉnh để không bị vỡ tiếng.
 * Nhờ vậy nhóm có thể thả file từ nhiều nguồn khác nhau vào mà không phải tự chỉnh âm lượng.
 *
 * Mỗi âm có giới hạn thời lượng (`maxS`). Khi nạp, game bỏ khoảng lặng ở đầu file, chỉ giữ đúng `maxS` giây
 * kể từ lúc có tiếng và làm nhỏ dần phần đuôi ở chỗ cắt. File tải về dài 20 giây thì tiếng bút vẫn chỉ kêu nửa giây.
 * Âm nền và nhạc dài hơn `maxS` thì cắt lại và trộn đuôi vào đầu để vẫn lặp liền.
 *
 * File nào chưa có thì hiệu ứng dùng âm tổng hợp bằng Web Audio thay thế, âm nền và nhạc thì im lặng.
 * Chỉ phát sau tương tác đầu tiên của người chơi để tuân thủ autoplay policy của trình duyệt.
 */

export type SfxName = "stamp" | "paper" | "window" | "bell" | "coin" | "radio_tune" | "pen" | "typewriter" | "click";
export type LoopName = "amb_tram_ngay" | "amb_dem_nha" | "mus_menu" | "mus_ket";

type Category = "sfx" | "amb" | "mus";

interface SoundDef {
  category: Category;
  /** Chỉnh thêm sau chuẩn hoá, tính bằng dB. Dùng khi một âm cần nổi hoặc chìm hơn các âm cùng nhóm. */
  trimDb?: number;
  /** Thời lượng tối đa được phát, tính bằng giây, đếm từ lúc có tiếng. Khớp cột "Độ dài" ở docs/09-am-thanh.md. */
  maxS: number;
}

/** Danh mục âm. Tên file = khoá, ví dụ `stamp` → public/audio/sfx_stamp.mp3. */
export const SOUNDS: Record<SfxName | LoopName, SoundDef> = {
  stamp: { category: "sfx", trimDb: 2, maxS: 0.5 },
  paper: { category: "sfx", trimDb: -3, maxS: 0.8 },
  window: { category: "sfx", maxS: 1.2 },
  bell: { category: "sfx", trimDb: -2, maxS: 1.5 },
  coin: { category: "sfx", trimDb: -1, maxS: 1 },
  radio_tune: { category: "sfx", trimDb: -4, maxS: 3 },
  pen: { category: "sfx", trimDb: -3, maxS: 0.5 },
  typewriter: { category: "sfx", trimDb: -2, maxS: 2 },
  click: { category: "sfx", trimDb: -4, maxS: 0.2 },
  amb_tram_ngay: { category: "amb", maxS: 120 },
  amb_dem_nha: { category: "amb", maxS: 120 },
  mus_menu: { category: "mus", maxS: 120 },
  mus_ket: { category: "mus", maxS: 120 },
};

export function fileBase(name: SfxName | LoopName): string {
  return name.startsWith("amb_") || name.startsWith("mus_") ? name : `sfx_${name}`;
}

/** Mức độ to mục tiêu (RMS, dBFS) của từng nhóm sau chuẩn hoá. Âm nền và nhạc để thấp dưới hiệu ứng. */
const TARGET_DB: Record<Category, number> = { sfx: -16, amb: -30, mus: -26 };
/** Đỉnh tối đa sau khuếch đại (−1 dBFS), và mức khuếch đại tối đa (+18 dB) để không kéo tiếng ồn nền của file quá nhỏ. */
const PEAK_CEIL = 0.89;
const MAX_GAIN = 8;
const FADE_S = 1.2;
/** Ngưỡng coi là bắt đầu có tiếng: −30 dB so với đỉnh của file. Lùi lại 10 ms để không mất phần đánh của âm. */
const ONSET_DB = -30;
const PREROLL_S = 0.01;
/** Đoạn trộn đuôi vào đầu khi cắt âm nền hoặc nhạc dài hơn `maxS`. */
const LOOP_XFADE_S = 2;

const MUTE_KEY = "tram15_mute";

let userHasInteracted = false;
let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let muted = readMuted();
const listeners = new Set<(m: boolean) => void>();

function readMuted(): boolean {
  try {
    return typeof localStorage !== "undefined" && localStorage.getItem(MUTE_KEY) === "1";
  } catch {
    return false;
  }
}

if (typeof window !== "undefined") {
  const markInteraction = () => {
    userHasInteracted = true;
    window.removeEventListener("pointerdown", markInteraction);
    window.removeEventListener("keydown", markInteraction);
    // Âm nền được yêu cầu trước khi người chơi bấm gì thì bây giờ mới bắt đầu.
    if (wantedLoop) startLoop(wantedLoop);
  };
  window.addEventListener("pointerdown", markInteraction);
  window.addEventListener("keydown", markInteraction);

  // Dựng AudioContext và nạp trước hiệu ứng lúc trình duyệt rảnh, ngay sau khi trang tải.
  // Làm việc này ngay trong cú bấm đầu tiên tốn 100–170 ms và làm giao diện khựng lại.
  // AudioContext tạo trước tương tác sẽ ở trạng thái "suspended"; cú bấm đầu chỉ cần resume().
  const idle = (fn: () => void) =>
    "requestIdleCallback" in window ? window.requestIdleCallback(fn, { timeout: 2000 }) : setTimeout(fn, 300);
  idle(() => {
    const ac = getCtx();
    if (!ac) return;
    noise(ac);
    for (const name of Object.keys(SOUNDS) as (SfxName | LoopName)[]) if (SOUNDS[name].category === "sfx") void load(ac, name);
  });
}

export function isMuted(): boolean {
  return muted;
}

export function setMuted(value: boolean) {
  muted = value;
  try {
    localStorage.setItem(MUTE_KEY, value ? "1" : "0");
  } catch {
    // Bỏ qua lỗi ghi localStorage
  }
  if (master && ctx) master.gain.setTargetAtTime(value ? 0 : 1, ctx.currentTime, 0.05);
  listeners.forEach((fn) => fn(value));
}

export function onMuteChange(fn: (m: boolean) => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function getCtx(): AudioContext | null {
  if (ctx) return ctx;
  const Ctor =
    typeof window !== "undefined"
      ? (window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)
      : undefined;
  if (!Ctor) return null;
  ctx = new Ctor();
  // Chuỗi chung: master (tắt/bật tiếng) → bộ nén làm limiter → loa.
  const limiter = ctx.createDynamicsCompressor();
  limiter.threshold.value = -6;
  limiter.knee.value = 6;
  limiter.ratio.value = 12;
  limiter.attack.value = 0.003;
  limiter.release.value = 0.2;
  master = ctx.createGain();
  master.gain.value = muted ? 0 : 1;
  master.connect(limiter).connect(ctx.destination);
  return ctx;
}

function ready(): AudioContext | null {
  if (typeof window === "undefined" || !userHasInteracted) return null;
  const ac = getCtx();
  if (ac && ac.state === "suspended") void ac.resume();
  return ac;
}

// ---------------------------------------------------------------------------
// Nạp file và chuẩn hoá âm lượng
// ---------------------------------------------------------------------------

interface Loaded {
  buffer: AudioBuffer;
  /** Hệ số khuếch đại đã chuẩn hoá (gồm cả trimDb). */
  gain: number;
}

const cache = new Map<string, Promise<Loaded | null>>();

/** Đo độ to: RMS của các khung 50 ms có tiếng (bỏ khoảng lặng), và đỉnh tuyệt đối. */
export function measure(channels: Float32Array[], sampleRate: number): { rmsDb: number; peak: number } {
  const frame = Math.max(1, Math.floor(sampleRate * 0.05));
  const len = channels[0]?.length ?? 0;
  let peak = 0;
  const frames: number[] = [];
  for (let start = 0; start < len; start += frame) {
    let sum = 0;
    let n = 0;
    for (const ch of channels) {
      const end = Math.min(len, start + frame);
      for (let i = start; i < end; i++) {
        const v = ch[i];
        sum += v * v;
        n++;
        const a = Math.abs(v);
        if (a > peak) peak = a;
      }
    }
    if (n > 0) frames.push(sum / n);
  }
  // Bỏ các khung nhỏ hơn 1/1000 khung to nhất (−30 dB so với đỉnh năng lượng) để khoảng lặng đầu/cuối không kéo độ to xuống.
  const loudest = Math.max(0, ...frames);
  const voiced = frames.filter((e) => e >= loudest / 1000);
  const mean = voiced.length ? voiced.reduce((a, b) => a + b, 0) / voiced.length : 0;
  const rmsDb = mean > 0 ? 10 * Math.log10(mean) : -120;
  return { rmsDb, peak };
}

/** Hệ số khuếch đại để đưa file về mức mục tiêu, có chặn đỉnh và chặn mức tăng tối đa. */
export function normalizeGain(rmsDb: number, peak: number, category: Category, trimDb = 0): number {
  const wanted = Math.pow(10, (TARGET_DB[category] + trimDb - rmsDb) / 20);
  const peakLimit = peak > 0 ? PEAK_CEIL / peak : MAX_GAIN;
  return Math.min(wanted, peakLimit, MAX_GAIN);
}

async function fetchFirst(ac: AudioContext, base: string): Promise<AudioBuffer | null> {
  for (const ext of ["mp3", "ogg", "wav"]) {
    try {
      const res = await fetch(`/audio/${base}.${ext}`);
      const type = res.headers.get("content-type") ?? "";
      // Máy chủ dev trả index.html cho đường dẫn không có: bỏ qua.
      if (!res.ok || type.includes("text/html")) continue;
      return await ac.decodeAudioData(await res.arrayBuffer());
    } catch {
      // Thử định dạng kế tiếp
    }
  }
  return null;
}

/** Mẫu đầu tiên có tiếng, tức vượt ngưỡng `ONSET_DB` so với đỉnh, đã lùi `PREROLL_S`. File im lặng hoàn toàn trả 0. */
export function findOnset(channels: Float32Array[], sampleRate: number): number {
  const len = channels[0]?.length ?? 0;
  let peak = 0;
  for (const ch of channels) for (let i = 0; i < len; i++) peak = Math.max(peak, Math.abs(ch[i]));
  if (peak === 0) return 0;
  const threshold = peak * Math.pow(10, ONSET_DB / 20);
  for (let i = 0; i < len; i++) {
    for (const ch of channels) {
      if (Math.abs(ch[i]) >= threshold) return Math.max(0, i - Math.floor(sampleRate * PREROLL_S));
    }
  }
  return 0;
}

/**
 * Cắt hiệu ứng về đúng đoạn được phát: bỏ khoảng lặng đầu, giữ tối đa `maxS` giây.
 * Có cắt đuôi thì làm nhỏ dần 30% cuối (tối đa 0,3 s) để không nghe tiếng "cụp".
 */
export function clipSfx(channels: Float32Array[], sampleRate: number, maxS: number): Float32Array[] {
  const len = channels[0]?.length ?? 0;
  const start = findOnset(channels, sampleRate);
  const end = Math.min(len, start + Math.floor(maxS * sampleRate));
  const fadeIn = start > 0 ? Math.min(end - start, Math.floor(sampleRate * 0.003)) : 0;
  const fadeOut = end < len ? Math.min(end - start, Math.floor(sampleRate * Math.min(0.3, maxS * 0.3))) : 0;
  return channels.map((ch) => {
    const out = ch.slice(start, end);
    for (let i = 0; i < fadeIn; i++) out[i] *= i / fadeIn;
    for (let i = 0; i < fadeOut; i++) out[out.length - 1 - i] *= i / fadeOut;
    return out;
  });
}

/**
 * Cắt âm nền hoặc nhạc về `maxS` giây mà vẫn lặp liền: đoạn `LOOP_XFADE_S` ngay sau điểm cắt được trộn
 * (công suất không đổi) vào đầu đoạn, nên nối cuối vào đầu nghe như file chạy tiếp. File ngắn hơn thì giữ nguyên.
 */
export function clipLoop(channels: Float32Array[], sampleRate: number, maxS: number): Float32Array[] {
  const len = channels[0]?.length ?? 0;
  const keep = Math.floor(maxS * sampleRate);
  if (len <= keep) return channels;
  const xfade = Math.min(Math.floor(LOOP_XFADE_S * sampleRate), len - keep, keep);
  return channels.map((ch) => {
    const out = ch.slice(0, keep);
    for (let i = 0; i < xfade; i++) {
      const t = (i + 0.5) / xfade;
      out[i] = ch[i] * Math.sin((t * Math.PI) / 2) + ch[keep + i] * Math.cos((t * Math.PI) / 2);
    }
    return out;
  });
}

function load(ac: AudioContext, name: SfxName | LoopName): Promise<Loaded | null> {
  let p = cache.get(name);
  if (!p) {
    p = fetchFirst(ac, fileBase(name)).then((decoded) => {
      if (!decoded) return null;
      const def = SOUNDS[name];
      const raw = Array.from({ length: decoded.numberOfChannels }, (_, i) => decoded.getChannelData(i));
      const chans = def.category === "sfx" ? clipSfx(raw, decoded.sampleRate, def.maxS) : clipLoop(raw, decoded.sampleRate, def.maxS);
      // Chép sang bộ đệm mới đúng độ dài đã cắt, để bộ đệm giải mã đầy đủ (có thể hàng trăm MB) được giải phóng.
      const buffer = ac.createBuffer(chans.length, Math.max(1, chans[0].length), decoded.sampleRate);
      chans.forEach((c, i) => buffer.getChannelData(i).set(c));
      const { rmsDb, peak } = measure(chans, buffer.sampleRate);
      return { buffer, gain: normalizeGain(rmsDb, peak, def.category, def.trimDb) };
    });
    cache.set(name, p);
  }
  return p;
}

/** Nạp trước các hiệu ứng để lần phát đầu không bị trễ. */
export function preloadSfx() {
  const ac = ready();
  if (!ac) return;
  for (const name of Object.keys(SOUNDS) as (SfxName | LoopName)[]) if (SOUNDS[name].category === "sfx") void load(ac, name);
}

// ---------------------------------------------------------------------------
// Hiệu ứng
// ---------------------------------------------------------------------------

export function playSfx(name: SfxName) {
  const ac = ready();
  if (!ac || !master || muted) return;
  const out = master;
  void load(ac, name).then((loaded) => {
    try {
      if (loaded) {
        const src = ac.createBufferSource();
        src.buffer = loaded.buffer;
        // Lệch cao độ nhẹ để các lần phát liên tiếp không giống hệt nhau.
        src.playbackRate.value = 0.96 + Math.random() * 0.08;
        const g = ac.createGain();
        g.gain.value = loaded.gain;
        src.connect(g).connect(out);
        src.start();
      } else {
        const g = ac.createGain();
        g.gain.value = 0.55;
        g.connect(out);
        SYNTHS[name](ac, g, ac.currentTime + 0.01);
      }
    } catch {
      // Bỏ qua lỗi âm thanh ở môi trường không hỗ trợ
    }
  });
}

// ---------------------------------------------------------------------------
// Âm nền và nhạc (lặp, chuyển mượt khi đổi màn)
// ---------------------------------------------------------------------------

let wantedLoop: LoopName | null = null;
let current: { name: LoopName; src: AudioBufferSourceNode; gain: GainNode } | null = null;

/** Đặt âm nền của màn hiện tại. Null để tắt. Gọi lại cùng tên thì không làm gì. */
export function setLoop(name: LoopName | null) {
  wantedLoop = name;
  if (current?.name === name) return;
  fadeOutCurrent();
  if (name) startLoop(name);
}

function fadeOutCurrent() {
  if (!current || !ctx) return;
  const { src, gain } = current;
  const t = ctx.currentTime;
  gain.gain.cancelScheduledValues(t);
  gain.gain.setValueAtTime(gain.gain.value, t);
  gain.gain.linearRampToValueAtTime(0, t + FADE_S);
  src.stop(t + FADE_S + 0.05);
  current = null;
}

function startLoop(name: LoopName) {
  const ac = ready();
  if (!ac || !master) return;
  const out = master;
  void load(ac, name).then((loaded) => {
    if (!loaded || wantedLoop !== name || current?.name === name) return;
    const src = ac.createBufferSource();
    src.buffer = loaded.buffer;
    src.loop = true;
    const g = ac.createGain();
    const t = ac.currentTime;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(loaded.gain, t + FADE_S);
    src.connect(g).connect(out);
    src.start();
    current = { name, src, gain: g };
  });
}

// ---------------------------------------------------------------------------
// Âm tổng hợp dự phòng khi chưa có file
// ---------------------------------------------------------------------------

let sharedNoise: AudioBuffer | null = null;

/** Một đoạn tiếng ồn trắng 2 giây dùng chung; mỗi lần phát lấy một điểm bắt đầu ngẫu nhiên. */
function noise(ac: AudioContext): AudioBuffer {
  if (!sharedNoise) sharedNoise = noiseBuffer(ac, 2);
  return sharedNoise;
}

function noiseBuffer(ac: AudioContext, seconds: number): AudioBuffer {
  const len = Math.floor(ac.sampleRate * seconds);
  const buf = ac.createBuffer(1, len, ac.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  return buf;
}

function noiseBurst(
  ac: AudioContext,
  out: AudioNode,
  t: number,
  dur: number,
  opts: { type: BiquadFilterType; freq: number; q?: number; gain: number; attack?: number; freqEnd?: number },
) {
  const src = ac.createBufferSource();
  src.buffer = noise(ac);
  const filter = ac.createBiquadFilter();
  filter.type = opts.type;
  filter.frequency.setValueAtTime(opts.freq, t);
  if (opts.freqEnd) filter.frequency.exponentialRampToValueAtTime(opts.freqEnd, t + dur);
  filter.Q.value = opts.q ?? 1;
  const g = ac.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(opts.gain, t + (opts.attack ?? 0.004));
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(filter).connect(g).connect(out);
  src.start(t, Math.random() * Math.max(0, 1.9 - dur));
  src.stop(t + dur + 0.05);
}

function tone(
  ac: AudioContext,
  out: AudioNode,
  t: number,
  dur: number,
  opts: { freq: number; freqEnd?: number; type?: OscillatorType; gain: number; attack?: number },
) {
  const osc = ac.createOscillator();
  osc.type = opts.type ?? "sine";
  osc.frequency.setValueAtTime(opts.freq, t);
  if (opts.freqEnd) osc.frequency.exponentialRampToValueAtTime(opts.freqEnd, t + dur);
  const g = ac.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(opts.gain, t + (opts.attack ?? 0.005));
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g).connect(out);
  osc.start(t);
  osc.stop(t + dur + 0.05);
}

const SYNTHS: Record<SfxName, (ac: AudioContext, out: AudioNode, t: number) => void> = {
  stamp(ac, out, t) {
    tone(ac, out, t, 0.22, { freq: 110, freqEnd: 42, gain: 0.9, attack: 0.002 });
    noiseBurst(ac, out, t, 0.09, { type: "lowpass", freq: 900, gain: 0.7, attack: 0.001 });
    noiseBurst(ac, out, t + 0.005, 0.03, { type: "bandpass", freq: 2600, q: 2, gain: 0.35, attack: 0.001 });
  },
  paper(ac, out, t) {
    const n = 4 + Math.floor(Math.random() * 3);
    for (let i = 0; i < n; i++) {
      noiseBurst(ac, out, t + i * (0.035 + Math.random() * 0.05), 0.05 + Math.random() * 0.07, {
        type: "bandpass",
        freq: 2500 + Math.random() * 3500,
        q: 0.8,
        gain: 0.12 + Math.random() * 0.15,
        attack: 0.01,
      });
    }
  },
  window(ac, out, t) {
    noiseBurst(ac, out, t, 0.5, { type: "bandpass", freq: 350, freqEnd: 1100, q: 3, gain: 0.3, attack: 0.08 });
    tone(ac, out, t, 0.5, { freq: 70, freqEnd: 90, type: "triangle", gain: 0.12, attack: 0.08 });
    noiseBurst(ac, out, t + 0.48, 0.08, { type: "lowpass", freq: 700, gain: 0.45, attack: 0.001 });
    tone(ac, out, t + 0.48, 0.12, { freq: 160, freqEnd: 80, gain: 0.3, attack: 0.002 });
  },
  radio_tune(ac, out, t) {
    noiseBurst(ac, out, t, 1.4, { type: "bandpass", freq: 1800, q: 0.6, gain: 0.12, attack: 0.15 });
    const osc = ac.createOscillator();
    osc.frequency.setValueAtTime(2200, t);
    osc.frequency.exponentialRampToValueAtTime(700, t + 0.8);
    osc.frequency.exponentialRampToValueAtTime(1100, t + 1.2);
    const lfo = ac.createOscillator();
    lfo.frequency.value = 7;
    const lfoGain = ac.createGain();
    lfoGain.gain.value = 25;
    lfo.connect(lfoGain).connect(osc.frequency);
    const g = ac.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.05, t + 0.1);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 1.3);
    osc.connect(g).connect(out);
    osc.start(t);
    lfo.start(t);
    osc.stop(t + 1.4);
    lfo.stop(t + 1.4);
  },
  coin(ac, out, t) {
    for (const [dt, f] of [
      [0, 2350],
      [0.09, 2780],
      [0.16, 2500],
    ] as const) {
      tone(ac, out, t + dt, 0.35, { freq: f, gain: 0.12, attack: 0.001 });
      tone(ac, out, t + dt, 0.25, { freq: f * 1.51, gain: 0.05, attack: 0.001 });
    }
  },
  bell(ac, out, t) {
    tone(ac, out, t, 1.2, { freq: 1480, gain: 0.18, attack: 0.002 });
    tone(ac, out, t, 0.9, { freq: 1480 * 2.76, gain: 0.05, attack: 0.002 });
    tone(ac, out, t, 0.5, { freq: 1480 * 5.4, gain: 0.02, attack: 0.002 });
  },
  pen(ac, out, t) {
    for (let i = 0; i < 3; i++)
      noiseBurst(ac, out, t + i * 0.12, 0.1, { type: "bandpass", freq: 4200 + i * 300, q: 4, gain: 0.08, attack: 0.02 });
  },
  typewriter(ac, out, t) {
    for (let i = 0; i < 7; i++) {
      const at = t + i * (0.07 + Math.random() * 0.05);
      noiseBurst(ac, out, at, 0.03, { type: "highpass", freq: 1800, gain: 0.35, attack: 0.001 });
      tone(ac, out, at, 0.05, { freq: 180, freqEnd: 90, gain: 0.25, attack: 0.001 });
    }
    tone(ac, out, t + 0.75, 0.6, { freq: 2600, gain: 0.08, attack: 0.002 });
  },
  click(ac, out, t) {
    noiseBurst(ac, out, t, 0.025, { type: "bandpass", freq: 3000, q: 2, gain: 0.3, attack: 0.001 });
  },
};
