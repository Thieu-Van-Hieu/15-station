# Việc cần làm

> Trạng thái: ĐANG DÙNG — cập nhật cuối mỗi ngày (KT giữ file này)

Chi tiết từng việc và test tương ứng: `docs/08-cac-phase.md`. Mã test (ví dụ `P0-02`) tra trong file đó.

## Phân vai

Điền tên trước khi bắt đầu P1.

| Nhãn | Vai trò | Tên |
|---|---|---|
| KB | Kịch bản và nguồn | |
| GP | Gameplay | |
| UI | Giao diện và art | |
| KT | Kết và test | |

## Người đang sửa `travelers.json`

Chỉ một người tại một thời điểm. Ghi tên trước khi sửa, xoá tên khi đã commit.

- (trống)

---

## P0 — Sửa nền

- [x] Thêm `"type": "module"`, `packageManager`, `engines`, lệnh `validate` vào `package.json` — 25/09
- [x] Cài pnpm 12.6.0, `pnpm install` — 25/09
- [x] Sửa README mục 1 và mục 8; thêm `07`, `08` vào cây thư mục — 25/09
- [x] Test P0-01: cài lại từ đầu, lockfile không đổi — 25/09
- [x] Test P0-02: `pnpm validate` chạy, 3/8 file xanh — 25/09
- [x] Test P0-03: lượt mẫu `d3-t3` qua tầng 1 — 25/09
- [ ] Test P0-04: **mỗi thành viên** chạy `pnpm install` và `pnpm validate` trên máy mình, ra cùng kết quả
  - [ ] KB
  - [ ] GP
  - [ ] UI
  - [ ] KT
- [ ] **Họp cả nhóm:** duyệt 11 quyết định ở `03-rules-spec.md` mục 12
- [ ] **Họp cả nhóm:** chốt 5 câu hỏi ở `07-trien-khai.md` mục 9, ghi kết quả vào `03`
- [ ] Đổi trạng thái `03-rules-spec.md` thành `CHỐT`
- [ ] Điền bảng phân vai ở trên

**Cổng P0:** hai mục họp xong và `03` ở trạng thái `CHỐT`.

---

## P1 — Khung dự án (GP)

Bắt đầu ngay sau buổi họp.

- [x] Cài React 19, Vite 8, TypeScript 7, Tailwind 4, Vitest 5 — 25/09
- [x] `tsconfig.json`, `vite.config.ts`, `index.html`, thêm `scripts` vào `package.json` — 25/09
- [x] `src/main.tsx`, `src/App.tsx` (trang tạm), `src/content.ts`, `src/index.css` (bảng màu tạm) — 25/09
- [x] Khung thư mục `src/engine/__fixtures__/`, `src/screens/`, `src/components/`, `public/` — 25/09
- [x] Test P1-01 (dev server phục vụ trang và CSS Tailwind), P1-02, P1-03, P1-04, P1-05, P1-06 — 25/09
- [ ] P1-01: mở `pnpm dev` bằng trình duyệt, xem trang và console bằng mắt
- [x] Commit và đẩy lên GitHub, merge PR #1 — 25/09
- [x] Kết nối Vercel Production — 25/09
- [x] Test P1-07: bản Production hiện đúng trang tạm — 25/09

## P2 — Engine (GP)

- [x] Hàm dựng dữ liệu test trong `src/engine/__fixtures__/` — 25/09
- [x] `compare.ts` — CMP-01 → CMP-14 — 25/09
- [x] `active.ts` — ACT-01 → ACT-05 — 25/09
- [x] `checks/` — R1-*, R2-*, R3-*, R4-*, R5-*, R6-* — 25/09
- [x] `evaluate.ts` — EV-01 → EV-05 — 25/09
- [x] `conditions.ts` (CON), `turn.ts` (TRN), `reports.ts` (REP), `day-end.ts` (DAY), `economy.ts` (ECO), `endings.ts` (END), `text.ts` (TXT), `game.ts` (GAM) — 25/09
- [x] `simulate.ts`: chơi tự động theo chiến lược (dùng lại ở P5, P6) — 25/09
- [x] 145 test xanh; đã thử làm hỏng 7 chỗ trong engine, test đều bắt được — 25/09
- [ ] Sau buổi họp chốt luật: nếu 5 câu hỏi ở 07 mục 9 chốt khác đề xuất, sửa các chỗ ghi "Câu hỏi mở số N" trong `turn.ts`, `endings.ts` và test tương ứng

## P3 — Nội dung nền (KB, UI, KT)

Bắt đầu sau khi `03` ở trạng thái `CHỐT`.

- [ ] `docs/02-bible.md` (KB)
- [ ] `content/characters.md` → `data/characters.json` (KB)
- [ ] Khung T2 của `ngay-1.md` … `ngay-6.md` → `data/days.json` (KB)
- [ ] `data/reports.json` (KB + GP)
- [ ] `content/ui-text.md` → `data/strings.json` (UI)
- [ ] `prompts/P2-logic-review.md`, `prompts/P3-fact-check.md` (KB + KT)
- [ ] Bắt đầu `docs/04-sources.md` (KB), `docs/05-art-brief.md` (UI)
- [ ] Test P3-01 → P3-08

## P6 — Giao diện (UI), làm song song

- [ ] Bố cục ba khu với lượt mẫu `d3-t3` (bắt đầu khi P1 xong)

## P4, P5, P7, P8, P9

Chép danh sách việc từ `08-cac-phase.md` vào đây khi đến lượt.
