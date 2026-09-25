# Trạm 15

> Game mô phỏng ra quyết định lấy cảm hứng từ *Papers, Please*. Người chơi là tổ trưởng một trạm kiểm soát liên huyện giai đoạn 1979–1987, đối chiếu giấy tờ người qua trạm với cuốn sổ chỉ thị. Sản phẩm sáng tạo môn Chủ nghĩa xã hội khoa học.

## Mục lục

1. [Bắt đầu nhanh](#1-bắt-đầu-nhanh)
2. [Cây thư mục](#2-cây-thư-mục)
3. [Luồng công việc](#3-luồng-công-việc)
4. [Vai trò trong nhóm](#4-vai-trò-trong-nhóm)
5. [Bảng tra cứu file](#5-bảng-tra-cứu-file)
6. [Quy ước đặt mã](#6-quy-ước-đặt-mã)
7. [Thứ tự triển khai](#7-thứ-tự-triển-khai)
8. [Lệnh thường dùng và quy ước Git](#8-lệnh-thường-dùng-và-quy-ước-git)

---

## 1. Bắt đầu nhanh

Cần Node 20 trở lên. Dự án dùng **pnpm**, phiên bản ghi ở trường `packageManager` trong `package.json`. Không dùng `npm install`, vì hai công cụ sẽ làm lockfile lệch nhau.

```bash
git clone https://github.com/Thieu-Van-Hieu/15-station.git
cd 15-station
npm i -g pnpm          # chỉ cần một lần trên mỗi máy
pnpm install
pnpm validate          # kiểm tra toàn bộ data/
```

Kế hoạch triển khai nằm ở `docs/07-trien-khai.md`. Danh sách việc và test của từng phase nằm ở `docs/08-cac-phase.md`.

---

## 2. Cây thư mục

```
tram-15/
├── README.md                   ← file này
├── docs/                       ← tài liệu định hướng, không phải nội dung game
│   ├── 00-idea.md              ← ý tưởng gốc
│   ├── 01-todo.md              ← việc cần làm theo ngày và người
│   ├── 02-bible.md             ← thế giới, giọng văn, quy ước hư cấu
│   ├── 03-rules-spec.md        ← đặc tả luật chơi — CHỐT ĐẦU TIÊN
│   ├── 04-sources.md           ← câu trích giáo trình, mốc lịch sử
│   ├── 05-art-brief.md         ← danh sách asset
│   ├── 06-presentation.md      ← kịch bản trình bày, hỏi đáp
│   ├── 07-trien-khai.md        ← kế hoạch triển khai, kiến trúc src/, deploy
│   └── 08-cac-phase.md         ← việc và test của từng phase P0–P9
├── content/                    ← nội dung viết bằng văn (Markdown)
│   ├── templates/
│   │   ├── T1-luot-khach.md
│   │   ├── T2-ngay.md
│   │   ├── T3-nhan-vat.md
│   │   └── T4-ket-cuc.md
│   ├── characters.md
│   ├── ngay-1.md … ngay-6.md
│   ├── endings.md
│   └── ui-text.md
├── prompts/                    ← prompt chuyển đổi và soát lỗi
│   ├── P1-script-to-json.md
│   ├── P2-logic-review.md
│   └── P3-fact-check.md
├── data/                       ← JSON game đọc — NGUỒN DUY NHẤT sau khi kiểm tra
│   ├── schema/                 ← một JSON Schema cho mỗi file dữ liệu
│   ├── rules.json
│   ├── documents.json
│   ├── characters.json
│   ├── days.json
│   ├── travelers.json
│   ├── reports.json
│   ├── endings.json
│   └── strings.json
├── scripts/
│   └── validate-data.ts        ← kiểm tra dữ liệu 3 tầng
└── src/                        ← code game (React + Vite + Tailwind)
```

---

## 3. Luồng công việc

```
 content/*.md  ──── P1 ────►  data/*.json  ──── validate ────►  ✅  ────►  src/ (game)
  Viết theo                  Bản chuyển         3 tầng           JSON là
  template                   từ LLM                              nguồn duy nhất
                                  ▲                  │
                                  └──── sửa lỗi ─────┘
                                   (sửa trực tiếp trên JSON)
```

**Bốn bước:**

1. **Viết.** Người viết điền nội dung vào `content/*.md` theo đúng template trong `content/templates/`.
2. **Chuyển.** Chạy prompt `P1-script-to-json.md` trên từng file, dán kết quả vào `data/*.json`.
3. **Kiểm.** Chạy `scripts/validate-data.ts`. Sau đó chạy `P2` (logic) và `P3` (nguồn) để bắt thêm lỗi mà script không thấy được.
4. **Khoá.** Khi validate xanh, đổi trạng thái file Markdown thành `ĐÃ CHUYỂN JSON`.

> **Quy tắc vàng: JSON là nguồn duy nhất sau khi đã qua kiểm tra.**
>
> Từ lúc một phần nội dung được chuyển sang JSON và `validate-data.ts` báo xanh, mọi chỉnh sửa về sau làm trực tiếp trên `data/*.json`. Không sửa Markdown rồi chạy P1 lại.
>
> Lý do: LLM không cho ra kết quả giống hệt nhau mỗi lần chạy. Nếu vừa sửa JSON vừa chuyển lại từ Markdown, hai bản sẽ lệch nhau mà không ai nhận ra, và những chỗ đã sửa tay trên JSON sẽ bị ghi đè.

### Trạng thái file Markdown

Dòng thứ hai của mọi file trong `content/` là dòng trạng thái:

| Trạng thái | Ý nghĩa | Được sửa ở đâu |
|---|---|---|
| `NHÁP` | Đang viết | Markdown |
| `CHỐT` | Viết xong, chờ chuyển | Markdown, nhưng phải báo nhóm |
| `ĐÃ CHUYỂN JSON (dd/mm, tên người chuyển)` | Đã chuyển và qua validate | **Chỉ trên JSON.** Markdown giữ làm bản lưu, chỉ đọc |

### Ngoại lệ: viết lại lớn

Khi cần viết lại từ một lượt khách trở lên, được phép quay về Markdown, nhưng phải đi đủ các bước:

1. Chép ngược mọi chỉnh sửa nhỏ đã làm trên JSON của ngày đó vào Markdown, nếu không chúng sẽ mất.
2. Đổi trạng thái về `NHÁP`, viết lại.
3. Chạy P1 cho **cả ngày**, thay thế **toàn bộ** bản ghi của ngày đó trong JSON. Không ghép tay từng đoạn.
4. Chạy validate, P2, rồi khoá lại.
5. Báo cả nhóm.

---

## 4. Vai trò trong nhóm

Dùng các nhãn này trong bảng tra cứu và trong `01-todo.md`.

| Nhãn | Vai trò | Phụ trách chính |
|---|---|---|
| **KB** | Kịch bản và nguồn | Nội dung, dữ liệu, kiểm tra nguồn lịch sử và trích dẫn |
| **GP** | Gameplay | Engine, schema, prompt P1, script validate |
| **UI** | Giao diện và art | Layout, asset, chữ giao diện |
| **KT** | Kết và test | Màn kết, âm thanh, chơi thử, trình bày |

Nhóm 3 người: gộp KT vào KB và GP.

---

## 5. Bảng tra cứu file

### 5.1. `docs/`

| File | Mục đích | Người phụ trách | Định dạng | Ràng buộc và phụ thuộc |
|---|---|---|---|---|
| `00-idea.md` | Ý tưởng gốc, ba nguyên tắc thiết kế, cốt truyện | KB, chỉ đọc | Markdown | Không sửa trừ khi cả nhóm đổi ý. Nếu mâu thuẫn với `03`: `03` thắng về chi tiết luật, `00` thắng về ba nguyên tắc thiết kế |
| `01-todo.md` | Việc theo ngày và người. Mỗi việc ghi đầu ra là file nào, phụ thuộc việc nào, và định nghĩa hoàn thành | KT giữ, cả nhóm cập nhật | Checklist `- [ ]` | Cập nhật cuối mỗi ngày |
| `02-bible.md` | Địa danh hư cấu, giọng nói từng nhân vật, từ ngữ thời 1979–1987 nên dùng và nên tránh, quy ước hư cấu – mô phỏng | KB | Markdown | Phải xong trước khi viết `ngay-*.md`. Ai viết nội dung cũng phải đọc trước |
| `03-rules-spec.md` | Đặc tả luật: quy định sổ chỉ thị, 6 loại lỗi, cách tính đáp án, kiến nghị và ngưỡng, công thức chỉ số, hệ thống cờ, công thức chọn kết cục. **Chứa danh mục mã chính thức** | KB + GP | Markdown, điều kiện viết dạng logic | **Chốt đầu tiên.** Schema, template, P1 đều dẫn xuất từ đây. Sửa file này thì phải rà lại schema, template và P1 trong cùng lần sửa |
| `04-sources.md` | Mọi câu trích giáo trình kèm chương và mục; mọi mốc Lịch sử Đảng kèm nguồn | KB | Markdown | Mọi trích dẫn xuất hiện trong game hoặc slide đều phải có ở đây. P3 đối chiếu với file này |
| `05-art-brief.md` | Chân dung (ai, biểu cảm, dùng ở lượt nào), mẫu giấy tờ, cảnh nền, bảng màu hex, font, âm thanh | UI | Markdown | Làm sau `02-bible.md`. Không dùng ảnh người thật cho chân dung |
| `06-presentation.md` | Kịch bản 10 phút, danh sách slide, hỏi đáp, checklist ngày trình bày | KT | Markdown | Bảng ánh xạ kiến thức lấy từ `00-idea.md` mục 11 |

### 5.2. `content/templates/`

| File | Mục đích | Người phụ trách | Định dạng | Ràng buộc và phụ thuộc |
|---|---|---|---|---|
| `T1-luot-khach.md` | Khung một lượt khách: mã lượt, nhân vật, lời thoại và biến thể theo cờ, giấy tờ và từng trường, hàng hoá, lỗi cài cắm, đáp án theo sổ, kiến nghị, hậu quả từng lựa chọn, cờ ghi lại, ghi chú art | KB + GP | Markdown, tiêu đề cố định | Dẫn xuất từ `travelers.schema.json`. Mọi trường của schema phải có chỗ điền trong template |
| `T2-ngay.md` | Khung một ngày: ngày tháng trong game, câu radio, quy định mới, dòng "Yếu tố khác", sự kiện gia đình, thứ tự lượt | KB + GP | như trên | Dẫn xuất từ `days.schema.json` |
| `T3-nhan-vat.md` | Khung một nhân vật: mã, tên, tuổi, quê, hoàn cảnh, giọng nói, các lần xuất hiện, dữ liệu cố định trên giấy tờ, mô tả chân dung | KB + GP | như trên | Dẫn xuất từ `characters.schema.json` |
| `T4-ket-cuc.md` | Khung một kết cục: điều kiện, nội dung theo cảnh, câu trích, nhân vật được nhắc | KB + GP | như trên | Dẫn xuất từ `endings.schema.json` |

> **Không đổi tên tiêu đề trong template.** Prompt P1 dựa vào tên tiêu đề để biết đoạn nào ứng với trường nào. Thêm hoặc đổi tiêu đề thì phải cập nhật P1 cùng lúc.

### 5.3. `content/`

| File | Mục đích | Người phụ trách | Định dạng | Ràng buộc và phụ thuộc |
|---|---|---|---|---|
| `characters.md` | Toàn bộ nhân vật | KB | Nhiều khối T3 | Chuyển sang JSON **trước** các file ngày, vì P1 cần `characters.json`. Họ tên, năm sinh, quê trên giấy tờ phải giống nhau ở mọi lần xuất hiện |
| `ngay-1.md` … `ngay-6.md` | Nội dung từng ngày chơi | KB, có thể chia người | Một khối T2 + các khối T1 | Số lượt lần lượt: 3, 4, 4, 5, 5, 5 (tổng 26). Màn 2 (ngày 3–4) có ít nhất 3 lượt mang giấy khoán. Cả game có ít nhất 5 lượt buôn lậu thật. Ngày 6 đủ 5 lượt, không được cắt |
| `endings.md` | Năm kết cục | KB | Năm khối T4 | Mọi câu trích phải có trong `04-sources.md` |
| `ui-text.md` | Chữ trên nút, tooltip, màn chú thích mở đầu, màn hướng dẫn tem phiếu và giấy đi đường, giấy nhắc nhở, câu hỏi cuối màn kết | UI | Bảng khoá – giá trị | Khoá đặt dạng `khu_vực.thành_phần.tên`, ví dụ `desk.stamp.approve` |

### 5.4. `prompts/`

| File | Mục đích | Người phụ trách | Đầu vào | Ràng buộc |
|---|---|---|---|---|
| `P1-script-to-json.md` | Chuyển một file `content/*.md` sang JSON | GP | Một file nội dung + schema tương ứng + `characters.json` + bảng mã từ `03` | Chỉ trả về JSON. Thiếu thông tin thì ghi `"TODO"`, không đoán. Không bịa thêm trường. Không sửa lời thoại |
| `P2-logic-review.md` | Soát logic: lỗi cài có thật sự vi phạm quy định đang hiệu lực không, đáp án có khớp không, có lỗi nào vô tình cài vào không, lời thoại có lộ đáp án quá rõ không | KB | Sổ chỉ thị + JSON của một ngày | Chạy sau P1. Không thay thế người đọc lại |
| `P3-fact-check.md` | Soát trích dẫn nguyên văn và đúng mục, mốc thời gian đúng, không vi phạm ba nguyên tắc thiết kế | KB | Nội dung cần soát + giáo trình + `04-sources.md` | Không thay thế người kiểm tra nguồn |

### 5.5. `data/`

| File | Mục đích | Người phụ trách | Ràng buộc |
|---|---|---|---|
| `schema/*.schema.json` | Cấu trúc hợp lệ của từng file dữ liệu | GP | JSON Schema draft 2020-12. Sửa schema thì sửa template T* và P1 trong **cùng một commit** |
| `rules.json` | Các quy định của sổ chỉ thị, ngày hiệu lực, điều kiện vi phạm dạng máy đọc được | GP | Khớp từng dòng với `03-rules-spec.md` |
| `documents.json` | Tám loại giấy: tên, các trường, trường bắt buộc, cách hiển thị | GP | Mã loại giấy theo mục 6 |
| `characters.json` | Nhân vật và dữ liệu cố định trên giấy tờ | KB | Chuyển đầu tiên trong nhóm nội dung |
| `days.json` | Sáu ngày chơi | KB | Thứ tự lượt phải tham chiếu mã có trong `travelers.json` |
| `travelers.json` | 26 lượt khách — file lớn nhất | KB | Xem nguyên tắc bên dưới. Chỉ một người sửa tại một thời điểm |
| `reports.json` | Vấn đề kiến nghị, lý do soạn sẵn, ngưỡng, hiệu ứng khi chạm ngưỡng | KB + GP | Ngưỡng mặc định 3 biên bản |
| `endings.json` | Năm kết cục | KB | Câu trích phải khớp `04-sources.md` |
| `strings.json` | Chữ giao diện | UI | Khoá giống `ui-text.md` |

> **Đáp án do engine tính, không do JSON quyết định.** Mỗi lượt trong `travelers.json` vẫn ghi đáp án người viết mong đợi, nhưng chỉ để đối chiếu. Engine tự tính đáp án từ `rules.json`, và `validate-data.ts` báo lỗi nếu hai bên lệch nhau. Nhờ vậy lỗi cài sai chỗ bị bắt ngay thay vì game âm thầm chấm sai.

### 5.6. `scripts/` và `src/`

| File | Mục đích | Người phụ trách | Ràng buộc |
|---|---|---|---|
| `scripts/validate-data.ts` | Kiểm tra dữ liệu 3 tầng: cấu trúc (schema), tham chiếu chéo (mã tồn tại, số lượt mỗi ngày, dữ liệu nhân vật nhất quán), logic (chạy engine lên từng lượt, kiểm tra ràng buộc thiết kế như đủ 5 lượt buôn lậu thật) | GP | Chạy trước mỗi commit đụng vào `data/` |
| `src/` | Code game | GP + UI | React + Vite + Tailwind, không backend. **Code không chứa nội dung cứng**: mọi chữ lấy từ `strings.json`, mọi luật lấy từ `rules.json`. Hàm validate của engine phải là hàm thuần đặt trong `src/engine/`, để `validate-data.ts` dùng lại đúng hàm đó |

---

## 6. Quy ước đặt mã

Bảng này là **quy tắc đặt tên** kèm ví dụ. **Danh mục mã chính thức nằm trong `docs/03-rules-spec.md`.**

| Loại | Quy tắc | Ví dụ |
|---|---|---|
| Nhân vật chính | kebab-case, không dấu | `ba-tu`, `anh-hung`, `ong-quynh`, `thang-ti`, `chi-thu`, `tram-truong-doi` |
| Nhân vật một lần | `np-` + mô tả | `np-buon-thuoc-la`, `np-dau-co-gao` |
| Ngày | `d` + số | `d1` … `d6` |
| Lượt khách | `d<ngày>-t<thứ tự>` | `d3-t2` |
| Loại giấy | viết tắt in hoa | `GDD` giấy đi đường, `SHK` sổ hộ khẩu, `TP` tem phiếu, `HDHTX` hoá đơn HTX, `GPVC` giấy phép vận chuyển, `DT` đơn thuốc, `CNTB` chứng nhận thương binh, `GXNK` giấy xác nhận sản phẩm khoán |
| Quy định | `R<ngày>-<TÊN>` | `R1-GDD`, `R2-DINH-MUC`, `R5K-KHOAN` (quy định có điều kiện) |
| Loại lỗi cài cắm | `E1` … `E6` | `E1` hết hạn, `E2` lệch tên, `E3` thiếu hoặc sai dấu, `E4` vượt định mức, `E5` thiếu giấy bắt buộc, `E6` mâu thuẫn nội dung |
| Vấn đề kiến nghị | `KN-<TÊN>` | `KN-KHOAN`, `KN-THUONG-BINH` |
| Cờ | `<nhân-vật>.<màn>` | `ba-tu.m2` với giá trị `giu`, `qua`, `qua-kn`, `giu-kn`, `lam-ngo` |
| Kết cục | `END-<TÊN>` | `END-KIEN-NGHI`, `END-GAC-CONG`, `END-LAM-NGO`, `END-AN-TIEN`, `END-SONG-SOT` |

Mã đã dùng trong JSON thì không đổi. Cần đổi thì đổi đồng loạt bằng tìm – thay thế toàn thư mục `data/`, rồi chạy validate.

---

## 7. Thứ tự triển khai

Các bước phụ thuộc nhau theo một chiều. Mỗi bước có một **cổng**: điều kiện phải đạt trước khi sang bước sau.

| Bước | Đầu ra | Phụ thuộc | Cổng |
|---|---|---|---|
| **1. Luật và schema** | `docs/03-rules-spec.md`, `data/schema/*`, và `validate-data.ts` tầng 1 | — | Cả nhóm duyệt `03`. Viết tay một lượt khách hoàn chỉnh bằng JSON (lượt bà Tư mang giấy khoán ở màn 2), chạy validate tầng 1 và qua |
| **2. Template** | `content/templates/T1`–`T4` | Bước 1 | Mọi trường trong schema đều có chỗ điền trong template |
| **3. Prompt** | `prompts/P1`, `P2`, `P3` | Bước 1, 2 | Viết lại lượt mẫu ở bước 1 bằng T1, chạy P1, kết quả tương đương bản viết tay và qua validate |
| **4. Bible và nhân vật** | `docs/02-bible.md`, `content/characters.md` → `data/characters.json` | Bước 2, 3 | `characters.json` qua validate |
| **5. Nội dung** | `ngay-1` … `ngay-6`, `endings.md`, `ui-text.md` → JSON tương ứng. Thêm `validate-data.ts` tầng 2 | Bước 4 | Validate tầng 1–2 xanh, P2 và P3 không còn lỗi mở, mọi file ở trạng thái `ĐÃ CHUYỂN JSON` |
| **6. Validate logic và ghép engine** | `validate-data.ts` tầng 3, engine trong `src/engine/` | Bước 5 | Validate tầng 3 xanh: đáp án engine tính khớp đáp án người viết ở cả 26 lượt |

> **Vì sao script validate không đợi đến cuối?** Tầng 1 chỉ là nạp schema và chạy Ajv, mất chừng nửa giờ, nhưng bước 3 cần nó để thử P1. Tầng 2 cần có dữ liệu thật nên làm ở bước 5. Chỉ tầng 3 mới phải đợi engine, nên nó nằm ở cuối.

**Làm song song được:**

- UI dựng layout từ bước 1, dùng lượt khách viết tay làm dữ liệu mẫu.
- `05-art-brief.md` bắt đầu ngay khi `02-bible.md` có danh sách nhân vật.
- `04-sources.md` do KB điền dần suốt bước 4–5.
- `06-presentation.md` bắt đầu từ bước 5.

**Gợi ý ghép vào kế hoạch 7 ngày:**

| Ngày | Bước |
|---|---|
| 1 | Bước 1–4 (buổi sáng chốt luật và schema, buổi chiều template, P1, nhân vật) |
| 2 | Bước 5: ngày 1–3 |
| 3 | Bước 5: ngày 4–6, kết cục; GP bắt đầu engine |
| 4 | Bước 5 xong; bước 6 |
| 5 | Art, âm thanh, màn chú thích mở đầu |
| 6 | Chỉnh nội dung trực tiếp trên JSON, cân độ khó |
| 7 | Chơi thử với người ngoài nhóm, sửa, tập trình bày |

---

## 8. Lệnh thường dùng và quy ước Git

```bash
pnpm validate                      # kiểm tra toàn bộ data/
pnpm validate --data <thư mục>     # kiểm tra một thư mục dữ liệu khác (phải có schema/ bên trong)
pnpm dev                           # chạy game (từ phase P1)
```

**Quy ước Git:**

- Không commit thay đổi trong `data/` khi validate đang đỏ.
- `travelers.json` chỉ một người sửa tại một thời điểm. Trước khi sửa, ghi tên mình vào `01-todo.md` hoặc báo trong nhóm chat.
- Sửa schema thì template và P1 đi cùng commit đó.
- Tiền tố commit: `docs:`, `content:`, `data:`, `feat:`, `fix:`, `art:`.
