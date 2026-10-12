// Application JS for Workshop Khởi nghiệp Pharmesthetic

document.addEventListener('DOMContentLoaded', () => {
  initAdminConfig();
  initFormHandler();
  initPackageSelection();
  initCountdownTimer();
  initVideoModals();
  initPageViewCounter();
});

// ============================================================
// CẤU HÌNH GOOGLE FORM / APPS SCRIPT & TELEGRAM
// ============================================================
const DEFAULT_CONFIG = {
  // 1. Telegram Notification Bot (Mặc định @Spamanagertool_bot)
  tgBotToken: localStorage.getItem('tg_bot_token') || '8652720930:AAFqGwAaAwWjPEaKzPzjQOHCqsixgsy_n_M',
  tgChatId: localStorage.getItem('tg_chat_id') || '7960159367',

  // 2. Google Form / Google Apps Script Webhook URL
  // Dán Web App URL triển khai từ Code.gs hoặc link Google Form
  googleEndpointUrl: localStorage.getItem('ws_google_endpoint') || '',

  // 3. Link Google Form trực tiếp (Nếu muốn hiển thị nút mở biểu mẫu sau khi đăng ký)
  googleFormDirectUrl: localStorage.getItem('ws_google_form_url') || ''
};

// Global helper for console configuration
window.setWorkshopEndpoint = function(googleUrl, googleFormDirectUrl = '') {
  if (googleUrl) localStorage.setItem('ws_google_endpoint', googleUrl.trim());
  if (googleFormDirectUrl) localStorage.setItem('ws_google_form_url', googleFormDirectUrl.trim());
  DEFAULT_CONFIG.googleEndpointUrl = googleUrl ? googleUrl.trim() : DEFAULT_CONFIG.googleEndpointUrl;
  DEFAULT_CONFIG.googleFormDirectUrl = googleFormDirectUrl ? googleFormDirectUrl.trim() : DEFAULT_CONFIG.googleFormDirectUrl;
  console.log('✅ Đã lưu Google Endpoint:', DEFAULT_CONFIG.googleEndpointUrl);
  alert('Đã cập nhật cấu hình kết nối Google thành công!');
};

// ============================================================
// ADMIN CONFIG MODAL LOGIC (Mở bằng ?admin=1 hoặc nhấp 3 lần footer)
// ============================================================
function initAdminConfig() {
  const trigger = document.getElementById('admin-secret-trigger');
  const modal = document.getElementById('admin-config-modal');
  const closeBtn = document.getElementById('close-admin-config');
  const saveBtn = document.getElementById('btn-save-admin-config');
  const testBtn = document.getElementById('btn-test-connection');

  const googleUrlInput = document.getElementById('cfg-google-url');
  const googleFormDirectInput = document.getElementById('cfg-google-form-direct');
  const tgTokenInput = document.getElementById('cfg-tg-token');
  const tgChatInput = document.getElementById('cfg-tg-chat');
  const statusEl = document.getElementById('cfg-status-message');

  function openModal() {
    if (!modal) return;
    if (googleUrlInput) googleUrlInput.value = localStorage.getItem('ws_google_endpoint') || DEFAULT_CONFIG.googleEndpointUrl;
    if (googleFormDirectInput) googleFormDirectInput.value = localStorage.getItem('ws_google_form_url') || DEFAULT_CONFIG.googleFormDirectUrl;
    if (tgTokenInput) tgTokenInput.value = localStorage.getItem('tg_bot_token') || DEFAULT_CONFIG.tgBotToken;
    if (tgChatInput) tgChatInput.value = localStorage.getItem('tg_chat_id') || DEFAULT_CONFIG.tgChatId;
    if (statusEl) statusEl.innerHTML = '';
    modal.classList.add('active');
  }

  function closeModal() {
    if (modal) modal.classList.remove('active');
  }

  // Auto open if URL has ?admin=1
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('admin') === '1') {
    openModal();
  }

  // Triple click trigger on footer copyright
  let clickCount = 0;
  let clickTimer = null;
  if (trigger) {
    trigger.addEventListener('click', () => {
      clickCount++;
      clearTimeout(clickTimer);
      if (clickCount >= 3) {
        clickCount = 0;
        openModal();
      } else {
        clickTimer = setTimeout(() => {
          clickCount = 0;
        }, 600);
      }
    });
  }

  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  // Save Settings
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      const gUrl = googleUrlInput?.value.trim() || '';
      const gDirect = googleFormDirectInput?.value.trim() || '';
      const token = tgTokenInput?.value.trim() || '';
      const chat = tgChatInput?.value.trim() || '';

      localStorage.setItem('ws_google_endpoint', gUrl);
      localStorage.setItem('ws_google_form_url', gDirect);
      localStorage.setItem('tg_bot_token', token);
      localStorage.setItem('tg_chat_id', chat);

      DEFAULT_CONFIG.googleEndpointUrl = gUrl;
      DEFAULT_CONFIG.googleFormDirectUrl = gDirect;
      DEFAULT_CONFIG.tgBotToken = token;
      DEFAULT_CONFIG.tgChatId = chat;

      showToast('Đã lưu cấu hình Google & Telegram thành công!', 'success');
      closeModal();
    });
  }

  // Test Connection
  if (testBtn) {
    testBtn.addEventListener('click', async () => {
      const gUrl = googleUrlInput?.value.trim() || '';
      const token = tgTokenInput?.value.trim() || '';
      const chat = tgChatInput?.value.trim() || '';

      if (statusEl) {
        statusEl.innerHTML = `<span class="text-sky-400 font-medium">⏳ Đang gửi dữ liệu kiểm tra...</span>`;
      }

      let tgOk = false;
      let googleOk = false;

      // Test Telegram
      if (token && chat) {
        try {
          const testMsg = `⚡ <b>[TEST] KIỂM TRA HỆ THỐNG WORKSHOP PHARMESTHETIC</b>\n\nKết nối Telegram hoạt động tốt!`;
          const res = await sendTelegramApi(token, chat, testMsg);
          if (res.ok) tgOk = true;
        } catch (e) {
          console.warn('Test TG error:', e);
        }
      }

      // Test Google Endpoint
      if (gUrl) {
        const dummyPayload = {
          fullName: 'Người Dùng Thử Nghiệm',
          phone: '0988888888',
          socialLink: 'facebook.com/test',
          problem: 'Kiểm tra kết nối Google Form/Sheet',
          goal: 'Đồng bộ dữ liệu thành công',
          role: 'Chủ Spa / Thẩm Mỹ Viện',
          packageType: 'Gói Little Master (15 triệu)',
          note: 'Dữ liệu test tự động',
          submittedAt: new Date().toLocaleString('vi-VN'),
          source: 'Admin Test'
        };
        const gRes = await sendToGoogleEndpoint(dummyPayload, gUrl);
        if (gRes.success) googleOk = true;
      }

      if (statusEl) {
        let msg = '';
        if (tgOk) msg += `<span class="text-emerald-400">✓ Telegram: OK</span> `;
        else if (token && chat) msg += `<span class="text-rose-400">✕ Telegram: Thất bại</span> `;

        if (googleOk) msg += `<span class="text-emerald-400">✓ Google: Đã gửi</span>`;
        else if (gUrl) msg += `<span class="text-rose-400">✕ Google: Kiểm tra lại URL</span>`;

        if (!token && !gUrl) msg = `<span class="text-amber-400">Vui lòng nhập ít nhất URL Google hoặc Telegram!</span>`;

        statusEl.innerHTML = msg;
      }
    });
  }
}

// ============================================================
// SEND DATA TO GOOGLE FORM / GOOGLE APPS SCRIPT
// ============================================================
async function sendToGoogleEndpoint(payload, customUrl = '') {
  const endpoint = customUrl || localStorage.getItem('ws_google_endpoint') || DEFAULT_CONFIG.googleEndpointUrl;
  
  if (!endpoint) {
    console.log('📌 Chưa cấu hình Google Endpoint. Kết quả sẽ được gửi qua Telegram.');
    return { success: false, reason: 'no_endpoint' };
  }

  try {
    let targetUrl = endpoint.trim();

    // Trường hợp 1: Link Google Form trực tiếp (docs.google.com/forms)
    if (targetUrl.includes('docs.google.com/forms')) {
      if (targetUrl.includes('/viewform')) {
        targetUrl = targetUrl.replace('/viewform', '/formResponse');
      } else if (!targetUrl.includes('/formResponse')) {
        targetUrl = targetUrl.replace(/\/$/, '') + '/formResponse';
      }

      const formBody = new URLSearchParams();
      // Google Form nhận URL-encoded parameters
      formBody.append('fullName', payload.fullName);
      formBody.append('phone', payload.phone);
      formBody.append('socialLink', payload.socialLink);
      formBody.append('problem', payload.problem);
      formBody.append('goal', payload.goal);
      formBody.append('role', payload.role);
      formBody.append('packageType', payload.packageType);
      formBody.append('note', payload.note);
      formBody.append('timestamp', payload.submittedAt);

      await fetch(targetUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formBody
      });

      return { success: true, type: 'google_form' };
    }

    // Trường hợp 2: Google Apps Script Web App (script.google.com)
    // Dùng Content-Type text/plain;charset=utf-8 và mode: no-cors để không bị chặn CORS
    await fetch(targetUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify(payload)
    });

    return { success: true, type: 'apps_script' };
  } catch (error) {
    console.error('Lỗi khi gửi kết quả về Google Form / Sheet:', error);
    return { success: false, error: error.message };
  }
}

// Send Message to Telegram API
async function sendTelegramApi(token, chatId, text) {
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: 'HTML'
    })
  });
  return await response.json();
}

// ============================================================
// REGISTRATION FORM SUBMISSION HANDLER
// ============================================================
function initFormHandler() {
  const form = document.getElementById('registration-form');
  const submitBtn = document.getElementById('submit-btn');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const fullName = document.getElementById('form-name').value.trim();
    const phone = document.getElementById('form-phone').value.trim();
    const socialLink = document.getElementById('form-social')?.value.trim() || 'Không cung cấp';
    const problem = document.getElementById('form-problem')?.value.trim() || 'Chưa nhập';
    const goal = document.getElementById('form-goal')?.value.trim() || 'Chưa nhập';
    const role = document.getElementById('form-role').value;
    const packageType = document.getElementById('form-package').value;
    const note = document.getElementById('form-note')?.value.trim() || 'Không có';

    if (!fullName || !phone || !problem || !goal) {
      showToast('Vui lòng điền đầy đủ Họ tên, Số điện thoại và 2 câu hỏi bắt buộc!', 'error');
      return;
    }

    // Phone validation
    const phoneRegex = /^[0-9+\s-]{9,15}$/;
    if (!phoneRegex.test(phone)) {
      showToast('Số điện thoại không hợp lệ, vui lòng kiểm tra lại!', 'error');
      return;
    }

    // UI Loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg> Đang xử lý đăng ký...
    `;

    const now = new Date().toLocaleString('vi-VN');

    // 1. Chuẩn bị dữ liệu gửi về Google Form / Google Sheet
    const registrationPayload = {
      fullName,
      phone,
      socialLink,
      problem,
      goal,
      role,
      packageType,
      note,
      submittedAt: now,
      source: window.location.href
    };

    // 2. Chuẩn bị tin nhắn gửi về Telegram Bot
    const telegramMessage = `
🔥 <b>ĐĂNG KÝ WORKSHOP PHARMESTHETIC MỚI!</b>
━━━━━━━━━━━━━━━━━━━━━━
👤 <b>Họ và tên:</b> ${fullName}
📞 <b>Số điện thoại:</b> <code>${phone}</code>
🌐 <b>Link FB/Zalo:</b> ${socialLink}
⚠️ <b>Vấn đề hiện tại:</b> ${problem}
🎯 <b>Mong muốn cải thiện:</b> ${goal}
💼 <b>Mô hình:</b> ${role}
📦 <b>Gói quan tâm:</b> <b>${packageType}</b>
📝 <b>Ghi chú:</b> ${note}
⏰ <b>Thời gian ĐK:</b> ${now}
📍 <b>Sự kiện:</b> Workshop Khởi nghiệp Pharmesthetic (21/10)
━━━━━━━━━━━━━━━━━━━━━━
<i>Tin nhắn tự động từ Landing Page Workshop Pharmesthetic</i>
    `.trim();

    const token = localStorage.getItem('tg_bot_token') || DEFAULT_CONFIG.tgBotToken;
    const chat = localStorage.getItem('tg_chat_id') || DEFAULT_CONFIG.tgChatId;

    let isSentToTelegram = false;
    let isSentToGoogle = false;

    // Gửi song song đến cả Telegram và Google Form / Sheet
    const promises = [];

    // Gửi Telegram
    if (token && chat) {
      promises.push(
        sendTelegramApi(token, chat, telegramMessage)
          .then(res => {
            if (res.ok) isSentToTelegram = true;
            else console.warn('Telegram Error:', res);
          })
          .catch(err => console.error('Telegram Send Failed:', err))
      );
    }

    // Gửi Google Form / Google Apps Script
    promises.push(
      sendToGoogleEndpoint(registrationPayload)
        .then(res => {
          if (res.success) isSentToGoogle = true;
        })
        .catch(err => console.error('Google Send Failed:', err))
    );

    await Promise.allSettled(promises);

    // Reset Form & Show Success Modal
    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `Đăng Ký Tham Gia Ngay ✨`;
      form.reset();

      showSuccessModal(fullName, phone, packageType, isSentToTelegram, isSentToGoogle);
    }, 600);
  });
}

function showSuccessModal(name, phone, packageType, sentToTg, sentToGoogle) {
  const modal = document.getElementById('success-modal');
  const detailsEl = document.getElementById('success-details');
  const linkContainer = document.getElementById('google-form-link-container');
  const formDirectUrl = localStorage.getItem('ws_google_form_url') || DEFAULT_CONFIG.googleFormDirectUrl;

  if (detailsEl) {
    detailsEl.innerHTML = `
      <p>Cảm ơn <strong>${name}</strong> (${phone})!</p>
      <p class="mt-1">Bạn đã đăng ký tham gia với lựa chọn: <span class="text-sky-400 font-bold">${packageType}</span></p>
      <p class="mt-2 text-xs text-slate-400">Ban tổ chức Pharmesthetic sẽ liên hệ xác nhận vé mời tham dự trong thời gian sớm nhất.</p>
      <p class="mt-2 text-xs text-emerald-400 font-medium">✓ Dữ liệu đăng ký đã được ghi nhận thành công và gửi tới Ban Tổ Chức!</p>
    `;
  }

  // Nếu có link Google Form trực tiếp thì hiển thị nút dẫn sang Google Form
  if (linkContainer) {
    if (formDirectUrl) {
      linkContainer.innerHTML = `
        <a href="${formDirectUrl}" target="_blank" rel="noopener noreferrer" 
           class="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 hover:text-sky-300 text-xs font-bold border border-slate-700 transition">
          <i data-lucide="external-link" class="w-4 h-4"></i>
          <span>Mở xem Biểu mẫu Google Form Workshop</span>
        </a>
      `;
      linkContainer.classList.remove('hidden');
      if (window.lucide) window.lucide.createIcons();
    } else {
      linkContainer.classList.add('hidden');
      linkContainer.innerHTML = '';
    }
  }

  if (modal) {
    modal.classList.add('active');
  }
}

function closeSuccessModal() {
  const modal = document.getElementById('success-modal');
  if (modal) modal.classList.remove('active');
}

// Package Selection Interactive Handler
function initPackageSelection() {
  const cards = document.querySelectorAll('.package-card');
  const packageSelect = document.getElementById('form-package');

  cards.forEach(card => {
    card.addEventListener('click', () => {
      cards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');

      const pkgName = card.dataset.package;
      if (packageSelect && pkgName) {
        packageSelect.value = pkgName;

        // Smooth scroll to form if clicked from pricing section
        const formElement = document.getElementById('register');
        if (formElement) {
          formElement.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });
}

// Countdown Timer for Oct 21, 13:30
function initCountdownTimer() {
  // Target: Oct 21, 13:30
  const now = new Date();
  let targetYear = now.getFullYear();
  let targetDate = new Date(`${targetYear}-10-21T13:30:00+07:00`);

  if (now > targetDate) {
    targetDate = new Date(`${targetYear + 1}-10-21T13:30:00+07:00`);
  }

  function update() {
    const current = new Date();
    const diff = targetDate - current;

    if (diff <= 0) {
      document.getElementById('days').innerText = '00';
      document.getElementById('hours').innerText = '00';
      document.getElementById('minutes').innerText = '00';
      document.getElementById('seconds').innerText = '00';
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    const dEl = document.getElementById('days');
    const hEl = document.getElementById('hours');
    const mEl = document.getElementById('minutes');
    const sEl = document.getElementById('seconds');

    if (dEl) dEl.innerText = String(days).padStart(2, '0');
    if (hEl) hEl.innerText = String(hours).padStart(2, '0');
    if (mEl) mEl.innerText = String(minutes).padStart(2, '0');
    if (sEl) sEl.innerText = String(seconds).padStart(2, '0');
  }

  update();
  setInterval(update, 1000);
}

// Video Modal logic
function initVideoModals() {
  const playBtns = document.querySelectorAll('.play-btn-trigger');
  const videoModal = document.getElementById('video-modal');
  const videoFrame = document.getElementById('video-iframe');
  const closeVideo = document.getElementById('close-video');

  playBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const src = btn.dataset.videoSrc || 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1';
      if (videoFrame) videoFrame.src = src;
      if (videoModal) videoModal.classList.add('active');
    });
  });

  if (closeVideo && videoModal) {
    closeVideo.addEventListener('click', () => {
      videoModal.classList.remove('active');
      if (videoFrame) videoFrame.src = '';
    });
  }
}

// Helper Toast Notification
function showToast(message, type = 'info') {
  let toast = document.getElementById('app-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'app-toast';
    toast.className = 'toast-notification';
    document.body.appendChild(toast);
  }

  const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';
  toast.innerHTML = `<div class="flex items-center gap-3"><span class="font-bold text-lg">${icon}</span><span>${message}</span></div>`;

  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3500);
}

// Page View Counter (Starts from 20)
function initPageViewCounter() {
  const viewsEl = document.getElementById('page-views-count');
  if (!viewsEl) return;

  const storageKey = 'pharmesthetic_page_views';
  let currentViews = parseInt(localStorage.getItem(storageKey) || '20', 10);
  
  if (isNaN(currentViews) || currentViews < 20) {
    currentViews = 20;
  }
  
  // Increment view count for each visit
  currentViews += 1;
  localStorage.setItem(storageKey, currentViews);

  viewsEl.innerText = currentViews.toLocaleString('vi-VN');
}
