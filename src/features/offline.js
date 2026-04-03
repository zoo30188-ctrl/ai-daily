// === AI Daily — 오프라인 감지 ===
import { showToast } from '../ui/toast.js';

const offlineBanner = document.getElementById('offlineBanner');

/** 현재 온라인 상태 확인 및 배너 표시 */
export const updateOnlineStatus = () => {
  if (!navigator.onLine) {
    offlineBanner.classList.add('visible');
    showToast('오프라인 상태입니다. 캐시된 데이터를 표시합니다.', 'error');
  } else {
    offlineBanner.classList.remove('visible');
  }
};

/** 오프라인 이벤트 리스너 등록 (fetchRSS 콜백 주입) */
export const initOfflineListeners = (onOnline) => {
  window.addEventListener('online', () => {
    offlineBanner.classList.remove('visible');
    showToast('온라인으로 복구되었습니다! 🎉');
    if (onOnline) onOnline();
  });

  window.addEventListener('offline', () => {
    offlineBanner.classList.add('visible');
    showToast('오프라인 상태입니다.', 'error');
  });
};
