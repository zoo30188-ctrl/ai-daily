// === AI Daily — 테마 관리 ===
import state, { saveState } from '../state.js';
import { showToast } from './toast.js';

const themeToggle = document.getElementById('themeToggle');

/** 테마 초기화 (저장된 테마 적용) */
export const initTheme = () => {
  const theme = state.theme || 'dark';
  document.documentElement.setAttribute('data-theme', theme);
  themeToggle.textContent = theme === 'dark' ? '🌙' : '☀️';
};

/** 테마 토글 */
export const toggleTheme = () => {
  const current = document.documentElement.getAttribute('data-theme') || 'dark';
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  themeToggle.textContent = next === 'dark' ? '🌙' : '☀️';
  state.theme = next;
  saveState();
  showToast(next === 'dark' ? '🌙 다크 모드' : '☀️ 라이트 모드');
};

// 테마 토글 이벤트
themeToggle.addEventListener('click', toggleTheme);
