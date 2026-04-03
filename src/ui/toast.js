// === AI Daily — 토스트 알림 ===

const toastContainer = document.getElementById('toastContainer');

/** 토스트 메시지 표시 */
export const showToast = (message, type = 'info') => {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
};
