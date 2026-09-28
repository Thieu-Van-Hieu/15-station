# NGÀY d6

> Trạng thái: ĐÃ CHUYỂN JSON

## Thông tin ngày
- Mã ngày: d6
- Màn: 4
- Nhãn hiển thị: Tháng 6/1987 — Ngày 6
- Ngày trong game: 1987-06-15
- Kiến nghị: tắt
- Quy định mới: R6-HANG-CAM

## Thẻ chuyển cảnh
- Tháng 12 năm 1986.
- Đại hội đại biểu toàn quốc lần thứ VI của Đảng khởi xướng đường lối Đổi mới toàn diện đất nước.
- "Nhìn thẳng vào sự thật, đánh giá đúng sự thật, nói rõ sự thật."
- Tháng 4 năm 1987, Hội nghị Trung ương 2 khoá VI yêu cầu xoá bỏ ngay tất cả các hình thức ngăn sông cấm chợ, giải thể các trạm kiểm soát lưu thông hàng hoá.

## Đồng hồ ca
- Bắt đầu: 07:00
- Hết ca: 17:00
- Mỗi lượt (phút): 100
- Mỗi biên bản (phút): 60

## Kinh tế
- Thu nhập: 1500
- Phạt mỗi lỗi: 0
- Thưởng xuất sắc: 0
- Đổi tiền (chia cho): không
- Tiền để dành đầu game: không

### Khoản chi
| Mã | Tên | Số tiền | Thiết yếu | Thành viên |
|---|---|---|---|---|
| gao | Gạo thị trường tự do | 800 | có | |
| than | Chất đốt gia đình | 180 | có | |
| thuoc-me | Thuốc cho mẹ | 300 | có | me-thanh |
| hoc-phi-mai | Tiền học của Mai | 80 | có | be-mai |

## Chỉ số đầu game
- không

## Yếu tố khác
- Nội dung: Xoá bỏ các trạm kiểm soát lưu thông, hàng hoá từ các tỉnh lân cận bắt đầu đổ về chợ thị xã.
- Lương thực vào thị xã: +12
- Hộ thiếu ăn: -20
- Giá gạo: -10

## Sự kiện gia đình
- không

## Lời chen giữa
### Tại: start
- [tram-truong-doi] Hôm nay là ca trực cuối cùng của Trạm 15. Thu hồi toàn bộ cuốn sổ chỉ thị dày cộp cũ. Giờ chỉ còn tờ danh mục hàng cấm: vũ khí, chất nổ, thuốc phiện. Hàng hoá thông thường được tự do lưu thông.
### Tại: end
- [tram-truong-doi] Thu dọn bàn ghế, tháo barie đi thôi Thành. Trạm kiểm soát kết thúc nhiệm vụ rồi.

## Thứ tự lượt khách
1. d6-t1
2. d6-t2
3. d6-t3
4. d6-t4
5. d6-t5

---

## LƯỢT d6-t1

### Người đến ô cửa
- Nhân vật: ba-tu
- Biểu cảm: vui
- Nhãn: dong-cam
- Ghi chú vẽ: Bà Tư cười rạng rỡ, chiếc nón lá mới tinh, gánh gạo đầy ắp.

### Chân dung theo nhánh đời
- {nếu đếm(ba-tu.m1, ba-tu.m2, ba-tu.m3 = giu, giu-kn) >= 2} bộ ba-tu-khong-non, biểu cảm buon

### Lời thoại
- [ba-tu] {nếu đếm(ba-tu.m1, ba-tu.m2, ba-tu.m3 = giu, giu-kn) <= 1} Chú Thành ơi! Nghe bảo trên Trung ương ra lệnh xoá bỏ trạm rồi phải không chú?
- [ba-tu] {nếu đếm(ba-tu.m1, ba-tu.m2, ba-tu.m3 = giu, giu-kn) <= 1} Nay tôi chở 30 cân gạo ra chợ bán công khai, không cần phải xin giấy đi đường hay giấy khoán gì nữa hả chú?
- [narrator] {nếu đếm(ba-tu.m1, ba-tu.m2, ba-tu.m3 = giu, giu-kn) >= 2} Bà Tư gánh gạo đi qua barie đã mở. Bà dừng lại trước ô cửa, không nhìn vào.
- [ba-tu] {nếu đếm(ba-tu.m1, ba-tu.m2, ba-tu.m3 = giu, giu-kn) >= 2} Giờ thì không cần giấy nữa, phải không chú.

### Phản ứng
- [CHO_QUA] Mừng quá chú ơi! Nông dân chúng tôi chờ ngày này bao năm rồi!
- [GIU_LAI] Ủa... xoá trạm rồi mà chú...

### Giấy tờ
- không

### Hàng thực mang theo
- gao | Gạo | 30 | kg | LUONG_THUC

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
- ba-tu.m4

### Tác động lên huyện
#### CHO_QUA
- Lương thực vào thị xã: +2
- Hộ thiếu ăn: -2
- Giá gạo: -2
- Ghi chú: Bà Tư chở gạo bán công khai tại chợ thị xã, hàng hoá lưu thông thuận lợi.
#### GIU_LAI
- Lương thực vào thị xã: 0
- Hộ thiếu ăn: +2
- Giá gạo: 0
- Ghi chú: Giữ gạo của bà Tư trái quy định xoá bỏ ngăn sông cấm chợ.

---

## LƯỢT d6-t2

### Người đến ô cửa
- Nhân vật: anh-hung
- Biểu cảm: vui
- Nhãn: dong-cam
- Ghi chú vẽ: Anh Hùng mặc áo sơ mi mới, khoẻ khoắn bên chiếc xe đạp chở phụ tùng.

### Chân dung theo nhánh đời
- {nếu đếm(anh-hung.m2, anh-hung.m2b, anh-hung.m3 = giu, giu-kn) >= 2} bộ anh-hung-gay, biểu cảm met-moi

### Lời thoại
- [anh-hung] {nếu đếm(anh-hung.m2, anh-hung.m2b, anh-hung.m3 = giu, giu-kn) <= 1} Chào chú em! Trạm sắp tháo barie rồi hả chú em?
- [anh-hung] {nếu đếm(anh-hung.m2, anh-hung.m2b, anh-hung.m3 = giu, giu-kn) <= 1} Tổ sửa xe của tôi nay tự do lên thị xã mua 10 bộ phụ tùng xích líp về mở rộng xưởng, không còn phải xin xỏ giấy phép phiền hà nữa.
- [narrator] {nếu đếm(anh-hung.m2, anh-hung.m2b, anh-hung.m3 = giu, giu-kn) >= 2} Anh Hùng đứng xa ô cửa, tay xách mấy bộ xích líp cũ.
- [anh-hung] {nếu đếm(anh-hung.m2, anh-hung.m2b, anh-hung.m3 = giu, giu-kn) >= 2} Tổ sửa xe giải tán từ năm ngoái rồi chú ạ. Tôi đi sửa xe lề đường. Bộ phụ tùng này là của người ta thuê tôi chở.

### Phản ứng
- [CHO_QUA] Đổi mới thế này thì dân mới có cơ mở mày mở mặt chú em ạ!
- [GIU_LAI] Chú em sao lại giữ phụ tùng của tổ thợ chúng tôi?

### Giấy tờ
- không

### Hàng thực mang theo
- phu-tung-xe | Phụ tùng xích líp xe đạp | 10 | chiec | VAT_TU

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
- anh-hung.m4

### Tác động lên huyện
#### CHO_QUA
- Lương thực vào thị xã: +1
- Hộ thiếu ăn: 0
- Giá gạo: 0
- Ghi chú: Tổ hợp tác sửa chữa xe đạp của thương binh phát triển thuận lợi.
#### GIU_LAI
- Lương thực vào thị xã: 0
- Hộ thiếu ăn: +2
- Giá gạo: 0
- Ghi chú: Giữ phụ tùng xe đạp trái lệnh xoá trạm.

---

## LƯỢT d6-t3

### Người đến ô cửa
- Nhân vật: thang-ti
- Biểu cảm: vui
- Bộ chân dung: thang-ti-lon
- Nhãn: dong-cam
- Ghi chú vẽ: Thằng Tí năm 1987: mười tám tuổi, áo sơ mi cũ, đeo ba lô, cao hơn cả khung cửa.

### Chân dung theo nhánh đời
- {nếu thang-ti.m2 = giu, giu-kn} bộ thang-ti-lon, biểu cảm ne-tranh

### Lời thoại
- [thang-ti] {nếu thang-ti.m2 = qua, qua-kn, lam-ngo, qua-tien, lam-ngo-tien} Chú Thành! Chú còn nhớ cháu không, thằng Tí con bố Thược rèn đây ạ!
- [thang-ti] {nếu thang-ti.m2 = qua, qua-kn, lam-ngo, qua-tien, lam-ngo-tien} Cháu mười tám rồi. Bố cháu vẫn khoẻ, hai bố con giờ buôn chuyến vải lên thị xã. Giấy tờ theo luật mới đủ cả, chú cứ xem.
- [narrator] {nếu thang-ti.m2 = giu, giu-kn} Một thanh niên gầy, cao lêu nghêu đặt tập giấy lên bậu cửa. Cậu nhìn Thành rất lâu, rồi nhìn đi chỗ khác. Cậu không nói gì cả.

### Phản ứng
- [CHO_QUA] {nếu thang-ti.m2 = qua, qua-kn, lam-ngo, qua-tien, lam-ngo-tien} Cháu chào chú. Chú giữ sức khoẻ ạ.
- [GIU_LAI] {nếu thang-ti.m2 = qua, qua-kn, lam-ngo, qua-tien, lam-ngo-tien} Trạm dỡ rồi mà chú vẫn giữ ạ...

### Giấy tờ
- không

### Hàng thực mang theo
- vai | Vải | 40 | met | HANG_TIEU_DUNG

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
- thang-ti.m4

### Tác động lên huyện
#### CHO_QUA
- Lương thực vào thị xã: 0
- Hộ thiếu ăn: -2
- Giá gạo: 0
- Ghi chú: Chuyến vải của thằng Tí lên chợ thị xã.
#### GIU_LAI
- Lương thực vào thị xã: 0
- Hộ thiếu ăn: +2
- Giá gạo: 0
- Ghi chú: Giữ chuyến vải của thằng Tí dù trạm đã xoá bỏ.

---

## LƯỢT d6-t4

### Người đến ô cửa
- Nhân vật: chi-thu
- Biểu cảm: vui
- Nhãn: không
- Ghi chú vẽ: Chị Thu tươi cười bắt tay Thành, tay nhận lại cuốn sổ chỉ thị cũ.

### Lời thoại
- [chi-thu] Chào đồng chí Thành! Tôi thay mặt Ban Nông nghiệp và đoàn thanh tra huyện đến thu hồi sổ chỉ thị cũ của Trạm 15.
- [chi-thu] Huyện uỷ đánh giá rất cao các biên bản kiến nghị phản ánh thực tiễn của trạm trong những năm qua. Nhờ những cơ sở thực tiễn ấy mà chúng ta có thêm niềm tin để kiến nghị lên trên mở cửa thị trường.

### Phản ứng
- [CHO_QUA] Cảm ơn đồng chí Thành, chúc mừng đồng chí đã hoàn thành xuất sắc nhiệm vụ lịch sử tại trạm.
- [GIU_LAI] Đồng chí Thành định giữ đoàn thanh tra lại sao?

### Giấy tờ
- không

### Hàng thực mang theo
- không

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
- chi-thu.m4

### Tác động lên huyện
#### CHO_QUA
- Lương thực vào thị xã: 0
- Hộ thiếu ăn: 0
- Giá gạo: 0
- Ghi chú: Thu hồi sổ chỉ thị, trạm 15 hoàn tất sứ mệnh lịch sử.
#### GIU_LAI
- Lương thực vào thị xã: 0
- Hộ thiếu ăn: 0
- Giá gạo: 0
- Ghi chú: Không thể giữ cán bộ thanh tra.

---

## LƯỢT d6-t5

### Người đến ô cửa
- Nhân vật: np-buon-thuoc-phien
- Biểu cảm: gian
- Nhãn: buon-lau-that
- Ghi chú vẽ: Gã đàn ông mặc áo chàm giật thót khi bị yêu cầu mở bọc hàng giấu kín.

### Lời thoại
- [np-buon-thuoc-phien] Chào ông bạn kiểm soát. Nghe nói xoá trạm rồi, không cần kiểm tra gì nữa đúng không?
- [np-buon-thuoc-phien] Tôi chỉ có mấy bọc thảo dược thuốc nam mang về xuôi bán thôi, ông bạn để tôi đi nhanh.

### Phản ứng
- [CHO_QUA] Hê hê, cảm ơn ông bạn!
- [GIU_LAI] Mẹ kiếp... tưởng xoá trạm là thả rông hết rồi chứ...

### Giấy tờ
- không

### Hàng thực mang theo
- thuoc-phien | Thuốc phiện đen | 2 | kg | HANG_CAM (ẩn giấu)

### Lỗi cài cắm
- không

### Đáp án mong đợi
- Phán quyết: GIU_LAI
- Vi phạm:
  - R6-HANG-CAM | không

### Biên bản kiến nghị
- không

### Phong bì
- không

### Cờ
- không

### Tác động lên huyện
#### CHO_QUA
- Lương thực vào thị xã: 0
- Hộ thiếu ăn: +5
- Giá gạo: 0
- Ghi chú: 2 kg thuốc phiện lọt vào thị xã đầu độc đời sống nhân dân.
#### GIU_LAI
- Lương thực vào thị xã: 0
- Hộ thiếu ăn: 0
- Giá gạo: 0
- Ghi chú: Bắt giữ kịp thời 2 kg thuốc phiện buôn lậu theo danh mục hàng cấm R6.
