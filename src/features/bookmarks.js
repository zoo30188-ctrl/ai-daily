// === AI Daily — 북마크 관리 ===
import state, { saveState } from '../state.js';

// 기존 북마크가 문자열(URL) 배열인 경우, 하위 호환성을 위해 변환 필요 없음
// 렌더링 측에서 문자열인지 객체인지 판단하여 처리.
// 단, 앞으로는 객체로 저장함.

/** 북마크 토글 (추가/제거) */
export const toggleBookmark = (item) => {
  const link = item.link || item; // 호환성
  const existingIdx = state.bookmarks.findIndex(b => (b.link === link || b === link));
  
  if (existingIdx >= 0) {
    // 제거
    state.bookmarks.splice(existingIdx, 1);
  } else {
    // 추가 (문자열인 경우 객체화 불가능하나, 일반적으로 item은 객체임)
    state.bookmarks.push(typeof item === 'string' ? { link: item } : item);
  }
  saveState();
};

/** 북마크 여부 확인 */
export const isBookmarked = (link) => {
  return state.bookmarks.some(b => b.link === link || b === link);
};
