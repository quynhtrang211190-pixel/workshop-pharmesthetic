// Application JS for Workshop Khởi nghiệp Pharmesthetic

document.addEventListener('DOMContentLoaded', () => {
  initTelegramConfig();
  initFormHandler();
  initPackageSelection();
  initCountdownTimer();
  initVideoModals();
  initPageViewCounter();
});

// Default Telegram Config state (stored in localStorage or built-in default)
const DEFAULT_TELEGRAM = {
  botToken: localStorage.getItem('tg_bot_token') || '8652720930:AAFqGwAaAwWjPEaKzPzjQOHCqsixgsy_n_M',
  chatId: localStorage.getItem('tg_chat_id') || '7960159367'
};

function initTelegramConfig() {
  const configBtn = document.getElementById('open-tg-config');
  const modal = document.getElementById('tg-config-modal');
  const closeBtn = document.getElementById('close-tg-config');
  const saveBtn = document.getElementById('save-tg-config');
  const testBtn = document.getElementById('test-tg-config');

  const tokenInput = document.getElementById('tg-bot-token');
  const chatInput = document.getElementById('tg-chat-id');
  const statusEl = document.getElementById('tg-config-status');

  // Load existing values into modal
  if (tokenInput) tokenInput.value = DEFAULT_TELEGRAM.botToken;
  if (chatInput) chatInput.value = DEFAULT_TELEGRAM.chatId;

  if (configBtn && modal) {
    configBtn.addEventListener('click', (e) => {
      e.preventDefault();
      modal.classList.add('active');
    });
  }

  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('active');
    });
  }

  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      const token = tokenInput.value.trim();
      const chat = chatInput.value.trim();

      localStorage.setItem('tg_bot_token', token);
      localStorage.setItem('tg_chat_id', chat);
      DEFAULT_TELEGRAM.botToken = token;
      DEFAULT_TELEGRAM.chatId = chat;

      showToast('Đã lưu cấu hình Telegram thành công!', 'success');
      modal.classList.remove('active');
    });
  }

  if (testBtn) {
    testBtn.addEventListener('click', async () => {
      const token = tokenInput.value.trim();
      const chat = chatInput.value.trim();

      if (!token || !chat) {
        statusEl.innerHTML = `<span class="text-red-500 font-semibold">Vui lòng nhập đầy đủ Bot Token và Chat ID!</span>`;
        return;
      }

      statusEl.innerHTML = `<span class="text-blue-500 font-semibold">Đang gửi tin nhắn thử nghiệm...</span>`;

      try {
        const message = `⚡ <b>[TEST] Thử nghiệm kết nối Telegram Bot</b>\n\nHệ thống LDP Workshop Pharmesthetic đã sẵn sàng nhận tin nhắn đăng ký!`;
        const res = await sendTelegramApi(token, chat, message);
        if (res.ok) {
          statusEl.innerHTML = `<span class="text-emerald-600 font-semibold">✓ Kết nối thành công! Kiểm tra tin nhắn trong Telegram của bạn.</span>`;
          showToast('Tin nhắn thử nghiệm đã được gửi!', 'success');
        } else {
          statusEl.innerHTML = `<span class="text-red-500 font-semibold">❌ Lỗi: ${res.description || 'Không thể kết nối Telegram Bot'}</span>`;
        }
      } catch (err) {
        statusEl.innerHTML = `<span class="text-red-500 font-semibold">❌ Lỗi mạng: ${err.message}</span>`;
      }
    });
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

// Registration Form Submission Handler
function initFormHandler() {
  const form = document.getElementById('registration-form');
  const submitBtn = document.getElementById('submit-btn');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const fullName = document.getElementById('form-name').value.trim();
    const phone = document.getElementById('form-phone').value.trim();
    const role = document.getElementById('form-role').value;
    const packageType = document.getElementById('form-package').value;
    const note = document.getElementById('form-note')?.value.trim() || 'Không có';

    if (!fullName || !phone) {
      showToast('Vui lòng điền đầy đủ Họ tên và Số điện thoại!', 'error');
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

    // Construct Telegram Message Payload
    const now = new Date().toLocaleString('vi-VN');
    const telegramMessage = `
🔥 <b>ĐĂNG KÝ WORKSHOP PHARMESTHETIC MỚI!</b>
━━━━━━━━━━━━━━━━━━━━━━
👤 <b>Họ và tên:</b> ${fullName}
📞 <b>Số điện thoại:</b> <code>${phone}</code>
💼 <b>Mô hình:</b> ${role}
📦 <b>Gói quan tâm:</b> <b>${packageType}</b>
📝 <b>Ghi chú:</b> ${note}
⏰ <b>Thời gian ĐK:</b> ${now}
📍 <b>Sự kiện:</b> Workshop Khởi nghiệp Pharmesthetic (21/10)
━━━━━━━━━━━━━━━━━━━━━━
<i>Tin nhắn tự động từ Landing Page Workshop Pharmesthetic</i>
    `.trim();

    const token = localStorage.getItem('tg_bot_token') || DEFAULT_TELEGRAM.botToken;
    const chat = localStorage.getItem('tg_chat_id') || DEFAULT_TELEGRAM.chatId;

    let isSentToTelegram = false;

    if (token && chat) {
      try {
        const res = await sendTelegramApi(token, chat, telegramMessage);
        if (res.ok) {
          isSentToTelegram = true;
        } else {
          console.warn('Telegram Error:', res);
        }
      } catch (err) {
        console.error('Telegram Send Failed:', err);
      }
    } else {
      console.log('Chưa cấu hình Telegram Token/ChatID. Dữ liệu sẽ mô phỏng gửi:', { fullName, phone, role, packageType, note });
    }

    // Reset Form & Show Success Modal / Toast
    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `Đăng Ký Tham Gia Ngay ✨`;
      form.reset();

      showSuccessModal(fullName, phone, packageType, isSentToTelegram);
    }, 800);
  });
}

function showSuccessModal(name, phone, packageType, sentToTg) {
  const modal = document.getElementById('success-modal');
  const detailsEl = document.getElementById('success-details');

  if (detailsEl) {
    detailsEl.innerHTML = `
      <p>Cảm ơn <strong>${name}</strong> (${phone})!</p>
      <p class="mt-1">Bạn đã đăng ký tham gia với lựa chọn: <span class="text-teal-600 font-bold">${packageType}</span></p>
      <p class="mt-2 text-xs text-slate-500">Ban tổ chức Pharmesthetic sẽ liên hệ xác nhận vé tham dự trong thời gian sớm nhất.</p>
      <p class="mt-2 text-xs text-emerald-600 font-medium">✓ Thông tin đăng ký đã được ghi nhận thành công!</p>
    `;
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
