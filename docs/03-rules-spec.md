# Đặc tả luật chơi

> Trạng thái: CHỐT BẢN 1 — chờ nhóm duyệt mục 12

Tài liệu này là nguồn gốc của mọi luật trong game. Các file sau dẫn xuất từ đây và phải khớp từng mã, từng trường:

- `data/schema/*.schema.json`
- `data/rules.json`, `data/documents.json`
- `content/templates/T1`–`T4`
- `prompts/P1-script-to-json.md`
- `src/engine/`

Sửa tài liệu này thì phải rà lại toàn bộ danh sách trên trong cùng một lần sửa. Nếu tài liệu này mâu thuẫn với `00-idea.md`: tài liệu này thắng về chi tiết luật, `00-idea.md` thắng về ba nguyên tắc thiết kế.

## Mục lục

1. [Danh mục mã chính thức](#1-danh-mục-mã-chính-thức)
2. [Mô hình dữ liệu và quy ước so sánh](#2-mô-hình-dữ-liệu-và-quy-ước-so-sánh)
3. [Sáu loại lỗi E1–E6](#3-sáu-loại-lỗi-e1e6)
4. [Sổ chỉ thị theo ngày](#4-sổ-chỉ-thị-theo-ngày)
5. [Hành động và chấm từng lượt](#5-hành-động-và-chấm-từng-lượt)
6. [Kiến nghị](#6-kiến-nghị)
7. [Đồng hồ ca và hai bảng chỉ số](#7-đồng-hồ-ca-và-hai-bảng-chỉ-số)
8. [Chi tiêu gia đình](#8-chi-tiêu-gia-đình)
9. [Chọn kết cục](#9-chọn-kết-cục)
10. [Ràng buộc nội dung cho validate](#10-ràng-buộc-nội-dung-cho-validate)
11. [Ví dụ hoàn chỉnh: bà Tư mang giấy khoán](#11-ví-dụ-hoàn-chỉnh-bà-tư-mang-giấy-khoán)
12. [Quyết định thiết kế cần nhóm duyệt](#12-quyết-định-thiết-kế-cần-nhóm-duyệt)

---

## 1. Danh mục mã chính thức

Mã đã dùng trong JSON thì không đổi. Muốn thêm mã mới phải sửa tài liệu này, schema tương ứng, và P1 trong cùng một commit.

### 1.1. Nhân vật

| Mã | Tên | Vai trò (`role`) | Ghi chú |
|---|---|---|---|
| `thanh` | Nguyễn Văn Thành | `nguoi-choi` | Nhân vật người chơi. Không xuất hiện như khách qua trạm |
| `ba-tu` | Bà Tư Lành | `chinh` | Xuất hiện ít nhất 3 lần |
| `anh-hung` | Anh Hùng | `chinh` | Thương binh 2/4. Xuất hiện ít nhất 3 lần trong d3–d5 |
| `ong-quynh` | Ông Quỳnh | `chinh` | Cán bộ Công ty Thương nghiệp tỉnh |
| `thang-ti` | Thằng Tí | `chinh` | 12 tuổi, không có giấy tờ |
| `chi-thu` | Chị Thu | `phu` | Cán bộ huyện phụ trách nông nghiệp, màn 2 và màn 4 |
| `tram-truong-doi` | Trạm trưởng Đối | `phu` | Nói qua giấy nhắc nhở và lời thoại chen giữa |
| `hoa` | Hoà | `gia-dinh` | Vợ Thành |
| `be-mai` | Bé Mai | `gia-dinh` | 8 tuổi |
| `be-binh` | Bé Bình | `gia-dinh` | 3 tuổi |
| `me-thanh` | Mẹ Thành | `gia-dinh` | |
| `np-<mô-tả>` | Nhân vật một lần | `mot-lan` | Kebab-case không dấu: `np-buon-thuoc-la`, `np-dau-co-gao`, `np-dau-co-vai`, `np-doan-can-bo`, `np-nguoi-dua-tang`, `np-sinh-vien`, `np-bo-ti`, … |

Mã `speaker` trong lời thoại dùng mã nhân vật ở trên, hoặc ba mã đặc biệt: `traveler` (người đang ở ô cửa), `radio`, `narrator`.

### 1.2. Ngày và màn

| Ngày | Màn (`act`) | Ngày trong game mặc định | Số lượt | Kiến nghị |
|---|---|---|---|---|
| `d1` | 1 | 1979-10-15 | 3 | tắt |
| `d2` | 1 | 1979-10-22 | 4 | tắt |
| `d3` | 2 | 1981-03-16 | 4 | bật |
| `d4` | 2 | 1981-03-23 | 5 | bật |
| `d5` | 3 | 1986-04-14 | 5 | bật |
| `d6` | 4 | 1987-06-15 | 5 | **luôn tắt** |

Mỗi ngày chơi đại diện cho **một tuần** làm việc. Lương và chi tiêu tính theo tuần. Ngày trong game dùng để xét hạn giấy tờ, KB có thể đổi trong `days.json` nhưng phải giữ đúng tháng và năm của màn.

Thẻ chuyển cảnh tháng 12/1986 nằm trong `transition_card` của `d6`.

### 1.3. Lượt khách

Mã: `d<ngày>-t<thứ tự>`, ví dụ `d3-t3`. Thứ tự từ 1, liên tục, không nhảy số. Tổng 26 lượt.

### 1.4. Loại giấy

| Mã | Tên | Dấu hợp lệ | Kiểm nơi đóng dấu | Trường chủ giấy | Trường năm sinh | Hạn |
|---|---|---|---|---|---|---|
| `GDD` | Giấy đi đường | `UBND_XA` | `noi_di` | `ho_ten` | `nam_sinh` | `co_gia_tri_den` (ngày) |
| `SHK` | Sổ hộ khẩu | `CONG_AN` | — | `ho_ten` | `nam_sinh` | không |
| `TP` | Tem phiếu | `PHONG_LUONG_THUC` | — | `ho_ten` | — | `thang` (tháng) |
| `HDHTX` | Hoá đơn hợp tác xã | `HTX` | — | — | — | không |
| `GPVC` | Giấy phép vận chuyển | `CTY_THUONG_NGHIEP` | — | `nguoi_van_chuyen` | — | `co_gia_tri_den` (ngày) |
| `DT` | Đơn thuốc | `BENH_VIEN` | — | — | — | `co_gia_tri_den` (ngày) |
| `CNTB` | Giấy chứng nhận thương binh | `TB_XH` | — | `ho_ten` | `nam_sinh` | không |
| `GXNK` | Giấy xác nhận sản phẩm khoán | `HTX` | `xa` | `ho_ten` | — | không |

Danh sách trường của từng loại nằm ở `data/documents.json` và `$defs/doc_*` trong `travelers.schema.json`. Hai nơi này phải giống hệt nhau.

`DT` và `HDHTX` không có trường chủ giấy, vì người mang đơn có thể không phải bệnh nhân, và người nhận hàng có thể là đơn vị.

`GXNK` chỉ được xuất hiện từ `d3`. Các loại khác được xuất hiện từ `d1`, kể cả khi sổ chưa có quy định nào kiểm tra chúng.

### 1.5. Loại dấu

| Mã | Cơ quan |
|---|---|
| `UBND_XA` | Uỷ ban nhân dân xã |
| `UBND_HUYEN` | Uỷ ban nhân dân huyện |
| `CONG_AN` | Công an |
| `PHONG_LUONG_THUC` | Phòng lương thực huyện |
| `HTX` | Hợp tác xã |
| `CTY_THUONG_NGHIEP` | Công ty Thương nghiệp |
| `BENH_VIEN` | Bệnh viện |
| `TRAM_Y_TE` | Trạm y tế xã |
| `TB_XH` | Cơ quan thương binh – xã hội |

Mỗi con dấu là `{ kind, place, legible }`, hoặc `null` nếu giấy không có dấu. `UBND_HUYEN` và `TRAM_Y_TE` không hợp lệ cho loại giấy nào; chúng tồn tại để cài lỗi E3 "dấu sai cơ quan".

### 1.6. Nhóm hàng và đơn vị

| Nhóm (`category`) | Nghĩa | Quy định kiểm tra |
|---|---|---|
| `LUONG_THUC` | Gạo, ngô, sắn, bột mì | R2 (định mức) |
| `THUC_PHAM` | Thịt, cá, đường, nước mắm | R5 |
| `THUOC` | Thuốc | R3, chỉ khi mã thuốc có trong danh mục quản lý |
| `HANG_TIEU_DUNG` | Vải, thuốc lá, xà phòng, dầu hoả | R5 |
| `VAT_TU` | Phân bón, xi măng, phụ tùng | R5 |
| `DO_CA_NHAN` | Quần áo, đồ dùng cá nhân | Không quy định nào. Được miễn khai trên GDD |
| `HANG_CAM` | Chỉ dùng ở d6 | R6 |

Đơn vị: `kg`, `cay`, `bao`, `hop`, `lo`, `vi`, `vien`, `met`, `chiec`, `lit`.

Mỗi mặt hàng có **mã hàng** (`ma`) dạng kebab-case không dấu: `gao`, `thuoc-la`, `duong`, `penicillin`. **Engine so khớp hàng bằng `ma` và `don_vi`, không bằng tên hiển thị.** Cùng một mặt hàng phải dùng cùng một mã ở hàng mang theo và trên mọi giấy tờ.

### 1.7. Quy định

| Mã | Điều | Hiệu lực | Điều kiện | Hàm kiểm tra | Lỗi sinh ra |
|---|---|---|---|---|---|
| `R1-GDD` | Điều 1 | d1–d5 | — | `GDD_HOP_LE` | E1, E3, E5, E6 |
| `R2-DINH-MUC` | Điều 2 | d2–d5 | — | `DINH_MUC_LUONG_THUC` | E4 |
| `R3-DON-THUOC` | Điều 3 | d3–d5 | — | `DON_THUOC` | E1, E3, E5, E6 |
| `R4-KHOP-TEN` | Điều 4 | d4–d5 | — | `KHOP_TEN` | E2, E5 |
| `R5-CHUNG-TU` | Điều 5 | d5 | — | `CHUNG_TU_HANG_HOA` | E1, E3, E5, E6 |
| `R5K-KHOAN` | Điều 2 (bổ sung) | d5 | `KN-KHOAN` đã kích hoạt | `MIEN_DINH_MUC_KHOAN` | không — chỉ nới hạn mức R2 |
| `R6-HANG-CAM` | Thông báo | d6 | — | `HANG_CAM` | không — vi phạm có `error: null` |

### 1.8. Lỗi

| Mã | Tên |
|---|---|
| `E1` | Giấy hết hạn |
| `E2` | Lệch tên hoặc năm sinh giữa các giấy |
| `E3` | Thiếu dấu, dấu mờ, dấu sai cơ quan, hoặc dấu sai nơi |
| `E4` | Vượt định mức |
| `E5` | Thiếu giấy bắt buộc |
| `E6` | Giấy tờ mâu thuẫn với hàng thực mang theo |

### 1.9. Vấn đề kiến nghị

| Mã | Nội dung | Mở từ | Ngưỡng | Hiệu ứng |
|---|---|---|---|---|
| `KN-KHOAN` | Giấy xác nhận sản phẩm khoán chưa có trong sổ | d3 | 3 | Kích hoạt `R5K-KHOAN` từ màn kế tiếp |
| `KN-THUONG-BINH` | Sổ không có mục nào cho người có giấy chứng nhận thương binh | d3 | 3 | Chỉ có hiệu ứng tường thuật ở màn 4 và kết cục |

### 1.10. Hành động, mã quyết định và cờ

**Hành động** (`action`): `CHO_QUA`, `GIU_LAI`, `LAM_NGO`.

**Mã quyết định** ghi vào cờ, ghép từ ba phần:

| Phần | Giá trị |
|---|---|
| Hành động | `qua`, `giu`, `lam-ngo` |
| Hậu tố kiến nghị | `-kn` nếu kèm một biên bản **hợp lệ** |
| Hậu tố hối lộ | `-tien` nếu nhận phong bì |

Tập giá trị hợp lệ: `qua`, `giu`, `lam-ngo`, `qua-kn`, `giu-kn`, `qua-tien`, `lam-ngo-tien`. Không có tổ hợp vừa `-kn` vừa `-tien`, vì một lượt không được vừa có phong bì vừa là dịp kiến nghị (mục 10, tầng 3, điều 11).

**Cờ** (`flag_key`): `<mã-nhân-vật>.m<màn>`, ví dụ `ba-tu.m2`. Nếu một nhân vật xuất hiện hai lần trong cùng màn, thêm chữ cái: `anh-hung.m2a`, `anh-hung.m2b`. Cờ được engine **tự ghi** sau mỗi lượt có `flag_key`, người viết không tự đặt giá trị.

**Điều kiện** dùng trong `when` của lời thoại, lời chen giữa, cảnh kết:

| Dạng | Ví dụ | Ghi chú |
|---|---|---|
| Theo cờ | `{ "flag": "ba-tu.m2", "in": ["giu", "giu-kn"] }` | Cờ chưa được ghi thì điều kiện sai |
| Theo kiến nghị | `{ "issue_triggered": "KN-KHOAN", "value": true }` | |
| Theo chỉ số ẩn | `{ "stat": "bribe_total", "op": ">", "value": 0 }` | Chỉ dùng trong `endings.json` |

Nhiều điều kiện trong một mảng `when` được nối bằng VÀ.

### 1.11. Chỉ số

**Chỉ số huyện** (hiện ở bảng phải, là số mô phỏng):

| Mã | Nghĩa | Giá trị đầu |
|---|---|---|
| `luong_thuc_vao_thi_xa` | Chỉ số lương thực vào thị xã | 100 |
| `ho_thieu_an` | Số hộ thiếu ăn trong huyện | 210 |
| `gia_gao_index` | Chỉ số giá gạo ngoài chợ | 100 |

**Chỉ số ẩn** (dùng để chọn kết cục, định nghĩa ở mục 9): `true_compliance`, `reported_compliance`, `valid_reports`, `invalid_reports`, `lam_ngo_violations`, `bribes_accepted`, `bribe_total`, `issues_triggered`, `hardship`, `overtime_days`, `reprimands`.

### 1.12. Kết cục

| Mã | Tên | Thứ tự xét |
|---|---|---|
| `END-AN-TIEN` | Người ăn tiền | 1 |
| `END-LAM-NGO` | Người làm ngơ | 2 |
| `END-KIEN-NGHI` | Người kiến nghị | 3 |
| `END-GAC-CONG` | Người gác cổng mẫu mực | 4 |
| `END-SONG-SOT` | Người sống sót | 5 — mặc định |

### 1.13. Nhãn lượt và biến trong chữ

**Nhãn lượt** (`tags`):

| Nhãn | Nghĩa |
|---|---|
| `huong-dan` | Lượt dạy thao tác |
| `buon-lau-that` | Buôn lậu, đầu cơ thật sự. Giữ lại là đúng cả luật lẫn đạo lý |
| `luot-trung-tam` | Lượt mang luận điểm chính |
| `dung-trinh-bay` | Điểm dừng khi trình bày trước lớp |
| `dong-cam` | Lượt nhằm tạo đồng cảm |

**Biến trong chữ**, dùng trong `strings.json` và cảnh kết: `{{bribe_total}}`, `{{valid_reports}}`, `{{hang_tich_thu_kg}}`, `{{day_label}}`, `{{kn_remaining:KN-KHOAN}}` (số biên bản còn thiếu để chạm ngưỡng).

---

## 2. Mô hình dữ liệu và quy ước so sánh

### 2.1. Một lượt khách gồm những gì

| Trường | Nội dung |
|---|---|
| `documents` | Các giấy người đó xuất trình. Có thể rỗng |
| `cargo` | Hàng thực mang theo, mỗi dòng có `ma`, `ten`, `so_luong`, `don_vi`, `category` |
| `planted` | Lỗi người viết **cố ý** cài, kèm ghi chú |
| `expected` | Đáp án người viết mong đợi. Chỉ để đối chiếu |
| `kn` | Lượt này có phải dịp kiến nghị hợp lệ không, cho vấn đề nào |
| `bribe` | Phong bì, nếu có |
| `outcomes` | Hậu quả của từng hành động lên chỉ số huyện |

> **Đáp án do engine tính.** Engine chạy mục 4 lên `documents` và `cargo`, ra danh sách vi phạm và phán quyết. `validate-data.ts` so kết quả đó với `expected`. Lệch là lỗi dữ liệu, không phải lỗi engine, trừ khi chứng minh được điều ngược lại.

### 2.2. Quy ước so sánh

- **Chuỗi**: chuẩn hoá Unicode NFC, bỏ khoảng trắng đầu cuối, gộp khoảng trắng liên tiếp, **giữ dấu và giữ hoa thường**. "Trần Thị Lành" khác "Trần Thị Lanh".
- **Ngày**: chuỗi `YYYY-MM-DD`, so sánh theo thứ tự từ điển. Giấy có `co_gia_tri_den` bằng đúng ngày trong game **vẫn còn hạn**.
- **Tháng**: chuỗi `YYYY-MM`. Tem phiếu chỉ hợp lệ khi `thang` bằng tháng của ngày trong game.
- **Hàng**: hai dòng hàng khớp khi cùng `ma` và cùng `don_vi`. Một giấy "phủ" một dòng hàng khi có dòng cùng `ma`, cùng `don_vi`, và `so_luong` lớn hơn hoặc bằng.
- **Dấu hợp lệ** cho một loại giấy khi: dấu khác `null`, `legible` là `true`, `kind` nằm trong danh sách dấu hợp lệ của loại giấy đó, và nếu loại giấy có trường kiểm nơi đóng dấu thì `place` phải bằng giá trị trường đó.

---

## 3. Sáu loại lỗi E1–E6

Một lỗi chỉ trở thành **vi phạm** khi có một quy định đang hiệu lực kiểm tra nó. Lỗi cài vào mà chưa có quy định nào kiểm tra thì **ngủ** — giấy vẫn sai, nhưng theo sổ thì người đó được qua. Đây là tính chất cố ý của game: người chơi có thể nhìn thấy một chỗ sai mà sổ chưa bắt.

Mỗi vi phạm là một cặp `{ rule, error }`. Một quy định sinh mỗi mã lỗi tối đa một lần cho mỗi lượt.

### E1 — Giấy hết hạn

- **Logic:** ngày trong game > `co_gia_tri_den` (giấy hạn theo ngày), hoặc `thang` ≠ tháng hiện tại (tem phiếu).
- **Sinh bởi:** R1 (GDD), R3 (DT), R5 (GPVC).
- **Tem phiếu hết hạn không sinh E1.** Nó chỉ không được cộng vào định mức ở R2, và nếu vì thế lượng lương thực vượt định mức thì lỗi sinh ra là E4.
- **Cách cài:** cho hết hạn 1 ngày khi muốn người chơi phải soi kỹ.

### E2 — Lệch tên hoặc năm sinh

- **Logic:** với mọi giấy có trường chủ giấy (mục 1.4), trừ chính Sổ hộ khẩu: tên chủ giấy ≠ `SHK.ho_ten`. Nếu `compare_birth_year` bật: với mọi giấy có trường năm sinh, năm sinh ≠ `SHK.nam_sinh`.
- **Sinh bởi:** R4 duy nhất.
- **Trước d4, lệch tên là lỗi ngủ.**
- **Cách cài:** lệch một dấu thanh ("Lành" – "Lãnh"), một chữ ("Văn" – "Vân"), hoặc năm sinh lệch 1.

### E3 — Dấu không hợp lệ

- **Logic:** giấy mà quy định yêu cầu có dấu không hợp lệ theo mục 2.2.
- **Sinh bởi:** R1 (GDD), R3 (DT), R5 (HDHTX, GPVC).
- **Cách cài:** dấu `null`; dấu mờ (`legible: false`); dấu `UBND_HUYEN` thay vì `UBND_XA`; dấu xã khác với nơi đi; đơn thuốc đóng dấu `TRAM_Y_TE`.

### E4 — Vượt định mức

- **Logic:** tổng kg hàng `LUONG_THUC` > hạn mức. Hạn mức tính ở mục 4.3.
- **Sinh bởi:** R2 duy nhất.
- **Cách cài:** vượt rõ ràng (18 kg) khi muốn tạo tình huống đạo lý; vượt sát (5,5 kg) khi muốn người chơi phải cộng.

### E5 — Thiếu giấy bắt buộc

- **Logic:** quy định cần một loại giấy mà lượt khách không có.
- **Sinh bởi:** R1 (không có GDD), R3 (có thuốc quản lý mà không có DT), R4 (không có SHK), R5 (có hàng thuộc nhóm R5 mà không có HDHTX lẫn GPVC).
- **Lưu ý:** khi thiếu giấy gốc, quy định đó dừng kiểm tra các lỗi khác của giấy ấy. Ví dụ không có GDD thì R1 chỉ sinh E5.

### E6 — Giấy tờ mâu thuẫn với hàng

- **Logic:** có dòng hàng thực mang theo mà giấy liên quan **không phủ**:
  - R1: mọi hàng không thuộc `DO_CA_NHAN` phải được `GDD.hang_mang_theo` phủ.
  - R3: mọi thuốc quản lý phải được `DT.thuoc` phủ.
  - R5: mọi hàng thuộc nhóm R5 phải được `mat_hang` của ít nhất một HDHTX hoặc GPVC hợp lệ phủ.
- **Sinh bởi:** R1, R3, R5.
- **Cách cài "lý do thăm thân mà chở hàng":** GDD ghi lý do thăm thân và không khai hàng, còn `cargo` có 8 cây thuốc lá. Lý do chỉ là gợi ý cho người chơi; thứ engine kiểm tra là hàng không được khai.
- **Hàng giấu** (`an_giau: true`) vẫn được kiểm tra như mọi hàng. Trường này chỉ để giao diện hiển thị "trong bao tải".

---

## 4. Sổ chỉ thị theo ngày

### 4.1. Sổ hiển thị từng ngày

| Ngày | Các điều trong sổ | Quy định mới |
|---|---|---|
| d1 | Điều 1 | R1 |
| d2 | Điều 1, 2 | R2 |
| d3 | Điều 1, 2, 3 | R3 |
| d4 | Điều 1, 2, 3, 4 | R4 |
| d5 | Điều 1, 2, 3, 4, 5, và Điều 2 bổ sung nếu `KN-KHOAN` đã kích hoạt | R5, có thể có R5K |
| d6 | Chỉ còn Thông báo danh mục hàng cấm | R6 |

Quy định đang hiệu lực trong một ngày:

```
active(ngày, state) = mọi r trong rules.json sao cho
    r.day_from ≤ ngày ≤ r.day_to
    VÀ (r.condition = null HOẶC r.condition.issue_triggered ∈ state.issues_active)
```

### 4.2. R1-GDD — Giấy đi đường (d1–d5)

```
g = giấy GDD của lượt
nếu không có g:                               vi phạm (R1, E5); dừng R1
nếu hôm_nay > g.co_gia_tri_den:               vi phạm (R1, E1)
nếu dấu của g không hợp lệ (UBND_XA, nơi = g.noi_di):  vi phạm (R1, E3)
với mỗi dòng hàng h mà h.category ≠ DO_CA_NHAN:
    nếu g.hang_mang_theo không phủ h:         vi phạm (R1, E6)
```

### 4.3. R2-DINH-MUC — Định mức lương thực (d2–d5)

```
LT     = các dòng hàng có category = LUONG_THUC và don_vi = kg
tong   = tổng so_luong của LT
nếu tong = 0: bỏ qua R2

han_muc = 5
với mỗi tem phiếu tp:
    nếu tp.thang = tháng hiện tại
       VÀ dấu tp hợp lệ (PHONG_LUONG_THUC)
       VÀ tp.mat_hang.ma trùng mã một dòng trong LT:
        han_muc += tp.mat_hang.so_luong

nếu R5K-KHOAN đang hiệu lực VÀ có giấy GXNK k:
    nếu dấu k hợp lệ (HTX, nơi = k.xa)
       VÀ k.san_pham_ma trùng mã một dòng trong LT
       VÀ có GDD và GDD.ho_ten = k.ho_ten:
        han_muc += k.so_luong_kg

nếu tong > han_muc:                            vi phạm (R2, E4)
```

Tem phiếu và giấy khoán không hợp lệ thì chỉ đơn giản là không được cộng, không sinh lỗi riêng.

### 4.4. R3-DON-THUOC — Thuốc quản lý (d3–d5)

Danh mục thuốc quản lý nằm trong `params.danh_muc_thuoc` của R3 và được hiển thị trên trang sổ.

```
TQ = các dòng hàng có category = THUOC và ma ∈ danh_muc_thuoc
nếu TQ rỗng: bỏ qua R3
d = giấy DT của lượt
nếu không có d:                               vi phạm (R3, E5); dừng R3
nếu hôm_nay > d.co_gia_tri_den:               vi phạm (R3, E1)
nếu dấu của d không hợp lệ (BENH_VIEN):       vi phạm (R3, E3)
với mỗi h trong TQ: nếu d.thuoc không phủ h:  vi phạm (R3, E6)
```

Người mang đơn không cần là bệnh nhân. Thằng Tí mua thuốc cho bố là hợp lệ nếu đơn hợp lệ.

### 4.5. R4-KHOP-TEN — Đối chiếu hộ khẩu (d4–d5)

```
s = giấy SHK của lượt
nếu không có s:                               vi phạm (R4, E5); dừng R4
với mỗi giấy x ≠ s có trường chủ giấy:
    nếu x.<trường chủ giấy> ≠ s.ho_ten:       vi phạm (R4, E2)
với mỗi giấy x ≠ s có trường năm sinh:
    nếu x.<trường năm sinh> ≠ s.nam_sinh:     vi phạm (R4, E2)
```

### 4.6. R5-CHUNG-TU — Chứng từ hàng hoá (d5)

```
HH = các dòng hàng có category ∈ {HANG_TIEU_DUNG, THUC_PHAM, VAT_TU}
nếu HH rỗng: bỏ qua R5
CT = các giấy HDHTX và GPVC của lượt
nếu CT rỗng:                                  vi phạm (R5, E5); dừng R5
với mỗi GPVC p: nếu hôm_nay > p.co_gia_tri_den: vi phạm (R5, E1)
với mỗi c trong CT: nếu dấu c không hợp lệ:   vi phạm (R5, E3)
CT_hop_le = các c trong CT còn hạn và dấu hợp lệ
với mỗi h trong HH:
    nếu không có c trong CT_hop_le có mat_hang phủ h:  vi phạm (R5, E6)
```

### 4.7. R5K-KHOAN — Miễn định mức cho sản phẩm khoán (d5, có điều kiện)

Không tự sinh vi phạm. Chỉ tham gia vào công thức hạn mức ở mục 4.3. Chỉ có hiệu lực khi `KN-KHOAN` đã kích hoạt trước d5 (mục 6).

### 4.8. R6-HANG-CAM — Danh mục hàng cấm (d6)

Mọi quy định R1–R5 hết hiệu lực. Không cần giấy tờ.

```
với mỗi dòng hàng h:
    nếu h.ma ∈ danh_muc của R6:               vi phạm (R6, null)
```

### 4.9. Hàm đánh giá

```
evaluate(luot, ngay, state):
    vi_pham = []
    với mỗi r trong active(ngay, state) theo thứ tự trong rules.json:
        vi_pham += chạy hàm r.check với r.params
    loại trùng cặp (rule, error)
    phan_quyet = vi_pham rỗng ? CHO_QUA : GIU_LAI
    trả về { phan_quyet, vi_pham }
```

Đây phải là **hàm thuần** trong `src/engine/`, không đọc giao diện, không đọc thời gian thật. `validate-data.ts` gọi đúng hàm này.

---

## 5. Hành động và chấm từng lượt

### 5.1. Trình tự một lượt

1. Hiện lời thoại, lọc theo `when`.
2. Nếu lượt có `bribe`: phong bì xuất hiện sau lời thoại, kèm `bribe.lines`.
3. Người chơi kiểm tra giấy tờ và sổ.
4. Người chơi chọn hành động. Nếu đã nhận phong bì thì chỉ được chọn `CHO_QUA` hoặc `LAM_NGO`.
5. Nếu ngày bật kiến nghị và hành động khác `LAM_NGO`: người chơi có thể lập biên bản (mục 6).
6. Hiện `reactions` của hành động đã chọn.
7. Engine cập nhật chỉ số, đồng hồ, cờ.
8. Nếu quyết định sai và có ghi sổ: giấy nhắc nhở hiện **đầu lượt sau**, dùng `reprimand` của quy định vi phạm đầu tiên (để lọt), hoặc chuỗi `reprimand.giu_oan` (giữ oan).

### 5.2. Đúng và sai theo sổ

Gọi `hv` là "lượt có vi phạm theo `evaluate`".

| Hành động | `hv` = có | `hv` = không | Có ghi sổ |
|---|---|---|---|
| `CHO_QUA` | **Sai** — để lọt | Đúng | Có |
| `GIU_LAI` | Đúng | **Sai** — giữ oan | Có |
| `LAM_NGO` | Làm ngơ vi phạm | Đúng (vô hại) | **Không** |

### 5.3. Cập nhật sau mỗi lượt

```
total += 1
correct = (CHO_QUA và không hv) hoặc (GIU_LAI và hv) hoặc (LAM_NGO và không hv)
nếu correct: correct_total += 1

nếu action ≠ LAM_NGO:
    recorded += 1
    nếu correct: correct_recorded += 1
    ngược lại:   reprimands += 1; reprimands_hom_nay += 1

nếu action = LAM_NGO và hv: lam_ngo_violations += 1

nếu action = GIU_LAI:
    hang_tich_thu_kg += tổng so_luong các dòng hàng don_vi = kg, trừ DO_CA_NHAN
    so_vu_giu_lai += 1

nếu nhận phong bì: bribes_accepted += 1; bribe_total += bribe.amount; tien_hom_nay += bribe.amount

chỉ số huyện += outcomes[action].deltas   (LAM_NGO không khai báo thì dùng outcomes.CHO_QUA)
đồng hồ += clock.per_traveler_min
nếu có flag_key: ghi cờ = mã quyết định (mục 1.10)
```

`LAM_NGO` không ghi sổ nên **cấp trên không biết**: nó không làm giảm `reported_compliance` và không bị nhắc nhở. Nhưng nó vẫn làm giảm `true_compliance`. Khoảng cách giữa hai con số này là một trong những điều kết cục sẽ phơi ra.

---

## 6. Kiến nghị

### 6.1. Điều kiện lập biên bản

- Ngày có `kn_enabled = true` (d3, d4, d5).
- Hành động là `CHO_QUA` hoặc `GIU_LAI`. Làm ngơ không để lại dấu vết nên không kèm biên bản được.
- Tối đa một biên bản mỗi lượt.

### 6.2. Chọn lý do

Khi bấm "Lập biên bản", giao diện hiện **toàn bộ lý do của mọi vấn đề đã mở** (`unlock_day` ≤ hôm nay), xáo thứ tự. Với hai vấn đề hiện có, người chơi chọn một trong hai lý do. Không có lý do nào luôn đúng: lý do phải khớp vấn đề của lượt.

### 6.3. Biên bản hợp lệ

```
hop_le = luot.kn ≠ null VÀ ly_do_da_chon thuộc vấn đề luot.kn.issue
nếu hop_le:
    valid_reports += 1
    dem[luot.kn.issue] += 1
ngược lại:
    invalid_reports += 1
đồng hồ += clock.per_report_min        (tính cả khi không hợp lệ)
```

Biên bản không hợp lệ không bị phạt tiền, nhưng tốn thời gian và làm trạm trưởng Đối khó chịu (lời chen giữa).

### 6.4. Chạm ngưỡng và hiệu ứng

```
nếu dem[vấn đề] ≥ threshold VÀ vấn đề chưa kích hoạt:
    đánh dấu kích hoạt tại ngày hiện tại
    issues_triggered += 1
    ngày_hiệu_lực =
        delay = next_day → ngày kế tiếp
        delay = next_act → ngày đầu của màn kế tiếp
    từ ngày_hiệu_lực: vấn đề ∈ state.issues_active
```

Với `delay = next_act` và ngưỡng 3:

| Chạm ngưỡng ở | Có hiệu lực từ | Tác dụng thực tế |
|---|---|---|
| d3 hoặc d4 | d5 | R5K bật ở d5: giấy khoán được công nhận |
| d5 | d6 | Sổ đã bị thu hồi ở d6, chỉ còn hiệu ứng tường thuật |

`KN-THUONG-BINH` có hiệu ứng `narrative`: không đổi luật, chỉ bật các dòng `when: issue_triggered` ở màn 4 và kết cục.

Độ trễ này là cố ý: tiếng nói từ cơ sở có đi lên, nhưng chậm.

---

## 7. Đồng hồ ca và hai bảng chỉ số

### 7.1. Đồng hồ ca

Đồng hồ **không chạy theo thời gian thật**. Nó chỉ tăng theo hành động:

| Sự kiện | Mặc định |
|---|---|
| Bắt đầu ca | 07:00 |
| Mỗi lượt | +100 phút |
| Mỗi biên bản | +60 phút |
| Hết ca | 17:00 |

Hết lượt cuối mà đồng hồ quá giờ hết ca thì ngày đó **làm ngoài giờ**: `overtime_days += 1` và xếp loại ngày hạ một bậc. Với ngày 5 lượt, lập từ 2 biên bản trở lên là quá giờ. Đây là cái giá của kiến nghị.

### 7.2. Bảng trái — "Báo cáo gửi cấp trên"

| Dòng | Công thức |
|---|---|
| Tỷ lệ chấp hành | `correct_recorded_hôm_nay / recorded_hôm_nay`, làm tròn % |
| Số vụ giữ lại | `so_vu_giu_lai` trong ngày |
| Hàng hoá tịch thu | `hang_tich_thu_kg` trong ngày |
| Biên bản kiến nghị đã gửi | số biên bản hợp lệ trong ngày |
| Xếp loại | xem dưới |

```
ty_le = tỷ lệ chấp hành hôm nay (recorded_hôm_nay = 0 thì coi là 100%)
xep_loai = ty_le ≥ 90% → XUẤT SẮC
           ty_le ≥ 70% → KHÁ
           còn lại     → TRUNG BÌNH
nếu làm ngoài giờ: hạ một bậc (TRUNG BÌNH giữ nguyên)
```

### 7.3. Bảng phải — "Tình hình huyện (số liệu mô phỏng)"

```
chỉ số cuối ngày = chỉ số đầu ngày
                 + tổng outcomes[action].deltas của các lượt trong ngày
                 + other_factor.deltas của ngày
```

| Dòng hiển thị | Cách hiện |
|---|---|
| Lương thực vào thị xã | % thay đổi so với đầu ngày: "giảm 14%" |
| Số hộ thiếu ăn | "đầu ngày → cuối ngày": "210 → 265" |
| Giá gạo ngoài chợ (chỉ số) | "đầu ngày → cuối ngày": "100 → 137" |
| Ghi chú của từng lượt | `outcomes[action].notes`, theo thứ tự lượt |
| Yếu tố khác | `other_factor.text` |

Chỉ số không bao giờ âm. Nếu phép cộng ra số âm thì giữ ở 0.

**Hướng dẫn cỡ số** cho người viết:

| Nguồn | `luong_thuc_vao_thi_xa` | `ho_thieu_an` | `gia_gao_index` |
|---|---|---|---|
| Một lượt | ±1 đến ±3 | ±2 đến ±15 | ±1 đến ±5 |
| Yếu tố khác của một ngày | ±5 đến ±15 | ±10 đến ±40 | ±5 đến ±20 |

Yếu tố khác phải đủ lớn để có ngày huyện xấu đi bất kể trạm làm gì. Ở d6, yếu tố khác đảo chiều nhưng chỉ ở mức nhỏ.

---

## 8. Chi tiêu gia đình

### 8.1. Dòng tiền mỗi ngày

```
tien_mang_sang = tiền cuối ngày trước        (d1: savings_start)
nếu ngày có currency_reform_divisor:
    tien_mang_sang = làm tròn xuống(tien_mang_sang / divisor)
co_the_chi = tien_mang_sang
           + economy.income
           + economy.bonus_xuat_sac (nếu xếp loại XUẤT SẮC)
           − economy.fine_per_error × reprimands_hôm_nay
           + tien_hom_nay (phong bì)
```

Nếu `co_the_chi` âm thì giữ ở 0.

Cuối ngày, người chơi đánh dấu các khoản trong `economy.expenses` muốn trả. Tổng không được vượt `co_the_chi`.

```
tiền cuối ngày = co_the_chi − tổng đã trả
với mỗi khoản essential không trả: hardship += 1
```

Bảng chi tiêu hiện riêng tiền phong bì thành một dòng, để người chơi thấy nó cùng lúc với dòng giá gạo ở bảng phải.

`currency_reform_divisor = 10` đặt ở d5: đổi tiền tháng 9/1985, 10 đồng cũ ăn 1 đồng mới.

### 8.2. Số mặc định đề xuất (mô phỏng, KB chỉnh trong `days.json`)

| Ngày | Thu | Phạt mỗi lỗi | Thưởng | Gạo | Than | Thuốc mẹ | Thuốc Bình | Học phí Mai | Tổng chi thiết yếu |
|---|---|---|---|---|---|---|---|---|---|
| d1–d2 | 20 | 2 | 3 | 8 | 3 | 4 | — | 2 | 17 |
| d3–d4 | 22 | 3 | 3 | 11 | 4 | 6 | — | 2 | 23 |
| d5 | 420 | 40 | 30 | 230 | 60 | 90 | 120 | 20 | 520 |
| d6 | 1500 | — | — | 800 | 180 | 300 | — | 80 | 1360 |

`savings_start` = 10. Màn 1 dư dả, màn 2 hụt nhẹ, màn 3 hụt nặng đến mức không trả nổi mọi khoản thiết yếu — đúng lúc phong bì xuất hiện. Phong bì của gã đầu cơ gạo ở d5 nên đặt `amount = 120`, bằng tiền thuốc của bé Bình. Màn 4 dư ít, không nhảy vọt.

---

## 9. Chọn kết cục

### 9.1. Định nghĩa chỉ số ẩn

| Chỉ số | Định nghĩa |
|---|---|
| `true_compliance` | `correct_total / total`, từ 0 đến 1 |
| `reported_compliance` | `correct_recorded / recorded`, từ 0 đến 1 |
| `valid_reports` | Tổng biên bản hợp lệ |
| `invalid_reports` | Tổng biên bản không hợp lệ |
| `lam_ngo_violations` | Số lần làm ngơ lượt có vi phạm |
| `bribes_accepted` | Số phong bì đã nhận |
| `bribe_total` | Tổng tiền phong bì |
| `issues_triggered` | Số vấn đề kiến nghị đã chạm ngưỡng |
| `hardship` | Số khoản thiết yếu không trả được |
| `overtime_days` | Số ngày làm ngoài giờ |
| `reprimands` | Số giấy nhắc nhở |

### 9.2. Luật chọn

Xét `endings.json` theo `priority` tăng dần. Chọn kết cục **đầu tiên** mà mọi điều kiện đều đúng. `END-SONG-SOT` không có điều kiện, nên luôn bắt được.

| Thứ tự | Kết cục | Điều kiện (nối bằng VÀ) |
|---|---|---|
| 1 | `END-AN-TIEN` | `bribes_accepted ≥ 2` |
| 2 | `END-LAM-NGO` | `lam_ngo_violations ≥ 4` |
| 3 | `END-KIEN-NGHI` | `valid_reports ≥ 4`, `issues_triggered ≥ 1`, `lam_ngo_violations ≤ 1` |
| 4 | `END-GAC-CONG` | `true_compliance ≥ 0.85`, `valid_reports = 0`, `lam_ngo_violations = 0` |
| 5 | `END-SONG-SOT` | — |

**Vì sao thứ tự này:** hành vi sai về đạo đức được xét trước, nên người vừa kiến nghị vừa nhận tiền vẫn là người ăn tiền. Người kiến nghị **không bị đòi hỏi chấp hành cao**, vì cho bà Tư qua kèm biên bản là sai theo sổ nhưng vẫn là con đường game khuyến khích. Điều bị chặn là làm ngơ: quá 1 lần thì không còn là người kiến nghị.

### 9.3. Tính khả thi của từng kết cục

Nội dung phải bảo đảm người chơi **có thể** đạt mọi kết cục. `validate-data.ts` tầng 3 kiểm tra các điều kiện ở mục 10 để bảo đảm điều này.

| Kết cục | Nội dung cần có |
|---|---|
| `END-AN-TIEN` | Ít nhất 2 lượt có phong bì. Khuyến nghị 3: một ở d4, hai ở d5 |
| `END-LAM-NGO` | Ít nhất 4 lượt có vi phạm. Luôn thoả |
| `END-KIEN-NGHI` | Ít nhất 4 dịp kiến nghị hợp lệ trong d3–d5, và ít nhất một vấn đề có đủ 3 dịp |
| `END-GAC-CONG` | Luôn thoả |

---

## 10. Ràng buộc nội dung cho validate

### Tầng 1 — cấu trúc

Mọi file khớp schema. Cấu hình Ajv:

```ts
new Ajv2020({ strict: true, allErrors: true, allowUnionTypes: true, allowMatchingProperties: true })
```

`allowMatchingProperties` cần cho `strings.schema.json`, nơi các khoá bắt buộc vừa khai trong `properties` vừa khớp `patternProperties`.

### Tầng 2 — tham chiếu chéo

1. Mỗi `days[i].travelers` trỏ đến lượt có thật; mỗi lượt thuộc đúng một ngày, `day` và `order` khớp vị trí.
2. Số lượt mỗi ngày đúng 3, 4, 4, 5, 5, 5.
3. Mọi `character`, `speaker`, `member`, `ruleId`, `issueId` đều tồn tại.
4. `characters[].appearances` khớp đúng các lượt có `character` đó.
5. Với nhân vật có `fixed_fields`: mọi giấy có trường chủ giấy của họ ghi đúng `ho_ten`, mọi giấy có trường năm sinh ghi đúng `nam_sinh` — **trừ khi lượt đó cài E2 có chủ đích** trong `planted`.
6. `documents.json` có đúng 8 loại, trường trùng khớp `$defs/doc_*` của `travelers.schema.json`.
7. Không giấy nào xuất hiện trước `introduced_day` của loại đó.
8. Mã thuốc trong `cargo` không có trong danh mục R3 được coi là thuốc không quản lý. Validate liệt kê chúng dạng thông tin để KB xác nhận là cố ý.
9. Mọi dòng hàng `HANG_CAM` phải có mã trong danh mục R6, và ngược lại mọi dòng hàng có mã trong danh mục R6 phải thuộc nhóm `HANG_CAM`.
10. Mỗi `flag_key` chỉ dùng cho một lượt. Mọi cờ được nhắc trong `when` phải được ghi ở một lượt **trước** chỗ dùng.

### Tầng 3 — logic

1. Với mỗi lượt, `evaluate` phải ra đúng `expected`, xét **trong cả hai trạng thái** `KN-KHOAN` kích hoạt và không kích hoạt nếu lượt đó ở d5. Nếu hai trạng thái cho kết quả khác nhau, `expected` ghi theo trạng thái không kích hoạt, và validate báo thông tin chứ không báo lỗi.
2. Mỗi lỗi trong `planted` mà quy định kiểm tra nó đang hiệu lực phải có mặt trong kết quả `evaluate`. Lỗi nào quy định chưa hiệu lực thì báo "lỗi ngủ" dạng thông tin.
3. Mỗi vi phạm `evaluate` tìm ra mà **không có** trong `planted` → cảnh báo "lỗi vô tình".
4. Ít nhất 5 lượt có nhãn `buon-lau-that`, và tất cả đều có `expected.verdict = GIU_LAI`.
5. d3–d4 có ít nhất 3 lượt `kn.issue = KN-KHOAN`.
6. `anh-hung` có ít nhất 3 lượt trong d3–d5 với `kn.issue = KN-THUONG-BINH`.
7. d6 có đúng 5 lượt, ít nhất 1 lượt vi phạm R6.
8. Ít nhất 2 lượt có `bribe`.
9. Tổng số dịp kiến nghị hợp lệ trong d3–d5 ≥ 4.
10. Mỗi nhân vật `chinh` xuất hiện ít nhất 3 lần.
11. Không lượt nào vừa có `bribe` vừa có `kn`. Nhận tiền và kiến nghị cùng một lượt tạo ra kết hợp khó hiểu cho người chơi.

---

## 11. Ví dụ hoàn chỉnh: bà Tư mang giấy khoán

Đây là lượt mẫu dùng làm cổng qua của bước 1 trong README: viết tay bằng JSON, chạy validate tầng 1 và qua. Nó cũng là ví dụ đầu vào – đầu ra cho prompt P1.

Ngày d3 (16/3/1981). Sổ có Điều 1, 2, 3. KN-KHOAN chưa kích hoạt.

**Engine tính:**

- R1: GDD còn hạn đến 20/3, dấu UBND xã Phú Hoà khớp nơi đi, 18 kg gạo được khai đủ. Không vi phạm.
- R2: 18 kg gạo, hạn mức 5 kg. Không có tem phiếu. R5K chưa hiệu lực nên giấy khoán không được cộng. 18 > 5 → **(R2, E4)**.
- R3: không mang thuốc. Bỏ qua.
- Phán quyết: **GIU_LAI**.

Nếu cùng lượt này rơi vào d5 với KN-KHOAN đã kích hoạt, hạn mức thành 5 + 13 = 18 kg và R2 không còn vi phạm. Đây là cách game cho người chơi thấy biên bản của họ có tác dụng.

```json
{
  "id": "d3-t3",
  "day": "d3",
  "order": 3,
  "character": "ba-tu",
  "tags": ["luot-trung-tam", "dung-trinh-bay", "dong-cam"],
  "portrait": { "expression": "lo-lang" },
  "dialogue": [
    { "speaker": "ba-tu", "text": "Chú Thành, lại gặp chú. Gạo này là phần vượt khoán nhà tôi được hưởng, hợp tác xã có giấy xác nhận đây." },
    { "speaker": "ba-tu", "text": "Tôi mang ra thị xã đổi thuốc cho thằng cháu. Nó sốt mấy hôm nay rồi." },
    { "speaker": "ba-tu", "text": "Lần trước chú cho tôi qua, tôi vẫn nhớ.", "when": [ { "flag": "ba-tu.m1", "in": ["qua", "qua-kn"] } ] }
  ],
  "reactions": {
    "CHO_QUA": [ { "speaker": "ba-tu", "text": "Tôi cảm ơn chú." } ],
    "GIU_LAI": [ { "speaker": "ba-tu", "text": "Giấy hợp tác xã cấp đàng hoàng mà chú..." } ]
  },
  "documents": [
    {
      "type": "GDD",
      "fields": {
        "ho_ten": "Trần Thị Lành",
        "nam_sinh": 1929,
        "noi_di": "Phú Hoà",
        "noi_den": "Thị xã",
        "ly_do": "Mang sản phẩm vượt khoán đi đổi thuốc",
        "hang_mang_theo": [ { "ma": "gao", "ten": "Gạo", "so_luong": 18, "don_vi": "kg" } ],
        "ngay_cap": "1981-03-14",
        "co_gia_tri_den": "1981-03-20"
      },
      "seal": { "kind": "UBND_XA", "place": "Phú Hoà", "legible": true }
    },
    {
      "type": "GXNK",
      "fields": {
        "ho_ten": "Trần Thị Lành",
        "xa": "Phú Hoà",
        "htx_ten": "HTX nông nghiệp Phú Hoà",
        "san_pham": "Gạo",
        "san_pham_ma": "gao",
        "so_luong_kg": 13,
        "vu": "Vụ mùa 1980",
        "ngay": "1981-03-10"
      },
      "seal": { "kind": "HTX", "place": "Phú Hoà", "legible": true }
    }
  ],
  "cargo": [
    { "ma": "gao", "ten": "Gạo", "so_luong": 18, "don_vi": "kg", "category": "LUONG_THUC" }
  ],
  "planted": [
    { "error": "E4", "doc": null, "field": null, "note": "18 kg gạo, vượt định mức 5 kg. Phần vượt đúng bằng 13 kg ghi trên giấy khoán, nhưng sổ chưa có mục nào công nhận giấy khoán." }
  ],
  "expected": {
    "verdict": "GIU_LAI",
    "violations": [ { "rule": "R2-DINH-MUC", "error": "E4" } ]
  },
  "kn": { "issue": "KN-KHOAN", "note": "Giấy khoán đã có theo chủ trương cấp trên nhưng sổ chỉ thị của trạm chưa công nhận." },
  "bribe": null,
  "flag_key": "ba-tu.m2",
  "outcomes": {
    "CHO_QUA": { "deltas": { "luong_thuc_vao_thi_xa": 1, "gia_gao_index": -1 }, "notes": ["Gạo khoán của bà Tư đến được chợ thị xã."] },
    "GIU_LAI": { "deltas": { "ho_thieu_an": 4 }, "notes": ["18 kg gạo bị tịch thu. Bà Tư không đổi được thuốc cho cháu."] }
  },
  "art_note": "Bà Tư đội nón, gánh hai thúng gạo. Tay cầm tờ giấy khoán gấp tư."
}
```

> KB cần đối chiếu chi tiết mùa vụ trên giấy khoán ("Vụ mùa 1980") với thời điểm Chỉ thị 100 trong `04-sources.md` trước khi chốt nội dung thật.

---

## 12. Quyết định thiết kế cần nhóm duyệt

Các điểm sau là lựa chọn của tài liệu này, không có sẵn trong `00-idea.md`. Nhóm cần đồng ý hoặc sửa trước khi viết nội dung.

| # | Quyết định | Lý do |
|---|---|---|
| 1 | Chỉ 2 vấn đề kiến nghị. `KN-KHOAN` đổi luật, `KN-THUONG-BINH` chỉ có hiệu ứng tường thuật | Đủ cho màn chọn "2–3 lý do". Thêm vấn đề thứ ba đòi thêm ít nhất 3 lượt nội dung |
| 2 | E6 được hiểu là **giấy tờ không phủ hàng thực mang theo**, không phải "lý do đi không hợp với hàng" | Engine không đọc được ý nghĩa của lý do. Lý do vẫn được viết để gợi ý người chơi |
| 3 | R1 yêu cầu khai toàn bộ hàng trên GDD, trừ đồ cá nhân | Là cách duy nhất để lượt buôn thuốc lá ở màn 1 bị bắt khi sổ mới chỉ có Điều 1 |
| 4 | Tem phiếu hợp lệ được cộng vào định mức R2 | Cho tem phiếu một vai trò thật trong luật, và tạo lỗi "tem phiếu tháng trước" |
| 5 | Làm ngơ không bị cấp trên biết. Có hai tỷ lệ chấp hành: báo cáo và thực tế | Làm rõ vì sao làm ngơ trông có vẻ an toàn, và kết cục phơi ra cái giá thật |
| 6 | Đồng hồ ca tăng theo hành động, không chạy thời gian thật | Không ép người chơi vội khi đang trình bày trước lớp. Áp lực thời gian vẫn đến từ kiến nghị |
| 7 | Hiệu ứng `KN-KHOAN` trễ sang màn kế tiếp | Chạm ngưỡng ở màn 2 thì có hiệu lực ở màn 3, đúng "sớm hơn màn 4" như ý tưởng gốc, và thể hiện bộ máy chậm |
| 8 | Mỗi ngày chơi là một tuần; đổi tiền ở d5 chia tiền mang sang cho 10 | Để bảng chi tiêu có nghĩa, và đưa sự kiện đổi tiền 9/1985 vào cơ chế |
| 9 | d6 chỉ còn R6. Không cần giấy tờ | Thể hiện trực tiếp nội dung xoá bỏ cấm đoán lưu thông |
| 10 | Danh mục thuốc quản lý và danh mục hàng cấm là hư cấu – mô phỏng | Không tìm được nguồn danh mục chính xác cho trạm cấp huyện. Ghi rõ trong màn chú thích mở đầu |
| 11 | Nhận phong bì thì chỉ được cho qua hoặc làm ngơ | Tránh kết hợp vô lý "nhận tiền rồi vẫn giữ hàng" |
