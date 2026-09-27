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

## 5. Hiệu ứng âm thanh (Audio / SFX)

Bốn âm thanh chủ đạo xây dựng không khí trải nghiệm, chỉ kích hoạt sau tương tác đầu tiên của người dùng:
1. `sfx_window_slide.mp3`: Tiếng ô cửa kính trượt lách cách khi khách tiến lại ô cửa trạm.
2. `sfx_paper_rustle.mp3`: Tiếng sột soạt nhẹ khi cầm, lật hoặc kéo giấy tờ trên mặt bàn gỗ.
3. `sfx_stamp_down.mp3`: Tiếng "Cộp!" đanh gọn và vang của con dấu gỗ đập xuống mặt giấy.
4. `sfx_radio_tune.mp3`: Tiếng rè rè của đài radio bán dẫn chuyển kênh trước khi phát bản tin chính sách.
