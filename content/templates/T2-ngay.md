# Template T2 — Ngày chơi

> Trạng thái: CHỐT

Mỗi file `content/ngay-N.md` mở đầu bằng **đúng một** khối ngày viết theo template này, sau đó là các khối lượt khách viết theo T1.

Khối này được prompt P1 chuyển thành một phần tử của `data/days.json`. Luật chơi đứng sau từng trường nằm ở `docs/03-rules-spec.md` mục 1.2, 7 và 8.

## Quy tắc viết

1. **Không đổi, không thêm, không bỏ tiêu đề nào.** Mục không dùng thì ghi `- không`.
2. Mọi mã viết đúng như bảng tra cứu ở cuối file T1.
3. Ký hiệu câu thoại và điều kiện giống hệt T1.
4. Số tiền là số nguyên, không có dấu chấm ngăn cách hàng nghìn: `1500`, không phải `1.500`.

## Khối để chép

```markdown
# NGÀY dX

## Thông tin ngày
- Mã ngày: dX
- Màn: 
- Nhãn hiển thị: 
- Ngày trong game: 
- Kiến nghị: tắt
- Quy định mới: không

## Thẻ chuyển cảnh
- không

## Đồng hồ ca
- Bắt đầu: 07:00
- Hết ca: 17:00
- Mỗi lượt (phút): 100
- Mỗi biên bản (phút): 60

## Kinh tế
- Thu nhập: 
- Phạt mỗi lỗi: 
- Thưởng xuất sắc: 
- Đổi tiền (chia cho): không
- Tiền để dành đầu game: không

### Khoản chi
| Mã | Tên | Số tiền | Thiết yếu | Thành viên |
|---|---|---|---|---|

## Chỉ số đầu game
- không

## Yếu tố khác
- Nội dung: 
- Lương thực vào thị xã: 0
- Hộ thiếu ăn: 0
- Giá gạo: 0

## Sự kiện gia đình
- không

## Lời chen giữa
### Tại: start
- không
### Tại: end
- không

## Thứ tự lượt khách
1. dX-t1
2. dX-t2
3. dX-t3
```

## Hướng dẫn từng mục

### Thông tin ngày

| Dòng | Điền gì |
|---|---|
| Mã ngày | `d1` … `d6` |
| Màn | d1–d2 là `1`, d3–d4 là `2`, d5 là `3`, d6 là `4` |
| Nhãn hiển thị | Chữ hiện trên thanh trên cùng, ví dụ `Tháng 3/1981` |
| Ngày trong game | `YYYY-MM-DD`, dùng để xét hạn giấy tờ. Giữ đúng tháng và năm của màn |
| Kiến nghị | `bật` ở d3, d4, d5; `tắt` ở d1, d2, d6 |
| Quy định mới | Mã quy định **bắt đầu** có hiệu lực hôm nay, cách nhau bằng dấu phẩy. Chỉ để hiển thị trang sổ mới; hiệu lực thật lấy từ `rules.json` |

### Thẻ chuyển cảnh

Chỉ dùng ở d6: màn hình đen tháng 12/1986 hiện trước khi ngày bắt đầu. Mỗi dòng là một dòng chữ trên thẻ. Các ngày khác để `- không`.

### Đồng hồ ca

Giữ mặc định trừ khi có lý do cân bằng độ khó. Với ngày 5 lượt, mặc định này làm người chơi quá giờ nếu lập từ 2 biên bản.

### Kinh tế

| Dòng | Điền gì |
|---|---|
| Thu nhập | Lương một tuần |
| Phạt mỗi lỗi | Tiền trừ cho mỗi giấy nhắc nhở |
| Thưởng xuất sắc | Tiền thưởng nếu xếp loại ngày là XUẤT SẮC |
| Đổi tiền (chia cho) | Chỉ d5: `10`. Các ngày khác `không` |
| Tiền để dành đầu game | Chỉ d1. Các ngày khác `không` |

**Khoản chi:** một dòng mỗi khoản. `Thiết yếu` là `có` hoặc `không`; khoản thiết yếu không trả được sẽ tính vào `hardship`. `Thành viên` là mã người trong gia đình liên quan, hoặc để trống. Số mặc định đề xuất ở `03-rules-spec.md` mục 8.2.

### Chỉ số đầu game

Chỉ d1 điền ba dòng:

```markdown
## Chỉ số đầu game
- Lương thực vào thị xã: 100
- Hộ thiếu ăn: 210
- Giá gạo: 100
```

Các ngày khác để `- không`.

### Yếu tố khác

Một sự kiện ngoài tầm tay của trạm làm chỉ số huyện thay đổi: lũ, rét, cấm vận, hàng nhập về chậm. Phải đủ lớn để có ngày huyện xấu đi dù trạm làm gì (cỡ số ở `03-rules-spec.md` mục 7.3). Số `0` nghĩa là không đổi.

### Sự kiện gia đình

Một câu hiện ở bảng chi tiêu cuối ngày, ví dụ `- Bé Bình sốt từ đêm qua.` Nếu không có thì `- không`. Khoản chi phát sinh từ sự kiện, như thuốc cho bé Bình, phải được thêm vào bảng "Khoản chi" của cùng ngày.

### Lời chen giữa

Radio, trạm trưởng, chị Thu… nói chen giữa ca. Mỗi thời điểm là một tiểu mục `### Tại: <thời điểm>`:

- `start`: đầu ca, trước lượt đầu tiên
- `end`: cuối ca, sau lượt cuối cùng
- `dX-tY`: ngay **sau** khi người chơi xử lý xong lượt đó

Có thể thêm bao nhiêu tiểu mục `### Tại: dX-tY` tuỳ ý, và cùng một thời điểm có thể có nhiều tiểu mục. Nếu cả khối chỉ hiện khi thoả điều kiện, dòng đầu tiên là `- Điều kiện: <điều kiện>`, viết như trong `{nếu ...}` nhưng không có ngoặc và chữ "nếu".

```markdown
### Tại: d3-t3
- Điều kiện: ba-tu.m2 = qua-kn, giu-kn
- [tram-truong-doi] Việc của cậu là đóng dấu, không phải viết báo cáo.
```

Hai tiểu mục `start` và `end` luôn phải có mặt, kể cả khi chỉ ghi `- không`.

### Thứ tự lượt khách

Danh sách đánh số, mỗi dòng một mã lượt. Số lượt: d1 là 3, d2 là 4, d3 là 4, d4 là 5, d5 là 5, d6 là 5. Mỗi mã ở đây phải có một khối `## LƯỢT` tương ứng trong cùng file.

## Ví dụ đã điền

```markdown
# NGÀY d3

## Thông tin ngày
- Mã ngày: d3
- Màn: 2
- Nhãn hiển thị: Tháng 3/1981
- Ngày trong game: 1981-03-16
- Kiến nghị: bật
- Quy định mới: R3-DON-THUOC

## Thẻ chuyển cảnh
- không

## Đồng hồ ca
- Bắt đầu: 07:00
- Hết ca: 17:00
- Mỗi lượt (phút): 100
- Mỗi biên bản (phút): 60

## Kinh tế
- Thu nhập: 22
- Phạt mỗi lỗi: 3
- Thưởng xuất sắc: 3
- Đổi tiền (chia cho): không
- Tiền để dành đầu game: không

### Khoản chi
| Mã | Tên | Số tiền | Thiết yếu | Thành viên |
|---|---|---|---|---|
| gao | Gạo | 11 | có | |
| than | Than | 4 | có | |
| thuoc-me | Thuốc huyết áp cho mẹ | 6 | có | me-thanh |
| hoc-phi-mai | Học phí của Mai | 2 | có | be-mai |

## Chỉ số đầu game
- không

## Yếu tố khác
- Nội dung: Rét đậm kéo dài, một phần mạ xuân ở Phú Hoà bị chết.
- Lương thực vào thị xã: -4
- Hộ thiếu ăn: +12
- Giá gạo: +3

## Sự kiện gia đình
- không

## Lời chen giữa
### Tại: start
- [radio] Ngày 13 tháng 1 năm 1981, Ban Bí thư đã ban hành Chỉ thị số 100 về cải tiến công tác khoán, mở rộng khoán sản phẩm đến nhóm lao động và người lao động trong hợp tác xã nông nghiệp.
### Tại: d3-t3
- Điều kiện: ba-tu.m2 = qua-kn, giu-kn
- [tram-truong-doi] Việc của cậu là đóng dấu, không phải viết báo cáo.
### Tại: end
- không

## Thứ tự lượt khách
1. d3-t1
2. d3-t2
3. d3-t3
4. d3-t4
```
