# Template T3 — Nhân vật

> Trạng thái: CHỐT

Mọi nhân vật nằm trong **một** file `content/characters.md`, mỗi nhân vật là một khối bắt đầu bằng `## NHÂN VẬT <mã>`. File này được chuyển sang `data/characters.json` **trước** mọi file ngày, vì khi chuyển các file ngày, P1 cần nó để đối chiếu tên trên giấy tờ.

## Quy tắc viết

1. **Không đổi, không thêm, không bỏ tiêu đề nào.** Mục không dùng thì ghi `- không`.
2. Mọi mã viết đúng như bảng tra cứu ở cuối file T1.
3. Nhân vật nào xuất hiện trên giấy tờ thì phải có mục "Dữ liệu cố định trên giấy tờ". Đây là nguồn duy nhất cho họ tên, năm sinh của họ ở mọi lượt.

## Khối để chép

```markdown
## NHÂN VẬT 

### Thông tin
- Mã: 
- Tên hiển thị: 
- Vai trò: mot-lan
- Tuổi: 
- Quê / nơi ở: 

### Hoàn cảnh


### Giọng nói


### Chân dung
- Mã ảnh: 
- Biểu cảm cần vẽ: binh-thuong
- Mô tả: 

### Dữ liệu cố định trên giấy tờ
- không

### Các lần xuất hiện
- 
```

## Hướng dẫn từng mục

### Thông tin

| Dòng | Điền gì |
|---|---|
| Mã | Mã nhân vật. Nhân vật một lần dùng `np-<mô-tả>` |
| Tên hiển thị | Tên gọi trong game, có thể là tên thân mật: `Bà Tư Lành`, `Thằng Tí` |
| Vai trò | `nguoi-choi`, `chinh`, `phu`, `gia-dinh`, hoặc `mot-lan` |
| Tuổi | Tuổi ở lần xuất hiện đầu tiên. `không` nếu không rõ |
| Quê / nơi ở | Ví dụ `xã Phú Hoà` |

Vai trò `chinh` bắt buộc xuất hiện ít nhất 3 lượt. Vai trò `mot-lan` xuất hiện đúng 1 lượt và mã phải bắt đầu bằng `np-`.

### Hoàn cảnh

Một đoạn văn ngắn, 2–4 câu. Chỉ để người viết tham khảo, không hiện trong game.

### Giọng nói

Một đoạn văn: xưng hô thế nào, gọi Thành là gì, nói nhanh hay chậm, hay dùng từ gì. Mọi người viết lượt có nhân vật này phải theo đúng mục này. Xem thêm quy ước từ ngữ thời kỳ ở `docs/02-bible.md`.

### Chân dung

| Dòng | Điền gì |
|---|---|
| Mã ảnh | kebab-case không dấu, thường trùng mã nhân vật |
| Biểu cảm cần vẽ | Danh sách biểu cảm, cách nhau bằng dấu phẩy. Mọi biểu cảm dùng trong các lượt của nhân vật phải có ở đây |
| Mô tả | Mô tả cho người vẽ. **Không** dựa trên ảnh người thật |

### Dữ liệu cố định trên giấy tờ

Người không có giấy tờ nào (thằng Tí, người trong gia đình) để `- không`. Người có giấy tờ điền:

```markdown
### Dữ liệu cố định trên giấy tờ
- Họ và tên: 
- Năm sinh: 
- Nơi ở: 
- Số sổ hộ khẩu: 
```

Họ và tên, năm sinh là bắt buộc. Nơi ở và số sổ hộ khẩu có thể ghi `không`.

Họ và tên ở đây là tên trên giấy tờ, có thể khác tên hiển thị: bà Tư Lành có tên trên giấy là Trần Thị Lành.

### Các lần xuất hiện

Mỗi dòng một mã lượt, theo thứ tự thời gian. Nhân vật không xuất hiện ở ô cửa (người chơi, gia đình, trạm trưởng) để `- không`. Validate đối chiếu danh sách này với `travelers.json`.

## Ví dụ đã điền

```markdown
## NHÂN VẬT ba-tu

### Thông tin
- Mã: ba-tu
- Tên hiển thị: Bà Tư Lành
- Vai trò: chinh
- Tuổi: 50
- Quê / nơi ở: xã Phú Hoà

### Hoàn cảnh
Xã viên hợp tác xã Phú Hoà. Chồng mất, nuôi đứa cháu nội mồ côi mẹ. Làm ruộng giỏi, là một trong những hộ đầu tiên nhận khoán.

### Giọng nói
Xưng tôi, gọi Thành là chú. Nói chậm, lễ phép, hay nhắc lại chuyện lần trước gặp. Không bao giờ cãi, chỉ trình bày.

### Chân dung
- Mã ảnh: ba-tu
- Biểu cảm cần vẽ: binh-thuong, vui, lo-lang, buon
- Mô tả: Phụ nữ nông thôn ngoài 50, nón lá, áo nâu, gánh hai thúng.

### Dữ liệu cố định trên giấy tờ
- Họ và tên: Trần Thị Lành
- Năm sinh: 1929
- Nơi ở: Phú Hoà
- Số sổ hộ khẩu: PH-0217

### Các lần xuất hiện
- d1-t2
- d3-t3
- d5-t1
- d6-t1
```

## Ánh xạ sang JSON

Dành cho người chuyển file này sang `data/characters.json`.

| Tiêu đề / dòng | Trường JSON |
|---|---|
| `## NHÂN VẬT <mã>` | một phần tử mới |
| Mã | `id` |
| Tên hiển thị | `name` |
| Vai trò | `role` |
| Tuổi | `age` (số nguyên, `không` → `null`) |
| Quê / nơi ở | `home` |
| `### Hoàn cảnh` | `background` |
| `### Giọng nói` | `voice` |
| Mã ảnh / Biểu cảm cần vẽ / Mô tả | `portrait.key` / `portrait.expressions` / `portrait.description` |
| `### Dữ liệu cố định trên giấy tờ` | `fixed_fields` (`- không` → `null`) |
| Họ và tên / Năm sinh / Nơi ở / Số sổ hộ khẩu | `fixed_fields.ho_ten` / `nam_sinh` / `noi_o` / `so_shk` (`không` → bỏ trường) |
| `### Các lần xuất hiện` | `appearances` (`- không` → `[]`) |
