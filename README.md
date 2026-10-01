# INT.github.io — Minimalist 3D Narrative Landing Page

Trang Landing Page kể câu chuyện dự án theo phong cách **Minimalist**, **Animation mượt mà** với **Web 3D Hero tương tác nằm chính giữa trang**.

---

## 🌟 Tính năng nổi bật

1. **Web 3D Hero ở trung tâm (Three.js)**:
   - Khối hình học 3D tương tác đặt chính giữa hero stage.
   - Hỗ trợ rê chuột (Mouse parallax), kéo xoay 360 độ (Drag to rotate), và hiệu ứng theo chiều cuộn trang.
   - Tích hợp sẵn 3 kiểu hình học 3D để đổi nhanh: **Quantum Knot**, **Orbital Core**, **Cyber Poly**.
   - Vòng quỹ đạo ánh sáng và hiệu ứng bụi sao (particle field) đa tầng.

2. **Chuyển động mượt mà (Smooth Momentum & GSAP)**:
   - Sử dụng **Lenis Smooth Scroll** tạo cảm giác lướt quán tính êm ái.
   - **GSAP ScrollTrigger** đồng bộ dòng chảy từng chương, hiệu ứng trôi chữ và thẻ thông tin theo nhịp cuộn.

3. **Cấu trúc kể chuyện dự án (5 Chương Storytelling)**:
   - **Chương 00 (Hero)**: Khởi đầu, thông điệp cốt lõi & 3D Hero trung tâm.
   - **Chương 01 (Khởi nguồn - Origins)**: Lý do ra đời, câu chuyện đằng sau và trích dẫn triết lý.
   - **Chương 02 (Thách thức - The Challenge)**: 3 nút thắt/nghịch lý cần giải quyết và các chỉ số đo lường.
   - **Chương 03 (Cốt lõi công nghệ - Core Engine)**: 3 trụ cột kỹ thuật và khung code terminal tương tác.
   - **Chương 04 (Hành trình - Evolution)**: Dòng thời gian (Timeline) các giai đoạn từ ý niệm đến hiện tại.
   - **Chương 05 (Tương lai - Epilogue)**: Kêu gọi tham gia, kết nối và đóng góp.

4. **Trải nghiệm tinh tế (Micro-interactions)**:
   - Con trỏ chuột quán tính (Custom inertia cursor).
   - Thanh tiến trình cuộn trang ở đỉnh (Progress bar).
   - Thanh điều hướng bám theo chương ở cạnh phải (Side Chapter Tracker).
   - Bộ phát âm thanh Ambient tĩnh lặng thư giãn (Web Audio API Synthesizer).
   - Thư viện nội bộ (`js/vendor/`) không phụ thuộc CDN mạng ngoài, mở là chạy ngay.

---

## 🚀 Cách mở và xem trước (Preview)

### Cách 1: Mở trực tiếp bằng trình duyệt (Nhanh nhất)
Chỉ cần nhấp đúp vào file `index.html` hoặc mở bằng trình duyệt (Chrome, Safari, Edge, Firefox).

### Cách 2: Dùng Python Web Server có sẵn
Chạy lệnh sau trong thư mục dự án:
```bash
python3 -m http.server 3000
```
Sau đó truy cập: [http://localhost:3000](http://localhost:3000)

### Cách 3: Dùng Node.js / npx
```bash
npx serve .
```

---

## 📝 Cách gửi và thay đổi nội dung dự án

Khi bạn đã xem trước template và muốn đưa nội dung thật của dự án vào:
1. Bạn có thể gửi trực tiếp các phần nội dung của bạn trong đoạn chat:
   - **Tên dự án & Slogan**
   - **Câu chuyện khởi nguồn (Vì sao bạn làm dự án này?)**
   - **Những khó khăn/vấn đề mà dự án giải quyết**
   - **Tính năng / Công nghệ cốt lõi**
   - **Lộ trình phát triển (Roadmap / Milestones)**
   - **Liên kết / Thông tin liên hệ**
2. Tôi sẽ tự động cập nhật chính xác vào template cho bạn!

Hoặc bạn có thể tự chỉnh sửa các thẻ có chú thích `<!-- [EDIT: ...] -->` trong file `index.html`.

---

## 🌐 Triển khai lên GitHub Pages

Để đưa trang web lên địa chỉ `https://Musual-Moncra.github.io/INT.github.io`:
```bash
git add .
git commit -m "feat: Minimalist 3D narrative landing page template"
git push origin main
```
Sau khi push, vào GitHub repository: **Settings** &rarr; **Pages** &rarr; Chọn nhánh **main** (thư mục root `/`) và bấm **Save**. Trang web sẽ tự động xuất bản online!
