// === AI Daily v2.0 — 진입점 ===

// CSS imports
import './styles/variables.css';
import './styles/base.css';
import './styles/layout.css';
import './styles/components.css';
import './styles/overlays.css';
import './styles/animations.css';

// 모듈 imports
import { getActiveSources } from './config.js';
import state from './state.js';
import { initTheme } from './ui/theme.js';
import { initSettings, toggleSettings } from './ui/settings.js';
import { initVersion } from './ui/changelog.js';
import { setNewsItems, initFilters } from './ui/renderer.js';
import { fetchRSS } from './api.js';
import { updateOnlineStatus, initOfflineListeners } from './features/offline.js';
import { closeChangelog } from './ui/changelog.js';

// --- 초기화 ---
initTheme();
initSettings(() => getActiveSources(state.customSources));
initVersion();
initFilters();
updateOnlineStatus();

// 오프라인→온라인 복구 시 강제 새로고침
initOfflineListeners(() => fetchRSS(true, setNewsItems));

// 새로고침 버튼 (Shift+클릭 = 캐시 무시)
const refreshBtn = document.getElementById('refreshBtn');
refreshBtn.addEventListener('click', (e) => fetchRSS(e.shiftKey, setNewsItems));

// 스크롤 맨 위 버튼
const scrollTopBtn = document.getElementById('scrollTopBtn');
window.addEventListener('scroll', () => {
  if (window.scrollY > 400) {
    scrollTopBtn.classList.add('visible');
  } else {
    scrollTopBtn.classList.remove('visible');
  }
}, { passive: true });

scrollTopBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ESC 키 핸들러
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const changelogOverlay = document.getElementById('changelogOverlay');
    const settingsOverlay = document.getElementById('settingsOverlay');
    if (changelogOverlay.classList.contains('open')) closeChangelog();
    if (settingsOverlay.classList.contains('open')) toggleSettings(false);
  }
});

// Service Worker 등록
if ('serviceWorker' in navigator) {
  const swPath = `${import.meta.env.BASE_URL}sw.js`;
  navigator.serviceWorker.register(swPath)
    .then(reg => console.log('SW registered:', reg.scope))
    .catch(err => console.warn('SW registration skipped:', err.message));
}

// 초기 데이터 로드
fetchRSS(false, setNewsItems);
