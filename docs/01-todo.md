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

- [x] `docs/02-bible.md` (KB) — Hoàn tất
- [x] `content/characters.md` → `data/characters.json` (KB) — Đủ 20 nhân vật
- [x] Khung T2 của `ngay-1.md` … `ngay-6.md` → `data/days.json` (KB) — Đủ 6 ngày
- [x] `data/reports.json` (KB + GP) — Đủ 2 vấn đề (KN-KHOAN, KN-THUONG-BINH)
- [x] `content/ui-text.md` → `data/strings.json` (UI) — Đủ chuỗi giao diện không hardcode
- [x] `prompts/P2-logic-review.md`, `prompts/P3-fact-check.md` (KB + KT) — Đã rà soát
- [x] `docs/04-sources.md` (KB), `docs/05-art-brief.md` (UI) — Đầy đủ nguồn và art brief
- [x] Test P3-01 → P3-08 đạt 100%

## P4 — Nội dung 6 ngày và validate tầng 2 (KB, GP)

- [x] Hoàn thiện kịch bản 6 ngày trong `content/ngay-1.md` đến `ngay-6.md` (trạng thái ĐÃ CHUYỂN JSON)
- [x] `data/travelers.json` đủ 26 lượt khách
- [x] `data/endings.json` đủ 5 kết cục
- [x] Validate tầng 2 trong `scripts/validate-data.ts` (10 điều tham chiếu chéo)
- [x] Test V2-01 đến V2-15 trong `scripts/validate-tang2.test.ts` xanh 100%

## P5 — Validate tầng 3 và bot chơi thử (GP)

- [x] Validate tầng 3 trong `scripts/validate-data.ts` (11 điều logic game & đối chiếu engine)
- [x] Bốn bot chơi thử trong `scripts/bots.ts`: Theo sổ, Kiến nghị, Làm ngơ, Ăn tiền
- [x] Test BOT-01 đến BOT-06 trong `scripts/bots.test.ts` xanh 100%
- [x] Test V3-01 đến V3-15 trong `scripts/validate-tang3.test.ts` xanh 100%
- [x] Bảng tóm tắt 26 lượt và kiểm tra `pnpm validate --strict` đạt

## P6 — Giao diện React UI (UI, GP)

- [x] Bố cục ba khu và TopBar: ngày, đồng hồ, lượt khách, ngân sách
- [x] `DocumentPaper` hiển thị 8 loại giấy tờ, click phóng to/thu nhỏ
- [x] `Rulebook` hiển thị sổ chỉ thị kích hoạt theo ngày và vấn đề kiến nghị
- [x] `WindowPanel` hiển thị chân dung SVG, khung thoại lọc `when`, phong bì hối lộ, giấy nhắc nhở
- [x] `ActionControls` 2 con dấu, làm ngơ, lập biên bản (modal chọn lý do), chặn thao tác đúng điều kiện
- [x] `DayEndScreen` hai bảng cạnh nhau, tỷ lệ chấp hành, chỉ số huyện, yếu tố khác
- [x] `BudgetScreen` chi tiêu gia đình, cảnh báo khoản thiết yếu và tiền phong bì tách riêng
- [x] `EndingScreen` màn kết đủ cảnh, số phận nhân vật, câu trích giáo trình có chương, câu hỏi suy ngẫm
- [x] `IntroScreen` màn chú thích lịch sử và hướng dẫn cách chơi
- [x] Chế độ nhảy lượt `?tu=dX-tY` và tự động lưu/khôi phục `localStorage`
- [x] Bộ test UI-01 đến UI-12 trong `src/ui.test.tsx` xanh 100% (không có chữ tiếng Việt có dấu hardcode trong JSX)

## P7 — Art, âm thanh, màn kết (UI, KT)

- [x] 51 file chân dung SVG vector monochrome silhouette trong `public/art/portraits/`
- [x] 4 hiệu ứng âm thanh SFX offline trong `public/sfx/` (`sfx_window_slide.mp3`, `sfx_paper_rustle.mp3`, `sfx_stamp_down.mp3`, `sfx_radio_tune.mp3`)
- [x] Module `src/audio.ts` phát SFX sau tương tác đầu tiên của người chơi
- [x] File font `public/fonts/typewriter.woff2` tự host offline
- [x] Không phụ thuộc CDN hay Google Fonts ngoài
- [x] Bộ test ART-01 đến ART-06 trong `src/assets.test.ts` xanh 100%

## P8 — Chơi thử và cân độ khó (KT)

- [x] Bốn bot mô phỏng chơi tự động toàn bộ 26 lượt và đạt cả 4 kết cục khác nhau
- [x] Chỉ số huyện và tiền được kiểm tra không âm, không bị nghẽn ở bất kỳ phase nào
- [x] Lượt bà Tư mang giấy khoán d5 ra đúng `CHO_QUA` khi kiến nghị kích hoạt
- [x] Lệnh `pnpm check` chạy toàn diện: validate + test + build đều xanh

## P9 — Deploy và trình bày (GP, KT)

- [x] Script build bundle `pnpm build` (`tsc && vite build`) hoàn tất sạch sẽ
- [x] Tạo file CI GitHub Actions `.github/workflows/check.yml`
- [x] Hỗ trợ chế độ nhảy lượt `?tu=d3-t3` để demo 4 phút cho buổi thuyết trình
- [x] Hỗ trợ chơi offline hoàn toàn qua `pnpm preview` không cần mạng

