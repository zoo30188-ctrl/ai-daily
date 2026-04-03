// === AI Daily — 공유 & 클립보드 복사 ===
import { showToast } from '../ui/toast.js';

/** 기사를 Web Share API 또는 클립보드로 공유 */
export const shareArticle = async (title, link) => {
  const shareData = { title, url: link };
  try {
    if (navigator.share) {
      await navigator.share(shareData);
    } else {
      await navigator.clipboard.writeText(`${title}\n${link}`);
      showToast('링크가 클립보드에 복사되었습니다.');
    }
  } catch (err) {
    if (err.name !== 'AbortError') {
      await navigator.clipboard.writeText(`${title}\n${link}`);
      showToast('링크가 클립보드에 복사되었습니다.');
    }
  }
};

/** 요약 텍스트를 클립보드에 복사 */
export const copySummaryText = async (boxEl) => {
  const text = boxEl.innerText.replace('(캐시됨)', '').replace('📋 요약 복사', '').trim();
  try {
    await navigator.clipboard.writeText(text);
    showToast('요약이 클립보드에 복사되었습니다.');
  } catch {
    showToast('복사에 실패했습니다.', 'error');
  }
};
