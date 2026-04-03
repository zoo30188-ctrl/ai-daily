// === AI Daily — 북마크 관리 ===
import state, { saveState } from '../state.js';

let bookmarksSet = new Set(state.bookmarks || []);

/** 북마크 토글 (추가/제거) */
export const toggleBookmark = (link) => {
  if (bookmarksSet.has(link)) {
    bookmarksSet.delete(link);
  } else {
    bookmarksSet.add(link);
  }
  state.bookmarks = [...bookmarksSet];
  saveState();
};

/** 북마크 여부 확인 */
export const isBookmarked = (link) => bookmarksSet.has(link);
