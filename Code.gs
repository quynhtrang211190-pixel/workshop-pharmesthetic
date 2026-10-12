// ==============================================================================
// WORKSHOP KHỞI NGHIỆP PHARMESTHETIC - GOOGLE APPS SCRIPT BACKEND
// Tự động ghi nhận thông tin khách đăng ký vào Google Sheet & báo Telegram
// ==============================================================================
// HƯỚNG DẪN CÀI ĐẶT 1 PHÚT:
// 1. Tạo một trang tính Google Sheet mới (Đặt tên: "Đăng Ký Workshop Pharmesthetic").
// 2. Vào Tiện ích mở rộng (Extensions) > Apps Script.
// 3. Xoá hết mã mặc định và dán toàn bộ đoạn mã này vào file Code.gs.
// 4. Bấm "Triển khai" (Deploy) > "Tùy chọn triển khai mới" (New deployment).
//    - Chọn loại: "Ứng dụng web" (Web app).
//    - Mô tả: "Workshop Pharmesthetic Registration API".
//    - Người thực thi (Execute as): "Tôi" (Me).
//    - Người có quyền truy cập (Who has access): "Bất kỳ ai" (Anyone) -> Rất quan trọng!
// 5. Bấm "Triển khai" (Deploy) -> Cấp quyền truy cập nếu Google yêu cầu.
// 6. Sao chép URL ứng dụng web (dạng https://script.google.com/macros/s/.../exec).
// 7. Mở Landing Page Workshop với đuôi ?admin=1 hoặc nhấp 3 lần vào dòng bản quyền chân trang,
//    dán URL vừa sao chép vào ô "URL Web App Google Apps Script" và bấm "Lưu Cấu Hình".
// ==============================================================================

const CONFIG = {
  // 1. Tên sheet lưu dữ liệu (mặc định tự tạo nếu chưa có)
  SHEET_NAME: 'Đăng Ký Workshop',

  // 2. (Tùy chọn) ID của Google Sheet:
  // - Nếu bạn mở Apps Script từ menu 'Tiện ích mở rộng > Apps Script' trong Google Sheet: ĐỂ NGUYÊN RỖNG (tự động nhận).
  // - Nếu tạo Apps Script độc lập tại script.google.com: Dán ID trang tính vào đây (Lấy từ URL: docs.google.com/spreadsheets/d/{ID}/edit).
  SPREADSHEET_ID: '',

  // 3. Cấu hình bot Telegram nhận thông báo tức thì khi có người đăng ký
  TELEGRAM_BOT_TOKEN: '8652720930:AAFqGwAaAwWjPEaKzPzjQOHCqsixgsy_n_M',
  TELEGRAM_CHAT_ID: '7960159367'
};

/**
 * Xử lý yêu cầu POST gửi từ Landing Page Workshop
 */
function doPost(e) {
  try {
    let data = {};
    if (e && e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (err) {
        data = e.parameter || {};
      }
    } else if (e && e.parameter) {
      data = e.parameter;
    }

    const result = handleWorkshopRegistration(data);
    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Xử lý yêu cầu GET để kiểm tra trạng thái hoạt động của Script
 */
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ 
      status: 'ok', 
      service: 'WorkshopPharmestheticRegistrationAPI',
      timestamp: new Date().toISOString()
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Ghi thông tin đăng ký vào Google Sheet và thông báo Telegram
 */
function handleWorkshopRegistration(data) {
  const fullName = data.fullName || data.name || 'Chưa cung cấp';
  const phone = data.phone || 'Chưa cung cấp';
  const socialLink = data.socialLink || data.social || 'Không cung cấp';
  const problem = data.problem || 'Chưa nhập';
  const goal = data.goal || 'Chưa nhập';
  const role = data.role || 'Chưa chọn';
  const packageType = data.packageType || data.package || 'Đăng ký tham dự Workshop (Miễn Phí)';
  const note = data.note || 'Không có';
  const source = data.source || 'Landing Page Workshop Pharmesthetic';

  let ss = null;
  try {
    ss = SpreadsheetApp.getActiveSpreadsheet();
  } catch (err) {
    Logger.log("Không có active spreadsheet: " + err.message);
  }

  if (!ss && CONFIG.SPREADSHEET_ID && CONFIG.SPREADSHEET_ID.trim() !== '') {
    try {
      ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID.trim());
    } catch (err) {
      Logger.log("Không thể mở Sheet bằng SPREADSHEET_ID: " + err.message);
    }
  }

  if (!ss) {
    return {
      success: false,
      error: "Chưa kết nối được với Google Sheet. Vui lòng kiểm tra lại quyền truy cập hoặc điền SPREADSHEET_ID nếu dùng Apps Script độc lập."
    };
  }

  let sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
  
  // Nếu chưa có sheet, tự động tạo và định dạng hàng tiêu đề đẹp mắt
  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.SHEET_NAME);
    const headers = [
      'Thời gian đăng ký',
      'Họ và tên',
      'Số điện thoại',
      'Link Facebook / Zalo',
      '1. Vấn đề hiện tại của bạn',
      '2. Mong muốn cải thiện',
      'Mô hình kinh doanh',
      'Gói giải pháp quan tâm',
      'Ghi chú thêm',
      'Nguồn đăng ký'
    ];
    sheet.appendRow(headers);
    
    // Định dạng giao diện tiêu đề bảng
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground('#0f172a');
    headerRange.setFontColor('#38bdf8');
    headerRange.setFontWeight('bold');
    headerRange.setFontSize(11);
    sheet.setFrozenRows(1);
    
    // Tự động căn chỉnh độ rộng cột
    for (let c = 1; c <= headers.length; c++) {
      sheet.setColumnWidth(c, 180);
    }
    sheet.setColumnWidth(1, 160); // Thời gian
    sheet.setColumnWidth(2, 180); // Họ tên
    sheet.setColumnWidth(3, 140); // SĐT
    sheet.setColumnWidth(5, 260); // Vấn đề
    sheet.setColumnWidth(6, 260); // Mong muốn
  }

  const now = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
  
  // Ghi thêm dòng dữ liệu mới
  sheet.appendRow([
    now,
    fullName,
    "'" + phone, // Dấu nháy đơn giữ định dạng số điện thoại chuẩn không mất số 0
    socialLink,
    problem,
    goal,
    role,
    packageType,
    note,
    source
  ]);

  // Gửi thông báo đến Telegram Bot
  sendTelegramNotification(fullName, phone, socialLink, problem, goal, role, packageType, note, now);

  return { 
    success: true, 
    message: 'Đăng ký đã được ghi nhận vào Google Sheet thành công!' 
  };
}

/**
 * Gửi thông báo đến Telegram Bot
 */
function sendTelegramNotification(name, phone, social, problem, goal, role, pkg, note, time) {
  try {
    const token = CONFIG.TELEGRAM_BOT_TOKEN;
    const chatId = CONFIG.TELEGRAM_CHAT_ID;
    if (!token || !chatId) return;

    const message = `🔥 <b>ĐĂNG KÝ WORKSHOP PHARMESTHETIC MỚI!</b>\n` +
      `━━━━━━━━━━━━━━━━━━━━━━\n` +
      `👤 <b>Họ và tên:</b> ${name}\n` +
      `📞 <b>Số điện thoại:</b> <code>${phone}</code>\n` +
      `🌐 <b>Link FB/Zalo:</b> ${social}\n` +
      `⚠️ <b>Vấn đề hiện tại:</b> ${problem}\n` +
      `🎯 <b>Mong muốn cải thiện:</b> ${goal}\n` +
      `💼 <b>Mô hình:</b> ${role}\n` +
      `📦 <b>Gói quan tâm:</b> <b>${pkg}</b>\n` +
      `📝 <b>Ghi chú:</b> ${note}\n` +
      `⏰ <b>Thời gian ĐK:</b> ${time}\n` +
      `📍 <b>Sự kiện:</b> Workshop Khởi nghiệp Pharmesthetic (21/10)\n` +
      `━━━━━━━━━━━━━━━━━━━━━━\n` +
      `<i>✓ Đã đồng bộ tự động vào Google Sheet</i>`;

    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    UrlFetchApp.fetch(url, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML'
      }),
      muteHttpExceptions: true
    });
  } catch (err) {
    Logger.log("Telegram Error: " + err.message);
  }
}

/**
 * Hàm kiểm tra và cấp quyền nhanh ngay trong Apps Script Editor
 */
function testRunAuthorization() {
  const dummyData = {
    fullName: 'Test Kiểm Tra',
    phone: '0987654321',
    socialLink: 'facebook.com/test',
    problem: 'Kiểm tra cấp quyền Google Sheet',
    goal: 'Chạy thông suốt',
    role: 'Chủ Spa / Thẩm Mỹ Viện',
    packageType: 'Gói Little Master (15 triệu)',
    note: 'Kiểm tra',
    source: 'Apps Script Test'
  };
  const res = handleWorkshopRegistration(dummyData);
  Logger.log(res);
}
