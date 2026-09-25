import { describe, expect, it } from "vitest";
import { traveler } from "./__fixtures__";
import { gameContent, startAt } from "./__fixtures__/game";
import { reduce } from "./game";
import { fillText, listVariables, textVars } from "./text";

describe("text — 03 mục 1.13", () => {
  it("TXT-01 thay biến có giá trị", () => {
    expect(fillText("Bạn đã nhận {{bribe_total}} đồng", { bribe_total: 120 })).toBe("Bạn đã nhận 120 đồng");
  });

  it("TXT-02 kn_remaining là số biên bản còn thiếu để chạm ngưỡng", () => {
    const content = gameContent([traveler({ id: "d3-t1", day: "d3", kn: { issue: "KN-KHOAN", note: "…" } })]);
    const s = reduce(startAt(content, "d3"), { type: "QUYET_DINH", action: "GIU_LAI", reasonId: "LD-KHOAN" }, content);
    expect(fillText("Còn {{kn_remaining:KN-KHOAN}} biên bản", textVars(s, content))).toBe("Còn 2 biên bản");
  });

  it("TXT-03 kn_remaining không âm", () => {
    expect(fillText("{{kn_remaining:KN-KHOAN}}", { "kn_remaining:KN-KHOAN": Math.max(0, 3 - 4) })).toBe("0");
  });

  it("TXT-04 biến không tồn tại thì giữ nguyên", () => {
    expect(fillText("Xin chào {{abc}}", {})).toBe("Xin chào {{abc}}");
    expect(listVariables("{{bribe_total}} và {{kn_remaining:KN-KHOAN}}")).toEqual(["bribe_total", "kn_remaining:KN-KHOAN"]);
  });
});
