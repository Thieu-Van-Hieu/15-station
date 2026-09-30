# Kịch bản trình bày

> Trạng thái: SẴN SÀNG — cập nhật 30/9/2026 (viết lại kịch bản 10 phút) theo bản game đã hoàn thiện (27 lượt, 5 kết cục, đóng dấu kéo thả, đối chất, thẻ kết quả, chế độ Host và bỏ phiếu lớp học qua điện thoại).

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
| 2 | `https://15-station.vercel.app/host?room=T15` | **Màn Host (tuỳ chọn)**: mở hội đồng lớp học cho bất kỳ lượt trung tâm nào mà không cần chơi tới; cũng dùng để nhập `HOST_TOKEN` lần đầu |
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
- **Hội đồng lớp học:** Tới lượt `dung-trinh-bay`, bàn game phủ màn hội đồng: mã QR cỡ lớn, số người đã vào phòng, hồ sơ dựng sẵn, đồng hồ đếm ngược, kết quả giữ kín tới lúc công bố, con dấu của lớp, bối cảnh lịch sử và câu thảo luận. Trang `/host?room=T15` dùng cùng màn này cho lượt tuỳ chọn.
- **Trang bỏ phiếu điện thoại (`/vote?room=T15`):** Sinh viên quét QR vào phòng chờ; khi mở vòng thấy hồ sơ nhân vật, lý lẽ hai phía, thanh thời gian và 2 con dấu to; sau khi chốt thấy kết quả và biết mình thuộc phe đa số hay thiểu số.
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

Kịch bản đi theo một mạch: **mở bằng một câu hỏi, để cả lớp tự trả lời bằng con dấu, rồi quay lại đúng câu hỏi đó khi chốt.** Mỗi đoạn có hai phần:

- **Làm**: việc của người cầm máy. Người cầm máy không nói, chỉ làm theo hiệu của người dẫn.
- **Nói**: lời gợi ý cho người dẫn. Nói bằng giọng của mình, nhìn lớp chứ đừng nhìn màn hình, **không đọc nguyên văn**. Chỗ ghi *(dừng)* là để im 2–3 giây cho lớp kịp nghĩ; đừng lấp chỗ im đó.

Ba nguyên tắc giữ suốt buổi:

1. **Kể chuyện trước, nói lý thuyết sau.** Lớp phải thấy bà Tư, anh Hùng, thằng Tí trước, rồi mới nghe tới giáo trình.
2. **Để game tự nói.** Tiếng dấu, câu thoại của nhân vật, con số 80% và 44% đều mạnh hơn lời giải thích. Chiếu xong thì dừng một nhịp.
3. **Mỗi đoạn chỉ gắn một ý giáo trình**, nói gọn một câu, có số chương. Bảng đầy đủ để dành cho lúc chốt.

### 0:00 – 1:00 · Mở bằng một câu hỏi (tab 1)

**Làm:** Chiếu màn mở đầu, dừng ở khung **Thông báo về tính mô phỏng và hư cấu**.

**Nói:**

> "Các bạn thử hình dung. Năm 1981, bạn ngồi sau ô cửa một trạm kiểm soát trên tỉnh lộ. Trên bàn có một cuốn sổ chỉ thị. Làm đúng sổ thì được khen, làm sai thì bị nhắc nhở.
>
> Một buổi sáng, một bà cụ đẩy qua ô cửa 18 cân gạo, kèm một tờ giấy mà cuốn sổ của bạn chưa nhắc tới bao giờ.
>
> Bạn đóng dấu gì? *(dừng)*
>
> Mười phút tới, cả lớp sẽ cùng trả lời câu đó, bằng chính điện thoại của mình. Các bạn cứ lấy điện thoại ra sẵn."

> "Đây là **Trạm 15**, game mô phỏng nhóm em làm, lấy cảm hứng từ *Papers, Please*. Bạn vào vai anh Thành, tổ trưởng một trạm kiểm soát liên huyện từ 1979 đến 1987, thời ngăn sông cấm chợ. Nhân vật, địa danh và số liệu là hư cấu. Còn các chủ trương, văn kiện là có thật, và đều ghi nguồn."

### 1:00 – 2:00 · Học chơi trong một phút (tab 1, bấm *Bắt đầu ca trực*)

**Làm:** Qua màn đài VEF-206 và lời giao ban của trạm trưởng Đối. Tới lượt cô sinh viên, lần lượt rê chuột qua ô cửa, giấy tờ, sổ chỉ thị.

**Nói:**

> "Cách chơi chỉ có ba thứ: người đứng ở ô cửa, giấy tờ trên bàn, và cuốn sổ bên phải. Việc của anh Thành là đặt ba thứ đó cạnh nhau xem có khớp không."

**Làm:** Kéo con dấu **CHO QUA** xuống giấy đi đường.

**Nói:**

> "Các bạn nhớ tiếng này. *(dừng một nhịp sau tiếng dấu)* Cả game xoay quanh nó. Năm 1979 mọi thứ còn đơn giản: giấy đủ thì cho qua, thiếu thì giữ lại, và anh Thành thấy mình đang làm một việc đúng."

**Làm:** Bấm *Lượt kế tiếp*, chuyển sang tab 3.

### 2:00 – 5:00 · Bà Tư và 18 cân gạo: cả lớp đóng dấu (tab 3, tab 2 để dự phòng)

**Nói** (lúc màn chuyển sang năm 1981):

> "Hai năm sau, tháng 1 năm 1981, Ban Bí thư ra **Chỉ thị 100** về khoán sản phẩm. Làm vượt khoán thì phần vượt là của người nông dân. Chủ trương ở trên đã đổi. Còn cuốn sổ trên bàn anh Thành thì chưa đổi chữ nào."

**Làm:** Màn **Hội đồng lớp học** tự hiện, có mã QR và mã phòng **T15**.

**Nói:**

> "Mời cả lớp quét mã, hoặc vào `15-station.vercel.app/vote` rồi gõ T15. Trong lúc chờ, mình gặp bà Tư."

**Làm:** Bấm **Xem giấy tờ** để thu hội đồng xuống góc. Chỉ lần lượt: dòng 18 kg gạo, nhãn **Điều 2** (bấm để sổ mở đúng dòng *tối đa 5 kg lương thực*), **giấy xác nhận sản phẩm khoán 13 kg**, và dải đỏ *Trạm trưởng đứng sau lưng*.

**Nói** (đọc chậm câu của bà Tư):

> "Bà Tư nói: *'Gạo này là phần vượt khoán nhà tôi được hưởng, hợp tác xã có giấy xác nhận đây.'* Bà mang ra thị xã đổi thuốc cho thằng cháu đang sốt.
>
> Các bạn cộng giúp em: 5 cân định mức cộng 13 cân khoán, vừa đúng 18. Chủ trương nói số gạo đó là của bà. Nhưng sổ của trạm chưa có dòng nào công nhận tờ giấy khoán.
>
> Và lần này trạm trưởng đang đứng ngay sau lưng anh Thành, nên có làm ngơ thì cũng bị ghi sổ."

**Làm:** Bấm **Mở lại hội đồng**, đợi số người vào phòng gần đủ, bấm **Bắt đầu bỏ phiếu** (45 giây).

**Nói** (trong lúc lớp bỏ phiếu, đọc to hai lý lẽ, mỗi bên một câu):

> "Một bên nói: *sổ là sổ, hôm nay tôi linh động thì mai người khác cũng linh động, và trạm này mất ý nghĩa.* Bên kia nói: *chủ trương đã ra, giữ gạo của bà là làm trái chính cái Trung ương vừa cho phép.* Các bạn được đổi ý tới khi hết giờ."

**Làm:** Hết giờ, hội đồng tự chốt (hoặc bấm **Chốt sớm**). Để hai thanh kết quả chạy lên và con dấu của lớp đập xuống. **Không nói gì trong 2 giây đó.**

**Nói:**

> "Lớp mình đã đóng dấu. *(đọc kết quả)* Em mời một bạn bên ít phiếu hơn nói lý do. Chỉ một câu thôi."

**Làm:** Bấm **Đóng dấu theo lớp** (nếu hoà phiếu thì người dẫn chọn một dấu), chưa bấm lượt kế tiếp.

**Nói:**

> "Theo nhóm em, cả hai con dấu đều có lý. Nhưng có một việc chắc chắn đúng mà chưa ai bấm: **ghi lại mâu thuẫn này và báo lên huyện.** Trong game, đó là **biên bản kiến nghị**."

**Làm:** Chỉ lên đồng hồ ở thanh trên và hàng người ngoài cửa sổ.

**Nói:**

> "Viết biên bản tốn 60 phút ca, hàng người ngoài kia cứ dài thêm, trạm trưởng thì không ưa. Nhưng phải đủ ba biên bản về chuyện giấy khoán thì năm 1986 sổ mới có thêm *Điều 2 (bổ sung)*. Sửa được, dù chậm.
>
> 18 cân gạo của bà Tư chính là cái giáo trình Chương 3 gọi là *nền kinh tế nhiều thành phần*, một thứ **tất yếu tồn tại** trong thời kỳ quá độ. Cuốn sổ chưa theo kịp điều đó."

*(Dự phòng: nếu wifi yếu, mở **Đường lui nhập tay** ở cuối cột trái hội đồng, cho cả lớp giơ tay, đếm rồi gõ số, bấm **Dùng số nhập tay**.)*

### 5:00 – 6:00 · Anh Hùng: nhìn vào mặt người mình bắt lỗi (tab 4)

**Nói:**

> "Tìm lỗi thì dễ. Nhìn thẳng vào người mình vừa bắt lỗi thì khó hơn nhiều.
>
> Ngay hôm sau, sổ có thêm Điều 4: tên và năm sinh trên mọi giấy phải khớp với sổ hộ khẩu. Đây là anh Hùng, thương binh."

**Làm:** Bật **Bút chì đối chất**, khoanh *Năm sinh* trên giấy thương binh (1951) và trên sổ hộ khẩu (1952), bấm **Đối chiếu**.

**Nói:** Đừng đọc hộ câu trả lời của anh Hùng. Để cả lớp tự đọc trên màn hình, *(dừng)*, rồi mới nói:

> "*'Năm 76 tôi đã lên huyện xin sửa. Người ta bảo hồ sơ thời chiến phải chờ tỉnh xác minh. Chờ đến giờ, chú em ạ.'*
>
> Theo sổ thì phải giữ. Điều 4 trong game bắt được đúng một kẻ gian thật, là gã đầu cơ đi bằng giấy của em trai. Nhưng nó cũng giữ lại hai người vô tội, và anh Hùng là một trong hai người đó.
>
> Đối chất không làm đổi đáp án. Game chỉ đếm hai con số: bạn **thấy** chỗ sai bao nhiêu lần, và bạn **làm theo** điều mình thấy bao nhiêu lần."

### 6:00 – 7:30 · Cuối ngày: hai bảng, một gia đình

**Làm:** Đóng dấu xong lượt anh Hùng, bấm tới **Báo cáo tổng kết cuối ngày**.

**Nói:**

> "Đây là phần nhóm em thấy đáng suy nghĩ nhất. Hai bảng đặt cạnh nhau. Bên trái là bảng gửi cấp trên: tỷ lệ chấp hành, con dấu xếp loại. Bên phải là tình hình huyện: gạo vào thị xã, số hộ thiếu ăn.
>
> Chấp hành càng đẹp thì gạo vào thị xã càng ít, và số hộ thiếu ăn càng tăng. *(dừng)*"

**Làm:** Chỉ vào dòng **Yếu tố khách quan**.

**Nói:**

> "Nhưng game cố ý không cho người chơi đổ hết lỗi cho trạm. Dòng này nhắc rằng còn rét đậm, lũ sớm, hàng Trung ương phân phối về chậm. Giáo trình dặn *'không phiến diện, cực đoan, duy ý chí'* (Chương 3). Một game phê phán duy ý chí thì không được tự mắc lỗi phiến diện."

**Làm:** Sang **Chi tiêu gia đình**.

**Nói:**

> "Tối về, anh Thành cũng chỉ là một ông bố cầm đồng lương mất giá: gạo, than, thuốc huyết áp cho mẹ, học phí cho bé Mai. Anh ấy cũng là một người sống trong chính cơ chế đó."

*(Nếu còn thời gian)* Kể thêm về bác Nga hàng xóm năm 1986. Bác mang thuốc huyết áp cho chính mẹ Thành, giấy tờ thiếu. Bác nói: *"Chú giữ thì tối nay chú lại phải đi mua chợ đen, giá gấp đôi đấy."*

### 7:30 – 9:00 · Năm 1987 (tab 5, hoặc video dự phòng)

**Làm:** Gõ `Mr.NoBody`, bấm **D6 · 1987**. Để thẻ chuyển cảnh và tiếng đài tự chạy. **Người dẫn im lặng.**

**Nói** (sau khi dòng chữ Đại hội VI hiện hết):

> "Tháng 12 năm 1986, Đại hội VI: *'Nhìn thẳng vào sự thật, đánh giá đúng sự thật, nói rõ sự thật.'* Tháng 4 năm 1987, Hội nghị Trung ương 2 yêu cầu xoá bỏ ngăn sông cấm chợ. Trạm trưởng Đối mang văn bản tới, thu lại cuốn sổ dày cộp, đưa một trang duy nhất: danh sách hàng cấm lưu thông.
>
> Những người cũ quay lại. Bà Tư chở gạo ra chợ bán công khai. Còn thằng Tí, cậu bé năm 1981 mang 20 viên quinin cho bố bị sốt rét, giờ đã mười tám tuổi."

> "Nếu năm ấy anh Thành cho thuốc qua, Tí sẽ gọi to: *'Chú Thành! Chú còn nhớ cháu không?'* Nếu năm ấy thuốc bị giữ, cậu chỉ nhìn anh Thành rất lâu, rồi nhìn đi chỗ khác, và không nói gì cả. *(dừng)*"

**Làm:** Gõ `Mr.NoBody` lần nữa, chọn **Người làm ngơ**, cuộn xuống **thẻ kết quả**.

**Nói:**

> "Đây là kết cục của người chơi hiền nhất: thấy vi phạm là làm ngơ cho qua. Báo cáo gửi lên ghi chấp hành **80%**, thực tế là **44%**. *(dừng)*
>
> Người làm ngơ tưởng mình đang tốt với dân. Nhưng lòng tốt không được ghi lại thì không ai sửa được cuốn sổ, và năm sau người khác ngồi sau ô cửa vẫn gặp đúng cuốn sổ ấy. Giáo trình Chương 4 viết: dân chủ phải *'gắn liền với kỷ luật, kỷ cương và phải được thể chế hóa bằng pháp luật'*. Vì vậy kết cục tốt nhất của game không dành cho người làm ngơ. Nó dành cho **người kiến nghị**."

### 9:00 – 10:00 · Chốt: trở lại câu hỏi ban đầu

**Làm:** Chiếu mục 5, chỉ cần ba dòng in đậm.

**Nói:**

> "Mười phút trước em hỏi: một bà cụ đẩy 18 cân gạo qua ô cửa, bạn đóng dấu gì?
>
> Câu trả lời của nhóm em là: đóng dấu nào cũng được, miễn là **đừng im lặng**.
>
> Cuốn sổ không sai vì có quản lý; game vẫn có những kẻ buôn lậu thật mà giữ lại là đúng. Nó sai vì chậm hơn đời sống. Giáo trình Chương 1 gọi tên cái sai đó: *giáo điều, chủ quan duy ý chí, bảo thủ*. Cũng câu đó khẳng định nguyên nhân **không phải do chủ nghĩa xã hội**. Và Đổi mới chính là lúc Đảng làm đúng điều giáo trình rút ra: *xuất phát từ thực tiễn, coi trọng tổng kết thực tiễn*.
>
> Nhóm em xin để lại câu hỏi cuối của game: *Đổi mới bắt đầu từ đâu, nếu không phải từ lòng dũng cảm nhìn thẳng vào sự thật ở chính cấp cơ sở?*
>
> Em cảm ơn thầy cô và các bạn. Link game ở trên màn hình. Các bạn chơi thử, rồi gửi thẻ kết quả của mình cho nhóm, xem ai là người kiến nghị."

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
| Wifi lớp học yếu / sinh viên không vào được trang vote | Bấm ngay mục **"Đường lui nhập tay (Khẩn cấp)"** trên màn `/host` hoặc ngay tại bàn game. Người dẫn đếm nhanh giơ tay, gõ số phiếu vào 2 ô và bấm **"Dùng số nhập tay"**. Hội đồng công bố ngay, bấm **Đóng dấu theo lớp** như thường. |
| Hội đồng lớp học không tự hiện trên bàn game | Kiểm tra nút **"Host: BẬT / TẮT"** trên thanh TopBar, hoặc bấm dòng **"Bật bỏ phiếu lớp học cho lượt này"** xuất hiện ngay trên mặt bàn. |

---

## 8. Sau buổi trình bày

- Đếm xem có bao nhiêu bạn trong lớp gửi **thẻ kết quả** cho nhóm hoặc đăng lên mạng xã hội — đó là tiêu chí kiểm tra V7 trong `10-can-sua.md`.
- Hỏi hai bạn đã chơi hai lối khác nhau: chuyện gì đã xảy ra với bà Tư và thằng Tí (tiêu chí V3). Hỏi một bạn còn nhớ câu nào khi đối chất (tiêu chí V8).
- Ghi mọi lỗi và góp ý phát hiện trên lớp thành mục mới trong `10-can-sua.md` (mẫu ở cuối file).
