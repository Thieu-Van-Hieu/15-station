# Danh sách âm thanh cần tìm

> Trạng thái: ĐANG TÌM — ai tìm được file nào thì ghi tên vào cột "Người tìm" và bỏ file vào `public/audio/`.

Game đã viết sẵn code phát cho mọi âm dưới đây. Việc của nhóm chỉ là **tìm file, đặt đúng tên, bỏ vào `public/audio/`**. Không cần sửa code.

- Chưa có file thì hiệu ứng dùng âm tổng hợp tạm, còn âm nền và nhạc im lặng. Game vẫn chạy bình thường.
- **Không cần chỉnh âm lượng.** Khi nạp file, game tự đo độ to rồi đưa mọi file về cùng một mức. Hiệu ứng ở −16 dBFS, âm nền ở −30, nhạc ở −26. Game cũng chặn đỉnh để không vỡ tiếng. File tải từ các nguồn khác nhau, to nhỏ lệch nhau cũng không sao.
- **Mỗi âm có giới hạn thời lượng** (cột "Phát tối đa"). Game bỏ khoảng lặng ở đầu file, chỉ phát đúng số giây đó kể từ lúc có tiếng, rồi làm nhỏ dần phần đuôi ở chỗ cắt. Âm nền và nhạc dài hơn giới hạn thì được cắt lại và trộn đuôi vào đầu để vẫn lặp liền. Xem mục 6.

---

## 1. Quy cách file

| Mục | Yêu cầu |
|---|---|
| Định dạng | `.mp3` (ưu tiên) hoặc `.ogg`. Không dùng `.wav`, vì file quá nặng |
| Tên | **Đúng y** tên ở cột "Tên file" bên dưới, chữ thường, không dấu. Ví dụ `sfx_stamp.mp3` |
| Chỗ đặt | `public/audio/` |
| Kênh | Mono hoặc stereo đều được. Hiệu ứng nên mono |
| Chất lượng | 44.1 kHz; 128 kbps cho hiệu ứng, 160–192 kbps cho nhạc |
| Cắt | Cắt sạch khoảng lặng ở đầu file, để âm vang lên ngay khi bấm. Đuôi file để tắt tự nhiên, đừng cắt cụt |
| Âm nền, nhạc | Phải **lặp liền mạch**: nối cuối vào đầu không nghe tiếng "cụp". Cần thì làm crossfade vài trăm ms trong Audacity |
| Dung lượng | Hiệu ứng dưới 100 KB. Âm nền và nhạc dưới 2 MB (khoảng 60–120 giây là đủ) |

**Bản quyền:** chỉ lấy âm **CC0** (dùng tự do) hoặc **CC-BY** (phải ghi tên tác giả). Mỗi file CC-BY ghi vào mục 4 ở cuối file này. Không lấy nhạc, bài hát có thật, nhạc hiệu đài hay giọng phát thanh viên thật.

**Nguồn gợi ý:** freesound.org (lọc theo License: Creative Commons 0), pixabay.com/sound-effects, mixkit.co/free-sound-effects, sonniss.com (gói GDC miễn phí).

---

## 2. Hiệu ứng (phát một lần)

| Tên file | Khi nào phát | Mô tả âm cần tìm | Độ dài | Từ khoá tìm (tiếng Anh) | Người tìm |
|---|---|---|---|---|---|
| `sfx_stamp.mp3` | Thả con dấu **CHO QUA** / **GIỮ LẠI** xuống giấy; đối chất trúng chỗ lệch; dấu xếp loại ở báo cáo cuối ngày | Con dấu cao su đập mạnh xuống tờ giấy đặt trên bàn gỗ. Một tiếng "thụp" trầm, chắc, có chút tiếng cạch của cán dấu. Không vang, không có tiếng mực. | 0,2–0,5 s | `rubber stamp`, `stamp paper desk`, `passport stamp` | |
| `sfx_paper.mp3` | Bấm vào giấy tờ để xem kỹ hoặc đặt lại; mở hộp biên bản; giấy đã đóng dấu trượt khỏi bàn; đối chất nhầm | Cầm lên hoặc lật một tờ giấy mỏng, giấy pơ-luya hay giấy đi đường cũ. Tiếng sột soạt ngắn, khô, giòn. | 0,3–0,8 s | `paper rustle`, `paper handle`, `page flip single` | |
| `sfx_window.mp3` | Khách mới đến ô cửa | Tấm kính cửa sổ khung gỗ hoặc sắt trượt ngang trên ray, kết thúc bằng tiếng chạm khung nhẹ. Nghe cũ kỹ, hơi rít. | 0,6–1,2 s | `sliding window`, `ticket window open`, `wooden window slide` | |
| `sfx_bell.mp3` | Ngay sau tiếng cửa, gọi lượt khách | Một tiếng chuông gọi phục vụ trên quầy (loại bấm tay bằng kim loại), ngân ngắn. **Một tiếng thôi**, không "ting ting". | 0,8–1,5 s | `service bell`, `desk bell single`, `counter bell` | |
| `sfx_coin.mp3` | Bấm **Nhận phong bì** | Vài đồng xu nhôm hoặc kẽm leng keng nhỏ, hoặc tiếng phong bì giấy dày được nhét vào túi áo kèm tiếng xu. Phải kín đáo, không hào nhoáng như tiếng game casino. | 0,4–1 s | `coins pocket`, `envelope money`, `few coins drop` | |
| `sfx_radio_tune.mp3` | Màn đầu ngày (đài VEF-206) | Dò sóng đài bán dẫn cũ: tiếng rè rè, huýt trượt tần số, rồi bắt được sóng (có thể lẫn vài nốt nhạc hoặc giọng nói **không rõ chữ**). | 1,5–3 s | `radio tuning`, `shortwave tuning`, `old radio static` | |
| `sfx_pen.mp3` | Đánh dấu một khoản chi tiêu; bấm **Xác nhận gửi biên bản**; khoanh một chỗ bằng bút chì đối chất | Ngòi bút máy hoặc bút chì gạch một nét nhanh trên giấy. | 0,2–0,5 s | `pen scribble`, `pencil tick`, `writing check mark` | |
| `sfx_typewriter.mp3` | Mở màn báo cáo cuối ngày | Máy chữ cơ gõ một loạt 5–8 phím nhanh, kết thúc bằng tiếng "ting" hết dòng. Có thể thêm tiếng gạt về đầu dòng. | 1–2 s | `typewriter typing bell`, `typewriter carriage return` | |
| `sfx_click.mp3` | Bấm **LÀM NGƠ** | Tiếng "tách" rất nhỏ và khô: bút bi bấm, hoặc ngón tay gõ lên mặt bàn gỗ. Cố ý nhỏ và vô hồn, vì nhắm mắt cho qua thì không có dấu nào cả. | 0,05–0,2 s | `pen click`, `click soft`, `finger tap wood` | |

---

## 3. Âm nền và nhạc (lặp liên tục)

| Tên file | Màn | Mô tả âm cần tìm | Độ dài | Từ khoá tìm | Người tìm |
|---|---|---|---|---|---|
| `amb_tram_ngay.mp3` | Bàn làm việc và báo cáo cuối ngày | Không khí trạm kiểm soát bên tỉnh lộ, ban ngày, nông thôn miền Bắc đầu thập niên 80. Nền là gió nhẹ, quạt trần quay chậm. Thỉnh thoảng có chuông xe đạp, một chiếc xe tải hoặc máy cày chạy xa, gà gáy, tiếng người nói lao xao **không rõ chữ**. Không có còi xe máy hiện đại, không có tiếng đô thị. | 60–120 s, lặp | `rural road ambience`, `village ambience asia`, `ceiling fan room tone`, `distant bicycle bell` | |
| `amb_dem_nha.mp3` | Chi tiêu gia đình (ban đêm) | Căn phòng khu tập thể ban đêm: tiếng dế, mưa phùn nhẹ trên mái, đồng hồ treo tường tích tắc, thỉnh thoảng tiếng ho khẽ ở phòng bên. Yên, buồn, hơi lạnh. | 60–120 s, lặp | `night crickets room`, `light rain roof`, `clock ticking room tone` | |
| `mus_menu.mp3` | Màn mở đầu | Nhạc nền chậm, trầm, hoài niệm, không lời. Gợi ý nhạc cụ: đàn bầu hoặc sáo trúc trên nền piano thưa hay đàn dây; hoặc piano độc tấu kiểu nhạc phim tài liệu. Không có trống, không hùng tráng. | 60–120 s, lặp | `vietnamese melancholic`, `dan bau ambient`, `bamboo flute sad`, `nostalgic piano documentary` | |
| `mus_ket.mp3` | Màn kết cục | Cùng tinh thần với `mus_menu` nhưng mở hơn, có chút hy vọng, như bình minh sau đêm dài. Dùng chung cho cả 5 kết cục, nên đừng quá vui hay quá bi. | 60–120 s, lặp | `hopeful piano ambient`, `sunrise strings soft`, `reflective ending` | |

---

## 4. Ghi công tác giả (file CC-BY)

| File | Tác giả | Nguồn (link) | Giấy phép |
|---|---|---|---|
| | | | |

---

## 5. Thử và chỉnh

1. Bỏ file vào `public/audio/`, tải lại trang (`pnpm dev`) và bấm một chỗ bất kỳ. Trình duyệt chỉ cho phát âm sau cú bấm đầu tiên.
2. Nếu một âm vẫn to hay nhỏ hơn hẳn các âm khác (thường gặp khi file có đỉnh rất nhọn, hoặc tai người nghe khác với số đo), chỉnh `trimDb` của âm đó trong `SOUNDS` ở `src/audio.ts`. Đơn vị là dB: `+3` to gấp khoảng 1,4 lần, `-6` nhỏ còn một nửa.
3. Muốn cả nhóm âm nền hoặc nhạc to hay nhỏ hơn thì chỉnh `TARGET_DB` trong cùng file.
4. Nút loa ở góc phải trên cùng dùng để tắt hoặc bật toàn bộ âm thanh. Trạng thái được nhớ giữa các lần chơi.

---

## 6. Giới hạn thời lượng

Mỗi âm có một con số `maxS` trong `SOUNDS` ở `src/audio.ts`. Khi nạp file, game:

1. Tìm chỗ bắt đầu có tiếng (to hơn −30 dB so với đỉnh của file), lùi lại 10 ms, và bỏ hết phần im lặng trước đó. Nhờ vậy dấu kêu đúng lúc thả, không trễ nửa giây vì file có khoảng lặng ở đầu.
2. Hiệu ứng chỉ giữ `maxS` giây kể từ đó. Nếu phải cắt thì 30% cuối (tối đa 0,3 s) nhỏ dần về 0 để không nghe tiếng "cụp".
3. Âm nền và nhạc dài hơn `maxS` thì chỉ giữ `maxS` giây đầu. 2 giây ngay sau chỗ cắt được trộn vào đầu đoạn, nên khi lặp lại nghe như file chạy tiếp.
4. Độ to được đo trên đúng đoạn sẽ phát, không đo trên cả file.

| Âm | Phát tối đa | | Âm | Phát tối đa |
|---|---|---|---|---|
| `stamp` | 0,5 s | | `radio_tune` | 3 s |
| `paper` | 0,8 s | | `pen` | 0,5 s |
| `window` | 1,2 s | | `typewriter` | 2 s |
| `bell` | 1,5 s | | `click` | 0,2 s |
| `coin` | 1 s | | Âm nền, nhạc | 120 s |

Muốn một âm dài hoặc ngắn hơn thì sửa `maxS` của âm đó.

**File vẫn phải gọn.** Game cắt khi phát nhưng trình duyệt vẫn tải và giải mã trọn file trước đã: một file âm nền 15 phút chiếm hơn 300 MB bộ nhớ khi giải mã. Test `ART-07` (`pnpm test`) báo lỗi nếu một file hiệu ứng dài quá `maxS` + 2 s, hoặc âm nền và nhạc dài quá `maxS` + 10 s. Gặp lỗi đó thì mở file trong Audacity, cắt về đoạn cần dùng, rồi xuất lại.

Ngày 28/9/2026 đã cắt sẵn các file quá dài: `amb_tram_ngay` từ 15 phút xuống 125 s, `mus_menu` từ 199 s xuống 125 s, `sfx_typewriter` từ 79 s xuống 3 s (bỏ 5,4 s im lặng ở đầu), `sfx_pen` từ 22,6 s xuống 1,5 s, `sfx_bell`, `sfx_window`, `sfx_radio_tune` từ 5–6 s xuống 2–4 s. Các file được cắt theo từng khung MP3, không nén lại nên chất lượng giữ nguyên. Tổng dung lượng thư mục giảm từ 36 MB xuống 14 MB.
