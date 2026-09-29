# P4 — Chế độ Host và bỏ phiếu lớp học

> File độc lập. Không thuộc `07-can-sua.md`, không sửa gì trong đó.
> Gồm hai phần: **cách làm** (đọc để hiểu và để quyết) và **prompt** (chép nguyên để giao cho LLM hoặc người khác làm).

---

# PHẦN 1 — CÁCH LÀM

## 1. Mục tiêu

Ở một số lượt khách được đánh dấu trước, game dừng lại và cả lớp bỏ phiếu bằng điện thoại: CHO QUA hay GIỮ LẠI. Màn máy chiếu hiện kết quả chạy realtime, rồi game tự bấm theo đa số.

Ba lượt dự kiến dùng, lấy từ nhãn `dung-trinh-bay` đã có sẵn trong `travelers.json`. Lượt trung tâm là bà Tư mang 18 kg gạo kèm giấy khoán ở d3.

## 2. Vì sao không dùng WebSocket

**Function trên Vercel là serverless.** Mỗi request có thể rơi vào một instance khác, và instance bị dọn sau khi trả lời xong. Hệ quả:

- `const rooms = new Map()` ở tầng module **không sống sót** giữa hai request.
- WebSocket server kiểu `ws` hay `socket.io` **không chạy được** trên function thường.
- Mọi trạng thái dùng chung phải nằm ở một kho bên ngoài.

Vercel ra tính năng khá nhanh, nên trước khi bắt tay hãy đọc lại tài liệu hiện tại của họ về runtime chạy dài và WebSocket — chỗ này có thể đã khác. Nhưng thiết kế dưới đây **không cần** những thứ đó, nên nó chạy được trên mọi phiên bản.

## 3. Vì sao polling là đủ

Một vòng bỏ phiếu kéo dài 60 giây, ba vòng cho cả buổi. Độ trễ 1–2 giây không ai nhận ra. Realtime ở đây là thứ xa xỉ không cần thiết.

Nhưng có một cái bẫy: 40 máy cùng poll mỗi 3 giây trong 15 phút là khoảng 12.000 request, và mỗi request là một lệnh Redis. Con số đó có thể chạm trần free tier.

**Cách xử lý: để CDN của Vercel gộp request.**

Endpoint đọc trạng thái của client trả về header:

```http
Cache-Control: s-maxage=1, stale-while-revalidate=2
```

Hệ quả:

- CDN của Vercel lưu kết quả 1 giây.
- 40 request đến trong cùng 1 giây chỉ có **1 request** lọt vào function và Redis. 39 request còn lại nhận bản cache ngay tại CDN, trả về trong vài mili-giây.
- Số lệnh Redis giảm từ 12.000 xuống khoảng **300 cho cả buổi**. Free tier sống tốt.

Màn host (máy chiếu) poll mỗi 1 giây để thanh kết quả mượt, nhưng chỉ có **một** màn host nên không lo quá tải. Endpoint của host không cache.

## 4. Kho dữ liệu dùng chung

Dùng **Upstash Redis**. Lý do:

- Giao tiếp bằng HTTPS (REST API), không giữ TCP connection, sinh ra để chạy trên serverless.
- Free tier: 10.000 lệnh/ngày, đủ cho cả tuần chạy thử.
- Setup 3 phút, có sẵn integration trên Vercel Marketplace (bấm một nút là tự gắn biến môi trường vào project).
- Thư viện: `@upstash/redis`.

Mô hình dữ liệu tối giản:

| Khoá | Kiểu | Nội dung | TTL |
|---|---|---|---|
| `t15:<room>:state` | string JSON | `{ round, open, turnId, question, openedAt }` | 6 giờ |
| `t15:<room>:votes:<round>` | hash | `voterId → choice` | 6 giờ |

Đếm phiếu: gọi `HGETALL` trên hash của vòng đó rồi gom trong JS. Với 40–50 người, hash chỉ nặng vài KB, gom trong RAM mất dưới 1 mili-giây. Không cần cấu trúc đếm phức tạp.

## 5. Bốn endpoint serverless

Đặt trong thư mục `api/` ở root của project (quy ước chuẩn của Vercel).

```
api/
  state.ts   # GET  — client poll trạng thái (có CDN cache)
  vote.ts    # POST — client gửi phiếu
  tally.ts   # GET  — host poll kết quả (yêu cầu HOST_TOKEN)
  round.ts   # POST — host mở/chốt vòng (yêu cầu HOST_TOKEN)
```

### `GET /api/state?room=AB12`
Client gọi mỗi 3 giây. Trả về:
```json
{
  "round": 1,
  "open": true,
  "turnId": "d3-t3",
  "question": "Bà Tư mang 18 kg gạo vượt khoán. Cả lớp chọn gì?",
  "options": ["CHO_QUA", "GIU_LAI"]
}
```
**Tuyệt đối không trả về số phiếu.** Nếu điện thoại hiện tỷ lệ đang chạy, sinh viên sẽ hùa theo đa số thay vì tự nghĩ.

### `POST /api/vote`
Body: `{ room, round, voterId, choice }`.
Ghi bằng `HSET`. Vì dùng `voterId` làm key trong hash nên:
- Một người chỉ tính một phiếu.
- Người chơi có thể đổi ý trước khi chốt: bấm lại thì ghi đè, không sinh phiếu rác.
Nếu vòng đã đóng (`open === false`) hoặc `round` không khớp: trả `{ ok: false, reason: "closed" }`.

### `GET /api/tally?room=AB12&host=<token>`
Màn host gọi mỗi 1 giây. Trả về:
```json
{
  "round": 1,
  "open": true,
  "turnId": "d3-t3",
  "counts": { "CHO_QUA": 24, "GIU_LAI": 11 },
  "total": 35
}
```
Sai token trả 401.

### `POST /api/round`
Body: `{ room, host, action, turnId, question }` với `action` là `"open"` hoặc `"close"`.
Mở vòng mới thì tăng `round` lên 1, xoá hash phiếu cũ, ghi state mới. Sai token trả 401.

## 6. Giao diện ba màn hình

### Màn host (`/host`) — dành cho máy chiếu
- Chữ to, tương phản cao, đọc được từ cuối phòng.
- Hiện mã phòng to, kèm **mã QR** trỏ tới `/vote?room=<mã>` (dùng thư viện `qrcode`, sinh client-side không cần backend).
- Hai thanh kết quả nằm ngang, chạy mượt bằng CSS transition khi số phiếu nhảy.
- Nút "Mở bỏ phiếu" và "Chốt".
- **Đường lui:** hai ô nhập số và nút "Dùng số nhập tay" — xem mục 8.

### Trang bỏ phiếu (`/vote?room=<mã>`) — dành cho điện thoại
- Cực kỳ nhẹ, tải dưới 1 giây trên 3G.
- Sinh `voterId` ngẫu nhiên lưu `localStorage` lần đầu vào trang.
- Trạng thái 1 (chưa mở): "Đang chờ vòng bỏ phiếu..."
- Trạng thái 2 (đang mở): câu hỏi ngắn, hai nút to đùng CHO QUA / GIỮ LẠI.
- Trạng thái 3 (đã bấm): "Đã ghi nhận phiếu của bạn. Bạn có thể đổi ý trước khi hết giờ." Hai nút vẫn bấm lại được.
- Trạng thái 4 (đã chốt): "Đã chốt kết quả. Nhìn lên màn hình máy chiếu."

### Nối vào game
Tại lượt có nhãn `dung-trinh-bay`:
- Bàn làm việc hiện một banner nhỏ: "Chế độ lớp học đang bật — chờ kết quả bỏ phiếu".
- Game tự gọi `POST /api/round` để mở vòng.
- Khi host bấm "Chốt", game đọc kết quả đa số rồi **tự kích hoạt hành động tương ứng** (giống như người chơi bấm nút). Nếu hoà, host tự bấm trên bàn.
- Chạy tiếp sang lượt sau bình thường.

## 7. Bảo mật — vừa đủ cho phòng học
- Không nhúng `HOST_TOKEN` vào bundle client. Token nằm trong biến môi trường của Vercel.
- Màn host nhập token một lần rồi lưu `localStorage`.
- `voterId` là chuỗi ngẫu nhiên sinh bằng `crypto.randomUUID()`. Đủ để ngăn một người bấm hai mươi lần, không ngăn được người cố tình xoá `localStorage` để bầu tiếp — nhưng đây là lớp học, không phải bầu cử quốc gia.

## 8. ĐƯỜNG LUI — BẮT BUỘC PHẢI CÓ
Wifi trường học chập chờn, sóng 4G trong phòng kín yếu, Upstash có thể gặp sự cố. **Không bao giờ được để buổi thuyết trình chết đứng vì lỗi mạng.**

Trên màn host, **luôn luôn hiện hai ô nhập số**:
- Ô số phiếu CHO QUA
- Ô số phiếu GIỮ LẠI
- Nút "Dùng số nhập tay"

Nếu mạng đơ, người trình bày chỉ cần:
1. Nói to: "Ai cho qua giơ tay" — đếm nhanh, gõ số.
2. "Ai giữ lại giơ tay" — gõ số.
3. Bấm "Dùng số nhập tay".
4. Màn hình máy chiếu vẽ hai thanh kết quả đúng theo hai số vừa gõ, game tự bấm theo đa số. Cả lớp thấy kết quả bình thường, không ai biết vừa có sự cố.

Chuyển sang đường lui mất **dưới 15 giây**.

---

# PHẦN 2 — PROMPT CHO LLM

Đã thực hiện xong toàn bộ các bước 1 → 5 trong Phase P4.
Chi tiết xem tại `docs/11-huong-dan-host-va-bo-phieu.md` và các test trong `src/game-host.test.tsx`, `src/host.test.tsx`, `src/vote.test.tsx`, `api/endpoints.test.ts`.
