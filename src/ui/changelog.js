// === AI Daily — 체인지로그 & 버전 배지 ===
import state, { saveState } from '../state.js';
import { APP_VERSION, CHANGELOG } from '../config.js';
import { escapeHTML } from '../utils.js';

const versionBadge = document.getElementById('versionBadge');
const changelogOverlay = document.getElementById('changelogOverlay');
const closeChangelogBtn = document.getElementById('closeChangelogBtn');
const changelogBody = document.getElementById('changelogBody');

/** 체인지로그 팝업 열기 */
export const openChangelog = () => {
  changelogBody.innerHTML = CHANGELOG.map(release => `
    <div class="changelog-version-block">
      <div class="changelog-version-title">${escapeHTML(release.version)}</div>
      <div class="changelog-version-date">${escapeHTML(release.date)}</div>
      <ul class="changelog-list">
        ${release.changes.map(c =>
          `<li class="${c.type}">${escapeHTML(c.text)}</li>`
        ).join('')}
      </ul>
    </div>
  `).join('');

  changelogOverlay.classList.add('open');

  // 버전을 "본 것"으로 마킹
  if (state.lastSeenVersion !== APP_VERSION) {
    state.lastSeenVersion = APP_VERSION;
    saveState();
    versionBadge.classList.remove('new-version');
  }
};

/** 체인지로그 닫기 */
export const closeChangelog = () => {
  changelogOverlay.classList.remove('open');
};

/** 버전 배지 초기화 */
export const initVersion = () => {
  versionBadge.textContent = APP_VERSION;

  if (state.lastSeenVersion !== APP_VERSION) {
    versionBadge.classList.add('new-version');
  }

  versionBadge.addEventListener('click', openChangelog);
  closeChangelogBtn.addEventListener('click', closeChangelog);

  changelogOverlay.addEventListener('click', (e) => {
    if (e.target === changelogOverlay) closeChangelog();
  });

  // Enter/Space 키로 열기
  versionBadge.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openChangelog();
    }
  });
};
