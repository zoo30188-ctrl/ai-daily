// === AI Daily — 유틸리티 함수 ===

/** HTML 특수문자 이스케이프 (XSS 방지) */
export const escapeHTML = (str) => {
  if (typeof str !== 'string') return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
};

/** 상대 시간 표시 (예: "3시간 전") */
export const timeAgo = (dateStr) => {
  const date = new Date(dateStr);
  if (isNaN(date)) return escapeHTML(dateStr);

  const seconds = Math.floor((new Date() - date) / 1000);

  let interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + "일 전";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + "시간 전";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + "분 전";
  return "방금 전";
};

/** 에러 메시지를 사용자 친화적 한국어로 변환 */
export const friendlyError = (err) => {
  const msg = err?.message || String(err);
  if (msg.includes('API key not valid') || msg.includes('403')) return 'API 키가 유효하지 않습니다. 설정에서 키를 확인하세요.';
  if (msg.includes('429') || msg.includes('quota') || msg.includes('rate')) return '요청 한도를 초과했습니다. 잠시 후 다시 시도하세요.';
  if (msg.includes('500') || msg.includes('503')) return '서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도하세요.';
  if (msg.includes('Failed to fetch') || msg.includes('NetworkError')) return '네트워크 연결을 확인해주세요.';
  if (msg.includes('SAFETY')) return 'AI 안전 필터에 의해 요약이 제한되었습니다.';
  return msg;
};
