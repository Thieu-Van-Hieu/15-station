# Kế hoạch triển khai

> Trạng thái: NHÁP — lập ngày 25/09/2026, dựa trên commit `b20059b`

File này trả lời: từ trạng thái hiện tại, làm gì tiếp, theo thứ tự nào, ai làm, xong thì kiểm bằng gì, và đưa game lên mạng thế nào.

- Quy ước làm việc (luồng Markdown → JSON, đặt mã, Git) vẫn nằm ở `README.md`.
- Luật chơi vẫn nằm ở `docs/03-rules-spec.md` (gọi tắt là **03**). Nếu file này mâu thuẫn với 03 thì 03 thắng.
- Nhãn vai trò giống README: **KB** kịch bản và nguồn, **GP** gameplay, **UI** giao diện và art, **KT** kết và test.

## Mục lục

1. [Hiện trạng](#1-hiện-trạng)
2. [Giai đoạn 0 — sửa nền](#2-giai-đoạn-0--sửa-nền)
3. [Kiến trúc mã nguồn](#3-kiến-trúc-mã-nguồn)
4. [Lộ trình theo giai đoạn](#4-lộ-trình-theo-giai-đoạn)
5. [Validate tầng 2 và 3](#5-validate-tầng-2-và-3)
6. [Deploy lên Vercel](#6-deploy-lên-vercel)
7. [Lịch 7 ngày](#7-lịch-7-ngày)
8. [Rủi ro](#8-rủi-ro)
9. [Câu hỏi cần chốt](#9-câu-hỏi-cần-chốt)
10. [Checklist trước ngày trình bày](#10-checklist-trước-ngày-trình-bày)

---

## 1. Hiện trạng

### 1.1. Đã có

| Hạng mục | File | Tình trạng |
|---|---|---|
| Ý tưởng, ba nguyên tắc thiết kế | `docs/00-idea.md` | Xong |
| Đặc tả luật | `docs/03-rules-spec.md` | CHỐT BẢN 1, **chờ nhóm duyệt mục 12** |
| Tám schema | `data/schema/*.schema.json` | Xong |
| Sổ chỉ thị | `data/rules.json` | 7 quy định, qua tầng 1 |
| Loại giấy | `data/documents.json` | 8 loại, qua tầng 1 |
| Template T1–T4 | `content/templates/` | CHỐT |
| Prompt chuyển JSON | `prompts/P1-script-to-json.md` | CHỐT |
| Validate tầng 1 | `scripts/validate-data.ts` | Viết xong, **nhưng hiện không chạy được** (xem 2.1) |
| Lượt mẫu bà Tư `d3-t3` | 03 mục 11 | Qua tầng 1 (đã thử sau khi sửa lỗi 2.1) |

### 1.2. Còn trống

Các file sau mới chỉ có tiêu đề và dòng `Trạng thái: NHÁP`:

- `docs/01-todo.md`, `02-bible.md`, `04-sources.md`, `05-art-brief.md`, `06-presentation.md`
- `content/characters.md`, `ngay-1.md` … `ngay-6.md`, `endings.md`, `ui-text.md`
- `prompts/P2-logic-review.md`, `P3-fact-check.md`
- `data/characters.json`, `days.json`, `travelers.json`, `reports.json`, `endings.json` (mảng rỗng) và `strings.json` (object rỗng)
- `src/`: chỉ có `.gitkeep`. Chưa có Vite, React hay engine.

### 1.3. Kết quả chạy validate

Sau khi sửa lỗi 2.1:

```
✓ rules.json (7 phần tử)
✓ documents.json (8 phần tử)
✗ characters.json   phải có ít nhất 1 phần tử
✗ days.json         phải có ít nhất 6 phần tử
✓ travelers.json (0 phần tử)
✗ reports.json      phải có ít nhất 1 phần tử
✗ endings.json      phải có ít nhất 5 phần tử
✗ strings.json      thiếu 13 khoá bắt buộc
Tầng 1: 3/8 file xanh.
```

Năm file đỏ vì chưa có nội dung, nên kết quả này là **đúng**. Chúng sẽ xanh dần trong giai đoạn 3 và 4.

### 1.4. So với sáu bước trong README

| Bước README | Tình trạng | Còn thiếu |
|---|---|---|
| 1. Luật và schema | Gần xong | Nhóm duyệt mục 12 của 03; sửa để validate chạy được |
| 2. Template | Xong | — |
| 3. Prompt | Một phần | P2, P3 còn trống. Chưa có bằng chứng đã qua cổng "viết lại lượt mẫu bằng T1, chạy P1, kết quả tương đương bản viết tay" |
| 4. Bible và nhân vật | Chưa bắt đầu | |
| 5. Nội dung | Chưa bắt đầu | |
| 6. Validate logic và engine | Chưa bắt đầu | |

Phần game chạy được (`src/`) chưa có dòng code nào. Đây là khối việc lớn nhất, và README chưa chia nhỏ nó. Mục 3 và 4 của file này chia việc đó.

---

## 2. Giai đoạn 0 — sửa nền

Làm ngay, khoảng một giờ.

| # | Việc | Ai | Vì sao |
|---|---|---|---|
| 2.1 | Thêm `"type": "module"` vào `package.json` | GP | Thiếu trường này thì `npx tsx scripts/validate-data.ts` dừng ngay với lỗi `Top-level await is currently not supported with the "cjs" output format`. Script dùng `await` ở cấp ngoài cùng nên phải chạy dưới dạng ES module |
| 2.2 | Thống nhất dùng **pnpm** | GP | Repo đã có `pnpm-lock.yaml` và `pnpm-workspace.yaml`, nhưng README lại hướng dẫn `npm i`. Dùng lẫn hai công cụ thì lockfile sẽ lệch. Cài bằng `npm i -g pnpm`, vì Node 25 không còn kèm corepack. Ghi phiên bản pnpm vào trường `packageManager` của `package.json` |
| 2.3 | Sửa README mục 1 | GP | README nhắc `scaffold.sh` nhưng repo không có file này. Thay bằng các lệnh ở giai đoạn 1 |
| 2.4 | Nhóm duyệt mục 12 của 03 rồi đổi trạng thái thành `CHỐT` | Cả nhóm | Mười một quyết định ở đó ảnh hưởng trực tiếp đến engine và nội dung. Viết nội dung trước khi duyệt thì dễ phải viết lại |
| 2.5 | Chép bảng việc ở mục 7 vào `docs/01-todo.md`, ghi tên người | KT | README giao KT giữ file này |

**Cổng:** `pnpm install` rồi `pnpm validate` chạy hết và in đúng kết quả ở 1.3.

---

## 3. Kiến trúc mã nguồn

### 3.1. Nguyên tắc

1. **Engine là hàm thuần.** `src/engine/` không import React, không đụng DOM, không gọi `Date.now()` hay `Math.random()`, và không tự import `data/*.json`. Dữ liệu được truyền vào qua tham số. Nhờ vậy `scripts/validate-data.ts` gọi đúng những hàm game đang dùng, và vẫn kiểm được một thư mục dữ liệu khác qua `--data`.
2. **Code không chứa nội dung.** Mọi chữ lấy từ `strings.json`, mọi luật lấy từ `rules.json` (README mục 5.6).
3. **State đi qua một reducer.** Mọi thay đổi có dạng `(state, hành động) → state mới`. `useReducer` của React là đủ. Không cần Zustand, vì bản thân engine đã là một reducer.
4. **Import không ghi đuôi file** (`from "./evaluate"`) để cả Vite lẫn tsx đều hiểu.

### 3.2. Cây thư mục

```
index.html                  ← điểm vào của Vite
vite.config.ts
tsconfig.json
public/
├── art/portraits/<portrait.key>/<expression>.png
├── art/scenes/
├── sfx/                    ← cửa sổ trượt, đóng dấu, giấy, radio
└── fonts/                  ← font máy chữ tự host để chạy được khi không có mạng
src/
├── main.tsx
├── App.tsx                 ← chọn màn hình theo state.phase
├── index.css               ← @import "tailwindcss"; bảng màu lấy từ 05-art-brief
├── content.ts              ← import 8 file data/*.json, gói thành GameContent
├── engine/                 ← HÀM THUẦN
│   ├── types.ts
│   ├── compare.ts          ← 03 mục 2.2
│   ├── active.ts           ← 03 mục 4.1
│   ├── checks/             ← 03 mục 4.2–4.8, mỗi quy định một file
│   │   ├── index.ts        ← bảng tra: tên `check` trong rules.json → hàm
│   │   ├── gdd.ts, dinh-muc.ts, don-thuoc.ts
│   │   └── khop-ten.ts, chung-tu.ts, hang-cam.ts
│   ├── evaluate.ts         ← 03 mục 4.9
│   ├── conditions.ts       ← điều kiện `when` (03 mục 1.10)
│   ├── turn.ts             ← chấm và cập nhật sau mỗi lượt (03 mục 5)
│   ├── reports.ts          ← biên bản, ngưỡng, kích hoạt (03 mục 6)
│   ├── day-end.ts          ← đồng hồ ca, hai bảng chỉ số (03 mục 7)
│   ├── economy.ts          ← 03 mục 8
│   ├── endings.ts          ← 03 mục 9
│   ├── text.ts             ← thay biến {{...}} (03 mục 1.13)
│   ├── game.ts             ← reducer tổng
│   └── *.test.ts
├── screens/                ← Intro, DayStart, Desk, DayEnd, Budget, Ending
└── components/             ← Window, DocumentPaper, Rulebook, Stamp, ReportDialog, Board…
```

`DocumentPaper` là **một** component chung cho cả tám loại giấy. Nó đọc nhãn trường và `layout` (`giay-doc`, `giay-ngang`, `so`, `phieu-nho`, `the`) từ `documents.json`, nên không cần viết tám component riêng.

### 3.3. Giao diện của engine

```ts
// evaluate.ts — validate-data.ts tầng 3 gọi đúng hàm này
export function evaluate(
  traveler: Traveler,
  day: Day,
  rules: Rule[],
  issuesActive: ReadonlySet<IssueId>,
): { verdict: "CHO_QUA" | "GIU_LAI"; violations: { rule: RuleId; error: ErrorCode | null }[] };

// game.ts
export function newGame(content: GameContent): GameState;
export function reduce(state: GameState, action: GameAction, content: GameContent): GameState;

type GameAction =
  | { type: "BAT_DAU_NGAY" }
  | { type: "NHAN_PHONG_BI" }
  | { type: "QUYET_DINH"; action: "CHO_QUA" | "GIU_LAI" | "LAM_NGO"; reasonId: string | null }
  | { type: "KET_THUC_NGAY" }
  | { type: "TRA_CHI_TIEU"; expenseIds: string[] }
  | { type: "SANG_NGAY_SAU" };
```

`evaluate` nhận `issuesActive` thay vì cả `GameState`. Lý do: tầng 3 phải chạy mỗi lượt d5 trong cả hai trạng thái `KN-KHOAN` (03 mục 10, tầng 3, điều 1).

`GameState` gồm: `phase`; chỉ số ngày và lượt hiện tại; `flags`; các bộ đếm ở 03 mục 5.3 và 9.1, mỗi bộ đếm có bản tổng và bản trong ngày; số biên bản hợp lệ theo từng vấn đề; các vấn đề đã kích hoạt kèm ngày bắt đầu hiệu lực; chỉ số huyện; tiền; đồng hồ; giấy nhắc nhở đang chờ; phong bì đã nhận ở lượt này; và nhật ký quyết định để màn kết nhắc lại.

### 3.4. Luồng màn hình

```
INTRO          chú thích hư cấu – mô phỏng, hướng dẫn tem phiếu và giấy đi đường
  ↓
DAY_START      thẻ chuyển cảnh (chỉ d6) → lời chen "start" → trang sổ mới (new_rules)
  ↓
TRAVELER × N   giấy nhắc nhở (nếu lượt trước sai và có ghi sổ)
               → lời thoại (lọc theo `when`) → phong bì (nếu có)
               → kiểm giấy, đối chiếu sổ → quyết định → biên bản (tuỳ chọn)
               → phản ứng → lời chen "dX-tY"
  ↓
DAY_END        lời chen "end" → hai bảng chỉ số đặt cạnh nhau
  ↓
BUDGET         sự kiện gia đình → bảng chi tiêu (dòng phong bì tách riêng)
  ↓ hết d6
ENDING         chọn kết cục → cảnh → số phận nhân vật → câu trích → câu hỏi cuối
  ↓
HISTORY_CARD   thẻ lịch sử chung (khoá `end.history_card`)
```

### 3.5. Những chỗ dễ làm sai trong engine

Người viết engine phải đọc kỹ 03. Bảng dưới gom các chi tiết hay bị bỏ sót.

| Chỗ | Đúng theo 03 |
|---|---|
| Hạn giấy | So chuỗi `YYYY-MM-DD`. Hết hạn khi `hôm_nay > co_gia_tri_den`. Hạn đúng bằng hôm nay thì vẫn còn hạn |
| So tên | Chuẩn hoá NFC, bỏ khoảng trắng đầu cuối, gộp khoảng trắng liên tiếp. **Giữ dấu và giữ hoa thường** |
| So hàng | Theo `ma` và `don_vi`, không theo tên hiển thị. R2 chỉ cộng các dòng có đơn vị `kg` |
| Thiếu giấy gốc | Chỉ sinh E5, rồi dừng quy định đó |
| Tem phiếu hết hạn | Không sinh E1. Chỉ không được cộng vào định mức |
| R5K | Không tự sinh lỗi. Hàm của R2 phải biết R5K có đang hiệu lực hay không |
| R6 | Vi phạm có `error: null` |
| Lỗi trùng | Loại trùng cặp `(rule, error)`. Chạy quy định theo thứ tự trong `rules.json` |
| Làm ngơ | Không ghi sổ, không bị nhắc nhở, không làm giảm `reported_compliance`, nhưng vẫn làm giảm `true_compliance`. Nếu lượt không có `outcomes.LAM_NGO` thì dùng `outcomes.CHO_QUA` |
| Phong bì | Đã nhận thì chỉ được chọn `CHO_QUA` hoặc `LAM_NGO` |
| Hậu tố `-kn` của cờ | Chỉ thêm khi biên bản **hợp lệ** |
| Biên bản | Biên bản không hợp lệ vẫn tốn 60 phút. `delay = next_act` nghĩa là có hiệu lực từ ngày đầu của màn kế tiếp |
| Chỉ số huyện | Không bao giờ âm. Phép cộng ra số âm thì giữ ở 0 |
| Tiền | Ở d5, tiền mang sang chia cho 10 và làm tròn xuống. `co_the_chi` âm thì giữ ở 0 |
| Xếp loại | Làm ngoài giờ thì hạ một bậc. Ngày không ghi sổ lượt nào thì tỷ lệ coi là 100% |
| Kết cục | Xét theo `priority` tăng dần, lấy kết cục đầu tiên thoả mọi điều kiện |

---

## 4. Lộ trình theo giai đoạn

Danh sách việc và test chi tiết của từng giai đoạn nằm ở `docs/08-cac-phase.md`.

Mỗi giai đoạn có một **cổng**: điều kiện phải đạt thì mới coi là xong. Nhánh code (GĐ1, GĐ2, GĐ6) và nhánh nội dung (GĐ3, GĐ4) chạy song song, gặp nhau ở GĐ5.

```
GĐ0 sửa nền
 ├──► GĐ1 khung Vite ──► GĐ2 engine ──────────────────┐
 │         └──► GĐ6 giao diện (dùng lượt mẫu d3-t3) ───┤
 └──► GĐ3 nội dung nền ──► GĐ4 nội dung 6 ngày ────────┴──► GĐ5 validate tầng 3
                                                                   │
                                   GĐ9 deploy ◄── GĐ8 chơi thử ◄── GĐ7 art, âm thanh
```

Bản preview trên Vercel nên có ngay từ GĐ1 (xem mục 6). Đừng đợi đến GĐ9 mới deploy lần đầu.

**Phạm vi** theo `00-idea.md` mục 10, để biết cắt gì khi thiếu giờ:

| Mức | Nội dung |
|---|---|
| Phải có | 4 màn, 6 ngày, 26 lượt, sổ chỉ thị, kiến nghị, hai bảng chỉ số kèm "Yếu tố khác", 4 nhân vật lặp lại, màn 4 đủ 5 lượt, kết cục Người kiến nghị và Người gác cổng, màn chú thích hư cấu – mô phỏng |
| Nên có | Hệ thống gia đình, phong bì kèm hậu quả, 3 kết cục còn lại, chị Thu, âm thanh |
| Cắt được | Kéo thả giấy, bớt nhân vật một lần (vẫn giữ đủ 5 lượt buôn lậu thật), rút "Yếu tố khác" thành một câu cố định |
| Không được cắt | Màn 4 và hành động kiến nghị |

### GĐ1 — Khung dự án

**Người:** GP. **Thời gian:** khoảng 2 giờ.

```bash
pnpm add react react-dom
pnpm add -D vite @vitejs/plugin-react typescript @types/react @types/react-dom \
            @types/node tailwindcss @tailwindcss/vite vitest
```

`package.json`, phần cần thêm. Điền đúng phiên bản pnpm đang dùng vào `packageManager`:

```json
{
  "name": "tram-15",
  "private": true,
  "type": "module",
  "packageManager": "pnpm@<phiên bản>",
  "engines": { "node": ">=20" },
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "validate": "tsx scripts/validate-data.ts",
    "test": "vitest run",
    "check": "pnpm validate && pnpm test && pnpm build"
  }
}
```

`tsconfig.json` (đã thử: `tsc` qua với `scripts/validate-data.ts` hiện tại):

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "resolveJsonModule": true,
    "noEmit": true,
    "skipLibCheck": true,
    "types": ["node", "vite/client"]
  },
  "include": ["src", "scripts"]
}
```

`vite.config.ts`:

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

`index.html` đặt ở gốc repo, có `<html lang="vi">`, `<div id="root">` và `<script type="module" src="/src/main.tsx">`.

`src/content.ts` import tám file `../data/*.json` và ép kiểu về `GameContent` **một lần duy nhất** ở đây. Ép kiểu an toàn vì `validate-data.ts` đã bảo đảm dữ liệu đúng cấu trúc.

**Cổng:**

- `pnpm dev` mở được trang, Tailwind hoạt động.
- `pnpm build` ra thư mục `dist/`.
- `pnpm validate` vẫn chạy như ở 1.3.
- Đã có một bản preview trên Vercel.

### GĐ2 — Engine

**Người:** GP. **Ứng với:** README bước 6, phần engine.

Viết theo thứ tự sau. Mỗi file viết xong thì có test ngay.

1. `types.ts`: kiểu dữ liệu viết tay theo schema. Có thể sinh tự động bằng `json-schema-to-typescript`, nhưng các nhánh `oneOf` sinh ra khó đọc, nên viết tay sẽ rõ hơn.
2. `compare.ts`: so chuỗi, so ngày, so tháng, "giấy phủ hàng", "dấu hợp lệ".
3. `checks/*` và `evaluate.ts`. Test đầu tiên là lượt mẫu `d3-t3`:
   - ở d3, chưa kích hoạt gì: `GIU_LAI`, vi phạm `[(R2-DINH-MUC, E4)]`;
   - cùng lượt đặt vào d5 với `KN-KHOAN` đã kích hoạt: không còn vi phạm R2. Lượt vẫn bị giữ vì ở d5 GDD đã hết hạn và thiếu SHK; muốn ra `CHO_QUA` thì phải đổi ngày trên giấy và thêm SHK (xem `08-cac-phase.md`, test EV-03).
4. Mỗi loại lỗi E1–E6 có ít nhất một test "bắt được" và một test "không bắt nhầm". Thêm một test lỗi ngủ: lệch tên ở d3 thì chưa bị bắt, vì R4 chỉ hiệu lực từ d4.
5. `conditions.ts`, `turn.ts`, `reports.ts`, `day-end.ts`, `economy.ts`, `endings.ts`, `text.ts`, cuối cùng là `game.ts`.

**Cổng:** `pnpm test` xanh, và test `d3-t3` qua ở cả hai trạng thái.

### GĐ3 — Nội dung nền

**Người:** KB, UI, KT. **Ứng với:** README bước 4.

| Việc | Ai | Ghi chú |
|---|---|---|
| `docs/02-bible.md` | KB | Phải xong trước khi viết bất kỳ file ngày nào |
| `content/characters.md` → `data/characters.json` | KB | Viết theo T3. **P1 chỉ dùng cho file ngày**, nên file này chuyển tay theo bảng "Ánh xạ sang JSON" ở cuối T3 |
| Khung ngày của cả 6 ngày | KB | Chỉ viết khối T2 của `ngay-1.md` … `ngay-6.md`: ngày trong game, đồng hồ, kinh tế, yếu tố khác, thứ tự lượt. Số liệu mặc định có sẵn ở 03 mục 1.2 và 8.2. Lý do phải làm trước: xem rủi ro đầu tiên ở mục 8 |
| `data/reports.json` | KB + GP | **Không có template, viết thẳng bằng JSON.** Hai vấn đề `KN-KHOAN` và `KN-THUONG-BINH`, ngưỡng 3, `delay: next_act`, hiệu ứng theo 03 mục 1.9, mỗi vấn đề 1–2 lý do mã `LD-…` |
| `content/ui-text.md` → `data/strings.json` | UI | Bảng khoá – giá trị, chép tay sang JSON. Đủ 13 khoá bắt buộc của schema |
| `prompts/P2`, `P3` | KB + KT | Phải xong trước GĐ4, vì mỗi ngày nội dung đều phải qua P2 và P3 |
| `docs/04-sources.md` | KB | Bắt đầu từ đây, điền dần đến hết GĐ4 |
| `docs/05-art-brief.md` | UI | Bắt đầu khi bible có danh sách nhân vật |

**Cổng:** `characters.json`, `days.json` (khung), `reports.json` và `strings.json` qua tầng 1.

### GĐ4 — Nội dung sáu ngày và kết cục

**Người:** KB viết, GP làm tầng 2. **Ứng với:** README bước 5.

Với mỗi ngày, đi đúng vòng trong README mục 3:

```
viết ngay-N.md (T2 + các khối T1)
  → P1 → thay phần tử ngày trong days.json, thay mọi lượt dN-* trong travelers.json
  → pnpm validate → P2 → P3 → sửa → đổi trạng thái thành ĐÃ CHUYỂN JSON
```

Ràng buộc phải nhớ khi viết (03 mục 10):

- Số lượt mỗi ngày: 3, 4, 4, 5, 5, 5 (tổng 26).
- Ít nhất 5 lượt có nhãn `buon-lau-that`, tất cả đều có đáp án `GIU_LAI`.
- d3–d4 có ít nhất 3 lượt `kn.issue = KN-KHOAN`.
- Anh Hùng có ít nhất 3 lượt `KN-THUONG-BINH` trong d3–d5.
- Ít nhất 2 lượt có phong bì. Khuyến nghị 3 lượt: một ở d4, hai ở d5. Phong bì của gã đầu cơ gạo ở d5 là 120.
- Không lượt nào vừa có phong bì vừa có `kn`.
- d6 đủ 5 lượt, có ít nhất một lượt vi phạm R6.
- Mỗi nhân vật chính xuất hiện ít nhất 3 lần.

`content/endings.md` viết theo T4, rồi chuyển tay sang `endings.json` theo bảng ánh xạ ở cuối T4. Schema bắt buộc **đủ 5 kết cục**. Ba kết cục thuộc mức "nên có" nếu thiếu giờ thì viết ngắn, nhưng không được bỏ.

GP làm song song validate tầng 2 (mục 5).

**Cổng:** tầng 1–2 xanh, P2 và P3 không còn lỗi mở, mọi file trong `content/` ở trạng thái `ĐÃ CHUYỂN JSON`.

### GĐ5 — Validate tầng 3

**Người:** GP. **Ứng với:** README bước 6. Chi tiết ở mục 5.

**Cổng:** tầng 3 xanh, đáp án engine khớp đáp án người viết ở cả 26 lượt, và bốn bot chơi thử ra đúng kết cục.

### GĐ6 — Giao diện

**Người:** UI, có GP hỗ trợ. **Chạy song song** từ GĐ1, dùng lượt mẫu `d3-t3` làm dữ liệu cho đến khi GĐ4 có dữ liệu thật.

Làm theo thứ tự ưu tiên:

1. Bố cục ba khu theo `00-idea.md` mục 8 và thanh trên cùng (ngày, đồng hồ, số khách đã xử lý).
2. `DocumentPaper` hiển thị đủ 8 loại giấy. Click để đưa tờ lên trên và phóng to. Bỏ kéo thả nếu thiếu giờ.
3. Sổ chỉ thị: các trang theo ngày (03 mục 4.1), có danh mục thuốc quản lý và danh mục hàng cấm.
4. Hai con dấu, nút làm ngơ, nút "Biên bản" (tắt ở d1, d2, d6), hộp chọn lý do. Việc xáo thứ tự lý do làm ở giao diện, không làm trong engine.
5. Phản ứng, giấy nhắc nhở, lời chen giữa, radio.
6. Hai bảng cuối ngày đặt cạnh nhau, có dòng "Yếu tố khác" và nhãn "số liệu mô phỏng".
7. Bảng chi tiêu gia đình (nên có).
8. Màn kết và thẻ lịch sử.
9. Màn chú thích mở đầu.

Đề xuất thêm hai tính năng nhỏ, không có trong 03 nhưng rẻ và cần cho buổi trình bày:

- **Chế độ nhảy lượt:** tham số URL `?tu=d3-t3` cho engine tự chơi các lượt trước theo đáp án đúng rồi dừng ở lượt đó. Kịch bản trình bày chỉ có 4 phút để đi từ đầu đến lượt bà Tư, tức 9 lượt, rất sát. Người test cũng cần tính năng này.
- **Lưu tiến trình** vào `localStorage` sau mỗi lượt, để lỡ tay tải lại trang thì không mất ván.

**Cổng:** chơi trọn 6 ngày chỉ bằng chuột, console không báo lỗi, và không có chữ nào viết cứng trong code.

### GĐ7 — Art, âm thanh, màn kết

**Người:** UI, KT.

- Chân dung **không dùng ảnh người thật** (Điều 32 Bộ luật Dân sự 2015). Cách rẻ nhất: bóng người sau kính mờ. Tiếp theo là pixel art hoặc tranh vẽ tay đơn sắc.
- Bốn hiệu ứng âm thanh. Trình duyệt chặn tự phát âm thanh, nên chỉ phát sau cú click đầu tiên (màn chú thích mở đầu là chỗ phù hợp).
- Font máy chữ tự host trong `public/fonts/`, không tải từ Google Fonts, để chạy được khi không có mạng.

**Cổng:** mọi asset trong `05-art-brief.md` đã có. Ảnh tư liệu dùng làm cảnh nền đều ghi nguồn.

### GĐ8 — Chơi thử và cân độ khó

**Người:** KT.

- Cho 3 người ngoài nhóm chơi qua link preview.
- Ghi lại: chỗ mắc kẹt, thời gian mỗi lượt, kết cục nhận được, và người chơi có nhận ra quy luật hai bảng vào khoảng cuối d2 hay không.
- Sửa **trực tiếp trên JSON** (quy tắc vàng của README). Sau mỗi lần sửa chạy `pnpm validate`.
- Mục tiêu: một ván 15–18 phút.

**Cổng:** ít nhất 2/3 người chơi xong mà không phải hỏi, không còn lỗi chặn.

### GĐ9 — Deploy

Xem mục 6.

---

## 5. Validate tầng 2 và 3

Mở rộng `scripts/validate-data.ts` theo 03 mục 10.

**Cách tổ chức:**

- Chỉ chạy tầng 2 khi tầng 1 xanh, vì dữ liệu sai cấu trúc sẽ làm tầng 2 lỗi theo kiểu khó hiểu.
- Kết quả chia ba mức: **LỖI** (thoát mã 1), **CẢNH BÁO** và **THÔNG TIN** (thoát mã 0). Ví dụ: "lỗi vô tình" là cảnh báo; "lỗi ngủ" và "thuốc không thuộc danh mục" là thông tin (theo đúng 03).
- Thêm cờ `--strict` để cảnh báo cũng làm thoát mã 1. Bật cờ này ở CI trước ngày trình bày.
- **Trong lúc nội dung còn viết dở:** tầng 2 chỉ kiểm tham chiếu của những lượt đã có. Các kiểm tra kiểu "đủ số lượng" (26 lượt, số lượt mỗi ngày) chỉ là cảnh báo khi chưa bật `--strict`. Nếu không làm vậy, `data/` sẽ đỏ suốt GĐ4, và quy tắc "không commit `data/` khi validate đỏ" của README sẽ không dùng được.
- Mỗi điều trong 03 mục 10 là một hàm kiểm riêng, tên hàm có số điều (ví dụ `tang2_dieu5_khopNhanVat`) để dễ đối chiếu với đặc tả.
- Tầng 3 import `evaluate` và `reduce` từ `../src/engine/`. Không viết lại logic trong script.

**Đề xuất thêm ngoài 03: bot chơi thử.** 03 mục 9.3 yêu cầu người chơi *có thể* đạt mọi kết cục, nhưng tầng 3 chỉ kiểm điều kiện tĩnh. Chạy `reduce` trọn 26 lượt với bốn chiến lược cố định sẽ kiểm được điều đó trực tiếp:

| Bot | Chiến lược | Kết cục phải ra |
|---|---|---|
| Theo sổ | Luôn chọn đáp án engine tính, không kiến nghị, không nhận phong bì | `END-GAC-CONG` |
| Kiến nghị | Như "Theo sổ", thêm biên bản đúng lý do ở mọi lượt có `kn` | `END-KIEN-NGHI` |
| Làm ngơ | Làm ngơ mọi lượt có vi phạm | `END-LAM-NGO` |
| Ăn tiền | Nhận mọi phong bì, các lượt khác theo sổ | `END-AN-TIEN` |

Bot cũng là cách rẻ nhất để bắt lỗi engine bị treo hoặc chỉ số ra số âm.

---

## 6. Deploy lên Vercel

`00-idea.md` mục 9 chọn Vercel. Game là trang tĩnh, không có backend hay cơ sở dữ liệu. Repo đã có remote `origin` trên GitHub (`Thieu-Van-Hieu/15-station`).

### 6.1. Cấu hình

| Mục | Giá trị |
|---|---|
| Framework Preset | Vite |
| Install Command | `pnpm install` (Vercel tự nhận ra nhờ `pnpm-lock.yaml`) |
| Build Command | `pnpm build`. Khi dữ liệu đã xanh (sau GĐ4), đổi thành `pnpm check` để Vercel từ chối deploy bản có dữ liệu đỏ |
| Output Directory | `dist` |
| Node.js Version | 20.x trở lên, khớp `engines` trong `package.json` |

Không cần `vercel.json`: game chỉ có một trang, không có đường dẫn con. Nếu sau này thêm router thì phải rewrite mọi đường dẫn về `index.html`.

### 6.2. Các bước

1. Đẩy nhánh lên GitHub.
2. Trên vercel.com: **Add New → Project**, chọn repo `15-station`.
3. Điền cấu hình ở 6.1, bấm **Deploy**.
4. Mỗi nhánh và mỗi pull request tự có một **Preview URL**. Gửi link này cho người chơi thử ở GĐ8.
5. Nhánh `main` là bản **Production**. Chỉ merge vào `main` khi `pnpm check` xanh.

Không muốn dùng giao diện web thì dùng CLI: `pnpm dlx vercel` để liên kết và deploy thử, `pnpm dlx vercel --prod` để đưa lên Production.

### 6.3. Kiểm tra sau mỗi lần deploy Production

- Mở bằng cửa sổ ẩn danh, chơi hết d1.
- Tab Network không có lỗi 404 (ảnh, âm thanh, font).
- Thử ở độ phân giải của máy chiếu trong lớp.
- Âm thanh phát sau cú click đầu tiên.

### 6.4. Dự phòng cho buổi trình bày

- **Không dựa vào wifi của lớp.** Trên laptop trình bày, chạy `pnpm build` rồi `pnpm preview` và mở `http://localhost:4173`. Mở thẳng `dist/index.html` bằng `file://` sẽ không chạy, vì trình duyệt chặn module script.
- Font, ảnh, âm thanh đều nằm trong `public/`, không tải từ CDN.
- Quay sẵn video 1 phút màn 4 (`00-idea.md` mục 12).
- Chuẩn bị link `?tu=d3-t3` phòng khi không kịp chơi từ đầu.

### 6.5. CI trên GitHub Actions (nên có)

`.github/workflows/check.yml`:

```yaml
name: check
on: [push, pull_request]
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4        # đọc phiên bản từ trường packageManager
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm check
```

CI bảo đảm quy tắc "không commit `data/` khi validate đỏ" được máy kiểm, không phụ thuộc trí nhớ của từng người.

---

## 7. Lịch 7 ngày

Lịch này thay bảng "Gợi ý ghép vào kế hoạch 7 ngày" trong README, vì bước 1–3 đã gần xong. N1 là ngày đầu tiên nhóm bắt tay làm.

| Ngày | KB | GP | UI | KT | Mốc cuối ngày |
|---|---|---|---|---|---|
| N1 | Sáng: cả nhóm duyệt mục 12 của 03. Chiều: bible, `characters.md`, khung T2 của 6 ngày | GĐ0; GĐ1; deploy preview lần đầu | Bố cục ba khu với lượt mẫu `d3-t3` | `01-todo.md`; `reports.json` cùng GP; bắt đầu `04-sources.md` | Validate chạy; `characters`, `days` (khung), `reports` xanh |
| N2 | `ngay-1` → `ngay-3` sang JSON | `compare`, `checks`, `evaluate` kèm test | `DocumentPaper` 8 loại, sổ chỉ thị; `strings.json` | P2, P3; bắt đầu `05-art-brief.md` | d1–d3 `ĐÃ CHUYỂN JSON`; test `d3-t3` xanh |
| N3 | `ngay-4` → `ngay-6`; `endings.md` | `turn`, `reports`, `day-end`, `game`; tầng 2 | Dấu, biên bản, phản ứng, giấy nhắc nhở | Đối chiếu nguồn; art brief | Đủ 26 lượt trong JSON; tầng 1–2 xanh |
| N4 | Sửa theo P2, P3, tầng 3 | Tầng 3 và bot; `economy`, `endings` | Hai bảng cuối ngày; bảng chi tiêu | Màn kết; bắt đầu `06-presentation.md` | Tầng 3 xanh; chơi được từ đầu đến kết cục, chưa cần đẹp |
| N5 | Soát lại mọi chữ trên màn hình | Chế độ nhảy lượt, lưu tiến trình, sửa lỗi | Art, màn chú thích mở đầu | Âm thanh | Preview có đủ art và âm thanh |
| N6 | Cân độ khó trên JSON | Build Command đổi sang `pnpm check`; bật CI | Sửa giao diện theo góp ý | Nhóm tự chơi thử | Bản Production đầu tiên |
| N7 | Hỗ trợ hỏi đáp | Sửa lỗi chặn | Sửa lỗi hiển thị | 3 người ngoài chơi thử; quay video dự phòng; tập trình bày | Checklist mục 10 đủ |

Nhóm 3 người: gộp việc của KT vào KB và GP, như README mục 4.

---

## 8. Rủi ro

| Rủi ro | Cách giảm |
|---|---|
| `days.json` bắt buộc đúng 6 phần tử và `endings.json` đúng 5 phần tử, nên `data/` sẽ đỏ suốt thời gian viết nội dung và không commit được | Viết khung T2 của cả 6 ngày ngay ở GĐ3. Viết đủ 5 kết cục, ba kết cục "nên có" có thể ngắn |
| Engine của game và logic trong validate lệch nhau | Validate import đúng hàm trong `src/engine/`, không viết lại (nguyên tắc 3.1) |
| P1 cho kết quả khác nhau mỗi lần chạy | Tuân quy tắc vàng của README: sau khi khoá, chỉ sửa trên JSON |
| Xung đột Git ở `travelers.json` | Mỗi lúc chỉ một người sửa, ghi tên vào `01-todo.md` trước khi sửa |
| Nội dung trượt khỏi ba nguyên tắc thiết kế (một chiều, quy về một nguyên nhân, cổ vũ làm trái luật) | P3 soát mỗi ngày; tầng 3 kiểm đủ 5 lượt buôn lậu thật; dòng "Yếu tố khác" có số đủ lớn (03 mục 7.3) |
| Engine xong muộn, giao diện phải chờ | UI dựng trên lượt mẫu `d3-t3` và một hàm `evaluate` tạm luôn trả `GIU_LAI`, thay bằng hàm thật khi GĐ2 xong |
| Art tốn nhiều thời gian hơn dự kiến | Mặc định dùng bóng người sau kính mờ, chỉ làm chân dung chi tiết khi còn giờ |
| Hết 4 phút trình bày trước khi đến lượt bà Tư | Chế độ nhảy lượt `?tu=d3-t3` |
| Mạng trong lớp không ổn định | Bản offline chạy bằng `pnpm preview`, asset tự host, video dự phòng |

---

## 9. Câu hỏi cần chốt

Những chỗ 03 chưa nói rõ, lộ ra khi thiết kế engine. Mỗi câu có sẵn đề xuất. Nhóm đồng ý thì ghi vào 03 cùng lúc với việc duyệt mục 12.

| # | Câu hỏi | Đề xuất |
|---|---|---|
| 1 | Lượt cuối của ngày bị quyết sai thì giấy nhắc nhở hiện ở đâu? 03 mục 5.1 nói "đầu lượt sau", nhưng lượt cuối ngày không có lượt sau | Hiện ở đầu ngày kế tiếp, trước lời chen "start". Lượt cuối d6 thì không hiện. Tiền phạt vẫn tính vào ngày xảy ra lỗi |
| 2 | `reported_compliance` bằng bao nhiêu khi người chơi chưa ghi sổ lượt nào (làm ngơ toàn bộ)? | Bằng 1, giống cách tính tỷ lệ trong ngày ở 03 mục 7.2 |
| 3 | Đã nhận phong bì rồi có được lập biên bản không? Lượt có phong bì không có `kn`, nên biên bản ở đó luôn không hợp lệ | Ẩn nút "Biên bản" sau khi nhận phong bì |
| 4 | Có lưu tiến trình khi tải lại trang không? | Có, lưu vào `localStorage` |
| 5 | Chế độ nhảy lượt chơi các lượt trước theo chiến lược nào? Lựa chọn này quyết định cờ, và cờ quyết định lời thoại của bà Tư | Chiến lược "Theo sổ" |

---

## 10. Checklist trước ngày trình bày

- [ ] `pnpm validate --strict` và `pnpm check` đều xanh
- [ ] Mọi file trong `content/` ở trạng thái `ĐÃ CHUYỂN JSON`
- [ ] Đủ 26 lượt, 6 ngày, ít nhất 5 lượt buôn lậu thật, màn 4 đủ 5 lượt, kiến nghị hoạt động
- [ ] Màn chú thích hư cấu – mô phỏng hiện đầu game; bảng phải ghi "số liệu mô phỏng"
- [ ] Mọi câu trích trong game và trong slide đều có trong `04-sources.md`, đã qua P3 và có người kiểm lại
- [ ] Không chân dung nào dùng ảnh người thật
- [ ] Bản Production mở được trên máy chiếu; bản offline chạy được trên laptop
- [ ] Có video dự phòng màn 4
- [ ] Đã tập đi từ đầu đến lượt bà Tư trong 4 phút, hoặc đã thử link `?tu=d3-t3`
- [ ] `06-presentation.md` đã xong, đã tập phần hỏi đáp
