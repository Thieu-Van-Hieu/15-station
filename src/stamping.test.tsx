// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { DraggableStamp } from "./components/stamping";

/** Bóng con dấu đang cầm nằm trong portal ở document.body, nhận ra bằng lớp `fixed`. */
const ghost = () => document.body.querySelector("div.fixed");

function setup(onDrop = vi.fn(() => false), onTap = vi.fn()) {
  const r = render(<DraggableStamp action="GIU_LAI" title="Giữ lại" onDrop={onDrop} onTap={onTap} />);
  const button = screen.getByRole("button");
  return { ...r, button, onDrop, onTap };
}

/** jsdom không có PointerEvent đầy đủ: dựng MouseEvent rồi gắn pointerId và pointerType. */
function pointer(type: string, x: number, y: number, extra: { buttons?: number } = {}) {
  const e = new MouseEvent(type, { bubbles: true, clientX: x, clientY: y, button: 0, buttons: extra.buttons ?? 1 });
  Object.assign(e, { pointerId: 1, pointerType: "mouse" });
  return e;
}

function startDrag(button: HTMLElement) {
  fireEvent.pointerDown(button, { button: 0, clientX: 10, clientY: 10, pointerId: 1, pointerType: "mouse" });
  act(() => {
    window.dispatchEvent(pointer("pointermove", 200, 150));
  });
}

describe("Con dấu kéo thả (V5) — không bị kẹt", () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("STP-01 kéo ra xa khỏi nút, bóng con dấu vẫn chạy theo chuột", () => {
    const { button } = setup();
    startDrag(button);
    act(() => {
      window.dispatchEvent(pointer("pointermove", 400, 300));
    });
    expect(ghost()?.getAttribute("style")).toContain("left: 400px");
  });

  it("STP-02 thả trúng giấy thì đóng dấu, bóng con dấu biến mất", () => {
    const { button, onDrop } = setup(vi.fn(() => true));
    startDrag(button);
    act(() => {
      window.dispatchEvent(pointer("pointerup", 200, 150, { buttons: 0 }));
    });
    expect(onDrop).toHaveBeenCalledWith(200, 150);
    expect(ghost()).toBeNull();
  });

  it("STP-03 thả ngoài giấy thì bay về khay rồi biến mất", () => {
    vi.useFakeTimers();
    const { button } = setup();
    startDrag(button);
    act(() => {
      window.dispatchEvent(pointer("pointerup", 200, 150, { buttons: 0 }));
    });
    expect(ghost()?.className).toContain("transition");
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(ghost()).toBeNull();
  });

  it("STP-04 nhả chuột ngoài cửa sổ (mất pointerup): lần di chuột kế tiếp đưa con dấu về, không đóng dấu", () => {
    vi.useFakeTimers();
    const { button, onDrop } = setup(vi.fn(() => true));
    startDrag(button);
    act(() => {
      window.dispatchEvent(pointer("pointermove", 220, 160, { buttons: 0 }));
    });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(onDrop).not.toHaveBeenCalled();
    expect(ghost()).toBeNull();
    // Rê chuột lại qua nút không làm bóng con dấu hiện lại.
    act(() => {
      window.dispatchEvent(pointer("pointermove", 10, 10, { buttons: 0 }));
    });
    expect(ghost()).toBeNull();
  });

  it("STP-05 đổi cửa sổ hoặc bấm Esc giữa lúc kéo: con dấu bay về", () => {
    vi.useFakeTimers();
    for (const interrupt of [() => window.dispatchEvent(new Event("blur")), () => fireEvent.keyDown(window, { key: "Escape" })]) {
      const { button, onDrop, unmount } = setup(vi.fn(() => true));
      startDrag(button);
      act(interrupt);
      act(() => {
        vi.advanceTimersByTime(300);
      });
      expect(onDrop).not.toHaveBeenCalled();
      expect(ghost()).toBeNull();
      unmount();
    }
  });

  it("STP-06 nút bị khoá giữa lúc kéo: huỷ lần kéo", () => {
    vi.useFakeTimers();
    const onDrop = vi.fn(() => true);
    const { button, rerender } = setup(onDrop);
    startDrag(button);
    rerender(<DraggableStamp action="GIU_LAI" title="Giữ lại" onDrop={onDrop} disabled />);
    act(() => {
      vi.advanceTimersByTime(300);
    });
    act(() => {
      window.dispatchEvent(pointer("pointerup", 200, 150, { buttons: 0 }));
    });
    expect(onDrop).not.toHaveBeenCalled();
    expect(ghost()).toBeNull();
  });

  it("STP-07 bấm mà không kéo là một cú chạm, không đóng dấu", () => {
    const { button, onDrop, onTap } = setup();
    fireEvent.pointerDown(button, { button: 0, clientX: 10, clientY: 10, pointerId: 1, pointerType: "mouse" });
    act(() => {
      window.dispatchEvent(pointer("pointerup", 11, 11, { buttons: 0 }));
    });
    expect(onTap).toHaveBeenCalledOnce();
    expect(onDrop).not.toHaveBeenCalled();
    expect(ghost()).toBeNull();
  });
});
