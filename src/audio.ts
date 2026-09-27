/**
 * Quản lý hiệu ứng âm thanh (SFX) — 05-art-brief.md mục 5.
 * Chỉ phát sau tương tác đầu tiên của người dùng để tuân thủ autoplay policy của trình duyệt.
 */

type SfxName = "window_slide" | "paper_rustle" | "stamp_down" | "radio_tune";

const SFX_MAP: Record<SfxName, string> = {
  window_slide: "/sfx/sfx_window_slide.mp3",
  paper_rustle: "/sfx/sfx_paper_rustle.mp3",
  stamp_down: "/sfx/sfx_stamp_down.mp3",
  radio_tune: "/sfx/sfx_radio_tune.mp3",
};

let userHasInteracted = false;

if (typeof window !== "undefined") {
  const markInteraction = () => {
    userHasInteracted = true;
    window.removeEventListener("click", markInteraction);
    window.removeEventListener("keydown", markInteraction);
  };

  window.addEventListener("click", markInteraction, { once: true });
  window.addEventListener("keydown", markInteraction, { once: true });
}

export function playSfx(name: SfxName) {
  if (typeof window === "undefined" || !userHasInteracted) return;

  try {
    const audio = new Audio(SFX_MAP[name]);
    audio.volume = 0.6;
    audio.play().catch(() => {
      // Bỏ qua lỗi trình duyệt chặn autoplay
    });
  } catch {
    // Bỏ qua lỗi âm thanh môi trường không hỗ trợ
  }
}
