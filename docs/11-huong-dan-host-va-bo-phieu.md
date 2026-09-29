# HƯỚNG DẪN VẬN HÀNH CHẾ ĐỘ HOST VÀ BỎ PHIẾU LỚP HỌC (P4)

> Tài liệu hướng dẫn thiết lập, chạy thử và kiểm thử đa thiết bị cho tính năng **Bỏ phiếu lớp học trên điện thoại** của trò chơi "Trạm 15".

---

## 1. TỔNG QUAN KIẾN TRÚC

Hệ thống được thiết kế tối ưu cho mô hình lớp học 40–50 sinh viên, chạy trên nền tảng **Vercel Serverless Functions** kết hợp **Upstash Redis (REST API)**:

- **Không dùng WebSocket hay state trong bộ nhớ tiến trình:** Vercel Function là serverless (mỗi request có thể rơi vào instance khác nhau). Toàn bộ dữ liệu trạng thái được lưu tập trung trên Redis hoặc in-memory fallback khi chạy dev offline.
- **Client polling + HTTP CDN Caching:**
  - Thiết bị sinh viên (`/vote`) poll mỗi **3 giây** gọi `GET /api/state?room=<mã>`. Endpoint này có header `Cache-Control: s-maxage=1, stale-while-revalidate=2`, nhờ đó CDN của Vercel tự gộp hàng chục request từ lớp học, giảm tải tối đa cho Upstash Redis (tránh chạm trần free tier).
  - Màn hình máy chiếu (`/host`) và bàn làm việc game poll mỗi **1 giây** gọi `GET /api/tally` để hiển thị biểu đồ kết quả thời gian thực.
  - Endpoint gửi phiếu (`POST /api/vote`) và điều khiển vòng (`POST /api/round`) không cache.
- **Bảo mật & Ẩn danh:**
  - Sinh viên được gán một `voterId` ngẫu nhiên lưu trong `localStorage`. Mỗi người chỉ tính 1 phiếu trong mỗi vòng (cho phép đổi ý trước khi chốt).
  - Màn hình sinh viên **không bao giờ trả về số phiếu hiện tại** để ngăn chặn hiệu ứng hùa theo số đông (bandwagon effect).
  - Thao tác điều khiển vòng và xem kết quả kiểm phiếu yêu cầu `HOST_TOKEN`.

---

## 2. CẤU HÌNH BIẾN MÔI TRƯỜNG

Cần ba biến:

| Biến | Lấy ở đâu |
|---|---|
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Vercel → Project → **Storage** → thêm **Upstash for Redis** (Marketplace, gói free). Vercel tự gắn hai biến này vào project. |
| `HOST_TOKEN` | Tự đặt một chuỗi ngẫu nhiên, ví dụ chạy `openssl rand -hex 12`. Không dùng chuỗi mẫu, không đưa vào mã nguồn. |

**Trên Vercel:** Project → Settings → Environment Variables → thêm `HOST_TOKEN` (môi trường Production). Sau khi thêm biến phải **Redeploy** thì function mới nhận.

**Chạy local:** tạo file `.env` ở thư mục gốc (đã nằm trong `.gitignore`):

```env
UPSTASH_REDIS_REST_URL="https://<instance>.upstash.io"
UPSTASH_REDIS_REST_TOKEN="<token>"
HOST_TOKEN="<chuỗi ngẫu nhiên của bạn>"
```

> **Local không có Upstash:** hệ thống dùng bộ nhớ trong tiến trình, đủ để chạy thử. Nếu chưa đặt `HOST_TOKEN` thì ở local mọi token không rỗng đều được chấp nhận.
>
> **Trên Vercel thiếu biến:** các endpoint trả **503** kèm thông điệp nói rõ thiếu biến nào (không lặng lẽ dùng bộ nhớ trong, vì mỗi instance serverless giữ một bản riêng và phiếu sẽ bị lạc). Màn host hiện thông báo này và gợi ý chuyển sang **đường lui nhập tay**.
>
> **Token:** nhập `HOST_TOKEN` một lần ở ô cuối trang `/host`; trình duyệt lưu lại và bàn game dùng chung. Token gửi qua header `Authorization: Bearer`, không nằm trên URL và không bị nhúng vào bundle.

---

## 3. CÁC ĐƯỜNG DẪN TRONG HỆ THỐNG

| Đường dẫn | Thiết bị | Mục đích |
|---|---|---|
| `/?host=1&room=<mã>` | Máy tính nối máy chiếu | Trò chơi chính. Tới lượt có nhãn `dung-trinh-bay` (Bà Tư `d3-t3`), màn **Hội đồng lớp học** phủ kín bàn game. Chỉ cần một tab này là đủ cho buổi trình bày. |
| `/host?room=<mã>` | Máy chiếu (tuỳ chọn) | Mở hội đồng cho một lượt trung tâm bất kỳ (`d3-t3`, `d3-t1`, `d5-t1`, `d5-t4`) mà không cần chơi tới lượt đó. Nếu bàn game mở vòng, màn này tự chuyển theo. |
| `/vote?room=<mã>` | Điện thoại sinh viên | Phòng chờ, hồ sơ nhân vật, đồng hồ, hai con dấu to, rồi kết quả của lớp. |

---

## 4. QUY TRÌNH TRONG BUỔI BÁO CÁO

### Bước 1: Chuẩn bị
- Dùng bản trên Vercel: https://15-station.vercel.app/ (đã cấu hình biến ở mục 2). Hoặc chạy `pnpm dev --host` trong mạng LAN của lớp.
- Mở `/?host=1&room=T15`. Muốn vào thẳng lượt Bà Tư: `/?host=1&room=T15&tu=d3-t3`.

### Bước 2: Phòng chờ
Tới lượt Bà Tư, màn **HỘI ĐỒNG LỚP HỌC** hiện ra:
- **Mã QR cỡ lớn** (bấm vào để phóng to gần kín màn), kèm đường dẫn ngắn `…/vote` và **mã phòng** chữ to để ai không quét được thì gõ tay.
- **Số người đã vào phòng** tăng dần khi điện thoại quét mã.
- Bên phải là **hồ sơ lượt khách** dựng sẵn từ dữ liệu game: chân dung, sự việc, câu hỏi, lý lẽ hai phía. Không phải gõ hay chép câu hỏi nữa.
- Nếu máy chưa có `HOST_TOKEN`, ô nhập token hiện ngay tại đây.
- Nút **Xem giấy tờ** thu nhỏ hội đồng xuống góc để chiếu giấy tờ trên bàn cho lớp xem, bấm **Mở lại hội đồng** để quay lại. Nút **Tự xử lượt này** bỏ qua bỏ phiếu.

### Bước 3: Bỏ phiếu
- Chọn thời gian (30/45/60/90 giây) và bấm **Bắt đầu bỏ phiếu** (có tiếng chuông).
- Máy chiếu hiện **đồng hồ đếm ngược** và **số phiếu đã bỏ / số người trong phòng**. Tỉ lệ được **giữ kín** tới khi hết giờ để lớp không hùa theo nhau.
- Điện thoại hiện hồ sơ, câu hỏi, lý lẽ hai phía (bấm để mở), thanh thời gian và hai con dấu. Được đổi ý tới khi hết giờ.
- Hết giờ thì tự chốt. Muốn chốt sớm thì bấm **Chốt sớm**.

### Bước 4: Công bố
- Hai thanh kết quả chạy lên, rồi **con dấu của lớp** đập xuống (có tiếng dấu).
- Hồ sơ đổi sang **Bối cảnh lịch sử** (Chỉ thị 100-CT/TW) và **câu hỏi thảo luận** để người trình bày dẫn tiếp.
- Điện thoại mỗi người thấy tỉ lệ và biết mình thuộc **phe đa số hay thiểu số**, gợi ý phe thiểu số chuẩn bị lý lẽ tranh luận.
- Bấm **Đóng dấu theo lớp**: dấu được đặt lên bàn game, rồi bấm **Lượt kế tiếp** như bình thường. Hoà phiếu (hoặc không ai bầu) thì người trực chọn một trong hai dấu. **Mở lại phòng chờ** để cho lớp bầu lại.

---

## 5. ĐƯỜNG LUI NHẬP TAY (KHẨN CẤP — BẮT BUỘC)

Wifi phòng học, sóng 4G chập chờn, hoặc Upstash hết quota là những rủi ro không thể lường trước. Hệ thống đã tích hợp sẵn cơ chế **Đường lui nhập tay**:

- Cả màn hội đồng tại bàn game và trang `/host` đều có mục gập
  **"Đường lui nhập tay (Khẩn cấp)"** ở cuối cột trái
- Gồm 2 ô nhập số cho **CHO QUA** và **GIỮ LẠI**, cùng nút bấm **"Dùng số nhập tay"**.
- Khi mạng gặp sự cố:
  1. Người trình bày hô nhanh: *"Ai chọn Cho qua giơ tay? (đếm ~20), Ai Giữ lại? (đếm ~15)"*.
  2. Gõ nhanh 2 con số vào 2 ô (ví dụ: `20` và `15`).
  3. Bấm **"Dùng số nhập tay"**.
  4. Hệ thống bỏ qua mạng và công bố ngay theo số vừa nhập (có ghi chú "Kết quả nhập tay"), rồi bấm **Đóng dấu theo lớp** như thường.

---

## 6. HƯỚNG DẪN KIỂM THỬ ĐA THIẾT BỊ (MULTI-DEVICE TESTING)

Để đảm bảo buổi thuyết trình diễn ra hoàn hảo, nhóm cần thực hiện kiểm thử theo các kịch bản sau:

### Kịch bản 1: Kiểm thử đồng thời trên 5+ thiết bị thật
1. Mở máy tính làm Host (`/host?room=T15`).
2. Dùng 5 điện thoại thật (cả iOS và Android) quét mã QR vào `/vote?room=T15`.
3. Bấm "Bắt đầu bỏ phiếu" trên Host.
4. Cả 5 điện thoại cùng bấm chọn trong khoảng 5–10 giây.
5. **Kỳ vọng:** Màn hình Host cập nhật tổng số 5 phiếu, thanh tỷ lệ % dịch chuyển chính xác và mượt mà.

### Kịch bản 2: Đổi ý bỏ phiếu
1. Trên một điện thoại, bấm **CHO QUA** (thấy thông báo *"Đã ghi nhận phiếu"*).
2. Bấm đổi sang **GIỮ LẠI**.
3. **Kỳ vọng:** Tổng số phiếu trên Host giữ nguyên, số phiếu của CHO QUA giảm 1 và GIỮ LẠI tăng 1 (không xảy ra hiện tượng tăng khống phiếu).

### Kịch bản 3: Thiết bị vào muộn
1. Mở vòng bỏ phiếu trên Host.
2. 3 điện thoại đã bỏ phiếu xong.
3. Cho điện thoại thứ 4 quét QR vào phòng khi vòng đã mở được 20 giây.
4. **Kỳ vọng:** Điện thoại thứ 4 nhận ngay trạng thái vòng đang mở kèm câu hỏi, bỏ phiếu bình thường và được tính vào tổng số.

### Kịch bản 4: Mất kết nối mạng giữa chừng
1. Trên điện thoại đang ở trang `/vote`, bật chế độ máy bay (Airplane mode).
2. **Kỳ vọng:** Màn hình hiện thanh cảnh báo màu hổ phách *"Mất kết nối. Đang tự động thử lại..."*, không bị văng trắng màn hình.
3. Tắt chế độ máy bay.
4. **Kỳ vọng:** Trang tự động kết nối lại thành công trong vòng 3 giây.

### Kịch bản 5: Bấm thử đường lui nhập tay tính giờ
1. Giả lập trường hợp mạng lớp học ngắt hoàn toàn.
2. Thao tác mở đường lui nhập tay, gõ số phiếu và bấm nút xác nhận.
3. Dùng đồng hồ bấm giờ: **toàn bộ thao tác phải hoàn thành dưới 15 giây**.

---

## 7. CHECKLIST TRƯỚC GIỜ THUYẾT TRÌNH

Trước khi bắt đầu buổi báo cáo trước lớp hoặc hội đồng, hãy hoàn thành bảng kiểm tra:

- [ ] **Màn hình máy chiếu:** Đã mở `/host?room=...` và kiểm tra mã QR hiển thị đủ lớn, có thể quét từ hàng ghế cuối phòng học.
- [ ] **Token Host:** Đã kiểm tra trường `HOST_TOKEN` được lưu sẵn trên trình duyệt của máy chủ trì.
- [ ] **Đường truyền mạng:** Đã thử quét QR từ ít nhất 2 thiết bị khác nhau qua mạng WiFi của trường hoặc 4G.
- [ ] **Phím tắt chuyển cảnh:** Đã ghi nhớ link nhảy nhanh `?tu=d3-t3` để vào ngay lượt trọng tâm Bà Tư nếu thời gian thuyết trình có hạn.
- [ ] **Diễn tập thao tác khẩn cấp:** Người vận hành máy đã thực hành bấm "Dùng số nhập tay" ít nhất 2 lần và thuần thục trong <10 giây.
- [ ] **Quota Upstash:** Nếu dùng tài khoản Upstash cá nhân, kiểm tra số lượt request còn lại trong ngày để đảm bảo không chạm trần.
