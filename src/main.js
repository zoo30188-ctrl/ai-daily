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
initOfflineListeners(() => fetchRSS(true, false, wrappedSetNewsItems));

// 새로고침 버튼 (Shift+클릭 = 캐시 무시)
const refreshBtn = document.getElementById('refreshBtn');
refreshBtn.addEventListener('click', (e) => fetchRSS(e.shiftKey, false, wrappedSetNewsItems));

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

// 최초 로드 완료 시 최신 pubDate 기록
const originalSetNewsItems = setNewsItems;
export const wrappedSetNewsItems = (items) => {
  if (items && items.length > 0) latestPubDate = new Date(items[0].pubDate).getTime();
  originalSetNewsItems(items);
};

// 초기 데이터 로드
fetchRSS(false, false, wrappedSetNewsItems);

// 자동 새로고침 (R6)
let refreshTimer = null;
const newArticlesBanner = document.getElementById('newArticlesBanner');
let latestPubDate = 0; // 최신 기사의 타임스탬프

newArticlesBanner.addEventListener('click', () => {
  newArticlesBanner.style.display = 'none';
  window.scrollTo({ top: 0, behavior: 'smooth' });
  fetchRSS(true, false, (items) => {
    if (items.length > 0) latestPubDate = new Date(items[0].pubDate).getTime();
    setNewsItems(items);
  });
});

const setupAutoRefresh = () => {
  if (refreshTimer) clearInterval(refreshTimer);
  const intervalMin = parseInt(state.autoRefreshInterval || '0', 10);
  
  if (intervalMin > 0) {
    refreshTimer = setInterval(() => {
      // silent fetch
      fetchRSS(true, true, (items) => {
        if (items.length > 0) {
          const newLatest = new Date(items[0].pubDate).getTime();
          if (latestPubDate === 0) {
            latestPubDate = newLatest;
          } else if (newLatest > latestPubDate) {
            // 새 기사 발견
            newArticlesBanner.style.display = 'block';
          }
        }
      });
    }, intervalMin * 60 * 1000);
  }
};

setupAutoRefresh();
