# Hướng Dẫn Kết Nối Google Sheet & Google Form Cho Workshop Pharmesthetic

Hệ thống Landing Page Workshop đã được nâng cấp tính năng **tự động lưu kết quả đăng ký vào Google Sheet / Google Form**, đồng thời **vẫn báo tin nhắn tức thì về Telegram Bot**.

---

## Cách 1: Kết nối Google Sheet tự động (Khuyên dùng - Chuẩn nhất)

### Bước 1: Tạo Google Sheet mới
1. Mở [Google Sheets (Trang tính)](https://sheets.google.com) và tạo một bảng tính mới.
2. Đổi tên trang tính thành: **"Đăng Ký Workshop Pharmesthetic"** (hoặc tên tùy bạn muốn).

### Bước 2: Dán mã Apps Script
1. Trên thanh menu của Google Sheet, bấm vào **Tiện ích mở rộng (Extensions)** > chọn **Apps Script**.
2. Xóa hết các dòng chữ có sẵn trong file `Code.gs`.
3. Mở file [Code.gs](file:///Users/MAC/Documents/H%E1%BB%87%20th%E1%BB%91ng%20b%C3%A1n%20h%C3%A0ng%20t%E1%BB%B1%20%C4%91%E1%BB%99ng/workshop-pharmesthetic/Code.gs) trong thư mục dự án, sao chép toàn bộ nội dung và dán vào Apps Script.
4. Bấm biểu tượng **Lưu (Save)** 💾.

### Bước 3: Triển khai Web App (Lấy URL kết nối)
1. Ở góc trên bên phải màn hình Apps Script, bấm nút **Triển khai (Deploy)** > chọn **Tùy chọn triển khai mới (New deployment)**.
2. Bấm vào biểu tượng bánh răng bên cạnh "Chọn loại", chọn **Ứng dụng web (Web app)**.
3. Điền các mục như sau:
   - **Mô tả:** `Workshop Pharmesthetic Registration`
   - **Thực thi dưới dạng (Execute as):** `Tôi (Me)`
   - **Ai có quyền truy cập (Who has access):** `Bất kỳ ai (Anyone)` *(Rất quan trọng, phải chọn Anyone để khách trên landing page gửi được)*.
4. Bấm **Triển khai (Deploy)**.
   - Nếu Google hiện thông báo yêu cầu cấp quyền: Bấm *Ủy quyền truy cập (Authorize access)* > Chọn tài khoản Google của bạn > Bấm *Nâng cao (Advanced)* > Bấm *Đi tới dự án (Không an toàn)* > Bấm *Cho phép (Allow)*.
5. Sao chép dòng **URL ứng dụng web (Web app URL)** (Có dạng: `https://script.google.com/macros/s/.../exec`).

### Bước 4: Kích hoạt trên Landing Page
Có 2 cách rất nhanh để lưu URL này vào Landing Page:
- **Cách A (Giao diện trực quan):** Mở link Landing Page và thêm đuôi `?admin=1` (Ví dụ: `https://workshop-pharmesthetic-h36n.vercel.app/?admin=1` hoặc bấm 3 lần liên tiếp vào dòng bản quyền ở chân trang) -> Dán URL vào ô **"URL Web App Google Apps Script"** -> Bấm **"Lưu Cấu Hình"**.
- **Cách B (Lưu vĩnh viễn vào mã nguồn):** Mở file [app.js](file:///Users/MAC/Documents/H%E1%BB%87%20th%E1%BB%91ng%20b%C3%A1n%20h%C3%A0ng%20t%E1%BB%B1%20%C4%91%E1%BB%99ng/workshop-pharmesthetic/js/app.js), dán URL vào biến `googleEndpointUrl` trong `DEFAULT_CONFIG`.

---

## Cách 2: Nếu bạn đã có link biểu mẫu Google Form sẵn

1. Mở cửa sổ cấu hình trên Landing Page (bằng đuôi `?admin=1` hoặc nhấp 3 lần chân trang).
2. Dán link Google Form (dạng `https://docs.google.com/forms/d/e/.../viewform` hoặc link rút gọn `https://forms.gle/...`):
   - Vào ô **"Link Google Form trực tiếp"**: Khi khách đăng ký xong, hệ thống sẽ hiện nút để khách bấm mở xem biểu mẫu Google Form.
   - Vào ô **"URL Web App Google Apps Script / Google Form"**: Hệ thống sẽ tự động chuyển đổi sang endpoint `formResponse` và gửi kết quả về Google Form.

---

## Các trường thông tin được tự động lưu trữ:
1. `Thời gian đăng ký` (Định dạng ngày giờ Việt Nam GMT+7).
2. `Họ và tên`.
3. `Số điện thoại (Zalo)`.
4. `Link Facebook / Zalo`.
5. `1. Vấn đề hiện tại của bạn là gì?` (Bắt buộc).
6. `2. Mong muốn cải thiện của bạn là gì?` (Bắt buộc).
7. `Mô hình kinh doanh` (Chủ Spa, Kinh doanh mỹ phẩm, v.v.).
8. `Gói giải pháp quan tâm` (Miễn phí, 15 triệu, 30 triệu...).
9. `Ghi chú thêm`.
10. `Nguồn đăng ký` (URL trang landing page).
