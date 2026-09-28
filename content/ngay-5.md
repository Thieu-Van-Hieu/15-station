# NGÀY d5

> Trạng thái: ĐÃ CHUYỂN JSON

## Thông tin ngày
- Mã ngày: d5
- Màn: 3
- Nhãn hiển thị: Tháng 4/1986 — Ngày 5
- Ngày trong game: 1986-04-14
- Kiến nghị: bật
- Quy định mới: R5-CHUNG-TU

## Thẻ chuyển cảnh
- không

## Đồng hồ ca
- Bắt đầu: 07:00
- Hết ca: 17:00
- Mỗi lượt (phút): 85
- Mỗi biên bản (phút): 60

## Kinh tế
- Thu nhập: 420
- Phạt mỗi lỗi: 40
- Thưởng xuất sắc: 30
- Đổi tiền (chia cho): 10
- Tiền để dành đầu game: không

### Khoản chi
| Mã | Tên | Số tiền | Thiết yếu | Thành viên | Điều kiện |
|---|---|---|---|---|---|
| gao | Gạo đong chợ tự do | 230 | có | | |
| than | Than tổ ong | 60 | có | | |
| thuoc-me | Thuốc huyết áp cho mẹ (bác Nga mang hộ) | 0 | có | me-thanh | hang-xom.m1 = qua, qua-kn, lam-ngo, qua-tien, lam-ngo-tien |
| thuoc-me-cho-den | Thuốc huyết áp cho mẹ (mua chợ đen) | 180 | có | me-thanh | hang-xom.m1 = giu, giu-kn |
| thuoc-binh | Thuốc kháng sinh cho bé Bình | 120 | có | be-binh | |
| hoc-phi-mai | Học phí và tiền sách của Mai | 20 | có | be-mai | |

## Chỉ số đầu game
- không

## Yếu tố khác
- Nội dung: Ảnh hưởng cuộc tổng điều chỉnh giá - lương - tiền, giá cả ngoài thị trường tự do tăng phi mã.
- Lương thực vào thị xã: -8
- Hộ thiếu ăn: +35
- Giá gạo: +18

## Sự kiện gia đình
- Bé Bình bị sốt cao li bì từ đêm qua, bác sĩ bảo phải mua thuốc kháng sinh ngoài hiệu thuốc tư nhân thị xã.

## Lời chen giữa
### Tại: start
- [tram-truong-doi] Sau đổi tiền, tình hình phức tạp lắm. Điều 5 bắt buộc mọi hàng hoá tiêu dùng, thực phẩm phải có Hoá đơn HTX hoặc Giấy phép vận chuyển của Công ty Thương nghiệp.
### Tại: end
- [tram-truong-doi] Cậu Thành, tháng này xếp loại kém là bị cắt tiền thưởng đấy. Giờ tiền mất giá, mất thưởng là cả nhà đói.
### Tại: d5-t1
- [tram-truong-doi] Giấy khoán thì cứ đối chiếu đúng sổ. Tôi đứng đây xem.

## Trạm trưởng đứng sau lưng
- d5-t1

Ở lượt này làm ngơ vẫn bị ghi sổ và nhắc nhở như cho qua (03 mục 5.4).

## Thứ tự lượt khách
1. d5-t1
2. d5-t2
3. d5-t3
4. d5-t4
5. d5-t5
6. d5-t6

---

## LƯỢT d5-t1

### Người đến ô cửa
- Nhân vật: ba-tu
- Biểu cảm: lo-lang
- Nhãn: luot-trung-tam, dong-cam
- Ghi chú vẽ: Bà Tư lưng đã còng hơn, tóc thêm nhiều sợi bạc, đôi quang thúng mòn vẹt.

### Chân dung theo nhánh đời
- {nếu đếm(ba-tu.m1, ba-tu.m2 = giu, giu-kn) >= 2} bộ ba-tu-khong-non, biểu cảm buon
- {nếu đếm(ba-tu.m1, ba-tu.m2 = giu, giu-kn) == 0} biểu cảm vui

### Lời thoại
- [ba-tu] {nếu đếm(ba-tu.m1, ba-tu.m2 = giu, giu-kn) <= 1} Chào chú Thành. Mấy năm nay lạm phát ghê quá chú ơi, đồng tiền mới mất giá từng ngày.
- [ba-tu] {nếu ba-tu.m2 = giu, giu-kn và đếm(ba-tu.m1, ba-tu.m2 = giu, giu-kn) <= 1} Năm ấy chú giữ gạo, thằng cháu không có thuốc, nằm mất nửa tháng. Giờ nó đỡ rồi.
- [ba-tu] {nếu đếm(ba-tu.m1, ba-tu.m2 = giu, giu-kn) == 0} Mấy lần chú cho qua, tôi dành dụm lợp lại được mái bếp đấy chú.
- [narrator] {nếu đếm(ba-tu.m1, ba-tu.m2 = giu, giu-kn) >= 2} Bà Tư không đội nón nữa. Bà không chào, đặt tờ giấy khoán lên bậu cửa rồi nhìn xuống đất.
- [ba-tu] {nếu đếm(ba-tu.m1, ba-tu.m2 = giu, giu-kn) <= 1} Vụ xuân này tôi lại được khoán 13 cân gạo, gánh ra thị xã đổi lấy mấy hộp sữa với cân đường cho cháu. Sổ hộ khẩu với giấy khoán đủ cả chú xem giùm.
- [ba-tu] {nếu đếm(ba-tu.m1, ba-tu.m2 = giu, giu-kn) >= 2} Giấy đây.

### Phản ứng
- [CHO_QUA] Đội ơn chú Thành! Có hạt gạo khoán này gia đình tôi mới sống nổi.
- [GIU_LAI] Khổ thân già này... đến bao giờ hạt gạo làm ra mới được tự do lưu thông đây...

### Phản ứng khi đối chất
#### Khi lệch bất kỳ chỗ nào
- [ba-tu] Tôi không biết chữ, chú ạ. Cán bộ xã viết sao thì tôi cầm vậy.
#### Khi khoanh nhầm
- [ba-tu] Tôi không biết chữ, chú ạ. Cán bộ xã viết sao thì tôi cầm vậy.

### Giấy tờ
#### GDD
- Họ và tên: Trần Thị Lành
- Năm sinh: 1929
- Nơi đi: Phú Hoà
- Nơi đến: Thị xã
- Lý do: Mang gạo khoán đi đổi nhu yếu phẩm
- Ngày cấp: 1986-04-12
- Có giá trị đến: 1986-04-20
- Hàng mang theo:
  - gao | Gạo | 18 | kg
- Dấu: UBND_XA | Phú Hoà | rõ
#### SHK
- Số sổ: PH-0217
- Chủ hộ: Trần Thị Lành
- Họ và tên: Trần Thị Lành
- Năm sinh: 1929
- Quan hệ với chủ hộ: Chủ hộ
- Địa chỉ: Xã Phú Hoà
- Dấu: CONG_AN | Phú Hoà | rõ
#### GXNK
- Xã viên: Trần Thị Lành
- Xã: Phú Hoà
- Hợp tác xã: HTX nông nghiệp Phú Hoà
- Sản phẩm: Gạo
- Mã sản phẩm: gao
- Số lượng vượt khoán (kg): 13
- Vụ: Vụ xuân 1986
- Ngày xác nhận: 1986-04-10
- Dấu: HTX | Phú Hoà | rõ

### Hàng thực mang theo
- gao | Gạo | 18 | kg | LUONG_THUC

### Lỗi cài cắm
- E4 | không | không | 18 kg gạo vượt 5 kg nếu chưa có R5K-KHOAN. Khi R5K-KHOAN hiệu lực, 5 + 13 = 18 kg nên được CHO_QUA.

### Đáp án mong đợi
- Phán quyết: GIU_LAI
- Vi phạm:
  - R2-DINH-MUC | E4

### Biên bản kiến nghị
- Vấn đề: KN-KHOAN
- Ghi chú: Bà Tư lần thứ 3 mang giấy khoán vào năm bão giá 1986.

### Phong bì
- không

### Cờ
- ba-tu.m3

### Tác động lên huyện
#### CHO_QUA
- Lương thực vào thị xã: +2
- Hộ thiếu ăn: 0
- Giá gạo: -1
- Ghi chú: Gạo khoán của bà Tư giúp giảm bớt cơn sốt giá ở chợ thị xã.
#### GIU_LAI
- Lương thực vào thị xã: 0
- Hộ thiếu ăn: +5
- Giá gạo: +2
- Ghi chú: Tịch thu 18 kg gạo khoán của bà Tư, đẩy giá gạo chợ đen lên cao.

---

## LƯỢT d5-t2

### Người đến ô cửa
- Nhân vật: ong-quynh
- Biểu cảm: binh-thuong
- Nhãn: hop-le-ma-hai
- Ghi chú vẽ: Ông Quỳnh đứng cạnh chiếc xe tải chở đầy các bao đường có dấu kiểm định.

### Lời thoại
- [ong-quynh] Kìa đồng chí Thành! Chuyến này tôi áp tải 200 cân đường mật của công ty điều phối sang kho thị xã.
- [ong-quynh] Giấy phép vận chuyển của Giám đốc Công ty Thương nghiệp ký duyệt, dấu má chuẩn trăm phần trăm. Cậu kiểm nhanh cho xe qua nhé.
- [ong-quynh] {nếu gia_gao_index >= 105} Giá gạo ngoài chợ lên thế này thì đường cũng phải lên theo thôi anh Thành ạ. Người ta đói thì càng thèm ngọt.

### Phản ứng
- [CHO_QUA] Cảm ơn đồng chí Thành. Cán bộ như cậu huyện nên cất nhắc sớm.
- [GIU_LAI] Cậu làm thế này là làm tắc nghẽn lưu thông của ngành thương nghiệp tỉnh đấy!

### Phản ứng khi đối chất
#### Khi khoanh nhầm
- [ong-quynh] Công ty ký, tỉnh duyệt. Cậu định so với cái gì nữa?

### Giấy tờ
#### GDD
- Họ và tên: Vũ Đình Quỳnh
- Năm sinh: 1938
- Nơi đi: Thị xã
- Nơi đến: Phú Mỹ
- Lý do: Vận chuyển phân phối đường mật
- Ngày cấp: 1986-04-12
- Có giá trị đến: 1986-04-25
- Hàng mang theo:
  - duong | Đường | 200 | kg
- Dấu: UBND_XA | Thị xã | rõ
#### SHK
- Số sổ: TX-1082
- Chủ hộ: Vũ Đình Quỳnh
- Họ và tên: Vũ Đình Quỳnh
- Năm sinh: 1938
- Quan hệ với chủ hộ: Chủ hộ
- Địa chỉ: Thị xã
- Dấu: CONG_AN | Thị xã | rõ
#### GPVC
- Số giấy phép: GP-86/042
- Đơn vị cấp: Công ty Thương nghiệp tỉnh
- Người vận chuyển: Vũ Đình Quỳnh
- Từ: Phú Mỹ
- Đến: Thị xã
- Ngày cấp: 1986-04-12
- Có giá trị đến: 1986-04-25
- Mặt hàng:
  - duong | Đường | 200 | kg
- Dấu: CTY_THUONG_NGHIEP | Thị xã | rõ

### Hàng thực mang theo
- duong | Đường | 200 | kg | THUC_PHAM

### Lỗi cài cắm
- không

### Đáp án mong đợi
- Phán quyết: CHO_QUA
- Vi phạm: không

### Biên bản kiến nghị
- không

### Phong bì
- không

### Cờ
- ong-quynh.m3

### Tác động lên huyện
#### CHO_QUA
- Lương thực vào thị xã: 0
- Hộ thiếu ăn: 0
- Giá gạo: +3
- Ghi chú: 200 kg đường của ông Quỳnh lọt qua trạm đầy đủ giấy tờ hợp pháp, sau đó tuồn ra chợ đen làm giá đường tăng vọt.
#### GIU_LAI
- Lương thực vào thị xã: 0
- Hộ thiếu ăn: +2
- Giá gạo: 0
- Ghi chú: Giữ lô hàng 200 kg đường của cán bộ thương nghiệp tỉnh.

---

## LƯỢT d5-t3

### Người đến ô cửa
- Nhân vật: anh-hung
- Biểu cảm: lo-lang
- Nhãn: dong-cam
- Ghi chú vẽ: Anh Hùng một tay xách bó chắn bùn buộc dây thép.

### Chân dung theo nhánh đời
- {nếu đếm(anh-hung.m2, anh-hung.m2b = giu, giu-kn) >= 2} bộ anh-hung-gay, biểu cảm met-moi
- {nếu đếm(anh-hung.m2, anh-hung.m2b = giu, giu-kn) == 0} biểu cảm vui

### Lời thoại
- [anh-hung] {nếu đếm(anh-hung.m2, anh-hung.m2b = giu, giu-kn) <= 1} Chào chú Thành. Đợt đổi tiền vừa rồi làm tổ thợ sửa xe chúng tôi kiệt quệ quá.
- [anh-hung] {nếu đếm(anh-hung.m2, anh-hung.m2b = giu, giu-kn) == 0} Tổ bây giờ được bốn anh em rồi chú ạ, có cả hai cậu cụt chân ngồi gò. Nhờ mấy lần chú cho qua đấy.
- [narrator] {nếu đếm(anh-hung.m2, anh-hung.m2b = giu, giu-kn) >= 2} Anh Hùng gầy rộc. Anh không chào, chỉ đẩy tập giấy qua khe cửa.
- [anh-hung] Mười hai cái chắn bùn tổ tự gò, giao cho cửa hàng xe đạp thị xã. Tổ chưa được công nhận là hợp tác xã nên chẳng ai cấp hoá đơn cho.
- [anh-hung] Chú giữ thì tháng này bốn anh em không có gạo.

### Phản ứng
- [CHO_QUA] Cảm ơn chú Thành nhiều lắm.
- [GIU_LAI] Cơm áo gạo tiền đè nặng quá rồi chú ơi...

### Phản ứng khi đối chất
#### Khi khoanh nhầm
- [anh-hung] Giấy tôi khớp cả. Cái tổ chúng tôi thiếu là tư cách hợp tác xã, không phải chữ trên giấy.

### Giấy tờ
#### GDD
- Họ và tên: Lê Văn Hùng
- Năm sinh: 1952
- Nơi đi: Phú Hoà
- Nơi đến: Thị xã
- Lý do: Giao hàng tổ sửa xe gia công
- Ngày cấp: 1986-04-12
- Có giá trị đến: 1986-04-20
- Hàng mang theo:
  - chan-bun | Chắn bùn xe đạp | 12 | chiec
- Dấu: UBND_XA | Phú Hoà | rõ
#### SHK
- Số sổ: PH-0541
- Chủ hộ: Lê Văn Hùng
- Họ và tên: Lê Văn Hùng
- Năm sinh: 1952
- Quan hệ với chủ hộ: Chủ hộ
- Địa chỉ: Xã Phú Hoà
- Dấu: CONG_AN | Phú Hoà | rõ
#### CNTB
- Họ và tên: Lê Văn Hùng
- Năm sinh: 1952
- Hạng: 2/4
- Số thẻ: TB-5201
- Đơn vị cấp: Ty Thương binh - Xã hội
- Dấu: TB_XH | Thị xã | rõ

### Hàng thực mang theo
- chan-bun | Chắn bùn xe đạp | 12 | chiec | VAT_TU

### Lỗi cài cắm
- E5 | không | không | Chắn bùn là vật tư, thuộc phạm vi Điều 5. Tổ thương binh chưa phải hợp tác xã nên không xuất được hoá đơn, cũng không có giấy phép vận chuyển.

### Đáp án mong đợi
- Phán quyết: GIU_LAI
- Vi phạm:
  - R5-CHUNG-TU | E5

### Biên bản kiến nghị
- Vấn đề: KN-THUONG-BINH
- Ghi chú: Anh Hùng lần thứ 3 kiến nghị cho chính sách thương binh trong bối cảnh bão giá.

### Phong bì
- không

### Cờ
- anh-hung.m3

### Tác động lên huyện
#### CHO_QUA
- Lương thực vào thị xã: 0
- Hộ thiếu ăn: -1
- Giá gạo: 0
- Ghi chú: Tổ sửa xe thương binh giao được hàng, bốn gia đình có gạo tháng này.
#### GIU_LAI
- Lương thực vào thị xã: 0
- Hộ thiếu ăn: +3
- Giá gạo: 0
- Ghi chú: 12 chiếc chắn bùn của tổ thương binh bị tạm giữ vì không có hoá đơn.

---

## LƯỢT d5-t4

### Người đến ô cửa
- Nhân vật: np-hang-xom
- Biểu cảm: binh-thuong
- Nhãn: dong-cam, luot-trung-tam
- Ghi chú vẽ: Người đàn bà trạc năm mươi, tóc búi, túi lưới đựng lọ thuốc và hai hộp sữa.

### Lời thoại
- [np-hang-xom] Chú Thành, tôi đây, Nga dãy B khu tập thể dệt đây mà.
- [np-hang-xom] Bà cụ nhà chú hết thuốc huyết áp từ tuần trước, hiệu thuốc quốc doanh không có hàng. Tôi về quê nhờ được người quen mua hộ ba chục viên Reserpin, với hai hộp sữa cho thằng Bình đang ốm.
- [np-hang-xom] Mua ngoài chợ nên làm gì có đơn với hoá đơn hả chú. Chú giữ thì tối nay chú lại phải đi mua chợ đen, giá gấp đôi đấy.

### Phản ứng
- [CHO_QUA] Tối nay tôi mang sang tận nhà cho bà cụ.
- [GIU_LAI] Ừ thì... phép vua. Chú liệu mà lo thuốc cho bà cụ.

### Phản ứng khi đối chất
#### Khi khoanh nhầm
- [np-hang-xom] Chú soi gì mà kỹ thế, tôi với chú hàng xóm bao năm nay.

### Giấy tờ
#### GDD
- Họ và tên: Đỗ Thị Nga
- Năm sinh: 1931
- Nơi đi: Phú Mỹ
- Nơi đến: Thị xã
- Lý do: Thăm quê về
- Ngày cấp: 1986-04-12
- Có giá trị đến: 1986-04-20
- Hàng mang theo:
  - reserpin | Reserpin (thuốc huyết áp) | 30 | vien
  - sua-dac | Sữa đặc | 2 | hop
- Dấu: UBND_XA | Phú Mỹ | rõ
#### SHK
- Số sổ: TX-1107
- Chủ hộ: Đỗ Thị Nga
- Họ và tên: Đỗ Thị Nga
- Năm sinh: 1931
- Quan hệ với chủ hộ: Chủ hộ
- Địa chỉ: Khu tập thể dệt, Thị xã
- Dấu: CONG_AN | Thị xã | rõ

### Hàng thực mang theo
- reserpin | Reserpin (thuốc huyết áp) | 30 | vien | THUOC
- sua-dac | Sữa đặc | 2 | hop | THUC_PHAM

### Lỗi cài cắm
- E5 | không | không | Reserpin thuộc danh mục thuốc quản lý nhưng không có đơn (Điều 3).
- E5 | không | không | Sữa đặc là thực phẩm, không có hoá đơn hay giấy phép (Điều 5).

### Đáp án mong đợi
- Phán quyết: GIU_LAI
- Vi phạm:
  - R3-DON-THUOC | E5
  - R5-CHUNG-TU | E5

### Biên bản kiến nghị
- không

### Phong bì
- không

### Cờ
- hang-xom.m1

### Tác động lên huyện
#### CHO_QUA
- Lương thực vào thị xã: 0
- Hộ thiếu ăn: -1
- Giá gạo: 0
- Ghi chú: Bác Nga mang thuốc huyết áp sang tận nhà cho mẹ Thành.
#### GIU_LAI
- Lương thực vào thị xã: 0
- Hộ thiếu ăn: +1
- Giá gạo: 0
- Ghi chú: Thuốc của mẹ Thành nằm trong kho tịch thu của chính trạm 15.

---

## LƯỢT d5-t5

### Người đến ô cửa
- Nhân vật: np-buon-chuyen-nghiep
- Biểu cảm: ne-tranh
- Nhãn: buon-lau-that
- Ghi chú vẽ: Gã buôn gạo ghé sát ô cửa kính, nhét phong bì dày cộp qua khe hẹp.

### Lời thoại
- [np-buon-chuyen-nghiep] Anh Thành ơi! Em gom được 300 cân gạo bãi chuyển gấp lên thị xã cho các lò bánh bún.
- [np-buon-chuyen-nghiep] Giấy đi đường là của thằng Lợi, em trai em, nó ốm nên em đi thay. Anh em ruột cả, sổ hộ khẩu em đây.
- [np-buon-chuyen-nghiep] Em biết anh đang kẹt tiền chữa bệnh cho bé Bình sốt cao. Em gửi chiếc phong bì 120 đồng này anh lo thuốc men cho cháu, anh cho xe em qua êm thấm nhé.

### Phản ứng
- [CHO_QUA] Cảm ơn anh Thành! Anh em mình hiểu nhau thế là tốt.
- [GIU_LAI] Anh không nghĩ đến mạng sống của con anh à...

### Phản ứng khi đối chất
#### Khi lệch tên
- [narrator] Gã im lặng một lúc lâu, mắt nhìn tờ giấy đi đường.
- [np-buon-chuyen-nghiep] Anh Thành... anh em mình với nhau. Anh coi như không thấy, em biết điều mà.
#### Khi khoanh nhầm
- [np-buon-chuyen-nghiep] Anh xem kỹ vậy làm gì, giấy tờ em sạch sẽ cả.

### Giấy tờ
#### GDD
- Họ và tên: Bùi Văn Lợi
- Năm sinh: 1950
- Nơi đi: Thị xã
- Nơi đến: Phú Hoà
- Lý do: Thu mua nông sản
- Ngày cấp: 1986-04-12
- Có giá trị đến: 1986-04-20
- Hàng mang theo:
  - gao | Gạo | 300 | kg
- Dấu: UBND_XA | Thị xã | rõ
#### SHK
- Số sổ: TX-0812
- Chủ hộ: Bùi Văn Thắng
- Họ và tên: Bùi Văn Thắng
- Năm sinh: 1944
- Quan hệ với chủ hộ: Chủ hộ
- Địa chỉ: Thị xã
- Dấu: CONG_AN | Thị xã | rõ

### Hàng thực mang theo
- gao | Gạo | 300 | kg | LUONG_THUC

### Lỗi cài cắm
- E4 | không | không | 300 kg gạo vượt định mức 5 kg.
- E2 | GDD | ho_ten | Giấy đi đường đứng tên em trai (Bùi Văn Lợi, 1950), hộ khẩu là của Bùi Văn Thắng (1944). Lượt duy nhất Điều 4 bắt đúng người gian.

### Đáp án mong đợi
- Phán quyết: GIU_LAI
- Vi phạm:
  - R2-DINH-MUC | E4
  - R4-KHOP-TEN | E2

### Biên bản kiến nghị
- không

### Phong bì
- Số tiền: 120
- Lời nói: [np-buon-chuyen-nghiep] Anh Thành cầm lấy 120 đồng này mua thuốc kháng sinh cho cháu Bình. Anh cho xe em qua nhé.
- Ghi chú hệ quả: 120 đồng nhận hối lộ để cho lọt xe tải chở 300 kg gạo.

### Cờ
- không

### Tác động lên huyện
#### CHO_QUA
- Lương thực vào thị xã: 0
- Hộ thiếu ăn: +10
- Giá gạo: +5
- Ghi chú: 300 kg gạo gom lậu tuồn vào thị xã làm giá gạo tự do bùng nổ, nhiều hộ nghèo không mua nổi gạo.
#### GIU_LAI
- Lương thực vào thị xã: 0
- Hộ thiếu ăn: -5
- Giá gạo: 0
- Ghi chú: Chặn đứng vụ đầu cơ 300 kg gạo, tịch thu nhập kho quốc doanh.

---

## LƯỢT d5-t6

### Người đến ô cửa
- Nhân vật: np-nong-dan-gao
- Biểu cảm: met-moi
- Nhãn: dong-cam
- Ghi chú vẽ: Người mẹ trẻ gầy gò, mắt trũng sâu, gánh đôi thúng gạo nặng nhọc.

### Lời thoại
- [np-nong-dan-gao] Chào anh cán bộ. Em là Lụa ở Phú Hoà, nhà em làm khoán được 15 cân thóc vượt chỉ tiêu.
- [np-nong-dan-gao] Em gánh 20 cân gạo ra thị xã bán lấy tiền mua vải may quần áo cho các cháu. Giấy khoán với hộ khẩu của em đây ạ.

### Phản ứng
- [CHO_QUA] Em đội ơn anh cán bộ nhiều lắm!
- [GIU_LAI] Bão giá thế này mà mất gạo thì mẹ con em biết sống sao...

### Giấy tờ
#### GDD
- Họ và tên: Nguyễn Thị Lụa
- Năm sinh: 1954
- Nơi đi: Phú Hoà
- Nơi đến: Thị xã
- Lý do: Mang gạo khoán đi mua nhu yếu phẩm
- Ngày cấp: 1986-04-12
- Có giá trị đến: 1986-04-18
- Hàng mang theo:
  - gao | Gạo | 20 | kg
- Dấu: UBND_XA | Phú Hoà | rõ
#### SHK
- Số sổ: PH-0921
- Chủ hộ: Nguyễn Thị Lụa
- Họ và tên: Nguyễn Thị Lụa
- Năm sinh: 1954
- Quan hệ với chủ hộ: Chủ hộ
- Địa chỉ: Xã Phú Hoà
- Dấu: CONG_AN | Phú Hoà | rõ
#### GXNK
- Xã viên: Nguyễn Thị Lụa
- Xã: Phú Hoà
- Hợp tác xã: HTX nông nghiệp Phú Hoà
- Sản phẩm: Gạo
- Mã sản phẩm: gao
- Số lượng vượt khoán (kg): 15
- Vụ: Vụ xuân 1986
- Ngày xác nhận: 1986-04-10
- Dấu: HTX | Phú Hoà | rõ

### Hàng thực mang theo
- gao | Gạo | 20 | kg | LUONG_THUC

### Lỗi cài cắm
- E4 | không | không | 20 kg gạo vượt định mức nếu không có R5K.

### Đáp án mong đợi
- Phán quyết: GIU_LAI
- Vi phạm:
  - R2-DINH-MUC | E4

### Biên bản kiến nghị
- Vấn đề: KN-KHOAN
- Ghi chú: Lượt kiến nghị thứ 4 cho sản phẩm khoán trong bối cảnh bão giá.

### Phong bì
- không

### Cờ
- không

### Tác động lên huyện
#### CHO_QUA
- Lương thực vào thị xã: +1
- Hộ thiếu ăn: 0
- Giá gạo: -1
- Ghi chú: Gạo của chị Lụa giúp giảm bớt cơn khát lương thực ở thị xã.
#### GIU_LAI
- Lương thực vào thị xã: 0
- Hộ thiếu ăn: +3
- Giá gạo: 0
- Ghi chú: Tịch thu 20 kg gạo của chị Lụa xã viên làm khoán.
