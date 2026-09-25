# Các phase và test

> Trạng thái: NHÁP — lập ngày 25/09/2026

Dự án chia thành 10 phase, đánh số P0–P9, trùng với giai đoạn GĐ0–GĐ9 trong `docs/07-trien-khai.md`. Mỗi phase ghi: mục tiêu, việc cần làm, đầu ra, **test** và cổng hoàn thành.

- Kiến trúc, lệnh cài đặt, cấu hình và lịch 7 ngày: xem `07-trien-khai.md`.
- Luật chơi: xem `03-rules-spec.md` (gọi tắt **03**). Mọi giá trị mong đợi trong test dưới đây đều lấy từ 03. Nếu test mâu thuẫn với 03 thì sửa test.
- Nhãn vai trò: **KB** kịch bản và nguồn, **GP** gameplay, **UI** giao diện và art, **KT** kết và test.

## Mục lục

- [Tổng quan](#tổng-quan)
- [Quy ước test](#quy-ước-test)
- [P0 — Sửa nền](#p0--sửa-nền)
- [P1 — Khung dự án](#p1--khung-dự-án)
- [P2 — Engine](#p2--engine)
- [P3 — Nội dung nền](#p3--nội-dung-nền)
- [P4 — Nội dung sáu ngày và validate tầng 2](#p4--nội-dung-sáu-ngày-và-validate-tầng-2)
- [P5 — Validate tầng 3 và bot chơi thử](#p5--validate-tầng-3-và-bot-chơi-thử)
- [P6 — Giao diện](#p6--giao-diện)
- [P7 — Art, âm thanh, màn kết](#p7--art-âm-thanh-màn-kết)
- [P8 — Chơi thử và cân độ khó](#p8--chơi-thử-và-cân-độ-khó)
- [P9 — Deploy và trình bày](#p9--deploy-và-trình-bày)

---

## Tổng quan

| Phase | Mục tiêu | Ai | Cần xong trước | Loại test chính | Cổng |
|---|---|---|---|---|---|
| P0 | Validate chạy được, luật được duyệt | GP, cả nhóm | — | Chạy lệnh | `pnpm validate` in đúng 3/8 file xanh |
| P1 | Có khung Vite + React + Tailwind | GP | P0 | Smoke | `dev`, `build`, `test` chạy; có preview Vercel |
| P2 | Engine thuần hiện thực 03 mục 2–9 | GP | P1 | Unit (~120 case) | `pnpm test` xanh |
| P3 | Nhân vật, khung 6 ngày, kiến nghị, chữ giao diện | KB, UI, KT | P0 | Validate tầng 1, soát tay | 4 file dữ liệu xanh tầng 1 |
| P4 | 26 lượt, 5 kết cục; validate tầng 2 | KB, GP | P3 | Validate, P2, P3, test đột biến | Tầng 1–2 xanh, mọi file `ĐÃ CHUYỂN JSON` |
| P5 | Validate tầng 3; bot chơi thử | GP | P2, P4 | Test đột biến, bot | Tầng 3 xanh, 4 bot ra đúng kết cục |
| P6 | Giao diện chơi trọn 6 ngày | UI, GP | P1 (dữ liệu mẫu), P2 | Component, test tay | Chơi hết game chỉ bằng chuột |
| P7 | Art, âm thanh, màn kết | UI, KT | P6 | Kiểm asset tự động, soát tay | Không thiếu asset, không ảnh người thật |
| P8 | Cân độ khó qua chơi thử | KT | P5, P7 | Playtest | ≥ 2/3 người chơi xong không phải hỏi |
| P9 | Bản Production và bản offline | GP, KT | P8 | Smoke sau deploy | Checklist trình bày đủ |

```
P0 ─┬─► P1 ─┬─► P2 ───────────────┐
    │       └─► P6 (dữ liệu mẫu) ─┼─► P7 ─► P8 ─► P9
    └─► P3 ─► P4 ─────────────────┴─► P5 ─┘
```

---

## Quy ước test

### Bốn loại test

| Loại | Kiểm cái gì | Công cụ | Đặt ở đâu | Lệnh |
|---|---|---|---|---|
| **Unit** | Từng hàm của engine | Vitest | `src/engine/**/*.test.ts` | `pnpm test` |
| **Dữ liệu** | `data/*.json` đúng schema, tham chiếu, logic | `scripts/validate-data.ts` | — | `pnpm validate` |
| **Đột biến** | Bản thân script validate có bắt được lỗi không | Vitest | `scripts/*.test.ts` | `pnpm test` |
| **Component** | Giao diện hiển thị và chặn thao tác đúng | Vitest + Testing Library + jsdom | `src/**/*.test.tsx` | `pnpm test` |

Ngoài ra còn test tay (checklist trong từng phase) và playtest (P8).

Gói cần thêm cho component test, cài ở P6:

```bash
pnpm add -D @testing-library/react @testing-library/user-event jsdom
```

### Quy tắc

1. **Mỗi test case có mã**, ví dụ `R2-03`. Ghi mã vào tên test: `it("R2-03 tem phiếu tháng trước không được cộng", …)`. Khi báo lỗi trong nhóm chỉ cần nói mã.
2. **Test engine dùng `rules.json` và `documents.json` thật**, không chép ra bản giả. Nhờ vậy ai sửa sổ chỉ thị lệch với 03 thì test đỏ ngay.
3. **Dữ liệu lượt khách trong unit test tạo bằng hàm dựng** trong `src/engine/__fixtures__/`, ví dụ `luot({ cargo: [...] })`, `gdd({ co_gia_tri_den: "1979-10-14" })`. Hàm dựng điền sẵn giá trị hợp lệ; test chỉ ghi phần khác biệt. Như vậy mỗi test chỉ đọc vài dòng.
4. **Test từng quy định thì gọi thẳng hàm check**, không đi qua `evaluate`. Nếu không, một lượt ở d5 sẽ dính cùng lúc R1, R4, R5 và test khó đọc.
5. **Sửa lỗi nào thì thêm một test tái hiện lỗi đó** trước khi sửa.
6. **Không commit khi `pnpm check` đỏ.** Từ P9, CI chặn việc này.

### Ngày dùng trong test

| Ngày | Ngày trong game | Quy định hiệu lực |
|---|---|---|
| d1 | 1979-10-15 | R1 |
| d2 | 1979-10-22 | R1, R2 |
| d3 | 1981-03-16 | R1, R2, R3 |
| d4 | 1981-03-23 | R1–R4 |
| d5 | 1986-04-14 | R1–R5, thêm R5K nếu `KN-KHOAN` đã kích hoạt |
| d6 | 1987-06-15 | R6 |

---

## P0 — Sửa nền

**Mục tiêu:** script validate chạy được, cả nhóm dùng chung một trình quản lý gói, luật được duyệt.
**Ai:** GP; cả nhóm cho việc duyệt luật. **Thời gian:** khoảng 1 giờ.

### Việc cần làm

- [ ] Thêm `"type": "module"` vào `package.json`
- [ ] Cài pnpm (`npm i -g pnpm`), ghi phiên bản vào trường `packageManager`
- [ ] Sửa README mục 1: bỏ `scaffold.sh`, đổi `npm i` thành `pnpm install`
- [ ] Cả nhóm duyệt 03 mục 12 và 07 mục 9, rồi đổi trạng thái 03 thành `CHỐT`
- [ ] Chép bảng việc vào `docs/01-todo.md`, ghi tên người

### Đầu ra

`package.json` đã sửa, README đã sửa, 03 ở trạng thái `CHỐT`, `01-todo.md` có việc.

### Test

| Mã | Làm gì | Mong đợi |
|---|---|---|
| P0-01 | `pnpm install` trên máy sạch (xoá `node_modules` trước) | Cài xong, không sửa `pnpm-lock.yaml` |
| P0-02 | `pnpm validate` | Chạy hết. `rules`, `documents`, `travelers` xanh; `characters`, `days`, `reports`, `endings`, `strings` đỏ vì chưa có nội dung. Thoát mã 1 |
| P0-03 | Chép cả thư mục `data/` (gồm `schema/`) ra một thư mục tạm, thay `travelers.json` ở đó bằng mảng chứa lượt mẫu ở 03 mục 11, chạy `pnpm validate --data <thư mục tạm>` | `travelers.json` xanh |
| P0-04 | Mọi thành viên chạy P0-01 và P0-02 trên máy mình | Cùng một kết quả |

### Cổng

P0-01 đến P0-04 đạt. 03 ở trạng thái `CHỐT`.

---

## P1 — Khung dự án

**Mục tiêu:** có khung Vite + React + TypeScript + Tailwind + Vitest; đọc được 8 file dữ liệu; có bản preview trên mạng.
**Ai:** GP. **Thời gian:** khoảng 2 giờ.

### Việc cần làm

- [ ] Cài gói, thêm `scripts` vào `package.json`, tạo `tsconfig.json`, `vite.config.ts`, `index.html` (nội dung ở 07 mục 4, GĐ1)
- [ ] `src/main.tsx`, `src/App.tsx` hiện một trang tạm
- [ ] `src/content.ts`: import 8 file `data/*.json`, gói thành `GameContent`
- [ ] Khung thư mục `src/engine/`, `src/engine/__fixtures__/`, `src/screens/`, `src/components/`, `public/`
- [ ] Một test mẫu để Vitest có việc chạy
- [ ] Kết nối repo với Vercel, có bản preview đầu tiên (07 mục 6)

### Đầu ra

`pnpm dev` mở được trang; URL preview Vercel.

### Test

| Mã | Làm gì | Mong đợi |
|---|---|---|
| P1-01 | `pnpm dev`, mở trình duyệt | Trang hiện, class Tailwind có tác dụng, console không lỗi |
| P1-02 | `pnpm build` | Ra `dist/`, không lỗi TypeScript |
| P1-03 | `pnpm preview` | Bản build chạy ở `localhost:4173` |
| P1-04 | `pnpm test` | Test mẫu xanh |
| P1-05 | Unit test `content.test.ts`: `content` có đủ 8 khoá; `rules` có 7 phần tử; `documents` có 8 phần tử | Xanh |
| P1-06 | `pnpm validate` sau khi thêm các file mới | Kết quả giống P0-02, tức không file nào bị ảnh hưởng |
| P1-07 | Mở URL preview trên Vercel | Giống P1-01 |

### Cổng

P1-01 đến P1-07 đạt.

---

## P2 — Engine

**Mục tiêu:** hiện thực toàn bộ luật ở 03 mục 2–9 dưới dạng hàm thuần trong `src/engine/`.
**Ai:** GP. **Cần xong trước:** P1.

### Việc cần làm

Làm theo thứ tự. File nào xong thì có test ngay.

- [ ] `types.ts`: kiểu dữ liệu theo schema
- [ ] `__fixtures__/`: hàm dựng lượt khách, giấy từng loại, dấu, ngày
- [ ] `compare.ts`: so chuỗi, ngày, tháng, giấy phủ hàng, dấu hợp lệ (03 mục 2.2)
- [ ] `active.ts`: quy định hiệu lực theo ngày (03 mục 4.1)
- [ ] `checks/`: R1, R2 (gồm R5K), R3, R4, R5, R6 (03 mục 4.2–4.8)
- [ ] `evaluate.ts` (03 mục 4.9)
- [ ] `conditions.ts`: điều kiện `when` (03 mục 1.10)
- [ ] `turn.ts`: chấm và cập nhật sau mỗi lượt (03 mục 5)
- [ ] `reports.ts`: biên bản, ngưỡng, kích hoạt (03 mục 6)
- [ ] `day-end.ts`: đồng hồ, xếp loại, bảng huyện (03 mục 7)
- [ ] `economy.ts` (03 mục 8)
- [ ] `endings.ts` (03 mục 9)
- [ ] `text.ts`: thay biến `{{…}}` (03 mục 1.13)
- [ ] `game.ts`: `newGame`, `reduce`

### Đầu ra

`src/engine/` đầy đủ, không import React hay DOM.

### Test

#### compare.ts

| Mã | Đầu vào | Mong đợi |
|---|---|---|
| CMP-01 | "Trần Thị Lành" so với "Trần Thị Lanh" | Khác |
| CMP-02 | "Trần Thị Lành" dạng NFC so với cùng chuỗi dạng NFD (`.normalize("NFD")`) | Bằng |
| CMP-03 | "␣␣Trần␣␣Thị Lành␣" so với "Trần Thị Lành" | Bằng |
| CMP-04 | "trần thị lành" so với "Trần Thị Lành" | Khác (giữ hoa thường) |
| CMP-05 | Hôm nay 1981-03-20, `co_gia_tri_den` 1981-03-20 | Còn hạn |
| CMP-06 | Hôm nay 1981-03-20, `co_gia_tri_den` 1981-03-19 | Hết hạn |
| CMP-07 | Tem phiếu `thang` 1981-03, hôm nay 1981-03-16 | Hợp lệ. Với `thang` 1981-02 thì không hợp lệ |
| CMP-08 | Giấy ghi gạo 18 kg; hàng thực gạo 18 kg | Phủ |
| CMP-09 | Giấy ghi gạo 18 kg; hàng thực gạo 20 kg | Không phủ |
| CMP-10 | Giấy ghi gạo 18 kg; hàng thực gạo 18 `bao` | Không phủ (khác đơn vị) |
| CMP-11 | Giấy ghi "Gạo tẻ" mã `gao`; hàng thực "Gạo" mã `gao`, cùng số lượng | Phủ (so theo mã, không theo tên) |
| CMP-12 | Dấu `null` / `legible: false` / `UBND_HUYEN` cho GDD | Cả ba không hợp lệ |
| CMP-13 | GDD `noi_di` "Phú Hoà", dấu `UBND_XA` nơi "Phú Mỹ" | Không hợp lệ (sai nơi) |
| CMP-14 | GDD `noi_di` "Phú Hoà", dấu `UBND_XA` nơi "Phú Hoà", rõ | Hợp lệ |

#### active.ts

| Mã | Đầu vào | Mong đợi |
|---|---|---|
| ACT-01 | d1 | `[R1]` |
| ACT-02 | d4 | `[R1, R2, R3, R4]` |
| ACT-03 | d5, `KN-KHOAN` chưa hiệu lực | `[R1, R2, R3, R4, R5]` |
| ACT-04 | d5, `KN-KHOAN` đã hiệu lực | Như ACT-03, thêm `R5K` |
| ACT-05 | d6 | `[R6]` |

#### R1 — Giấy đi đường (gọi thẳng hàm check, ngày d1)

| Mã | Tình huống | Mong đợi |
|---|---|---|
| R1-01 | Không có GDD, đồng thời mang thuốc lá không khai | Chỉ `(R1, E5)`. Dừng R1, không có E6 |
| R1-02 | GDD hết hạn đúng 1 ngày | `(R1, E1)` |
| R1-03 | GDD đóng dấu `UBND_HUYEN` | `(R1, E3)` |
| R1-04 | Lý do "thăm thân", không khai hàng, mang 8 cây thuốc lá | `(R1, E6)` |
| R1-05 | Chỉ mang quần áo (`DO_CA_NHAN`), không khai | Không vi phạm |
| R1-06 | Hàng `an_giau: true` không khai | `(R1, E6)` |
| R1-07 | Hai mặt hàng cùng không khai | `(R1, E6)` đúng một lần |
| R1-08 | GDD hết hạn và dấu sai cùng lúc | `(R1, E1)` và `(R1, E3)` |

#### R2 — Định mức và R5K (ngày d2, trừ khi ghi khác)

| Mã | Tình huống | Mong đợi |
|---|---|---|
| R2-01 | 5 kg gạo | Không vi phạm |
| R2-02 | 5,5 kg gạo | `(R2, E4)` |
| R2-03 | 3 kg gạo + 3 kg ngô | `(R2, E4)`, vì cộng mọi dòng lương thực |
| R2-04 | 2 `bao` gạo, không có dòng kg | Bỏ qua R2 (chỉ cộng dòng kg) |
| R2-05 | Không mang lương thực | Bỏ qua R2 |
| R2-06 | 18 kg gạo + tem phiếu tháng hiện tại, dấu `PHONG_LUONG_THUC`, gạo 13 kg | Không vi phạm (hạn mức 5 + 13 = 18) |
| R2-07 | Như R2-06 nhưng tem phiếu tháng trước | `(R2, E4)`. **Không có E1** |
| R2-08 | Như R2-06 nhưng tem phiếu ghi mặt hàng `ngo` | `(R2, E4)` (khác mã, không được cộng) |
| R2-09 | d3, 18 kg gạo + GXNK hợp lệ 13 kg, R5K chưa hiệu lực | `(R2, E4)` |
| R2-10 | d5, như R2-09 nhưng R5K đã hiệu lực | Không vi phạm R2 |
| R2-11 | Như R2-10 nhưng dấu GXNK nơi khác `xa` | `(R2, E4)` |
| R2-12 | Như R2-10 nhưng `ho_ten` trên GXNK khác GDD | `(R2, E4)` |
| R2-13 | Như R2-10 nhưng không có GDD | `(R2, E4)` |
| R2-14 | Như R2-10 nhưng `san_pham_ma` là `ngo` | `(R2, E4)` |

#### R3 — Đơn thuốc (ngày d3)

| Mã | Tình huống | Mong đợi |
|---|---|---|
| R3-01 | Mang thuốc không có trong danh mục (ví dụ `vitamin-b1`) | Bỏ qua R3 |
| R3-02 | Mang `penicillin`, không có DT | `(R3, E5)`, dừng R3 |
| R3-03 | DT hết hạn | `(R3, E1)` |
| R3-04 | DT đóng dấu `TRAM_Y_TE` | `(R3, E3)` |
| R3-05 | DT kê 10 viên, mang 20 viên | `(R3, E6)` |
| R3-06 | Thằng Tí mang DT hợp lệ, `benh_nhan` là bố | Không vi phạm (người mang không cần là bệnh nhân) |

#### R4 — Khớp hộ khẩu (ngày d4)

| Mã | Tình huống | Mong đợi |
|---|---|---|
| R4-01 | Không có SHK | `(R4, E5)`, dừng R4 |
| R4-02 | GDD "Trần Thị Lãnh", SHK "Trần Thị Lành" | `(R4, E2)` |
| R4-03 | CNTB năm sinh lệch 1 năm so với SHK | `(R4, E2)` |
| R4-04 | Cả tên lẫn năm sinh đều lệch | `(R4, E2)` đúng một lần |
| R4-05 | DT và HDHTX ghi tên người khác | Không vi phạm (hai loại này không có trường chủ giấy) |
| R4-06 | Dữ liệu như R4-02 nhưng gọi `evaluate` ở d3 | Không có E2 (lỗi ngủ) |

#### R5 — Chứng từ hàng hoá (ngày d5)

| Mã | Tình huống | Mong đợi |
|---|---|---|
| R5-01 | Chỉ mang gạo | Bỏ qua R5 (gạo là lương thực, không thuộc nhóm R5) |
| R5-02 | 200 kg đường, không có HDHTX lẫn GPVC | `(R5, E5)`, dừng R5 |
| R5-03 | 200 kg đường, chỉ có GPVC hết hạn | `(R5, E1)` và `(R5, E6)` (giấy hết hạn không được tính là phủ) |
| R5-04 | 200 kg đường, chỉ có HDHTX dấu mờ | `(R5, E3)` và `(R5, E6)` |
| R5-05 | Một HDHTX dấu mờ và một GPVC hợp lệ phủ đủ | Chỉ `(R5, E3)` |
| R5-06 | Ông Quỳnh: đủ giấy, dấu thật, 200 kg đường | Không vi phạm |

#### R6 — Hàng cấm (ngày d6)

| Mã | Tình huống | Mong đợi |
|---|---|---|
| R6-01 | Mang `thuoc-phien` | `(R6, null)` |
| R6-02 | 18 kg gạo, không có giấy nào | `CHO_QUA` qua `evaluate` (R1–R5 đã hết hiệu lực) |

#### evaluate.ts

| Mã | Tình huống | Mong đợi |
|---|---|---|
| EV-01 | Lượt mẫu `d3-t3` (03 mục 11) ở d3 | `GIU_LAI`, `[(R2-DINH-MUC, E4)]` |
| EV-02 | Lượt mẫu `d3-t3` ở d5, `KN-KHOAN` đã hiệu lực | Không có vi phạm nào của R2. Vẫn có `(R1, E1)` vì GDD hết hạn năm 1981 và `(R4, E5)` vì thiếu SHK |
| EV-03 | Lượt mẫu với ngày trên giấy đổi sang 1986 và thêm SHK khớp tên, ở d5, `KN-KHOAN` đã hiệu lực | `CHO_QUA`, không vi phạm |
| EV-04 | Lượt vi phạm nhiều quy định | Vi phạm xếp theo thứ tự quy định trong `rules.json` |
| EV-05 | Gọi hai lần trên cùng đầu vào đã `Object.freeze` sâu | Cùng kết quả, không lỗi, không sửa đầu vào |

#### conditions.ts

| Mã | Tình huống | Mong đợi |
|---|---|---|
| CON-01 | `{ flag: "ba-tu.m2", in: ["giu"] }`, cờ chưa được ghi | Sai |
| CON-02 | Như trên, cờ đang là `giu` | Đúng |
| CON-03 | `{ issue_triggered: "KN-KHOAN", value: false }`, vấn đề chưa kích hoạt | Đúng |
| CON-04 | Mảng hai điều kiện, một đúng một sai | Sai (nối bằng VÀ) |
| CON-05 | `{ stat: "bribe_total", op: ">", value: 0 }` với `bribe_total = 120` | Đúng |

#### turn.ts

| Mã | Tình huống | Mong đợi |
|---|---|---|
| TRN-01 | `CHO_QUA`, lượt có vi phạm | Sai; `recorded` +1; `reprimands` +1; có giấy nhắc nhở dùng `reprimand` của quy định vi phạm đầu tiên |
| TRN-02 | `CHO_QUA`, lượt không vi phạm | Đúng; `correct_recorded` +1 |
| TRN-03 | `GIU_LAI`, lượt có vi phạm | Đúng |
| TRN-04 | `GIU_LAI`, lượt không vi phạm | Sai (giữ oan); nhắc nhở dùng chuỗi `reprimand.giu_oan` |
| TRN-05 | `LAM_NGO`, lượt có vi phạm | `lam_ngo_violations` +1; `recorded` và `reprimands` không đổi; `correct_total` không đổi |
| TRN-06 | `LAM_NGO`, lượt không vi phạm | Đúng; `correct_total` +1; `recorded` không đổi |
| TRN-07 | `GIU_LAI` lượt có 18 kg gạo và 2 kg quần áo | `hang_tich_thu_kg` +18 (bỏ đồ cá nhân); `so_vu_giu_lai` +1 |
| TRN-08 | Nhận phong bì 120 rồi `CHO_QUA` | `bribes_accepted` +1, `bribe_total` +120, tiền phong bì hôm nay +120; cờ `qua-tien` |
| TRN-09 | Nhận phong bì rồi chọn `GIU_LAI` | Bị từ chối, state không đổi |
| TRN-10 | `LAM_NGO`, lượt không khai `outcomes.LAM_NGO` | Chỉ số huyện cộng theo `outcomes.CHO_QUA` |
| TRN-11 | Mã cờ cho từng tổ hợp | `qua`, `giu`, `lam-ngo`, `qua-kn`, `giu-kn`, `qua-tien`, `lam-ngo-tien` |
| TRN-12 | `CHO_QUA` kèm biên bản **không hợp lệ** | Cờ là `qua`, không có `-kn` |
| TRN-13 | Lượt có `flag_key: null` | Không ghi cờ nào |
| TRN-14 | Sau một lượt bất kỳ | Đồng hồ +100 phút |

#### reports.ts

| Mã | Tình huống | Mong đợi |
|---|---|---|
| REP-01 | Lập biên bản ở d1, d2 hoặc d6 | Bị từ chối |
| REP-02 | Lập biên bản kèm `LAM_NGO` | Bị từ chối |
| REP-03 | Lượt có `kn.issue = KN-KHOAN`, chọn lý do thuộc `KN-KHOAN` | Hợp lệ; `valid_reports` +1; đếm `KN-KHOAN` +1 |
| REP-04 | Như REP-03 nhưng chọn lý do thuộc `KN-THUONG-BINH` | Không hợp lệ; `invalid_reports` +1 |
| REP-05 | Lượt có `kn: null`, lập biên bản | Không hợp lệ |
| REP-06 | Biên bản không hợp lệ | Đồng hồ vẫn +60 phút |
| REP-07 | Biên bản hợp lệ `KN-KHOAN` thứ 3, ở d3 hoặc d4 | Kích hoạt; `issues_triggered` +1; R5K hiệu lực từ d5 |
| REP-08 | Biên bản hợp lệ `KN-KHOAN` thứ 3, ở d5 | Kích hoạt, hiệu lực từ d6; R5K không bao giờ hiệu lực (R5K chỉ ở d5) |
| REP-09 | Biên bản hợp lệ thứ 4 của vấn đề đã kích hoạt | `issues_triggered` không tăng thêm |
| REP-10 | `KN-THUONG-BINH` chạm ngưỡng | Điều kiện `issue_triggered` đúng; danh sách quy định hiệu lực không đổi |
| REP-11 | Danh sách lý do ở d3 | Gồm mọi lý do của mọi vấn đề có `unlock_day` ≤ d3 |

#### day-end.ts

| Mã | Tình huống | Mong đợi |
|---|---|---|
| DAY-01 | 5 lượt, 1 biên bản | Hết ca lúc 16:20, không ngoài giờ |
| DAY-02 | 5 lượt, 2 biên bản | Hết ca lúc 17:20, ngoài giờ; `overtime_days` +1 |
| DAY-03 | Ghi sổ 9/10 lượt đúng | 90% → XUẤT SẮC |
| DAY-04 | 7/10 đúng | 70% → KHÁ |
| DAY-05 | 6/10 đúng | 60% → TRUNG BÌNH |
| DAY-06 | XUẤT SẮC nhưng ngoài giờ | KHÁ |
| DAY-07 | TRUNG BÌNH và ngoài giờ | Giữ TRUNG BÌNH |
| DAY-08 | Làm ngơ mọi lượt, không ghi sổ lượt nào | Tỷ lệ 100% |
| DAY-09 | Chỉ số đầu ngày 5, tổng các thay đổi −9 | Cuối ngày 0, không âm |
| DAY-10 | Lương thực vào thị xã 100 → 86 | Hiển thị "giảm 14%" |
| DAY-11 | Lương thực vào thị xã đầu ngày là 0 | Không chia cho 0, không hiện `NaN` hay `Infinity` |
| DAY-12 | Ghi chú của từng lượt | Hiện theo thứ tự lượt, sau đó là `other_factor.text` |

#### economy.ts (số lấy từ 03 mục 8.2)

| Mã | Tình huống | Mong đợi |
|---|---|---|
| ECO-01 | d1, để dành 10, thu 20, XUẤT SẮC, 0 nhắc nhở | Có thể chi 33 |
| ECO-02 | d1, 3 lượt ghi sổ, sai 1 (67% → TRUNG BÌNH) | 10 + 20 − 2 = 28 |
| ECO-03 | Vào d5 với 95 tiền mang sang | Còn 9 (95 ÷ 10, làm tròn xuống), rồi mới cộng thu nhập |
| ECO-04 | Tiền phạt lớn hơn tiền có | Có thể chi 0, không âm |
| ECO-05 | Chọn trả các khoản có tổng lớn hơn số có thể chi | Bị từ chối |
| ECO-06 | Không trả 2 khoản thiết yếu | `hardship` +2 |
| ECO-07 | Ngày có nhận phong bì | Tiền phong bì là một dòng riêng trong bảng chi tiêu |

#### endings.ts

| Mã | Chỉ số ẩn | Mong đợi |
|---|---|---|
| END-01 | `bribes_accepted` 2, `valid_reports` 5, `issues_triggered` 1 | `END-AN-TIEN` (hành vi sai được xét trước) |
| END-02 | `lam_ngo_violations` 4 | `END-LAM-NGO` |
| END-03 | `valid_reports` 4, `issues_triggered` 1, `lam_ngo_violations` 1, `true_compliance` 0,6 | `END-KIEN-NGHI` (không đòi chấp hành cao) |
| END-04 | Như END-03 nhưng `lam_ngo_violations` 2 | `END-SONG-SOT` |
| END-05 | `true_compliance` 0,85, `valid_reports` 0, `lam_ngo_violations` 0 | `END-GAC-CONG` |
| END-06 | Như END-05 nhưng `true_compliance` 0,84 | `END-SONG-SOT` |
| END-07 | Cảnh có `when` không thoả | Cảnh đó không hiện |

#### text.ts

| Mã | Tình huống | Mong đợi |
|---|---|---|
| TXT-01 | `"Bạn đã nhận {{bribe_total}} đồng"`, `bribe_total` 120 | `"Bạn đã nhận 120 đồng"` |
| TXT-02 | `{{kn_remaining:KN-KHOAN}}`, đã có 1/3 biên bản | `2` |
| TXT-03 | `{{kn_remaining:KN-KHOAN}}`, đã có 4/3 biên bản | `0`, không âm |
| TXT-04 | Biến không tồn tại `{{abc}}` | Giữ nguyên chuỗi. Validate báo cảnh báo (P5) |

#### game.ts (tích hợp)

| Mã | Tình huống | Mong đợi |
|---|---|---|
| GAM-01 | `newGame` | Ngày d1, lượt 1; chỉ số và tiền lấy từ `indicators_start`, `savings_start` của d1 |
| GAM-02 | Nội dung mẫu nhỏ (6 ngày, mỗi ngày 1 lượt), chơi hết bằng `reduce` | Đi qua đủ các phase theo 07 mục 3.4, kết thúc ở `ENDING` |
| GAM-03 | Hành động không hợp lệ với phase hiện tại (ví dụ `QUYET_DINH` khi đang ở `BUDGET`) | Bị từ chối, state không đổi |
| GAM-04 | Chạy GAM-02 hai lần | Kết quả giống hệt (không có ngẫu nhiên trong engine) |
| GAM-05 | Kiểm mã nguồn `src/engine/` | Không có `import` từ `react`, không có `Date.now`, `Math.random`, `window`, `document` |

### Cổng

- `pnpm test` xanh với mọi test ở trên.
- EV-01 và EV-03 xanh (tương ứng cổng của bước 1 trong README và ví dụ ở 03 mục 11).

---

## P3 — Nội dung nền

**Mục tiêu:** có đủ dữ liệu nền để viết nội dung ngày: thế giới, nhân vật, khung 6 ngày, vấn đề kiến nghị, chữ giao diện, hai prompt soát.
**Ai:** KB, UI, KT. **Cần xong trước:** P0. Chạy song song với P1–P2.

### Việc cần làm

- [ ] `docs/02-bible.md`: địa danh hư cấu, giọng nói từng nhân vật, từ nên dùng và nên tránh thời 1979–1987 (KB)
- [ ] `content/characters.md` theo T3 → chuyển tay sang `data/characters.json` theo bảng "Ánh xạ sang JSON" cuối T3 (KB)
- [ ] Khối T2 (khung ngày) của `ngay-1.md` … `ngay-6.md` → `data/days.json`. Số mặc định lấy từ 03 mục 1.2 và 8.2 (KB)
- [ ] `data/reports.json`, viết thẳng bằng JSON: `KN-KHOAN`, `KN-THUONG-BINH`, ngưỡng 3, `delay: next_act`, mỗi vấn đề 1–2 lý do (KB + GP)
- [ ] `content/ui-text.md` → `data/strings.json`, đủ 13 khoá bắt buộc (UI)
- [ ] `prompts/P2-logic-review.md`, `prompts/P3-fact-check.md` (KB + KT)
- [ ] Bắt đầu `docs/04-sources.md` (KB) và `docs/05-art-brief.md` (UI)

### Đầu ra

`characters.json`, `days.json` (khung), `reports.json`, `strings.json`; P2 và P3 ở trạng thái `CHỐT`.

### Test

| Mã | Làm gì | Mong đợi |
|---|---|---|
| P3-01 | `pnpm validate` | `characters`, `days`, `reports`, `strings` xanh tầng 1 |
| P3-02 | Soát `characters.json` | Có đủ mã ở 03 mục 1.1; mỗi nhân vật `chinh` có `fixed_fields` |
| P3-03 | Soát `days.json` | Ngày trong game khớp bảng "Ngày dùng trong test"; `kn_enabled` bật đúng d3, d4, d5; d5 có `currency_reform_divisor` 10; chỉ d1 có `indicators_start` và `savings_start` |
| P3-04 | Soát `reports.json` | Mỗi lý do đọc vào là biết thuộc vấn đề nào, nhưng không có lý do nào đúng cho mọi lượt |
| P3-05 | **Cổng P1 của README bước 3:** viết lại lượt mẫu bằng T1 (có sẵn ở phần "Ví dụ đã điền" của T1), chạy P1, so với JSON ở 03 mục 11 | Hai bản giống nhau về dữ liệu. Chỉ được khác ở thứ tự khoá |
| P3-06 | Chạy thử P2 lên lượt mẫu, cố ý đổi `expected` sai | P2 chỉ ra được chỗ sai |
| P3-07 | Chạy thử P3 lên một câu trích cố ý chép sai một chữ | P3 chỉ ra được chỗ sai |
| P3-08 | Một người không viết đọc `02-bible.md` | Đọc xong viết được một lượt khách đúng giọng mà không phải hỏi |

### Cổng

P3-01 đến P3-07 đạt. `02-bible.md` ở trạng thái `CHỐT`.

---

## P4 — Nội dung sáu ngày và validate tầng 2

**Mục tiêu:** đủ 26 lượt khách, 5 kết cục; validate kiểm được tham chiếu chéo.
**Ai:** KB viết nội dung, GP làm tầng 2. **Cần xong trước:** P3.

### Việc cần làm — KB

Với từng ngày, từ d1 đến d6:

- [ ] Viết các khối T1 trong `ngay-N.md`
- [ ] Chạy P1, thay phần tử ngày trong `days.json` và mọi lượt `dN-*` trong `travelers.json`
- [ ] `pnpm validate` → P2 → P3 → sửa → đổi trạng thái thành `ĐÃ CHUYỂN JSON`

Sau đó:

- [ ] `content/endings.md` theo T4 → chuyển tay sang `endings.json`. Đủ 5 kết cục; ba kết cục "nên có" có thể viết ngắn
- [ ] Điền `04-sources.md` cho mọi câu trích đã dùng

Ràng buộc nội dung phải giữ, liệt kê ở 07 mục 4, GĐ4.

### Việc cần làm — GP

- [ ] Tách `validate-data.ts` thành các hàm trả về danh sách phát hiện (`{ muc: "loi" | "canh_bao" | "thong_tin", dieu, noi_dung }`), để test được
- [ ] Hiện thực 10 điều của tầng 2 (03 mục 10), mỗi điều một hàm
- [ ] Cờ `--strict`: cảnh báo cũng làm thoát mã 1
- [ ] Khi chưa bật `--strict`, các kiểm tra "đủ số lượng" (26 lượt, số lượt mỗi ngày) chỉ là cảnh báo

### Đầu ra

`travelers.json` đủ 26 lượt, `endings.json` đủ 5 kết cục, validate có tầng 2.

### Test — test đột biến cho tầng 2

Cách làm: đọc dữ liệu thật, sửa **đúng một chỗ** trong bộ nhớ, chạy hàm kiểm của tầng 2, kiểm tra phát hiện trả về. Đặt ở `scripts/validate-tang2.test.ts`.

| Mã | Chỗ sửa | Mong đợi |
|---|---|---|
| V2-01 | Dữ liệu thật, không sửa | Không có lỗi |
| V2-02 | Xoá một lượt mà `days` đang trỏ tới | Lỗi điều 1 |
| V2-03 | Đổi `order` của một lượt lệch vị trí trong ngày | Lỗi điều 1 |
| V2-04 | Bớt một lượt của d4 | Điều 2: cảnh báo khi thường, lỗi khi `--strict` |
| V2-05 | Đổi `speaker` thành mã không tồn tại | Lỗi điều 3 |
| V2-06 | Xoá một mục trong `appearances` của `ba-tu` | Lỗi điều 4 |
| V2-07 | Đổi `ho_ten` trên GDD của bà Tư ở một lượt không cài E2 | Lỗi điều 5 |
| V2-08 | Như V2-07 nhưng lượt đó có E2 trong `planted` | Không lỗi |
| V2-09 | Đổi tên một trường trong `documents.json` | Lỗi điều 6 |
| V2-10 | Đặt một GXNK vào lượt d2 | Lỗi điều 7 |
| V2-11 | Thêm thuốc mã `vitamin-b1` vào `cargo` | Thông tin điều 8, không phải lỗi |
| V2-12 | Dòng hàng `HANG_CAM` có mã không nằm trong danh mục R6 | Lỗi điều 9 |
| V2-13 | Dòng hàng mã `thuoc-phien` nhưng nhóm `HANG_TIEU_DUNG` | Lỗi điều 9 |
| V2-14 | Hai lượt cùng `flag_key` | Lỗi điều 10 |
| V2-15 | Điều kiện `when` dùng cờ `ba-tu.m3` trong lượt d3 | Lỗi điều 10 (cờ dùng trước khi được ghi) |

### Test — nội dung

| Mã | Làm gì | Mong đợi |
|---|---|---|
| P4-01 | `pnpm validate` sau mỗi ngày | Tầng 1 xanh, tầng 2 không có lỗi ở các lượt đã có |
| P4-02 | P2 cho từng ngày | Không còn lỗi mở |
| P4-03 | P3 cho từng ngày và cho `endings.md` | Không còn lỗi mở; mọi câu trích có trong `04-sources.md` |
| P4-04 | Một người không viết ngày đó đọc lại, soát theo ba nguyên tắc thiết kế (`00-idea.md` mục 1) | Không lượt nào biến trạm thành phe ác tuyệt đối; lượt buôn lậu thật đủ thuyết phục |
| P4-05 | `pnpm validate --strict` khi xong cả 6 ngày | Tầng 1–2 không có lỗi và không có cảnh báo |

### Cổng

V2-01 đến V2-15, P4-01 đến P4-05 đạt. Mọi file trong `content/` ở trạng thái `ĐÃ CHUYỂN JSON`.

---

## P5 — Validate tầng 3 và bot chơi thử

**Mục tiêu:** chứng minh đáp án engine tính khớp đáp án người viết, và người chơi đạt được mọi kết cục.
**Ai:** GP. **Cần xong trước:** P2 và P4.

### Việc cần làm

- [ ] Tầng 3: import `evaluate` từ `src/engine/`, hiện thực 11 điều của 03 mục 10
- [ ] Mỗi lượt d5 chạy `evaluate` hai lần: `KN-KHOAN` bật và tắt
- [ ] Bốn bot trong `scripts/bots.ts`, chạy `reduce` trọn 26 lượt (07 mục 5)
- [ ] Kiểm biến `{{…}}` trong `strings.json` và `endings.json` đều là biến có thật (TXT-04)
- [ ] In bảng tóm tắt: 26 lượt, đáp án, số lỗi ngủ, số lỗi vô tình

### Test — test đột biến cho tầng 3

| Mã | Chỗ sửa | Mong đợi |
|---|---|---|
| V3-01 | Dữ liệu thật, không sửa | Không có lỗi |
| V3-02 | Đổi `expected.verdict` của một lượt | Lỗi điều 1 |
| V3-03 | Lượt d5 có GXNK: đáp án khác nhau giữa hai trạng thái `KN-KHOAN` | Thông tin, không phải lỗi |
| V3-04 | Thêm E1 vào `planted` của một lượt mà GDD vẫn còn hạn | Lỗi điều 2 |
| V3-05 | Cài E2 ở một lượt d3 | Thông tin "lỗi ngủ" |
| V3-06 | Cho GDD của một lượt đúng ra hết hạn, không ghi vào `planted` | Cảnh báo điều 3 "lỗi vô tình" |
| V3-07 | Bỏ nhãn `buon-lau-that` khỏi một lượt, còn 4 | Lỗi điều 4 |
| V3-08 | Lượt `buon-lau-that` có đáp án `CHO_QUA` | Lỗi điều 4 |
| V3-09 | Bỏ `kn` của một lượt `KN-KHOAN` ở d3–d4, còn 2 | Lỗi điều 5 |
| V3-10 | Bỏ `kn` của một lượt Anh Hùng, còn 2 | Lỗi điều 6 |
| V3-11 | Bỏ lượt vi phạm R6 ở d6 | Lỗi điều 7 |
| V3-12 | Chỉ còn 1 lượt có phong bì | Lỗi điều 8 |
| V3-13 | Tổng dịp kiến nghị d3–d5 còn 3 | Lỗi điều 9 |
| V3-14 | Một nhân vật `chinh` còn 2 lần xuất hiện | Lỗi điều 10 |
| V3-15 | Một lượt vừa có `bribe` vừa có `kn` | Lỗi điều 11 |

### Test — bot

| Mã | Bot | Mong đợi |
|---|---|---|
| BOT-01 | Theo sổ | `END-GAC-CONG`; `true_compliance` = 1 |
| BOT-02 | Kiến nghị | `END-KIEN-NGHI`; `KN-KHOAN` kích hoạt trước d5 |
| BOT-03 | Làm ngơ | `END-LAM-NGO` |
| BOT-04 | Ăn tiền | `END-AN-TIEN` |
| BOT-05 | Cả bốn bot | Chỉ số huyện không âm; không bot nào bị kẹt ở một phase; tiền không âm |
| BOT-06 | Bot Kiến nghị ở d5 | Lượt bà Tư mang giấy khoán (nếu có ở d5) ra `CHO_QUA`, cho thấy biên bản có tác dụng |

### Cổng

`pnpm validate --strict` xanh cả ba tầng. V3-01 đến V3-15 và BOT-01 đến BOT-06 đạt.

---

## P6 — Giao diện

**Mục tiêu:** chơi trọn 6 ngày trong trình duyệt, chỉ bằng chuột.
**Ai:** UI, có GP hỗ trợ. **Cần xong trước:** P1 để bắt đầu (dùng lượt mẫu `d3-t3`); P2 để nối engine thật.

### Việc cần làm

Theo thứ tự ưu tiên ở 07 mục 4, GĐ6:

- [ ] Bố cục ba khu và thanh trên cùng
- [ ] `DocumentPaper` cho 8 loại giấy, click để đưa lên trên và phóng to
- [ ] Sổ chỉ thị theo ngày
- [ ] Hai con dấu, nút làm ngơ, nút "Biên bản", hộp chọn lý do
- [ ] Phản ứng, giấy nhắc nhở, lời chen giữa, radio
- [ ] Hai bảng cuối ngày
- [ ] Bảng chi tiêu gia đình
- [ ] Màn kết và thẻ lịch sử
- [ ] Màn chú thích mở đầu
- [ ] Chế độ nhảy lượt `?tu=dX-tY`, lưu tiến trình vào `localStorage`

### Test — component

| Mã | Tình huống | Mong đợi |
|---|---|---|
| UI-01 | Hiển thị từng loại giấy trong `documents.json` bằng dữ liệu mẫu | Cả 8 loại hiện đủ nhãn trường; GDD hiện danh sách hàng |
| UI-02 | Sổ chỉ thị ở d1, d5 (có và không có R5K), d6 | d1 chỉ Điều 1; d5 có "Điều 2 (bổ sung)" khi và chỉ khi R5K hiệu lực; d6 chỉ còn Thông báo |
| UI-03 | Nút "Biên bản" ở d1, d2, d6 | Không bấm được |
| UI-04 | Chọn làm ngơ | Nút "Biên bản" không bấm được |
| UI-05 | Nhận phong bì | Dấu "Giữ lại" và nút "Biên bản" không bấm được |
| UI-06 | Mở hộp lý do ở d3 | Hiện đủ lý do của mọi vấn đề đã mở, mỗi lý do đúng một lần |
| UI-07 | Lượt trước quyết sai | Giấy nhắc nhở hiện đầu lượt này |
| UI-08 | Lời thoại có `when` không thoả | Không hiện |
| UI-09 | Mở `?tu=d3-t3` | Vào thẳng lượt bà Tư, thanh trên ghi đúng ngày |
| UI-10 | Tải lại trang giữa ván | Tiếp tục đúng lượt đang chơi |
| UI-11 | `localStorage` chứa dữ liệu hỏng hoặc bị chặn | Bắt đầu ván mới, không lỗi |
| UI-12 | Quét `src/**/*.tsx` tìm chữ tiếng Việt có dấu nằm trong JSX | Không có. Mọi chữ lấy từ `strings.json` hoặc dữ liệu |

### Test tay

| Mã | Làm gì | Mong đợi |
|---|---|---|
| UI-M1 | Chơi trọn 6 ngày theo từng chiến lược của bốn bot ở P5 | Ra đúng kết cục như bot tương ứng |
| UI-M2 | Mở DevTools Console suốt UI-M1 | Không có lỗi hay cảnh báo React |
| UI-M3 | Chơi ở 1280×720 và 1920×1080 | Không có chữ bị cắt, không phải cuộn ngang |
| UI-M4 | Lượt bà Tư `d3-t3` | Radio nhắc Chỉ thị 100; nút "Biên bản" lần đầu bấm được |
| UI-M5 | Cuối d2 | Hai bảng đặt cạnh nhau; dòng "Yếu tố khác" và nhãn "số liệu mô phỏng" hiện rõ |

### Cổng

UI-01 đến UI-12 xanh; UI-M1 đến UI-M5 đạt.

---

## P7 — Art, âm thanh, màn kết

**Mục tiêu:** game có không khí; không vi phạm quyền hình ảnh; chạy được khi không có mạng.
**Ai:** UI, KT. **Cần xong trước:** P6.

### Việc cần làm

- [ ] Chân dung theo `05-art-brief.md`: bóng người sau kính mờ, pixel art, hoặc tranh vẽ tay đơn sắc
- [ ] Mẫu giấy tờ, cảnh nền, bảng màu, font máy chữ tự host
- [ ] Bốn hiệu ứng âm thanh, chỉ phát sau cú click đầu tiên
- [ ] Hoàn thiện màn kết cho 5 kết cục và thẻ lịch sử

### Test

| Mã | Làm gì | Mong đợi |
|---|---|---|
| ART-01 | Test tự động `assets.test.ts`: với mỗi `portrait.key` và mỗi biểu cảm được dùng trong `characters.json` và `travelers.json`, kiểm tra file có trong `public/art/portraits/` | Không thiếu file nào |
| ART-02 | Như ART-01 cho 4 file âm thanh và file font | Không thiếu file nào |
| ART-03 | Chơi hết game, xem tab Network | Không có lỗi 404; không có request ra ngoài (Google Fonts, CDN) |
| ART-04 | Rút mạng, chạy `pnpm preview`, chơi d1 | Chạy bình thường, đủ font, ảnh, âm thanh |
| ART-05 | Soát danh sách asset | Không chân dung nào dùng ảnh người thật; ảnh tư liệu làm cảnh nền đều ghi nguồn trong `05-art-brief.md` |
| ART-06 | Vào từng kết cục (dùng bot hoặc `?tu=`) | Hiện đủ cảnh, số phận nhân vật, câu trích có ghi chương, câu hỏi cuối, thẻ lịch sử |

### Cổng

ART-01 đến ART-06 đạt.

---

## P8 — Chơi thử và cân độ khó

**Mục tiêu:** người ngoài nhóm chơi được, hiểu được luận điểm, một ván dài 15–18 phút.
**Ai:** KT. **Cần xong trước:** P5, P7.

### Việc cần làm

- [ ] Nhóm tự chơi thử trước
- [ ] Mời 3 người ngoài nhóm chơi qua link preview
- [ ] Ghi phiếu quan sát cho từng người (bên dưới)
- [ ] Sửa trực tiếp trên JSON; sau mỗi lần sửa chạy `pnpm check`

### Cách chơi thử

1. Không giải thích gì ngoài màn chú thích mở đầu và màn hướng dẫn trong game.
2. Người quan sát ngồi cạnh, không nhắc, chỉ ghi.
3. Sau khi chơi, hỏi đúng ba câu:
   - Bạn nghĩ game muốn nói gì?
   - Có lúc nào bạn không biết phải làm gì không?
   - Lượt nào bạn nhớ nhất, vì sao?

### Phiếu quan sát

| Mục | Ghi |
|---|---|
| Tổng thời gian | |
| Thời gian trung bình mỗi lượt | |
| Chỗ mắc kẹt (mã lượt, mô tả) | |
| Lúc nhận ra quy luật hai bảng (ngày nào) | |
| Có lập biên bản không, ở lượt nào | |
| Có nhận phong bì không | |
| Kết cục nhận được | |
| Trả lời ba câu hỏi | |

### Test

| Mã | Tiêu chí | Mong đợi |
|---|---|---|
| PT-01 | Chơi xong mà không phải hỏi | ≥ 2/3 người |
| PT-02 | Tổng thời gian một ván | 15–18 phút |
| PT-03 | Nhận ra quy luật hai bảng | Khoảng cuối d2 hoặc d3 |
| PT-04 | Câu trả lời "game muốn nói gì" | Gần với luận điểm ở `00-idea.md` mục 1, không phải "chủ nghĩa xã hội gây ra đói nghèo" |
| PT-05 | Sau mỗi lần sửa JSON | `pnpm check` xanh |

### Cổng

PT-01 đến PT-05 đạt, không còn lỗi chặn.

---

## P9 — Deploy và trình bày

**Mục tiêu:** bản Production ổn định, có bản dự phòng offline, nhóm sẵn sàng trình bày.
**Ai:** GP, KT. **Cần xong trước:** P8.

### Việc cần làm

- [ ] Đổi Build Command trên Vercel thành `pnpm check`
- [ ] Thêm `.github/workflows/check.yml` (07 mục 6.5)
- [ ] Merge vào `main` → bản Production
- [ ] Chuẩn bị bản offline trên laptop trình bày
- [ ] Quay video dự phòng 1 phút màn 4
- [ ] Hoàn thiện `06-presentation.md`, tập trình bày và hỏi đáp

### Test

| Mã | Làm gì | Mong đợi |
|---|---|---|
| DEP-01 | Đẩy một commit làm `data/` đỏ lên một nhánh thử | CI đỏ; Vercel không tạo bản deploy |
| DEP-02 | Mở bản Production trong cửa sổ ẩn danh, chơi hết d1 | Chạy đúng, Network không có 404 |
| DEP-03 | Mở bản Production trên máy chiếu của lớp (hoặc cùng độ phân giải) | Không có chữ bị cắt, đọc được từ cuối lớp |
| DEP-04 | Tắt wifi, chạy `pnpm preview` trên laptop trình bày | Chơi được từ đầu đến kết cục |
| DEP-05 | Mở link `?tu=d3-t3` trên bản Production | Vào thẳng lượt bà Tư |
| DEP-06 | Tập trình bày có bấm giờ theo `00-idea.md` mục 12 | Xong trong 10 phút; đến lượt bà Tư trong 4 phút đầu |
| DEP-07 | Tập hỏi đáp với 4 câu ở `00-idea.md` mục 12 | Mỗi người trả lời được ít nhất một câu mà không nhìn giấy |

### Cổng

DEP-01 đến DEP-07 đạt, và checklist ở 07 mục 10 được đánh dấu đủ.
