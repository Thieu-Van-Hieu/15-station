# Kịch bản trình bày

> Trạng thái: SẴN SÀNG — cập nhật 29/9/2026 theo bản game đã hoàn thiện (27 lượt, 5 kết cục, đóng dấu kéo thả, đối chất, thẻ kết quả, chế độ Host và bỏ phiếu lớp học qua điện thoại).

Tài liệu cho nhóm khi lên lớp: chuẩn bị gì, mở màn nào, nói gì, trả lời câu hỏi thế nào. Thời lượng chính **10 phút**, cộng **5 phút hỏi đáp**.

## Mục lục

1. [Chuẩn bị trước buổi](#1-chuẩn-bị-trước-buổi)
2. [Cách mở nhanh từng đoạn (preview)](#2-cách-mở-nhanh-từng-đoạn-preview)
3. [Cách chơi — bản tóm tắt để nói và để phát](#3-cách-chơi--bản-tóm-tắt-để-nói-và-để-phát)
4. [Kịch bản 10 phút](#4-kịch-bản-10-phút)
5. [Bảng ánh xạ kiến thức để chiếu khi chốt](#5-bảng-ánh-xạ-kiến-thức-để-chiếu-khi-chốt)
6. [Câu hỏi có thể gặp](#6-câu-hỏi-có-thể-gặp)
7. [Khi có sự cố](#7-khi-có-sự-cố)
8. [Sau buổi trình bày](#8-sau-buổi-trình-bày)

---

## 1. Chuẩn bị trước buổi

### Phân vai trên lớp

| Vai | Việc |
|---|---|
| **Người dẫn** | Nói theo kịch bản mục 4, giữ đồng hồ, điều phối phần biểu quyết trên điện thoại của lớp |
| **Người cầm máy** | Mở đúng tab (game và màn Host `/host`), mở/chốt bình chọn theo hiệu của người dẫn, sẵn sàng đường lui nhập tay |
| **Người đỡ câu hỏi** | Đọc trước mục 6, trả lời phần hỏi đáp, giữ `04-sources.md` mở sẵn để tra nguồn |

### Máy và âm thanh

- Chơi trên **máy tính**, trình duyệt Chrome hoặc Edge bản mới. Máy chiếu để độ phân giải 1280×720 trở lên (dưới 1024 px ngang game chuyển sang bố cục điện thoại).
- **Bật loa.** Tiếng dấu, tiếng giấy, chuông gọi khách, tiếng đài là một nửa cảm giác của game. Thử âm lượng trước giờ vào lớp. Nút loa ở góc phải trên cùng để tắt/bật nhanh.
- Trình duyệt chỉ cho phát âm sau cú bấm đầu tiên, nên mở game xong **bấm một lần vào trang** trước khi lên trình bày.
- **Nhắc nhở lớp:** Chuẩn bị sẵn điện thoại thông minh có kết nối mạng (wifi trường hoặc 4G) để quét mã QR tham gia biểu quyết trực tiếp.

### Mở sẵn năm tab

Link game: **https://15-station.vercel.app/** (chạy offline/LAN thì thay bằng `http://localhost:5173` hoặc IP máy, xem bên dưới).

| Tab | Địa chỉ | Dùng lúc |
|---|---|---|
| 1 | `https://15-station.vercel.app/` | Mở đầu: màn chú thích hư cấu và tiêu đề |
| 2 | `https://15-station.vercel.app/host?room=T15` | **Màn hình Host máy chiếu**: hiện mã QR cỡ lớn cho cả lớp quét, biểu đồ kết quả chạy realtime |
| 3 | `https://15-station.vercel.app/?host=1&room=T15&tu=d3-t3` | Lượt bà Tư mang 18 kg gạo khoán — **điểm dừng trình bày chính (tích hợp bỏ phiếu lớp học)** |
| 4 | `https://15-station.vercel.app/?tu=d4-t2` | Lượt anh Hùng — đối chất năm sinh lệch |
| 5 | `https://15-station.vercel.app/` rồi gõ `Mr.NoBody` → *Người làm ngơ* | Màn kết cục và thẻ kết quả |

Mỗi tab mở bằng `?tu=` bắt đầu **một ván mới** chơi sẵn theo sổ tới đúng lượt đó, không phụ thuộc ván đang lưu.

### Chạy offline (phòng mạng yếu)

```bash
pnpm install
pnpm build
pnpm preview      # mở http://localhost:4173
```

Bản `preview` không cần mạng: font, âm thanh, chân dung đều nằm trong máy.

### Chuẩn bị dự phòng

- Tải sẵn một **thẻ kết quả** (PNG) của kết cục Người làm ngơ và một của Người kiến nghị, để chiếu nếu máy trục trặc.
- Quay sẵn một video 1 phút: màn 1987 (thẻ chuyển cảnh, thằng Tí năm 18 tuổi, màn kết cục).

---

## 2. Cách mở nhanh từng đoạn (preview)

### Nhảy thẳng tới một lượt: `?tu=dX-tY`

Thêm `?tu=` vào cuối địa chỉ rồi nhấn Enter (trang phải tải lại thì mới nhảy). Game tự chơi theo sổ các lượt trước rồi dừng ở lượt đó. Ví dụ: https://15-station.vercel.app/?tu=d3-t3

- Viết `d<ngày>-t<lượt>`, ví dụ `d3-t3`. Viết hoa, thiếu gạch nối (`d3t3`) hay chỉ ghi số (`3-3`) đều được.
- `?tu=d3` (chỉ có ngày) mở **màn đầu ngày 3**, có thẻ chuyển cảnh và lời giao ban.
- Gõ sai (ví dụ `d3-t`, `d3-t9`) thì game hiện dòng báo đỏ ở trên cùng và mở ván đang lưu.

| Địa chỉ | Lượt | Đáng chiếu vì |
|---|---|---|
| `?tu=d1-t1` | Cô sinh viên, lượt đầu tiên | Dạy thao tác đóng dấu |
| `?tu=d3-t1` | Thằng Tí mang 20 viên quinin cho bố sốt rét, đơn chỉ kê 10 | Người chơi biết trước cái giá của việc giữ lại |
| `?tu=d3-t3` | Bà Tư mang 18 kg gạo, có giấy khoán; **trạm trưởng đứng sau lưng** | Luận điểm chính: sổ chậm hơn chủ trương (Chỉ thị 100) |
| `?tu=d3-t4` | Người buôn vải, dấu sai cơ quan, **có phong bì** | Buôn lậu thật và phong bì đầu tiên |
| `?tu=d4-t2` | Anh Hùng, giấy thương binh ghi năm sinh lệch hộ khẩu | Đối chất: "Năm 76 tôi đã lên huyện xin sửa…" |
| `?tu=d5-t2` | Ông Quỳnh chở 200 kg đường, giấy tờ hoàn hảo | "Hợp lệ mà hại": cho qua là đúng sổ |
| `?tu=d5-t4` | Bác Nga hàng xóm mang thuốc huyết áp cho mẹ Thành | Trạm và gia đình chạm nhau: giữ lại thì tối đó Thành mua chợ đen |
| `?tu=d5-t5` | Gã đầu cơ 300 kg gạo, phong bì 120 đồng bằng tiền thuốc bé Bình | Cám dỗ nặng nhất |
| `?tu=d6-t3` | Thằng Tí năm 1987 | Theo sổ thì năm 1981 thuốc của bố nó bị giữ, nên nó nhận ra Thành và không nói gì |

Lưu ý: vì đi theo sổ, các nhân vật ở `?tu=` luôn mang nhánh đời "bị giữ" (bà Tư không chào, thằng Tí im lặng). Muốn nhánh vui hơn thì phải chơi tay từ đầu.

### Chế độ Host và Bỏ phiếu lớp học: `?host=1`, `/host` và `/vote`

Tính năng phục vụ biểu quyết tập thể thời gian thực tại lớp học bằng điện thoại di động:

- **Bật Host trên bàn game:** Thêm `?host=1` hoặc `?room=<mã>` vào URL (ví dụ: `https://15-station.vercel.app/?host=1&room=T15&tu=d3-t3`). Ngoài ra có thể bấm nút **Host: BẬT / TẮT** trực tiếp trên thanh TopBar bất kỳ lúc nào.
- **Màn hình máy chiếu (`/host?room=T15`):** Dành cho màn hình lớn giảng đường. Tự sinh mã QR cỡ lớn để sinh viên quét, hiện biểu đồ kết quả chạy realtime, nút Mở/Chốt vòng và **Đường lui nhập tay khẩn cấp (<10s)**.
- **Trang bỏ phiếu điện thoại (`/vote?room=T15`):** Sinh viên quét QR để vào phòng trên điện thoại, bỏ phiếu ẩn danh với 2 nút to: **CHO QUA** hoặc **GIỮ LẠI**, cho phép đổi ý trước khi chốt.
- **Tự động đóng dấu theo đa số:** Khi chốt vòng, game tự động đối chiếu số phiếu và đóng dấu theo kết quả đa số của cả lớp.

### Cheat code `Mr.NoBody`

Gõ `Mr.NoBody` ở bất kỳ màn nào (không cần ô nhập, không phân biệt hoa thường). Bảng xem trước hiện ra:

- **5 kết cục**, mỗi kết cục được một bot chơi thật từ đầu nên số liệu trên màn kết là thật.
- **Nhảy tới đầu ngày 1 đến 6.**

Số liệu từng kết cục khi mở bằng cheat (để người dẫn biết trước sẽ thấy gì):

| Kết cục | Bot chơi thế nào | Chấp hành theo báo cáo | Thực tế | Biên bản |
|---|---|---|---|---|
| Người ăn tiền | Nhận mọi phong bì | 93% | 93% | 0 |
| **Người làm ngơ** | Làm ngơ mọi lượt có vi phạm | **80%** | **44%** | 0 |
| Người kiến nghị | Theo sổ, lập biên bản mọi dịp | 100% | 100% | 8 |
| Người gác cổng mẫu mực | Theo sổ tuyệt đối | 100% | 100% | 0 |
| Người sống sót | Theo sổ, không chi đồng nào cho gia đình | 100% | 100% | 0 (hộp thiếc còn 1930 đồng) |

Chiếu **Người làm ngơ** khi nói về thẻ kết quả: hai tỷ lệ 80% và 44% đặt cạnh nhau là chi tiết đắt nhất.

### Phím tắt

| Phím | Việc |
|---|---|
| `1` / `2` | Đóng dấu CHO QUA / GIỮ LẠI (không cần kéo) |
| `Enter` | Lượt kế tiếp; ở các màn chuyển là đi tiếp |
| `S` | Ẩn/hiện sổ chỉ thị |
| `H` | Mở sổ tay hướng dẫn trong game (7 trang) |
| `Esc` | Huỷ lần kéo dấu, đóng hộp thoại |

---

## 3. Cách chơi — bản tóm tắt để nói và để phát

> Có thể in mục này thành một tờ A5 phát cho lớp. Trong game, nút **Sổ tay hướng dẫn** (phím `H`) có đủ 7 trang chi tiết.

**Bạn là Nguyễn Văn Thành, tổ trưởng Trạm kiểm soát liên huyện số 15, 1979–1987.** Mỗi ngày có 3 đến 6 người qua trạm. Với từng người:

1. **Đọc sổ chỉ thị** (cột phải). Sổ đổi theo ngày: điều mới thêm vào, điều cũ bị sửa hoặc bỏ. Dòng *Áp dụng cho* nói điều đó quản mặt hàng nào.
2. **Soi giấy tờ và hàng mang theo.** Dưới mỗi dòng hàng có nhãn điều đang áp dụng; bấm nhãn để mở đúng điều đó trong sổ.
3. **Quyết định bằng con dấu**: nhấn giữ con dấu ở hàng dưới cùng, kéo xuống mặt giấy, thả ra. Vệt mực in đúng chỗ thả.
   - **CHO QUA** (mực đỏ) — đúng sổ.
   - **GIỮ LẠI** (mực đen) — có vi phạm.
   - **LÀM NGƠ** — cho qua mà không ghi sổ. Cấp trên không biết, trừ lượt trạm trưởng đứng sau lưng.
4. **Lập biên bản kiến nghị** (từ ngày 3): khi thấy một điều trong sổ trái với đời sống, kèm biên bản vào quyết định. Tốn 60 phút ca. Đủ biên bản hợp lệ về cùng một vấn đề thì huyện có thể sửa sổ, nhưng không sửa ngay.
5. **Bút chì đối chất** (tuỳ chọn): khoanh hai chỗ lệch nhau (tên với tên, năm sinh với năm sinh, hàng mang với hàng khai) rồi bấm *Đối chiếu*. Người trước ô cửa sẽ trả lời bạn. Khoanh nhầm mất 15 phút.
6. **Phong bì**: đôi khi có người đẩy phong bì qua ô cửa. Nhận hay không là việc của bạn.

**Cuối ngày** có hai bảng đặt cạnh nhau: *Báo cáo gửi cấp trên* (tỷ lệ chấp hành, xếp loại) và *Tình hình huyện* (lương thực vào thị xã, hộ thiếu ăn, giá gạo). **Ban đêm** bạn chia lương cho gia đình: gạo, chất đốt, thuốc cho mẹ, học phí của Mai. Bỏ lỡ khoản thiết yếu thì hôm sau làm chậm, và nhà cửa sa sút dần.

**Sau 6 ngày** (1979 → 1987) game chọn một trong 5 kết cục theo cách bạn đã làm, và in một **thẻ kết quả** để tải về.

---

## 4. Kịch bản 10 phút

Lời trong ngoặc kép là gợi ý cho người dẫn, không cần đọc nguyên văn.

### 0:00 – 1:00 · Đặt vấn đề (tab 1)

- Chiếu màn mở đầu, dừng ở khung **Thông báo về tính mô phỏng và hư cấu**.
- "Nhóm em làm một game mô phỏng, lấy cảm hứng từ *Papers, Please*. Người chơi là tổ trưởng một trạm kiểm soát liên huyện giai đoạn 1979–1987, thời ngăn sông cấm chợ. Nhân vật, địa danh, số liệu là hư cấu. Các chủ trương, văn kiện là có thật và có ghi nguồn."
- Câu hỏi mở cho lớp: "Nếu cuốn sổ quy định đi sau đời sống, người cầm con dấu nên làm gì?"

### 1:00 – 2:00 · Dạy thao tác trong 60 giây (tab 1, bấm *Bắt đầu ca trực*)

- Qua màn đài VEF-206 ngày 1 (tiếng đài, lời giao ban của trạm trưởng Đối).
- Lượt cô sinh viên: chỉ nhanh ba khu — ô cửa bên trái, giấy tờ ở giữa, sổ chỉ thị bên phải.
- **Kéo con dấu CHO QUA xuống giấy đi đường.** Để lớp nghe tiếng dấu và thấy vệt mực. Bấm *Lượt kế tiếp*.

### 2:00 – 5:00 · Lượt bà Tư — lớp biểu quyết bằng điện thoại (tab 2 và tab 3)

- "Năm 1981. Tháng 1, Ban Bí thư ra Chỉ thị 100 về khoán sản phẩm. Đây là bà Tư Lành, đã qua trạm này hai năm trước."
- **Chuyển sang Tab 2 (`/host?room=T15`) hoặc mở trực tiếp trên bàn game (`/?host=1&room=T15&tu=d3-t3`):**
  - Chiếu mã QR cỡ lớn trên màn máy chiếu.
  - "Mời cả lớp lấy điện thoại quét mã QR trên màn hình (hoặc truy cập `.../vote?room=T15`) để tham gia biểu quyết trực tiếp."
- Quay lại bàn game (Tab 3), chỉ lần lượt giấy tờ và hàng: 18 kg gạo trên dòng hàng, nhãn **Điều 2** (bấm để sổ mở đúng Điều 2: tối đa 5 kg lương thực); **giấy xác nhận sản phẩm khoán 13 kg**; và dải đỏ *Trạm trưởng đứng sau lưng* — lượt này làm ngơ cũng bị ghi sổ.
- "5 kg định mức cộng 13 kg khoán vừa đúng 18 kg. Nhưng sổ chưa có điều nào công nhận giấy khoán."
- **Bắt đầu bỏ phiếu:**
  - Bấm **"Mở bỏ phiếu"** (hoặc vòng tự mở khi vào lượt).
  - Trên điện thoại của sinh viên hiện câu hỏi và 2 nút lựa chọn: **CHO QUA** hoặc **GIỮ LẠI**.
  - Màn hình máy chiếu `/host` chạy thanh tiến trình và nhảy số realtime theo từng lượt vote của cả lớp.
- **Chốt kết quả:**
  - Người dẫn hô chốt, người cầm máy bấm **"Chốt kết quả"** (có thể bấm ngay tại bàn game hoặc tab `/host`).
  - **Trò chơi tự động đóng dấu theo quyết định đa số của cả lớp:**
    - Nếu đa số chọn **CHO QUA**: Game tự động hạ dấu đỏ `CHO_QUA` lên phiếu kiểm soát.
    - Nếu đa số chọn **GIỮ LẠI**: Game tự động hạ dấu đen `GIU_LAI`.
    - *(Nếu hoà phiếu, người dẫn tự chọn đóng dấu).*
- **Phân tích chiều sâu:**
  - "Tại sao nhiều bạn chọn Cho qua? Vì thấy hợp lý, vì thương dân. Nhưng đứng ở góc độ người thừa hành, cuốn sổ chưa cho phép. Nếu muốn lên tiếng hợp thức hoá, người kiểm soát viên phải **kèm biên bản kiến nghị** lý do *Giấy xác nhận sản phẩm khoán của HTX chưa có trong sổ chỉ thị*."
  - Chỉ lên đồng hồ ở thanh trên: **nó nhảy 60 phút** và hàng người ngoài cửa sổ nhúc nhích — cái giá của việc lên tiếng.
  - "Đủ ba biên bản hợp lệ về chuyện khoán thì sang năm 1986 sổ mới có thêm *Điều 2 (bổ sung)*. Sửa được, nhưng chậm."
- *(Dự phòng: Nếu wifi phòng học chập chờn, lập tức dùng **Đường lui nhập tay** — đếm nhanh giơ tay, gõ số, bấm 'Dùng số nhập tay' xong trong <10s).*

### 5:00 – 6:00 · Đối chất: nhìn vào mặt người mình bắt lỗi (tab 4, `?tu=d4-t2`)

- "Từ ngày 4 có Điều 4: tên và năm sinh trên mọi giấy phải khớp sổ hộ khẩu."
- Bật **Bút chì đối chất**, khoanh *Năm sinh* trên giấy chứng nhận thương binh (1951) và trên sổ hộ khẩu (1952), bấm **Đối chiếu**.
- Để lớp đọc câu trả lời của anh Hùng: *"Năm 76 tôi đã lên huyện xin sửa. Người ta bảo hồ sơ thời chiến phải chờ tỉnh xác minh. Chờ đến giờ, chú em ạ."*
- "Theo sổ thì phải giữ. Điều 4 trong game bắt một người vô tội như anh Hùng, và chỉ một người thật sự gian — gã đầu cơ dùng giấy đi đường của em trai."
- "Đối chất không đổi đáp án. Game chỉ đếm: bạn đã **thấy** chỗ sai bao nhiêu lần, và **làm theo** điều mình thấy bao nhiêu lần."

### 6:00 – 7:30 · Cuối ngày: hai bảng và gia đình

- Đóng dấu cho xong lượt anh Hùng, bấm tiếp tới **Báo cáo tổng kết cuối ngày**.
- Chỉ hai bảng đặt cạnh nhau: bên trái tỷ lệ chấp hành và con dấu xếp loại; bên phải *Tình hình huyện*. "Chấp hành càng tốt, lương thực vào thị xã càng ít, hộ thiếu ăn càng tăng."
- Chỉ vào dòng **Yếu tố khách quan**: "Không phải cái gì cũng do trạm. Game cố ý không để người chơi đổ hết lỗi cho một nơi."
- Sang **Chi tiêu gia đình**: lương không đủ cho gạo, than, thuốc của mẹ. "Thành cũng là người trong cơ chế ấy."
- Nếu còn thời gian: kể ngắn về lượt **bác Nga hàng xóm** ngày 5 — mang thuốc huyết áp cho chính mẹ Thành, giấy tờ thiếu; giữ lại đúng sổ thì tối đó Thành phải mua thuốc chợ đen giá gấp đôi.

### 7:30 – 9:00 · Năm 1987 và kết cục (tab 5, hoặc video dự phòng)

- Gõ `Mr.NoBody`, chọn nút **D6 · 1987** (nhảy tới đầu ngày 6) để chiếu thẻ chuyển cảnh: Đại hội VI, *"Nhìn thẳng vào sự thật, đánh giá đúng sự thật, nói rõ sự thật"*; Hội nghị Trung ương 2 khoá VI xoá bỏ ngăn sông cấm chợ.
- Kể về **thằng Tí năm 1987**: nếu năm 1981 thuốc quinin của bố nó bị giữ, nó quay lại trạm, nhận ra Thành, nhìn rất lâu rồi không nói gì.
- Gõ `Mr.NoBody` lần nữa, chọn **Người làm ngơ**. Cuộn xuống **thẻ kết quả**:
  - "Chấp hành theo báo cáo **80%**. Chấp hành thực tế **44%**. Người xem ảnh chưa chơi cũng thấy có gì đó không khớp — đó là câu hỏi game muốn các bạn hỏi."
  - Bấm **Tải thẻ kết quả**, mời lớp chơi và gửi thẻ của mình cho nhóm.

### 9:00 – 10:00 · Chốt

- Chiếu mục 5 (ba dòng in đậm là đủ).
- "Cuốn sổ không sai vì có quản lý. Nó sai vì cập nhật chậm hơn đời sống. Đổi mới bắt đầu khi có người ở cơ sở dám nhìn thẳng vào sự thật và nói ra — và khi cấp trên chịu nghe."
- Kết bằng câu hỏi suy ngẫm của kết cục Người kiến nghị: *"Đổi mới bắt đầu từ đâu nếu không phải từ lòng dũng cảm nhìn thẳng vào sự thật ở chính cấp cơ sở?"*

---

## 5. Bảng ánh xạ kiến thức để chiếu khi chốt

Rút gọn từ `00-idea.md` mục 11. Nguồn đầy đủ trong `04-sources.md`.

| Cơ chế trong game | Kiến thức giáo trình Chủ nghĩa xã hội khoa học | Vị trí |
|---|---|---|
| **Sổ chỉ thị cứng, cập nhật chậm hơn đời sống** | Khủng hoảng do "giáo điều, chủ quan duy ý chí, bảo thủ" | Ch.1, mục 2.1.2 và 3.3 |
| **Gạo vượt khoán của bà Tư** | Thời kỳ quá độ "tất yếu tồn tại nền kinh tế nhiều thành phần" | Ch.3, mục 2.2 |
| Trạm chặn nông sản vào thị xã | Liên minh công – nông – trí thức: "lợi ích kinh tế thiết thân" | Ch.5, mục 3.2.1 |
| **Biên bản kiến nghị** | Đại hội VI "lấy dân làm gốc"; dân chủ gắn với kỷ luật, kỷ cương, pháp luật | Ch.4, mục 3.1.1 |
| Dòng "Yếu tố khách quan" | "Không phiến diện, cực đoan, duy ý chí" | Ch.3, mục 3.2.2 |
| Phong bì, kết cục Người ăn tiền | "Đấu tranh phòng, chống tham nhũng, lãng phí, quan liêu" | Ch.3, mục 3.2.2 |
| Màn 1987 và các kết cục | "Tôn trọng quy luật khách quan, xuất phát từ thực tiễn" | Ch.1, mục 2.3 |

Mốc lịch sử dùng trong game: Hội nghị Trung ương 6 khoá IV (8/1979), Chỉ thị 100-CT/TW (1/1981), điều chỉnh giá – lương – tiền (9/1985), Đại hội VI (12/1986), Hội nghị Trung ương 2 khoá VI (4/1987), Nghị quyết 10 (4/1988), xuất khẩu gạo (1989).

---

## 6. Câu hỏi có thể gặp

**"Game có ý nói chủ nghĩa xã hội gây ra đói nghèo không?"**
Không. Theo giáo trình (Ch.1, mục 3.3), nguyên nhân không nằm ở chủ nghĩa xã hội mà ở cách nhận thức và hành động giáo điều, duy ý chí. Chính Đảng đã tự nhìn ra và tự sửa từ Đại hội VI. Game cũng cho thấy trạm chỉ là một trong nhiều nguyên nhân (dòng *Yếu tố khách quan*).

**"Nếu em là Thành, em xử lý bà Tư thế nào?"**
Không làm ngơ. Chỉ thị 100 đã ban hành, nên xử lý và lập biên bản báo lên huyện để sổ được cập nhật. Đó là con đường tổng kết thực tiễn — và trong game đó là con đường duy nhất làm sổ thay đổi.

**"Sao giữ lại thuốc của thằng Tí lại là 'đúng'?"**
Đúng theo sổ: 20 viên quinin, đơn chỉ kê 10. Game cố ý để người chơi biết trước cái giá rồi mới bấm, vì chỗ đáng bàn không phải người chơi sai hay đúng mà là một quy định đúng về mục đích (quản lý thuốc) vẫn có thể gây hại khi áp dụng máy móc.

**"Có lượt nào giữ lại là đúng cả luật lẫn đạo lý không?"**
Có, ít nhất 5 lượt buôn lậu, đầu cơ thật: thuốc lá giấu, 40 kg gạo đầu cơ, vải sai dấu, 300 kg gạo kèm phong bì, thuốc phiện năm 1987. Game không một chiều: vấn đề không phải có quản lý, mà là bộ quy tắc cập nhật chậm hơn đời sống.

**"Đối chất để làm gì nếu không đổi đáp án?"**
Để đo khoảng cách giữa **biết** và **làm**. Màn kết hiện: *"Bạn chỉ ra chỗ lệch ở X lượt. Bạn hành động theo điều mình thấy ở Y lượt."* Người gác cổng không phải không thấy; họ thấy rồi vẫn đóng dấu.

**"Hệ thống bỏ phiếu qua điện thoại hoạt động thế nào, có sợ lộ thông tin hay sập server không?"**
Hệ thống chạy trên Vercel Serverless Functions kết hợp Upstash Redis qua REST HTTPS, không duy trì kết nối WebSocket nặng nề. Cơ chế client polling có header CDN Cache (`s-maxage=1, stale-while-revalidate=2`) giúp gộp hàng chục request từ cả lớp thành 1 request duy nhất vào server mỗi giây, tiết kiệm tối đa tài nguyên. Sinh viên chỉ nhận một mã ngẫu nhiên `voterId` lưu trong trình duyệt máy mình, hoàn toàn ẩn danh, không thu thập bất kỳ dữ liệu cá nhân nào, và màn hình điện thoại không hiển thị số phiếu đang chạy để đảm bảo tính khách quan (tránh hiệu ứng hùa theo đám đông).

**"Game minh hoạ chương nào?"**
Chương 1 (bài học đổi mới), Chương 3 (kinh tế nhiều thành phần trong thời kỳ quá độ), Chương 4 (dân chủ gắn với kỷ cương, pháp luật), Chương 5 (liên minh công – nông – trí thức). Xem mục 5.

**"Số liệu lấy ở đâu?"**
Số liệu trong game (giá gạo, số hộ thiếu ăn, tiền lương) là mô phỏng và ghi rõ *(số liệu mô phỏng)* trên màn hình. Chỉ các mốc chủ trương, văn kiện là có thật, nguồn trong `04-sources.md`.

**"Chân dung và âm thanh lấy từ đâu, có vi phạm bản quyền không?"**
Chân dung do nhóm vẽ bằng script (tranh phác thảo mực nâu, không dùng ảnh người thật). Âm thanh lấy từ nguồn giấy phép tự do (CC0 hoặc ghi công theo CC-BY), liệt kê trong `09-am-thanh.md`.

**"Chơi hết mất bao lâu?"**
Khoảng 20–30 phút cho 6 ngày, 27 lượt.

---

## 7. Khi có sự cố

| Sự cố | Cách xử lý |
|---|---|
| Không có tiếng | Bấm một lần vào trang (trình duyệt chặn âm trước cú bấm đầu). Kiểm tra nút loa góc phải trên. |
| Mất mạng / link Vercel không vào được | Chạy bản offline: `pnpm build && pnpm preview`, mở `http://localhost:4173`. |
| Game mở ra ở giữa một ván cũ | Thêm `?tu=d1-t1` vào địa chỉ, hoặc gõ `Mr.NoBody` → *Nhảy tới đầu ngày 1*. |
| Kéo dấu không ăn | Phải thả **trên mặt một tờ giấy** hoặc *Phiếu kiểm soát*. Hoặc bấm phím `1` / `2`. |
| Máy chiếu hẹp, bố cục thành một cột | Máy chiếu đang dưới 1024 px ngang. Tăng độ phân giải hoặc thu nhỏ trình duyệt (`Ctrl` + `-`). |
| Hết giờ giữa chừng | Bỏ đoạn 5:00–6:00 (đối chất) và phần bác Nga; đi thẳng tới thẻ kết quả và chốt. |
| Wifi lớp học yếu / sinh viên không vào được trang vote | Bấm ngay mục **"Đường lui nhập tay (Khẩn cấp)"** trên màn `/host` hoặc ngay tại bàn game. Người dẫn đếm nhanh giơ tay, gõ số phiếu vào 2 ô và bấm **"Dùng số nhập tay"**. Game lập tức tính đa số và tự động đóng dấu trong **dưới 10 giây**. |
| Bảng bỏ phiếu lớp học không tự hiện trên bàn game | Kiểm tra nút **"Host: BẬT / TẮT"** trên thanh TopBar, hoặc bấm dòng **"Bật bỏ phiếu lớp học cho lượt này"** xuất hiện ngay trên mặt bàn. |

---

## 8. Sau buổi trình bày

- Đếm xem có bao nhiêu bạn trong lớp gửi **thẻ kết quả** cho nhóm hoặc đăng lên mạng xã hội — đó là tiêu chí kiểm tra V7 trong `10-can-sua.md`.
- Hỏi hai bạn đã chơi hai lối khác nhau: chuyện gì đã xảy ra với bà Tư và thằng Tí (tiêu chí V3). Hỏi một bạn còn nhớ câu nào khi đối chất (tiêu chí V8).
- Ghi mọi lỗi và góp ý phát hiện trên lớp thành mục mới trong `10-can-sua.md` (mẫu ở cuối file).
