// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { content } from "./content";
import { IntroScreen } from "./screens/IntroScreen";

const s = (k: string) => content.strings[k];

describe("Sổ tay hướng dẫn", () => {
  afterEach(cleanup);

  it("TUT-01 màn mở đầu có nút mở sổ tay; bấm thì hiện trang 1", () => {
    render(<IntroScreen onStart={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: new RegExp(s("tutorial.open"), "i") }));
    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(screen.getByRole("heading", { name: s("tutorial.1.title") })).toBeTruthy();
  });

  it("TUT-02 phím → lật trang, Esc đóng sổ", () => {
    render(<IntroScreen onStart={() => {}} />);
    fireEvent.keyDown(window, { key: "h" });
    fireEvent.keyDown(window, { key: "ArrowRight" });
    expect(screen.getByRole("heading", { name: s("tutorial.2.title") })).toBeTruthy();
    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("TUT-03 khi sổ tay đang mở, Enter không bắt đầu ca", () => {
    const onStart = vi.fn();
    render(<IntroScreen onStart={onStart} />);
    fireEvent.keyDown(window, { key: "H" });
    fireEvent.keyDown(document.body, { key: "Enter" });
    expect(onStart).not.toHaveBeenCalled();
    fireEvent.keyDown(window, { key: "Escape" });
    fireEvent.keyDown(document.body, { key: "Enter" });
    expect(onStart).toHaveBeenCalledOnce();
  });

  it("TUT-04 mọi trang đều có tiêu đề và ít nhất ba gạch đầu dòng trong strings.json", () => {
    for (let p = 1; p <= 7; p++) {
      expect(s(`tutorial.${p}.title`), `trang ${p}`).toBeTruthy();
      expect(s(`tutorial.${p}.b3`), `trang ${p}`).toBeTruthy();
    }
  });
});
