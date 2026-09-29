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

## 2. CẤU HÌNH BIẾN MÔI TRƯỜNG (`.env`)

Tạo hoặc cập nhật file `.env` tại thư mục gốc của dự án:

```env
# URL và Token kết nối Upstash Redis (REST API)
UPSTASH_REDIS_REST_URL="https://your-upstash-instance.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-upstash-token"

# Mã bí mật dành cho Host điều khiển vòng và xem số phiếu
HOST_TOKEN="tram15-host-secret"
```

> **Lưu ý:** Nếu chạy local và chưa cấu hình Upstash Redis, hệ thống sẽ **tự động kích hoạt InMemoryStorage** tích hợp sẵn. Nhờ đó, bạn có thể chạy thử nghiệm và kiểm thử ngay lập tức mà không gặp bất kỳ lỗi nào.

---

## 3. CÁC ĐƯỜNG DẪN TRONG HỆ THỐNG

| Đường dẫn | Thiết bị mục tiêu | Mục đích |
|---|---|---|
| `/` hoặc `/?host=1` | Máy tính người chơi / Máy chiếu | Trò chơi chính. Ở lượt khách có nhãn `dung-trinh-bay` (như Bà Tư `d3-t3`), game dừng lại mở bỏ phiếu, sau đó tự đóng dấu theo đa số. |
| `/host?room=<mã>` | Màn hình máy chiếu lớp học | Chữ to, hiển thị mã phòng, mã QR cỡ lớn cho lớp quét, biểu đồ bình chọn chạy mượt, nút mở/chốt vòng, và **đường lui nhập tay**. |
| `/vote?room=<mã>` | Điện thoại di động sinh viên | Giao diện tối giản, nút bấm to: CHO QUA / GIỮ LẠI, ghi nhận phiếu tức thì, thông báo trạng thái mạng. |

---

## 4. QUY TRÌNH THỰC HIỆN TRONG BUỔI BÁO CÁO

### Bước 1: Khởi động hệ thống
1. Chạy dev server hỗ trợ truy cập mạng nội bộ (LAN / WiFi phòng học):
   ```bash
   rtk pnpm dev --host
   ```
   *Lưu ý địa chỉ IP hiển thị trên terminal (ví dụ: `http://192.168.1.15:5173`).*

2. Hoặc triển khai lên Vercel:
   ```bash
   rtk pnpm build
   ```

### Bước 2: Thiết lập máy chiếu
1. Trên máy tính nối máy chiếu, mở trình duyệt vào:
   `http://<IP-hoặc-domain>/host?room=T15`
2. Chiếu tab này lên máy chiếu để sinh viên trong lớp thấy mã QR và đường link `.../vote?room=T15`.
3. Sinh viên dùng camera điện thoại quét mã QR hoặc gõ link để vào phòng chờ.

### Bước 3: Vận hành trong trò chơi
1. Trong tab trò chơi chính (`/?host=1&room=T15`):
   - Chơi qua các lượt bình thường.
   - Có thể nhảy nhanh trực tiếp đến lượt Bà Tư để demo:
     `http://<IP-hoặc-domain>/?host=1&room=T15&tu=d3-t3`
2. Khi đến lượt **Bà Tư (d3-t3)** mang 18 kg gạo:
   - Trò chơi tự động dừng lại, hiển thị khung **BỎ PHIẾU LỚP HỌC**.
   - Vòng bỏ phiếu tự động mở (`round 1`).
   - Màn hình điện thoại của sinh viên tự động hiện câu hỏi và 2 nút lựa chọn: **CHO QUA** và **GIỮ LẠI**.
   - Màn hình máy chiếu `/host` hiển thị thanh tiến trình và tỷ lệ phần trăm chạy trực quan theo thời gian thực.
3. Chốt kết quả:
   - Giáo viên hoặc sinh viên thuyết trình bấm nút **"Chốt kết quả"** (có thể bấm ngay tại bàn game hoặc trên màn hình máy chiếu `/host`).
   - Trò chơi tự động đối chiếu số phiếu:
     - Nếu **CHO QUA** chiếm đa số: Game tự động hạ con dấu `CHO_QUA` lên phiếu kiểm soát, hiện thông báo *"Cả lớp đã chọn CHO QUA"*.
     - Nếu **GIỮ LẠI** chiếm đa số: Game tự động hạ con dấu `GIU_LAI`, hiện thông báo *"Cả lớp đã chọn GIỮ LẠI"*.
     - Nếu **Hoà phiếu**: Game hiện thông báo hoà và trao quyền quyết định cuối cùng cho người chủ trì.
   - Bấm nút **"Lượt kế tiếp"** (hoặc phím Enter) để tiếp tục trò chơi.

---

## 5. ĐƯỜNG LUI NHẬP TAY (KHẨN CẤP — BẮT BUỘC)

Wifi phòng học, sóng 4G chập chờn, hoặc Upstash hết quota là những rủi ro không thể lường trước. Hệ thống đã tích hợp sẵn cơ chế **Đường lui nhập tay**:

- Cả màn hình `/host` và bảng điều khiển tại bàn game đều có mục:
  **"Đường lui nhập tay (Khẩn cấp)"**
- Gồm 2 ô nhập số cho **CHO QUA** và **GIỮ LẠI**, cùng nút bấm **"Dùng số nhập tay"**.
- Khi mạng gặp sự cố:
  1. Người trình bày hô nhanh: *"Ai chọn Cho qua giơ tay? (đếm ~20), Ai Giữ lại? (đếm ~15)"*.
  2. Gõ nhanh 2 con số vào 2 ô (ví dụ: `20` và `15`).
  3. Bấm **"Dùng số nhập tay"**.
  4. Hệ thống lập tức bỏ qua toàn bộ mạng, cập nhật biểu đồ và tự động đóng dấu theo số vừa nhập trong **dưới 10 giây**.

---

## 6. HƯỚNG DẪN KIỂM THỬ ĐA THIẾT BỊ (MULTI-DEVICE TESTING)

Để đảm bảo buổi thuyết trình diễn ra hoàn hảo, nhóm cần thực hiện kiểm thử theo các kịch bản sau:

### Kịch bản 1: Kiểm thử đồng thời trên 5+ thiết bị thật
1. Mở máy tính làm Host (`/host?room=T15`).
2. Dùng 5 điện thoại thật (cả iOS và Android) quét mã QR vào `/vote?room=T15`.
3. Bấm "Mở bỏ phiếu" trên Host.
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
