# Hiểu đúng bảo hiểm — bản mẫu sách tương tác

Bản mẫu trải nghiệm đọc **một** cuốn sách: bìa đóng → mở bìa xoay quanh gáy → lật trang cong giấy → phóng lớn trang.
Nội dung bên trong là **nội dung minh họa**.

## Mở bản mẫu

**Cách nhanh nhất:** bấm đúp `index.html`. Sách chạy trực tiếp trong Chrome, Edge, Safari hoặc Firefox, không cần máy chủ.

**Nếu muốn chạy qua máy chủ cục bộ** (ví dụ để mở trên điện thoại cùng mạng Wi-Fi):

```bash
cd hieu-dung-bao-hiem
python3 -m http.server 8000
# Máy tính: http://localhost:8000
# Điện thoại: http://<địa-chỉ-IP-máy-tính>:8000
```

Phông chữ (Be Vietnam Pro, Lora) tải từ Google Fonts. Khi không có mạng, sách tự dùng phông hệ thống, mọi chức năng vẫn chạy bình thường.

## Thao tác

| Thao tác | Máy tính | Điện thoại / máy tính bảng |
|---|---|---|
| Mở sách | Bấm vào bìa, hoặc phím `Enter` | Chạm vào bìa |
| Lật tiếp | Kéo góc trên/dưới trang phải sang trái · phím `→` · nút › | Kéo hoặc vuốt từ mép phải sang trái |
| Lật lại | Kéo trang trái sang phải · phím `←` · nút ‹ | Kéo hoặc vuốt từ mép trái sang phải |
| Phóng lớn | Bấm vào giữa trang | Chạm vào giữa trang |
| Trong chế độ phóng lớn | Con lăn chuột, nút `+`/`−`, kéo để di chuyển, `0` để vừa màn hình, `Esc` để đóng | Chụm hai ngón, chạm đúp, kéo, chạm ra ngoài trang để đóng |
| Đóng sách | Nút ✕ · phím `Esc` / `Home` | Nút ✕ |
| Âm thanh | Nút loa (lựa chọn được lưu trên thiết bị) | như máy tính |

## Cấu trúc thư mục

```
index.html               Khung trang (không chứa nội dung sách)
content/book-content.js  ← NỘI DUNG SÁCH: bìa, trang, bìa sau. Chỉ cần sửa file này
css/styles.css           Giao diện, kiểu chữ trong trang
js/app.js                Tương tác: mở/đóng, lật, phóng lớn, bàn phím, bố cục
js/sound.js              Âm thanh lật giấy (tổng hợp bằng Web Audio, không cần file âm thanh)
vendor/                  Thư viện lật trang StPageFlip 2.0.7 (giấy phép MIT)
assets/pages/            Nơi đặt ảnh trang khi dùng tài liệu thật
```

## Thay bằng tài liệu thật (PDF / PowerPoint / Word)

Cách ổn định nhất: chuyển mỗi trang thành một ảnh, rồi khai báo ảnh trong `content/book-content.js`.

1. **Xuất ra PDF.**
   - PowerPoint: *File → Export → PDF*.
   - Word: *File → Save As → PDF*.
   - Nên đặt khổ trang dọc tỉ lệ A (A4/A5) để khớp khung sách.
2. **Chuyển PDF thành ảnh trang**, độ phân giải khoảng 200 dpi để chữ vẫn rõ khi phóng lớn:
   ```bash
   pdftoppm -r 200 -jpeg -jpegopt quality=88 tai-lieu.pdf assets/pages/p
   # tạo ra p-01.jpg, p-02.jpg, ...
   ```
   Không dùng dòng lệnh: Acrobat (*Export PDF → Image → JPEG*) hoặc PowerPoint (*Save As → JPEG*, chọn "All slides") cũng được.
3. **Khai báo trong `content/book-content.js`:**
   ```js
   cover:  { type: "image", src: "assets/pages/p-01.jpg", alt: "Bìa" },
   pages: [
     { type: "image", src: "assets/pages/p-02.jpg", alt: "Trang 1 – Lời mở đầu" },
     { type: "image", src: "assets/pages/p-03.jpg", alt: "Trang 2 – Mục lục" },
     // ...
   ],
   backCover: { type: "image", src: "assets/pages/p-xx.jpg", alt: "Bìa sau" }
   ```
   - Số trang nội dung cần là **số chẵn**. Nếu lẻ, hệ thống tự thêm một trang ghi chú trống.
   - Có thể trộn trang ảnh và trang HTML trong cùng một cuốn.

Ghi chú: trang ảnh giữ nguyên bố cục gốc nhưng chữ không chọn hoặc tìm được. Trang HTML (như sách mẫu) sắc nét ở mọi mức phóng, nhưng phải dựng lại nội dung.

## Đã kiểm tra

Kiểm tra tự động bằng Chromium (Playwright) ở khổ máy tính 1280–1440px, điện thoại dọc 390×844 (cảm ứng) và điện thoại ngang 844×390.

1. Màn hình đầu chỉ có cuốn sách đóng, nút âm thanh và dòng hướng dẫn. ✔
2. Bấm hoặc chạm vào bìa mở ra đúng trang đầu. Bìa xoay quanh gáy, rồi cả cuốn trượt vào giữa. ✔
3. Kéo từ góc trên thì cong ở góc trên, kéo từ góc dưới thì cong ở góc dưới. Thấy mặt sau, bóng đổ và trang bên dưới. ✔
4. Kéo chưa đủ rồi thả thì trang trở về. ✔
5. Lật tiếp và lật lại đúng thứ tự (1, 3, 5 … 13 rồi ngược lại). ✔
6. Không lật vượt quá bìa trước hoặc bìa sau. ✔
7. Nhấn phím liên tục 30 lần: mỗi lần chỉ lật một tờ, trạng thái không lỗi. Thao tác bị chặn khi đang lật. ✔
8. Âm thanh chỉ phát sau tương tác đầu tiên. Tắt/bật được, lựa chọn còn nguyên sau khi tải lại trang. ✔
9. Phóng lớn rồi đóng vẫn ở đúng trang. Thao tác kéo lật không mở nhầm chế độ phóng lớn. ✔
10. Điện thoại: không tràn ngang. Vuốt nhanh và kéo chậm đều lật được. Xoay máy vẫn giữ đúng trang. ✔
- Thiết lập giảm chuyển động của thiết bị: thời gian lật rút xuống khoảng 0,3 giây, tắt hiệu ứng trượt và nhấp nháy. ✔
- Bàn phím: `Enter`, `←`/`→`, `Esc`, `Home`, và `+`/`−`/`0` trong chế độ phóng lớn. ✔

## Giới hạn hiện tại

- **Hiệu ứng cong giấy là mô phỏng 2D.** StPageFlip tạo hình trang bằng vùng cắt đa giác, xoay theo điểm kéo và các lớp bóng chuyển màu. Kết quả có góc trang uốn theo tay, thấy mặt sau, có bóng và trang dưới lộ dần. Tuy nhiên đây không phải mô hình 3D cuộn tròn thật: nếp gấp là một đường thẳng, độ "phồng" của giấy do bóng đổ tạo ra.
- **Hai chỉnh sửa trên thư viện** (trong `js/app.js`, hàm `tuneFlipController`):
  - Điểm bắt đầu kéo luôn là chỗ người dùng chạm xuống. Bản gốc có thể đoán sai hướng khi ngón tay di chuyển chậm.
  - Ngưỡng hoàn tất được nới về mức hợp lý: khoảng nửa trang ở chế độ một trang, 65% bề rộng trang ở chế độ hai trang. Bản gốc yêu cầu kéo qua hết gáy.
- **Cảm ứng:** thư viện chỉ cho trang bám theo ngón tay sau khi giữ khoảng 0,25 giây. Vuốt nhanh hơn thì được xử lý như một cú vuốt và tự hoàn tất việc lật.
- **Tiếng lật** được tổng hợp, không phải bản ghi thật. Muốn dùng file âm thanh thật, thay phần tạo âm trong `js/sound.js`.
- **Chưa kiểm tra trên thiết bị thật.** Mới kiểm tra trên Chromium mô phỏng. Nên thử thêm trên Safari iOS và một máy Android.
