# Template T1 — Lượt khách

> Trạng thái: CHỐT

Mỗi lượt khách là một khối bắt đầu bằng `## LƯỢT <mã-lượt>`. Các khối lượt nằm trong file `content/ngay-N.md`, ngay sau khối ngày viết theo T2.

Khối này được prompt P1 chuyển thành một phần tử của `data/travelers.json`. Luật chơi đứng sau từng trường nằm ở `docs/03-rules-spec.md`.

## Quy tắc viết

1. **Không đổi, không thêm, không bỏ tiêu đề nào.** P1 dựa vào đúng chữ của tiêu đề để biết đoạn nào là trường nào. Mục không dùng thì ghi `- không`.
2. **Mọi mã viết đúng như bảng tra cứu ở cuối file**, không dấu, đúng hoa thường.
3. Chữ trong lời thoại được chép nguyên văn sang JSON. Muốn sửa câu chữ thì sửa ở đây trước khi chuyển, sau khi chuyển thì sửa trên JSON (xem README mục 3).
4. Số thập phân dùng dấu chấm: `5.5`.

## Ký hiệu

| Cần viết | Cách viết | Ví dụ |
|---|---|---|
| Trống | `không` | `- Vấn đề: không` |
| Có / không | `có`, `không` | `- Giấy bị hỏng: có` |
| Ngày | `YYYY-MM-DD` | `1981-03-20` |
| Tháng | `YYYY-MM` | `1981-03` |
| Mặt hàng | `Tên (mã): số lượng đơn vị` | `Gạo (gao): 18 kg` |
| Dấu | `LOẠI_DẤU / nơi / rõ` hoặc `mờ` | `UBND_XA / Phú Hoà / rõ` |
| Không có dấu | `không có` | `- Dấu: không có` |
| Một câu thoại | `- [mã người nói] nội dung` | `- [ba-tu] Chú Thành, lại gặp chú.` |
| Câu thoại có điều kiện | `- [mã] {nếu điều kiện} nội dung` | `- [ba-tu] {nếu ba-tu.m1 = qua, qua-kn} Lần trước chú cho tôi qua.` |
| Điều kiện theo cờ | `<cờ> = <giá trị>, <giá trị>` | `ba-tu.m2 = giu, giu-kn` |
| Điều kiện theo kiến nghị | `<vấn đề> đã kích hoạt` hoặc `chưa kích hoạt` | `KN-KHOAN đã kích hoạt` |
| Nhiều điều kiện | nối bằng ` và ` | `{nếu ba-tu.m2 = giu và KN-KHOAN chưa kích hoạt}` |
| Một vi phạm | `<quy định>/<lỗi>` | `R2-DINH-MUC/E4` |
| Vi phạm R6 | `R6-HANG-CAM/-` | |

Người nói có thể là mã nhân vật, hoặc `traveler` (người đang ở ô cửa), `radio`, `narrator`.

## Khối để chép

Chép nguyên khối dưới đây, rồi điền. Mẫu từng loại giấy nằm ở phần sau.

```markdown
## LƯỢT dX-tY

### Thông tin chung
- Mã lượt: dX-tY
- Nhân vật: 
- Nhãn: không
- Biểu cảm: binh-thuong
- Cờ ghi lại: không

### Lời thoại
- [traveler] 

### Phản ứng
#### Khi CHO QUA
- không
#### Khi GIỮ LẠI
- không
#### Khi LÀM NGƠ
- không

### Giấy tờ
- không

### Hàng mang theo
| Mã | Tên | Số lượng | Đơn vị | Nhóm | Giấu |
|---|---|---|---|---|---|

### Lỗi cài cắm
| Lỗi | Giấy | Trường | Ghi chú |
|---|---|---|---|

### Đáp án mong đợi
- Phán quyết: 
- Vi phạm: không

### Kiến nghị
- Vấn đề: không
- Ghi chú: không

### Phong bì
- Số tiền: không
- Hậu quả: không
- Lời thoại:
  - không

### Hậu quả
#### Khi CHO QUA
- Lương thực vào thị xã: 0
- Hộ thiếu ăn: 0
- Giá gạo: 0
- Ghi chú:
  - không
#### Khi GIỮ LẠI
- Lương thực vào thị xã: 0
- Hộ thiếu ăn: 0
- Giá gạo: 0
- Ghi chú:
  - không
#### Khi LÀM NGƠ
- Giống khi CHO QUA

### Ghi chú art

```

## Hướng dẫn từng mục

### Thông tin chung

| Dòng | Điền gì |
|---|---|
| Mã lượt | `d<ngày>-t<thứ tự>`. Phải trùng với tiêu đề khối và với danh sách "Thứ tự lượt khách" của ngày |
| Nhân vật | Mã nhân vật. Nhân vật một lần dùng `np-...` và phải có trong `content/characters.md` |
| Nhãn | Một hoặc nhiều nhãn, cách nhau bằng dấu phẩy, hoặc `không` |
| Biểu cảm | Một biểu cảm, phải nằm trong danh sách biểu cảm của nhân vật ở `characters.md` |
| Cờ ghi lại | `<mã-nhân-vật>.m<màn>` nếu quyết định ở lượt này cần được nhớ để đổi lời thoại về sau. Nếu không thì `không`. Giá trị cờ do engine tự ghi |

### Lời thoại

Ít nhất một câu. Câu có `{nếu ...}` chỉ hiện khi điều kiện đúng. Cờ được nhắc trong điều kiện phải được ghi ở một lượt **trước** lượt này.

### Phản ứng

Câu người khách nói sau khi người chơi quyết định. Mục nào không cần thì để `- không`. Nếu cả ba đều `không` thì lượt này không có phản ứng.

### Giấy tờ

Mỗi giấy là một tiểu mục `#### Giấy <MÃ>`, chép từ mẫu ở phần sau. Người không có giấy nào thì để `- không`. Thứ tự các giấy là thứ tự chúng được đẩy qua khe.

Tên người và năm sinh trên giấy phải khớp `characters.md`, **trừ khi bạn cố ý cài lỗi E2** và ghi nó vào "Lỗi cài cắm".

### Hàng mang theo

Một dòng cho mỗi mặt hàng thực mang theo, **kể cả hàng không khai trên giấy**. Bảng trống nghĩa là không mang gì.

- **Mã**: kebab-case không dấu. Cùng một mặt hàng phải dùng cùng một mã ở đây và trên mọi giấy.
- **Nhóm**: xem bảng tra cứu. Đồ cá nhân dùng `DO_CA_NHAN` để không phải khai trên giấy đi đường.
- **Giấu**: `có` nếu hàng nằm trong bao tải, dưới thúng. Chỉ ảnh hưởng cách hiển thị, engine vẫn kiểm tra.

### Lỗi cài cắm

Một dòng cho mỗi lỗi **bạn cố ý cài**. Bảng trống nghĩa là lượt này không có lỗi cố ý.

- **Giấy**: mã loại giấy, hoặc `-` nếu lỗi không nằm trên giấy nào (ví dụ E4 vượt định mức).
- **Trường**: tên trường đúng như trong mẫu giấy (`Có giá trị đến`, `Dấu`…), hoặc `-`.
- Lỗi cài vào mà sổ chưa có quy định kiểm tra thì vẫn ghi. Validate sẽ báo nó là "lỗi ngủ" để xác nhận bạn cố ý.

### Đáp án mong đợi

Đáp án **theo sổ** của ngày đó, do bạn tự tính bằng tay. Engine sẽ tính lại và validate báo nếu lệch.

- **Phán quyết**: `CHO_QUA` hoặc `GIU_LAI`. Không bao giờ là `LAM_NGO`.
- **Vi phạm**: `không` nếu cho qua; nếu giữ lại thì liệt kê mọi vi phạm, cách nhau bằng dấu phẩy.

### Kiến nghị

Lượt này có phải dịp lập biên bản kiến nghị hợp lệ không. Chỉ dùng ở d3, d4, d5.

### Phong bì

`Số tiền: không` nếu không có phong bì. Một lượt không được vừa có phong bì vừa có kiến nghị.

### Hậu quả

Thay đổi chỉ số huyện khi người chơi chọn từng hành động. Số `0` nghĩa là không đổi. Xem cỡ số gợi ý ở `03-rules-spec.md` mục 7.3.

"Ghi chú" là các dòng hiện ở bảng "Tình hình huyện" cuối ngày. Mục "Khi LÀM NGƠ" để `- Giống khi CHO QUA` nếu hậu quả như nhau, vì cả hai đều để hàng đi qua.

### Ghi chú art

Một đoạn văn tả người khách và hàng hoá cho người vẽ.

## Mẫu từng loại giấy

Chép đúng tiểu mục của loại giấy cần dùng vào mục "Giấy tờ". Mọi dòng đều bắt buộc, trừ `Giấy bị hỏng` (bỏ đi nếu không hỏng).

```markdown
#### Giấy GDD
- Họ và tên: 
- Năm sinh: 
- Nơi đi (xã): 
- Nơi đến: 
- Lý do: 
- Hàng mang theo:
  - Tên (ma): 0 kg
- Ngày cấp: 
- Có giá trị đến: 
- Dấu: UBND_XA /  / rõ

#### Giấy SHK
- Số sổ: 
- Chủ hộ: 
- Họ và tên: 
- Năm sinh: 
- Quan hệ với chủ hộ: 
- Địa chỉ: 
- Dấu: CONG_AN /  / rõ

#### Giấy TP
- Người được mua: 
- Tháng: 
- Mặt hàng:
  - Tên (ma): 0 kg
- Dấu: PHONG_LUONG_THUC /  / rõ

#### Giấy HDHTX
- Số hoá đơn: 
- Hợp tác xã: 
- Người nhận hàng: 
- Mặt hàng:
  - Tên (ma): 0 kg
- Ngày: 
- Dấu: HTX /  / rõ

#### Giấy GPVC
- Số giấy phép: 
- Đơn vị cấp: 
- Người vận chuyển: 
- Mặt hàng:
  - Tên (ma): 0 kg
- Từ: 
- Đến: 
- Ngày cấp: 
- Có giá trị đến: 
- Dấu: CTY_THUONG_NGHIEP /  / rõ

#### Giấy DT
- Bệnh nhân: 
- Thuốc:
  - Tên (ma): 0 lo
- Bác sĩ: 
- Ngày kê: 
- Có giá trị đến: 
- Dấu: BENH_VIEN /  / rõ

#### Giấy CNTB
- Họ và tên: 
- Năm sinh: 
- Hạng: 
- Số thẻ: 
- Đơn vị cấp: 
- Dấu: TB_XH /  / rõ

#### Giấy GXNK
- Xã viên: 
- Xã: 
- Hợp tác xã: 
- Sản phẩm: 
- Mã sản phẩm: 
- Số lượng vượt khoán (kg): 
- Vụ: 
- Ngày xác nhận: 
- Dấu: HTX /  / rõ
```

Các trường "Hàng mang theo", "Mặt hàng", "Thuốc" có thể có nhiều dòng con. Riêng tem phiếu chỉ có **đúng một** dòng mặt hàng.

## Ví dụ đã điền

Lượt trung tâm của màn 2. Bản JSON tương ứng ở `03-rules-spec.md` mục 11.

```markdown
## LƯỢT d3-t3

### Thông tin chung
- Mã lượt: d3-t3
- Nhân vật: ba-tu
- Nhãn: luot-trung-tam, dung-trinh-bay, dong-cam
- Biểu cảm: lo-lang
- Cờ ghi lại: ba-tu.m2

### Lời thoại
- [ba-tu] Chú Thành, lại gặp chú. Gạo này là phần vượt khoán nhà tôi được hưởng, hợp tác xã có giấy xác nhận đây.
- [ba-tu] Tôi mang ra thị xã đổi thuốc cho thằng cháu. Nó sốt mấy hôm nay rồi.
- [ba-tu] {nếu ba-tu.m1 = qua, qua-kn} Lần trước chú cho tôi qua, tôi vẫn nhớ.

### Phản ứng
#### Khi CHO QUA
- [ba-tu] Tôi cảm ơn chú.
#### Khi GIỮ LẠI
- [ba-tu] Giấy hợp tác xã cấp đàng hoàng mà chú...
#### Khi LÀM NGƠ
- không

### Giấy tờ
#### Giấy GDD
- Họ và tên: Trần Thị Lành
- Năm sinh: 1929
- Nơi đi (xã): Phú Hoà
- Nơi đến: Thị xã
- Lý do: Mang sản phẩm vượt khoán đi đổi thuốc
- Hàng mang theo:
  - Gạo (gao): 18 kg
- Ngày cấp: 1981-03-14
- Có giá trị đến: 1981-03-20
- Dấu: UBND_XA / Phú Hoà / rõ

#### Giấy GXNK
- Xã viên: Trần Thị Lành
- Xã: Phú Hoà
- Hợp tác xã: HTX nông nghiệp Phú Hoà
- Sản phẩm: Gạo
- Mã sản phẩm: gao
- Số lượng vượt khoán (kg): 13
- Vụ: Vụ mùa 1980
- Ngày xác nhận: 1981-03-10
- Dấu: HTX / Phú Hoà / rõ

### Hàng mang theo
| Mã | Tên | Số lượng | Đơn vị | Nhóm | Giấu |
|---|---|---|---|---|---|
| gao | Gạo | 18 | kg | LUONG_THUC | không |

### Lỗi cài cắm
| Lỗi | Giấy | Trường | Ghi chú |
|---|---|---|---|
| E4 | - | - | 18 kg gạo, vượt định mức 5 kg. Phần vượt đúng bằng 13 kg ghi trên giấy khoán, nhưng sổ chưa có mục nào công nhận giấy khoán. |

### Đáp án mong đợi
- Phán quyết: GIU_LAI
- Vi phạm: R2-DINH-MUC/E4

### Kiến nghị
- Vấn đề: KN-KHOAN
- Ghi chú: Giấy khoán đã có theo chủ trương cấp trên nhưng sổ chỉ thị của trạm chưa công nhận.

### Phong bì
- Số tiền: không
- Hậu quả: không
- Lời thoại:
  - không

### Hậu quả
#### Khi CHO QUA
- Lương thực vào thị xã: +1
- Hộ thiếu ăn: 0
- Giá gạo: -1
- Ghi chú:
  - Gạo khoán của bà Tư đến được chợ thị xã.
#### Khi GIỮ LẠI
- Lương thực vào thị xã: 0
- Hộ thiếu ăn: +4
- Giá gạo: 0
- Ghi chú:
  - 18 kg gạo bị tịch thu. Bà Tư không đổi được thuốc cho cháu.
#### Khi LÀM NGƠ
- Giống khi CHO QUA

### Ghi chú art
Bà Tư đội nón, gánh hai thúng gạo. Tay cầm tờ giấy khoán gấp tư.
```

## Bảng tra cứu

| Loại mã | Giá trị hợp lệ |
|---|---|
| Nhân vật | `ba-tu`, `anh-hung`, `ong-quynh`, `thang-ti`, `chi-thu`, `tram-truong-doi`, `thanh`, `hoa`, `be-mai`, `be-binh`, `me-thanh`, `np-...` |
| Người nói đặc biệt | `traveler`, `radio`, `narrator` |
| Nhãn | `huong-dan`, `buon-lau-that`, `luot-trung-tam`, `dung-trinh-bay`, `dong-cam` |
| Biểu cảm | `binh-thuong`, `vui`, `lo-lang`, `buon`, `gian`, `ne-tranh`, `met-moi` |
| Loại giấy | `GDD`, `SHK`, `TP`, `HDHTX`, `GPVC`, `DT`, `CNTB`, `GXNK` |
| Loại dấu | `UBND_XA`, `UBND_HUYEN`, `CONG_AN`, `PHONG_LUONG_THUC`, `HTX`, `CTY_THUONG_NGHIEP`, `BENH_VIEN`, `TRAM_Y_TE`, `TB_XH` |
| Nhóm hàng | `LUONG_THUC`, `THUC_PHAM`, `THUOC`, `HANG_TIEU_DUNG`, `VAT_TU`, `DO_CA_NHAN`, `HANG_CAM` |
| Đơn vị | `kg`, `cay`, `bao`, `hop`, `lo`, `vi`, `vien`, `met`, `chiec`, `lit` |
| Quy định | `R1-GDD`, `R2-DINH-MUC`, `R3-DON-THUOC`, `R4-KHOP-TEN`, `R5-CHUNG-TU`, `R5K-KHOAN`, `R6-HANG-CAM` |
| Lỗi | `E1` hết hạn, `E2` lệch tên hoặc năm sinh, `E3` dấu không hợp lệ, `E4` vượt định mức, `E5` thiếu giấy, `E6` giấy không khai đủ hàng |
| Vấn đề kiến nghị | `KN-KHOAN`, `KN-THUONG-BINH` |
| Giá trị cờ | `qua`, `giu`, `lam-ngo`, `qua-kn`, `giu-kn`, `qua-tien`, `lam-ngo-tien` |
| Mã thuốc quản lý (R3) | `penicillin`, `tetracyclin`, `quinin`, `streptomycin` |
| Mã hàng cấm (R6) | `thuoc-phien`, `vu-khi`, `chat-no`, `hang-nhap-lau` |
