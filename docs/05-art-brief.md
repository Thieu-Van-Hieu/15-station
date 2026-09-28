# Định hướng mỹ thuật và âm thanh (Art Brief)

> Trạng thái: CHỐT — Cập nhật cho giai đoạn P3 & P7

Tài liệu này quy định toàn bộ tiêu chuẩn mỹ thuật thị giác, thiết kế giấy tờ, quy tắc bản quyền hình ảnh và hiệu ứng âm thanh trong game **"Trạm 15"**.

---

## 1. Nguyên tắc cốt lõi về bản quyền và hình ảnh

1. **Tuyệt đối KHÔNG sử dụng ảnh tư liệu người thật để gán ghép làm chân dung nhân vật:**
   - Theo Điều 32 Bộ luật Dân sự 2015, việc sử dụng hình ảnh của cá nhân phải được người đó đồng ý. Gán gương mặt một người có thật trong lịch sử cho các nhân vật hư cấu (như ông Quỳnh, gã buôn lậu, kẻ hối lộ...) là vi phạm quyền nhân thân và tiềm ẩn rủi ro pháp lý/đạo đức nghiêm trọng.
   - Phong cách chân dung được chuẩn hoá: **Tranh vẽ tay nét đơn sắc (monochrome sketch)**, **Pixel art phong cách hoài niệm**, hoặc **Hình bóng nhân vật đổ bóng sau ô cửa kính mờ (silhouette behind frosted glass)**.
2. **Ảnh tư liệu chỉ dùng làm cảnh nền phong cảnh (background):**
   - Chỉ sử dụng ảnh tư liệu lịch sử cho các khung cảnh rộng không nhận diện được danh tính cá nhân (con đường làng, cánh đồng lúa, dãy phố thị xã cũ, nhà trạm ba gian).
   - Mọi ảnh cảnh nền tư liệu phải có nguồn gốc rõ ràng thuộc phạm vi công cộng (Public Domain) hoặc tư liệu lịch sử giáo dục phi thương mại, ghi rõ nguồn trong `docs/04-sources.md`.
3. **Chạy hoàn toàn Offline (Không phụ thuộc mạng Internet):**
   - Toàn bộ font chữ, hình ảnh, file âm thanh phải được lưu cục bộ trong thư mục `public/`. Không gọi CDN bên ngoài hay Google Fonts khi game vận hành.

---

## 2. Bảng màu chủ đạo (Color Palette)

Lấy cảm hứng từ không khí xã hội Việt Nam thời kỳ 1979–1987: mộc mạc, trầm lắng, cũ kỹ và đậm chất hành chính thời bao cấp.

| Tên màu | Mã màu gợi ý | Ứng dụng |
|---|---|---|
| **Xi măng** (`bg-xi-mang`) | `#D3D5D2` / `#C8CCC9` | Màu nền phòng làm việc, tường vôi ố mốc |
| **Gỗ lim mòn** (`bg-ban-go`) | `#4A3525` / `#3B281B` | Màu mặt bàn gỗ kiểm soát viên, bậu cửa sổ |
| **Giấy ố vàng** (`bg-giay`) | `#F4EBD9` / `#E8D8BA` | Màu giấy đi đường, sổ hộ khẩu, đơn thuốc |
| **Mực tài liệu** (`text-muc`) | `#242220` / `#1F1E1D` | Màu chữ in máy chữ trên giấy tờ, văn bản |
| **Dấu đỏ** (`dau-do`) | `#B91C1C` / `#991B1B` | Dấu mộc cơ quan, dấu chấp thuận "CHO QUA" |
| **Dấu đen** (`dau-den`) | `#18181B` / `#09090B` | Dấu kiểm soát, dấu từ chối "GIỮ LẠI" |
| **Cỏ úa** (`ao-can-bo`) | `#4B5320` / `#555D30` | Màu áo đồng phục cán bộ kiểm soát viên |

---

## 3. Kiểu chữ (Typography)

- **Font máy chữ (Typewriter Font):** Dùng font monospace kiểu máy cơ khí cổ điển (như *Special Elite*, *Cutive Mono* hoặc font nội bộ tự host `.woff2`). Toàn bộ nội dung biểu mẫu trên các giấy tờ (GDD, SHK, DT, GPVC, GXNK) sử dụng font này.
- **Font văn bản giao diện:** Font sans-serif cổ điển, rõ ràng, dễ đọc trên màn hình máy tính và máy chiếu lớp học (hỗ trợ đầy đủ tiếng Việt Unicode dựng sẵn NFC).

---

## 4. Đặc tả giấy tờ và con dấu

### 4.1. Tám loại giấy tờ (`DocumentPaper`)
1. **Giấy đi đường (GDD):** Giấy mỏng màu vàng ngà, viền đơn, có quốc hiệu và tiêu ngữ, dấu tròn đỏ của UBND xã ở góc dưới bên trái chữ ký.
2. **Sổ hộ khẩu (SHK):** Bìa giấy cứng màu xanh rêu hoặc nâu sẫm, bên trong chia ô kẻ bảng liệt kê chủ hộ và thành viên.
3. **Tem phiếu (TP):** Các ô tem rời kích thước nhỏ, có in tháng, tên mặt hàng (Gạo, Thịt, Vải) và con dấu phòng lương thực.
4. **Hoá đơn hợp tác xã (HDHTX):** Giấy in rônêô màu xám đục, nét chữ mờ, dấu vuông hoặc dấu tròn của Ban quản trị HTX.
5. **Giấy phép vận chuyển (GPVC):** Văn bản khổ dài của Công ty Thương nghiệp, có số công văn, biển số xe và tuyến đường vận chuyển.
6. **Đơn thuốc (DT):** Giấy nhỏ màu trắng ngà của Bệnh viện đa khoa huyện/tỉnh, chữ viết tay bác sĩ kê tên thuốc và số lượng, dấu tròn đỏ bệnh viện.
7. **Chứng nhận thương binh (CNTB):** Bìa gập màu đỏ sẫm in sao vàng hoặc huy hiệu thương binh, dấu cơ quan Thương binh - Xã hội.
8. **Giấy xác nhận sản phẩm khoán (GXNK):** Giấy biên nhận viết tay theo mẫu Chỉ thị 100, do Đội trưởng đội sản xuất ký và Chủ nhiệm HTX đóng dấu xác nhận.

### 4.2. Con dấu
- Dấu hợp lệ: Nét mực đỏ tươi hoặc đỏ gạch, rõ nét từng con chữ và tên cơ quan.
- Dấu lỗi cài cắm: Dấu lem mực, dấu mờ đứt đoạn (`legible: false`), dấu sai cấp cơ quan (`UBND_HUYEN` đóng trên giấy đi đường xã), hoặc dấu bị lệch địa danh.

---

## 4a. Chân dung theo nhánh đời (V3)

Chân dung vẽ bằng `scripts/generate-portraits.ts` (`pnpm art`), phác thảo mực nâu đơn sắc. Ngoài bộ thường của mỗi nhân vật, có thêm các bộ theo nhánh:

| Mã ảnh | Biểu cảm | Dùng khi |
|---|---|---|
| `ba-tu-khong-non` | `buon` | Bà Tư đã bị giữ từ hai lần: không nón, tóc bạc búi vội, má hóp |
| `anh-hung-gay` | `met-moi` | Anh Hùng đã bị giữ từ hai lần: gầy rộc, râu không cạo, tóc bù |
| `thang-ti-lon` | `vui`, `ne-tranh` | Thằng Tí năm 1987, mười tám tuổi, áo sơ mi, ba lô |
| `np-hang-xom` | `binh-thuong`, `lo-lang` | Bác Nga hàng xóm, d5-t4 |

Muốn thêm nhánh thì khai `portrait.variants` trong lượt khách và thêm mô tả vẽ vào `SPECS` của script.

## 4b. Con dấu cầm tay và vệt mực (V5)

Con dấu là vật thể, không phải nút. Tất cả vẽ bằng CSS và SVG trong `src/components/stamping.tsx`, không dùng file ảnh.

**Con dấu trên khay** (nhìn nghiêng, nhỏ, bên trái nhãn nút): núm gỗ tròn `#6b4a2e`, cổ `#5a3d25`, đế `#4a3525`, dải mực ở mặt đế theo màu dấu.

**Con dấu đang cầm** (khi kéo): to hơn, nghiêng −8°, bóng đổ xuống dưới phải. Núm gỗ vân gradient `#5a3d25 → #8a6040 → #5a3d25`, đế rộng 112 px, dải mực 104 px. Điểm thả là mép dưới con dấu, không phải tâm, để người chơi thấy mình "ấn" xuống đâu.

**Vệt mực**, hai mẫu:

| Dấu | Màu | Chữ |
|---|---|---|
| CHO QUA | Đỏ son `#b3261e` | CHO QUA (chuỗi `desk.stamp.approve`) |
| GIỮ LẠI | Đen mực `#1c1712` | GIỮ LẠI (`desk.stamp.reject`) |

Khung chữ nhật 148 × 70, viền đôi (ngoài 4 px, trong 1,6 px), chữ Space Mono đậm, dòng nhỏ "TRẠM 15" bên dưới. Hạt mực loang bằng bộ lọc `feTurbulence` để vệt không đều như dấu cao su thật. Mỗi lần đóng: nghiêng ngẫu nhiên trong ±9°, độ đậm 0,72–0,95, hoà trộn `multiply` để chữ trên giấy vẫn đọc được qua vệt mực. Vệt mực bị kẹp trong 18–82% chiều ngang và 12–88% chiều dọc của tờ giấy để không tràn ra ngoài.

**Phiếu kiểm soát**: tờ giấy nhỏ viền đứt nét, nghiêng 1,5°, luôn nằm trên bàn làm chỗ đóng dấu cho người không mang giấy nào.

## 4c. Hàng người chờ ngoài cửa sổ (V6)

Dải cao 48 px ngay dưới ô cửa (`src/components/QueueStrip.tsx`). Bóng người là SVG một màu, không có mặt, cao 26–31 px, mờ dần về cuối hàng. Tối đa 8 bóng.

Ba dáng xoay vòng:

1. Gánh hàng: đòn gánh ngang vai, hai thúng hai đầu.
2. Đội nón lá.
3. Dắt xe đạp.

Hai mức ánh sáng, chuyển trong 1,5 s:

| Lúc | Nền trời | Bóng người |
|---|---|---|
| Ban ngày (trước giờ hết ca 90 phút) | Vàng đất `#d9c9a6 → #b89f76` | Nâu sẫm `#2a2119` |
| Chạng vạng | Nâu `#8f7a60 → #5e4c3a` | Nâu sẫm |
| Quá giờ hết ca | Xanh đêm `#1d2230 → #2c2a2a` | Đen `#0c0a09`, co lại 12% chiều cao và run nhẹ vì rét |

Khi người chơi kèm biên bản, cả hàng nhúc nhích một lần (hoạt ảnh `nhuc-nhich`), cùng lúc đồng hồ trên thanh trên nhảy 60 phút.

## 4d. Thẻ kết quả (V7)

Ảnh vuông **1200 × 1200** vẽ bằng canvas (`src/components/ResultCard.tsx`), tải về dạng PNG tên `tram15-<mã kết cục>.png`. Chọn vuông vì dễ đăng mạng xã hội. Trên máy tính vẫn đọc được vì chữ to.

Nền giấy cũ: màu `#efe6cf`, vệt ố nâu loang từ mép vào (gradient tròn), 9000 hạt bụi cố định (cùng một hạt giống, nên ai tải thẻ cũng có cùng nền). Khung viền đôi cách mép 44 px.

Bố cục từ trên xuống, lề trái phải 100 px:

1. **Đầu thẻ**: "TRẠM 15" chữ có dấu to giãn cách, bên phải "Hồ sơ kết thúc ca trực · 1979 – 1987", hai vạch kẻ ngang.
2. **Kết cục**: nhãn đỏ "KẾT CỤC", tên kết cục chữ serif đậm 70 px viết hoa, rồi `card_line` in nghiêng màu nâu xám.
3. **Ba con số** trong ba ô: chấp hành theo báo cáo, chấp hành thực tế, số biên bản kiến nghị. **Ô "thực tế" viền đỏ, chữ đỏ, và giữa hai ô có dấu ≠ đỏ khi hai tỷ lệ lệch nhau.** Hai tỷ lệ đặt cạnh nhau là chi tiết đắt nhất của thẻ: người xem chưa chơi cũng thấy có gì không khớp.
4. **Dòng đối chất** (chỉ khi người chơi đã đối chất): "Chỉ ra chỗ lệch ở số lượt: N · hành động theo: M".
5. **Một dòng nhân vật**: số phận đầu tiên hiện được của kết cục (đã xét cờ), tối đa ba dòng, ký tên nhân vật.
6. **Câu trích giáo trình** có gạch đứng đỏ bên trái, ghi chương và mục.
7. **Con dấu ĐÃ DUYỆT** đỏ, tròn, nghiêng, góc dưới phải.
8. **Chân thẻ**: tên người chơi nếu có ("Tổ trưởng trực ca: …"), rồi "Trạm 15 · Nhóm Trạm 15 · Môn Chủ nghĩa xã hội khoa học".

Tên người chơi **tuỳ chọn** và hỏi ngay ở màn kết, cạnh nút tải, không hỏi ở đầu game. Như vậy không thêm bước nào trước khi vào chơi. Vệt mực của từng lượt không in lên thẻ.

## 5. Hiệu ứng âm thanh (Audio / SFX)

> Danh sách file âm thanh hiện hành, tên file và mô tả nằm ở `docs/09-am-thanh.md`. Mục dưới đây là định hướng ban đầu.


Bốn âm thanh chủ đạo xây dựng không khí trải nghiệm, chỉ kích hoạt sau tương tác đầu tiên của người dùng:
1. `sfx_window_slide.mp3`: Tiếng ô cửa kính trượt lách cách khi khách tiến lại ô cửa trạm.
2. `sfx_paper_rustle.mp3`: Tiếng sột soạt nhẹ khi cầm, lật hoặc kéo giấy tờ trên mặt bàn gỗ.
3. `sfx_stamp_down.mp3`: Tiếng "Cộp!" đanh gọn và vang của con dấu gỗ đập xuống mặt giấy.
4. `sfx_radio_tune.mp3`: Tiếng rè rè của đài radio bán dẫn chuyển kênh trước khi phát bản tin chính sách.
