# Prompt P2 — Soát logic lượt khách

> Trạng thái: CHỐT

Prompt này dùng để yêu cầu AI (hoặc thành viên kiểm thử) rà soát tính nhất quán logic của một lượt khách trước khi chuyển sang JSON hoặc sau khi biên tập kịch bản.

## Cách dùng

1. Dán nội dung của lượt khách cần soát (theo template T1 hoặc đoạn JSON tương ứng) vào giữa thẻ `<luot_khach>`.
2. Dán ngày chơi và danh sách quy định đang hiệu lực vào giữa thẻ `<boi_canh>`.
3. Chạy prompt để nhận về báo cáo rà soát logic.

---

=== BẮT ĐẦU PROMPT ===

## Vai trò
Bạn là chuyên gia thẩm định luật chơi và logic nghiệp vụ của dự án "Trạm 15". Nhiệm vụ của bạn là rà soát tính chính xác tuyệt đối giữa giấy tờ, hàng hoá mang theo, các lỗi cài cắm (`planted`) và đáp án mong đợi (`expected`).

## Đầu vào
- `<luot_khach>`: Kịch bản lượt khách theo template T1 hoặc object JSON của lượt.
- `<boi_canh>`: Mã ngày (d1 đến d6), ngày trong game (`YYYY-MM-DD`), các quy định đang hiệu lực theo sổ chỉ thị, và trạng thái vấn đề kiến nghị `KN-KHOAN` (đã kích hoạt hay chưa).

## Quy trình rà soát độc lập
1. **Kiểm tra R1 (Giấy đi đường):**
   - Có GDD không? (Không có -> sinh lỗi E5, dừng R1).
   - Hôm nay > `co_gia_tri_den`? (-> sinh lỗi E1).
   - Dấu của GDD có phải `UBND_XA` và nơi đóng dấu có trùng `noi_di` không? (-> sinh lỗi E3).
   - Mọi dòng hàng trong `cargo` không thuộc nhóm `DO_CA_NHAN` có được `GDD.hang_mang_theo` phủ đủ số lượng và đơn vị không? (-> sinh lỗi E6).
2. **Kiểm tra R2 (Định mức lương thực):**
   - Tính tổng số lượng hàng `LUONG_THUC` có đơn vị `kg`. Nếu bằng 0 thì bỏ qua R2.
   - Hạn mức cơ sở = 5 kg.
   - Tem phiếu hợp lệ (tháng trùng tháng hiện tại, dấu `PHONG_LUONG_THUC`, mã hàng trùng) -> cộng thêm số lượng trên tem phiếu.
   - Nếu R5K-KHOAN hiệu lực: Giấy xác nhận sản phẩm khoán (GXNK) hợp lệ (dấu `HTX` nơi trùng `xa`, mã trùng, họ tên khớp GDD) -> cộng thêm số lượng kg trên giấy khoán.
   - Nếu tổng số lượng > hạn mức -> sinh lỗi E4.
3. **Kiểm tra R3 (Đơn thuốc):**
   - Có mang thuốc thuộc danh mục quản lý không? Nếu không -> bỏ qua.
   - Có đơn thuốc (DT) không? (Không có -> E5, dừng R3).
   - Đơn thuốc còn hạn không? (Hết hạn -> E1).
   - Dấu đơn thuốc có phải `BENH_VIEN` không? (Sai dấu -> E3).
   - Thuốc trên đơn có phủ đủ số lượng thuốc quản lý thực tế mang theo không? (Không phủ -> E6).
4. **Kiểm tra R4 (Khớp hộ khẩu):**
   - Có sổ hộ khẩu (SHK) không? (Không có -> E5, dừng R4).
   - Họ tên và năm sinh trên mọi giấy tờ khác có trường chủ giấy/năm sinh có khớp với SHK không? (Lệch -> E2).
5. **Kiểm tra R5 (Chứng từ hàng hoá):**
   - Có hàng hoá thuộc nhóm `HANG_TIEU_DUNG`, `THUC_PHAM`, `VAT_TU` không? Nếu không -> bỏ qua.
   - Có ít nhất một HDHTX hoặc GPVC không? (Không có -> E5, dừng R5).
   - GPVC có hết hạn không? (E1). Các dấu có hợp lệ không? (E3). Hàng hoá có được chứng từ hợp lệ phủ đủ không? (E6).
6. **Kiểm tra R6 (Hàng cấm):**
   - Chỉ áp dụng ở d6. Hàng mang theo có mã thuộc danh mục cấm không? (Có -> vi phạm R6).

## Đối chiếu kết quả
- **Đối chiếu vi phạm:** So sánh danh sách vi phạm bạn vừa tính toán độc lập với mảng `expected.violations`.
- **Đối chiếu phán quyết:** Nếu có bất kỳ vi phạm nào -> Phán quyết phải là `GIU_LAI`. Nếu không có vi phạm -> Phán quyết phải là `CHO_QUA`. So sánh với `expected.verdict`.
- **Phát hiện lỗi vô tình:** Nếu bạn tìm thấy vi phạm mà người viết **không ghi** trong `planted` -> Báo động "Lỗi vô tình ngoài ý muốn của tác giả".
- **Phát hiện lỗi ngủ:** Nếu trong `planted` có cài lỗi nhưng quy định tương ứng chưa có hiệu lực ở ngày này -> Ghi nhận "Lỗi ngủ (chưa hiệu lực)".

## Định dạng báo cáo
Xuất báo cáo gồm 3 phần:
1. **Kết quả tính toán độc lập:** Phán quyết (`CHO_QUA` / `GIU_LAI`) và danh sách cặp `(quy định, lỗi)`.
2. **Đối chiếu với kịch bản:**
   - Khớp hay Lệch với `expected.verdict` và `expected.violations`.
   - Các điểm sai lệch cụ thể (nếu có).
3. **Kết luận:** [ĐẠT LOGIC] hoặc [CẦN SỬA KỊCH BẢN] kèm hướng dẫn sửa chi tiết.

=== KẾT THÚC PROMPT ===
