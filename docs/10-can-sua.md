# Cần sửa

> Trạng thái: ĐANG MỞ — cập nhật liên tục

Sổ ghi các chỗ cần sửa phát hiện trong lúc làm, chủ yếu từ chơi thử. Mỗi mục ghi đủ: triệu chứng, nguyên nhân, hướng sửa, việc phải làm ở từng file, và cách kiểm tra là đã sửa xong.

Mã: `V<số>` theo thứ tự phát hiện. Trạng thái: `MỞ` (chưa quyết) → `ĐÃ CHỐT` (đã quyết, chưa làm) → `XONG`.

| Mã | Tên | Mức | Trạng thái |
|---|---|---|---|
| V2 | Người chơi không biết điều nào áp dụng cho hàng gì | Nặng | XONG — còn chờ kiểm tra bằng chơi thử |
| V3 | Quyết định chưa thấy rõ ảnh hưởng lên đời người khác | Nặng | XONG — còn chờ kiểm tra bằng chơi thử |
| V4 | Có quy định không lượt nào vi phạm — Điều 4 | Vừa | XONG |
| V5 | Con dấu chưa có cảm giác tay | Vừa | XONG — còn chờ kiểm tra bằng chơi thử |
| V6 | Không nhìn thấy hàng đợi | Nhẹ | XONG — còn chờ kiểm tra bằng chơi thử |
| V7 | Không có gì mang ra khỏi game | Vừa | XONG — còn chờ kiểm tra sau buổi trình bày |
| V8 | Soi giấy chỉ là đọc rồi bấm | Nặng | XONG — còn chờ kiểm tra bằng chơi thử |

Mã không dùng lại. V1 đã xử lý xong trong code nên không có trong sổ.

---

## V2 — Người chơi không biết điều nào áp dụng cho hàng gì

**Mức:** nặng. Người chơi mất niềm tin vào luật.

**Triệu chứng:** sổ ghi không quá 5 kg, nhưng người buôn mang 15 m vải qua trạm. Người chơi không hiểu vải có bị định mức hay không.

**Nguyên nhân:** luật trả lời được nhưng game không nói ra. Điều 2 chỉ áp dụng cho lương thực; vải thuộc `HANG_TIEU_DUNG` nên định mức không đụng tới. Trước ngày 5, thứ duy nhất ràng buộc vải là Điều 1.

| Tình huống | Đúng theo sổ |
|---|---|
| 15 m vải **có ghi** trên giấy đi đường, dấu hợp lệ | CHO QUA, không vi phạm gì |
| 15 m vải **không ghi**, hoặc giấy ghi 3 m mà mang 15 m | GIỮ LẠI, `R1-GDD/E6` |
| Từ d5, có ghi nhưng không có hoá đơn HTX lẫn giấy phép vận chuyển | GIỮ LẠI, `R5-CHUNG-TU/E5` |

### Đã quyết

- `applies_to` là **trường riêng** trong `rules.json`, kèm `scope_note` là câu hiển thị. Giao diện cần nó cho nhãn trên dòng hàng.
- **Không** cho Điều 2 quản vải. Giữ luật, chỉ sửa cách trình bày.

### Đã làm

| Hướng | Việc |
|---|---|
| a. Trang sổ nói rõ phạm vi | Mỗi điều có dòng "Áp dụng cho" ngay dưới tiêu đề (`scope_note`) |
| b. Nhãn điều trên dòng hàng | Khung "Hàng hoá mang theo" gắn nhãn điều đang áp dụng cho từng dòng (vải ở d2: "Điều 1"; gạo: "Điều 1, Điều 2"; hàng không thuộc điều nào: "Không điều nào"). Engine: `src/engine/scope.ts` |
| c. Nhắc nhở giữ oan nêu tên điều | Giấy nhắc nhở liệt kê từng dòng hàng: thuộc phạm vi điều nào, không thuộc điều nào |
| d. Nhãn `hop-le-ma-hai` | Thêm vào schema, T1, P1, `03` mục 1.13. Gắn cho ba lượt ông Quỳnh (d2-t3, d4-t4, d5-t2) |

File: `03-rules-spec.md` mục 1.7 và 1.13, `rules.json`, `rules.schema.json`, `travelers.schema.json`, `T1-luot-khach.md`, `P1-script-to-json.md`, `strings.json`, `src/engine/scope.ts`, `turn.ts`, `Rulebook.tsx`, `DeskScreen.tsx`. Validate tầng 3 thêm điều 13 (nhãn khớp đáp án) và điều 14 (`applies_to` khớp tham số hàm kiểm tra).

### Kiểm tra là đã sửa xong

Cho một người chưa chơi bao giờ chơi đến lượt hàng tiêu dùng hợp lệ. Họ phải nói đúng được vì sao cho qua, mà không cần hỏi ai. **Chưa kiểm tra** — chờ buổi chơi thử.

---

## V3 — Quyết định chưa thấy rõ ảnh hưởng lên đời người khác

**Mức:** nặng. Đây là thứ quyết định game hay hay dở, không phải luật.

**Triệu chứng:** đóng dấu xong thấy vài con số đổi ở bảng bên phải và một dòng ghi chú, rồi hết.

**Nguyên nhân:** hậu quả đang là số, không phải người. Cờ có sẵn nhưng nội dung chưa dùng để rẽ nhánh. Hai hệ thống trạm và gia đình chạy song song mà không chạm nhau.

### Đã quyết

- Ba nhánh có **chân dung riêng** cho bà Tư, anh Hùng, thằng Tí (chân dung sinh bằng script nên làm được cả ba). Ông Quỳnh không rẽ nhánh theo cờ; lời thoại của ông phản ứng theo giá gạo.
- **Giữ** lượt người cùng xóm: nó cho thấy cơ chế đẩy người tử tế vào chỗ phải chọn.
- Khoản chi phụ thuộc cờ **giới hạn ở đúng một lượt** (bác Nga), để nó còn sức nặng.

### Đã làm

| Hướng | Việc |
|---|---|
| a. Đường đời ba nhánh | Điều kiện mới `flag_count` (đếm số lần bị giữ). Bà Tư d5, d6; anh Hùng d5, d6; thằng Tí d4, d6 rẽ nhánh cả lời thoại lẫn chân dung (`portrait.variants`). Lời dẫn `narrator` cho nhánh gãy |
| b. Biết trước cái giá | Thằng Tí d3 nói thẳng: bố sốt rét, đơn kê 10 viên, nó mua thêm cho đủ đợt, "chú mà giữ thì bố cháu uống dở chừng". Đáp án theo sổ là GIỮ LẠI (`R3/E6`) |
| c. Hậu quả trễ một màn | d3 → d4 (bố thằng Tí sốt lại), d3 → d5 (cháu bà Tư nằm nửa tháng), d3–d5 → d6 |
| d. Nối gia đình với trạm | Lượt bác Nga d5-t4, ngay trước phong bì của màn 3. Cho qua: thuốc cho mẹ 0 đồng. Giữ lại: mua chợ đen 180 đồng. Khoản chi trong `days.json` nhận `when` |
| e. Thằng Tí năm 1987 | Mười tám tuổi, buôn chuyến vải. Nếu thuốc năm 1981 bị giữ: nhận ra Thành, nhìn rất lâu, không nói gì |
| f. Tin đồn trong ngày | Hai lượt liền trước đều bị giữ thì người tới sau đã thủ thế (dòng "Tin đồn ngoài hàng chờ") |
| g. Người thứ hai trong phòng | Trạm trưởng Đối đứng sau lưng ở d3-t3, d4-t3, d5-t1 (`days[].observed`). Làm ngơ ở những lượt này vẫn bị ghi sổ và nhắc nhở |

Thêm điều kiện `indicator` (theo chỉ số huyện) vào `03` mục 1.10 và cả ba schema có `$defs/condition`.

File: `00-idea.md`, `02-bible.md` mục 3.2a, `05-art-brief.md` mục 4a, `characters.md`, `ngay-3.md` … `ngay-6.md`, `days.json`, `travelers.json`, `characters.json`, `03-rules-spec.md` mục 1.10, 5.2, 8.2, schema, `generate-portraits.ts`.

### Kiểm tra là đã sửa xong

Cho hai người chơi hai lối khác nhau đến hết d5, rồi hỏi họ kể lại chuyện gì đã xảy ra với bà Tư và thằng Tí. **Chưa kiểm tra** — chờ buổi chơi thử.

---

## V4 — Có quy định không lượt nào vi phạm — Điều 4

**Mức:** vừa. Không sai luật, nhưng làm hỏng niềm tin của người chơi vào sổ.

**Triệu chứng:** d4 thêm Điều 4 nhưng không ai lệch tên hay năm sinh. Rà lại thì **Điều 3 và Điều 5 cũng không có lượt vi phạm nào**.

### Đã quyết

- Bà Tư không xuất hiện ở d4, và thêm lỗi tên vào lượt khoán d5 của bà sẽ phá ý nghĩa của R5K. Vì vậy Điều 4 bắt **một người vô tội và một người có tội** thay vì hai và một.
- Lượt anh Hùng lệch năm sinh: đáp án theo sổ là GIỮ LẠI. Giữ nguyên, chính vì nặng tay nên nó mới đáng viết.
- Không làm bẫy ngược cho Điều 4.

### Đã làm

| Quy định | Lượt vi phạm |
|---|---|
| Điều 3 (R3) | Thằng Tí d3-t1: 20 viên quinin, đơn kê 10 (`E6`). Bác Nga d5-t4: Reserpin không đơn (`E5`, thêm Reserpin vào danh mục) |
| Điều 4 (R4) | Anh Hùng d4-t2: giấy thương binh ghi 1951, hộ khẩu 1952 (`E2`, ngô giảm còn 5 kg để lỗi này là lỗi duy nhất). Gã đầu cơ d5-t5: giấy đi đường đứng tên em trai (`E2`) |
| Điều 5 (R5) | Anh Hùng d5-t3: chắn bùn tổ thương binh tự gò, không hoá đơn vì tổ chưa là hợp tác xã (`E5`). Bác Nga d5-t4: sữa đặc không hoá đơn (`E5`) |

d5 có 6 lượt (27 lượt tổng), `per_traveler_min` của d5 giảm còn 85. Validate tầng 3 thêm điều 12: mỗi quy định trừ `R5K-KHOAN` và `R6-HANG-CAM` có ít nhất 2 lượt vi phạm.

### Kiểm tra là đã sửa xong

Validate tầng 3 điều 12 xanh. Và khi chơi, người chơi phải mở sổ hộ khẩu ở mọi lượt từ d4 chứ không bỏ qua nó (chờ chơi thử).

---

## V5 — Con dấu chưa có cảm giác tay

**Mức:** vừa. Người chơi làm thao tác này 26 lần, nên nó quyết định cảm giác của cả game.

**Triệu chứng:** đóng dấu là bấm một cái nút. Không khác gì điền form.

**Nguyên nhân:** chưa làm phần cảm giác, mới làm phần logic.

### Đã quyết

- Mặc định là kéo thả. Phím `1` / `2` là lối tắt cho ai muốn chơi nhanh.
- Vệt mực **không** lưu sang thẻ kết quả (V7). Thẻ chỉ in con dấu ĐÃ DUYỆT chung, khỏi phải giữ toạ độ thả của từng lượt.

### Đã làm

| Hướng | Việc |
|---|---|
| Con dấu là vật thể | Nhấn giữ, kéo xuống giấy, thả mới ăn. Thả ngoài giấy thì con dấu bật về khay (260 ms). Bấm mà không kéo thì hiện lời nhắc cách kéo. `src/components/stamping.tsx` |
| Vệt mực | In đúng chỗ thả, nghiêng ±9°, đậm 0,72–0,95. CHO QUA đỏ, GIỮ LẠI đen, hạt mực loang |
| Chỗ đóng dấu | Phiếu kiểm soát luôn nằm trên bàn, để người không mang giấy vẫn có chỗ đóng |
| Tiếng và rung | Tiếng `stamp` và mặt bàn rung một khung (110 ms) khi dấu ăn |
| Giấy trượt ra | Bấm "Tiếp" thì giấy trượt khỏi bàn (380 ms, tiếng `paper`) rồi mới sang lượt |
| Âm thanh | File `sfx_stamp.mp3` có 0,5 s im lặng ở đầu nên tiếng dấu kêu trễ sau cú thả. Game giờ tự bỏ khoảng lặng đầu file và giới hạn thời lượng từng âm (`docs/09-am-thanh.md` mục 6) |

| Sửa lỗi kẹt (28/9) | Con dấu có lúc đứng yên giữa màn hình, chỉ chạy theo chuột khi rê qua nút. Nguyên nhân: lần kéo dựa vào pointer capture của nút, mà capture có thể mất giữa chừng (đổi tab, nhả chuột ngoài cửa sổ, nút bị khoá) trong khi trạng thái kéo vẫn còn. Giờ mỗi lần kéo gắn trình nghe lên `window` và mọi cách kết thúc bất thường (mất `pointerup`, đổi cửa sổ, Esc, nút bị khoá) đều cho con dấu bay về khay. Test `src/stamping.test.tsx` |

File: `stamping.tsx`, `ActionControls.tsx`, `DeskScreen.tsx`, `DocumentPaper.tsx`, `index.css`, `audio.ts`, `03-rules-spec.md` mục 5.4, `05-art-brief.md` mục 4b.

### Kiểm tra là đã sửa xong

Người chơi thử đóng dấu ba lượt rồi hỏi họ thấy thế nào. Nếu họ nhắc đến tiếng dấu hoặc vệt mực mà không cần gợi ý, là đạt. **Chưa kiểm tra**, chờ buổi chơi thử.

---

## V6 — Không nhìn thấy hàng đợi

**Mức:** nhẹ. Rẻ, và bù được một phần áp lực mà đồng hồ số không tạo được.

**Triệu chứng:** người chơi soi giấy bao lâu cũng được, không thấy gì thúc mình.

**Nguyên nhân:** đồng hồ ca là con số ở thanh trên, dễ quên mất.

### Đã làm

| Hướng | Việc |
|---|---|
| Hàng người | Cảnh nhìn qua cửa sổ ngay dưới ô cửa: đường đất, luỹ tre, người xếp hàng to nhỏ theo khoảng cách, số người bằng số lượt còn lại trong ngày (tối đa 6). Năm dáng: gánh hàng, mũ cối, dắt xe đạp, bế con, cụ già chống gậy. Vẽ lại ngày 28/9 vì bản đầu là biểu tượng quá nhỏ. `src/components/QueueStrip.tsx` |
| Trời tối dần | Từ 90 phút trước giờ hết ca trời chuyển chạng vạng; quá giờ thì tối hẳn, bóng người co lại và run vì rét |
| Cái giá của biên bản | Kèm biên bản thì đồng hồ nhảy trước 60 phút ngay lúc bấm, có hoạt ảnh (phóng to, chữ đỏ, số chạy), và hàng người nhúc nhích |

Thuần hình, không đụng cơ chế. File: `QueueStrip.tsx`, `WindowPanel.tsx`, `TopBar.tsx`, `DeskScreen.tsx`, `03-rules-spec.md` mục 7.1, `05-art-brief.md` mục 4c.

### Kiểm tra là đã sửa xong

Người chơi lập biên bản lần đầu phải ngẩng lên nhìn đồng hồ hoặc cửa sổ. **Chưa kiểm tra**, chờ buổi chơi thử.

---

## V7 — Không có gì mang ra khỏi game

**Mức:** vừa. Đây là thứ quyết định game có lan ra ngoài buổi trình bày hay không.

**Triệu chứng:** chơi xong, đóng tab, hết. Không có gì để kể lại hay đưa cho người khác xem.

**Nguyên nhân:** màn kết là chữ trên trang web, không phải vật.

### Đã quyết

- Thẻ **vuông 1200 × 1200**, dễ đăng mạng xã hội.
- Tên người chơi **tuỳ chọn**, gõ ngay ở màn kết cạnh nút tải. Không hỏi ở đầu game, để không thêm bước nào trước khi vào chơi.

### Đã làm

| Hướng | Việc |
|---|---|
| Thẻ kết quả | Vẽ canvas trên nền giấy cũ, nút tải PNG. `src/components/ResultCard.tsx`, `EndingScreen.tsx` |
| Nội dung thẻ | Tên kết cục và `card_line`; ba con số (chấp hành theo báo cáo, thực tế, số biên bản), ô "thực tế" đỏ và dấu ≠ khi hai tỷ lệ lệch; dòng đối chất (V8); một dòng nhân vật lấy từ số phận đầu tiên hiện được; câu trích giáo trình; dòng chân tên game, nhóm, môn |
| Dữ liệu | `card_line` bắt buộc trong `endings.json` và schema; đã thêm vào `content/endings.md` (dòng "Dòng trên thẻ") và T4 |

File: `ResultCard.tsx`, `EndingScreen.tsx`, `endings.json`, `endings.schema.json`, `strings.json`, `content/endings.md`, `T4-ket-cuc.md`, `05-art-brief.md` mục 4d.

### Kiểm tra là đã sửa xong

Sau buổi trình bày, đếm xem có ai trong lớp đăng thẻ lên mạng xã hội hoặc gửi cho nhau không. **Chưa kiểm tra**.

---

## V8 — Soi giấy chỉ là đọc rồi bấm

**Mức:** nặng. Đây là vòng lặp chính của game, làm 26 lần.

**Triệu chứng:** người chơi đọc giấy, thấy sai, bấm GIỮ LẠI. Nhân vật ở cửa sổ không liên quan gì đến thao tác đó. Có thể chơi hết game mà không thực sự nhìn ai.

**Nguyên nhân:** chưa có bước nào bắt người chơi **chỉ ra** cái sai.

### Đã quyết

- Đối chất nhầm (hai chỗ khớp nhau hoặc không so được) **mất 15 phút** ca. Đối chất đúng không mất gì.
- **Không** bắt buộc đối chất mới được GIỮ LẠI.
- Viết lời phản ứng cho **15 lượt**: mọi lượt của nhân vật lặp lại (bà Tư, anh Hùng, thằng Tí, ông Quỳnh) từ d1 đến d5, cả hai lượt E2 của V4 (anh Hùng d4-t2 lệch năm sinh, gã dùng giấy em trai d5-t5 lệch tên), và các lượt buôn lậu có lỗi rõ. V4 chỉ có hai lượt E2, không phải ba. d6 không có vì không còn giấy tờ để soi.
- Không thêm nét bút chì "nghi ngờ" riêng: số lần đối chất đã là số lần người chơi tự khai rằng mình thấy.

### Đã làm

| Hướng | Việc |
|---|---|
| Bút chì đối chất | Nút trên thanh công cụ bàn làm việc. Khoanh hai chỗ (trường trên giấy, dòng hàng trên giấy, dòng hàng thực mang theo) rồi bấm "Đối chiếu". `DeskScreen.tsx`, `DocumentPaper.tsx` |
| Màn so hai chỗ | Hai chỗ đặt cạnh nhau, đóng chữ LỆCH / KHỚP / KHÔNG SO ĐƯỢC, lời nhân vật hiện cả ở cửa sổ. `ConfrontPanel.tsx`, `WindowPanel.tsx` |
| Engine | `src/engine/confront.ts`; action `DOI_CHAT`; đếm `doi_chat`, `doi_chat_dung`, `doi_chat_hanh_dong`, `doi_chat_bo_qua` theo lượt |
| Lời phản ứng | `travelers[].confront` (theo loại lệch: `name`, `year`, `item`, `other`, `any`, và `khop` khi khoanh nhầm). Đã chép sang `content/ngay-*.md` mục "Phản ứng khi đối chất" |
| Màn kết | Mỗi kết cục có cảnh "Bạn chỉ ra chỗ lệch ở N lượt. Bạn hành động theo điều mình thấy ở M lượt." Bảng chỉ số màn kết và thẻ kết quả cũng in hai con số này |

Sửa thêm ngày 28/9: hai chỗ khoanh không so được với nhau (ví dụ năm sinh với tên) trước đây vẫn lấy câu "khoanh nhầm" của nhân vật. Giờ giao diện hiện câu chung giải thích cách khoanh (`confront.generic_incomparable`).

File: `confront.ts`, `game.ts`, `turn.ts`, `state.ts`, `endings.ts`, `text.ts`, `types.ts`, `travelers.json` và schema, `endings.json` và schema, `content/ngay-1.md` … `ngay-5.md`, `content/endings.md`, `T1-luot-khach.md`, `T4-ket-cuc.md`, `P1-script-to-json.md`, `03-rules-spec.md` mục 5.5, 7.1, 9.1.

### Kiểm tra là đã sửa xong

Người chơi phải nhớ được ít nhất một câu nhân vật nói khi bị đối chất, và phải phản ứng khi thấy dòng "biết mà vẫn làm" ở màn kết. **Chưa kiểm tra**, chờ buổi chơi thử.

---

## Mẫu để thêm mục mới

```markdown
## V<số> — <tên ngắn>

**Mức:** nhẹ / vừa / nặng

**Triệu chứng:**

**Nguyên nhân:**

### Hướng sửa

### Việc phải làm

| File | Việc |
|---|---|

### Còn phải quyết

### Kiểm tra là đã sửa xong
```
