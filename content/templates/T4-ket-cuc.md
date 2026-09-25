# Template T4 — Kết cục

> Trạng thái: CHỐT

Năm kết cục nằm trong **một** file `content/endings.md`, mỗi kết cục là một khối bắt đầu bằng `## KẾT CỤC <mã>`. File này được chuyển sang `data/endings.json`.

Luật chọn kết cục nằm ở `docs/03-rules-spec.md` mục 9: engine xét các kết cục theo thứ tự tăng dần và chọn kết cục đầu tiên thoả mọi điều kiện.

## Quy tắc viết

1. **Không đổi, không thêm, không bỏ tiêu đề nào.** Mục không dùng thì ghi `- không`.
2. Mã kết cục, thứ tự xét và điều kiện **đã được chốt ở `03-rules-spec.md` mục 9.2**. Muốn đổi thì sửa đặc tả trước, không sửa ở đây.
3. Câu trích giáo trình phải có mặt trong `docs/04-sources.md`, chép nguyên văn, ghi đúng chương và mục.
4. Ký hiệu câu thoại và điều kiện giống T1. Riêng ở đây được dùng thêm điều kiện theo chỉ số ẩn.

## Khối để chép

```markdown
## KẾT CỤC 

### Thông tin
- Mã: 
- Tên: 
- Thứ tự xét: 

### Điều kiện
- không

### Cảnh
#### Cảnh 1
- Ảnh: không
- Điều kiện: không
- Nội dung: 

### Câu trích
- Nội dung: 
- Chương: 
- Mục: 

### Số phận nhân vật
- không

### Câu hỏi cuối
- không
```

## Hướng dẫn từng mục

### Thông tin

Chép đúng từ bảng này, không tự đặt:

| Mã | Tên | Thứ tự xét |
|---|---|---|
| `END-AN-TIEN` | Người ăn tiền | 1 |
| `END-LAM-NGO` | Người làm ngơ | 2 |
| `END-KIEN-NGHI` | Người kiến nghị | 3 |
| `END-GAC-CONG` | Người gác cổng mẫu mực | 4 |
| `END-SONG-SOT` | Người sống sót | 5 |

### Điều kiện

Mỗi dòng một điều kiện theo chỉ số ẩn, dạng `<chỉ số> <phép so sánh> <giá trị>`. Các dòng nối với nhau bằng VÀ. Chép đúng từ `03-rules-spec.md` mục 9.2.

- Phép so sánh: `>=`, `<=`, `==`, `>`, `<`
- Chỉ số: `true_compliance`, `reported_compliance`, `valid_reports`, `invalid_reports`, `lam_ngo_violations`, `bribes_accepted`, `bribe_total`, `issues_triggered`, `hardship`, `overtime_days`, `reprimands`

`END-SONG-SOT` là kết cục mặc định, luôn để `- không`. Mọi kết cục khác phải có ít nhất một điều kiện.

### Cảnh

Mỗi cảnh là một màn hình của phần kết, tiểu mục `#### Cảnh <số>` đánh số từ 1. Ít nhất một cảnh.

| Dòng | Điền gì |
|---|---|
| Ảnh | Mã ảnh nền kebab-case không dấu, hoặc `không` |
| Điều kiện | Cảnh chỉ hiện khi thoả điều kiện, hoặc `không`. Viết như `{nếu ...}` ở T1 nhưng bỏ ngoặc và chữ "nếu". Được dùng thêm điều kiện chỉ số: `bribe_total > 0` |
| Nội dung | Chữ trên màn hình. Được dùng biến `{{bribe_total}}`, `{{valid_reports}}`, `{{hang_tich_thu_kg}}`, `{{kn_remaining:KN-KHOAN}}` |

Nội dung dài nhiều đoạn thì viết tiếp các dòng ngay dưới dòng `- Nội dung:`, thụt vào hai dấu cách.

### Câu trích

| Dòng | Điền gì |
|---|---|
| Nội dung | Câu trích nguyên văn, không có ngoặc kép bao ngoài |
| Chương | Số chương, 1 đến 7 |
| Mục | Số mục, ví dụ `2.3` hoặc `3.2.2` |

Câu trích mặc định cho từng kết cục có ở `00-idea.md` mục 7.

### Số phận nhân vật

Mỗi dòng một câu về một nhân vật sau khi game kết thúc, viết như câu thoại: `- [mã] {nếu điều kiện} nội dung`. Dùng điều kiện theo cờ để số phận phụ thuộc cách người chơi đối xử với họ.

### Câu hỏi cuối

Một câu hiện ở màn hình cuối cùng, hoặc `- không`.

## Ví dụ đã điền

```markdown
## KẾT CỤC END-GAC-CONG

### Thông tin
- Mã: END-GAC-CONG
- Tên: Người gác cổng mẫu mực
- Thứ tự xét: 4

### Điều kiện
- true_compliance >= 0.85
- valid_reports == 0
- lam_ngo_violations == 0

### Cảnh
#### Cảnh 1
- Ảnh: bang-khen
- Điều kiện: không
- Nội dung: Cuối năm 1987, trạm 15 giải thể. Tổ trưởng Nguyễn Văn Thành được tặng bằng khen vì hoàn thành xuất sắc nhiệm vụ.
#### Cảnh 2
- Ảnh: khong-co-bien-ban
- Điều kiện: không
- Nội dung: Trong bản tổng hợp gửi tỉnh về việc triển khai khoán, không có dòng nào đến từ trạm 15.
  Chỉ còn thiếu {{kn_remaining:KN-KHOAN}} biên bản nữa thì trang sổ về giấy khoán đã đến sớm hơn.

### Câu trích
- Nội dung: nhìn thẳng vào sự thật, đánh giá đúng sự thật, nói rõ sự thật
- Chương: 1
- Mục: 2.3

### Số phận nhân vật
- [ba-tu] {nếu ba-tu.m2 = giu} Bà Tư không qua trạm 15 lần nào nữa. Bà đi đường vòng qua bến đò, xa hơn mười cây số.
- [ong-quynh] Ông Quỳnh được điều về tỉnh. Sổ của trạm không ghi lại được điều gì bất thường.

### Câu hỏi cuối
- Bạn đã thấy những gì mà không báo lên?
```

## Ánh xạ sang JSON

Dành cho người chuyển file này sang `data/endings.json`.

| Tiêu đề / dòng | Trường JSON |
|---|---|
| `## KẾT CỤC <mã>` | một phần tử mới |
| Mã / Tên / Thứ tự xét | `id` / `title` / `priority` |
| `### Điều kiện` | `conditions`: mỗi dòng thành `{ "stat", "op", "value" }`. `- không` → `[]` |
| `#### Cảnh <số>` | một phần tử của `scenes` |
| Ảnh | `image` (`không` → bỏ trường) |
| Điều kiện của cảnh | `when` (`không` → bỏ trường) |
| Nội dung | `text`; các dòng thụt vào nối bằng ký tự xuống dòng `\n` |
| Câu trích | `quote.text` / `quote.chapter` / `quote.section` |
| `### Số phận nhân vật` | `character_lines`: mỗi dòng thành `{ "character", "text", "when"? }`. `- không` → `[]` |
| `### Câu hỏi cuối` | `closing_question` (`- không` → `null`) |
