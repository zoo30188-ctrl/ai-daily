// === AI Daily — 설정 패널 ===
import state, { saveState, getApiKey } from '../state.js';
import { showToast } from './toast.js';
import { LANG_MAP, APP_VERSION } from '../config.js';
import { initTheme } from './theme.js';
import { createFocusTrap } from '../utils/focus-trap.js';

// DOM 요소
const settingsBtn = document.getElementById('settingsBtn');
const closeSettingsBtn = document.getElementById('closeSettingsBtn');
const backdrop = document.getElementById('backdrop');
const settingsOverlay = document.getElementById('settingsOverlay');
const geminiApiKeyInput = document.getElementById('geminiApiKey');
const apiKeyToggleBtn = document.getElementById('apiKeyToggle');
const apiKeyStatus = document.getElementById('apiKeyStatus');
const sourceTogglesContainer = document.getElementById('sourceToggles');
const summaryLangSelect = document.getElementById('summaryLang');
const addSourceBtn = document.getElementById('addSourceBtn');
const newSourceName = document.getElementById('newSourceName');
const newSourceUrl = document.getElementById('newSourceUrl');
const newSourceCategory = document.getElementById('newSourceCategory');
const exportBtn = document.getElementById('exportBtn');
const importBtn = document.getElementById('importBtn');
const importFileInput = document.getElementById('importFileInput');

// Focus Trap
const settingsFocusTrap = createFocusTrap(settingsOverlay);

/** 설정 패널 열기/닫기 */
export const toggleSettings = (show) => {
  if (show) {
    settingsOverlay.classList.add('open');
    backdrop.classList.add('open');
    settingsFocusTrap.activate();
    updateApiKeyStatus();
  } else {
    settingsOverlay.classList.remove('open');
    backdrop.classList.remove('open');
    settingsFocusTrap.deactivate();
  }
};

/** API 키 상태 표시 업데이트 */
const updateApiKeyStatus = () => {
  const { source } = getApiKey();
  if (source === 'env') {
    apiKeyStatus.textContent = '🔒 환경변수(.env.local)에서 로드됨';
    apiKeyStatus.className = 'help-text api-key-env';
    geminiApiKeyInput.placeholder = '환경변수 키 사용 중 (덮어쓰려면 입력)';
  } else if (source === 'user') {
    apiKeyStatus.textContent = '✅ 사용자 키 저장됨';
    apiKeyStatus.className = 'help-text api-key-user';
  } else {
    apiKeyStatus.textContent = '⚠️ 키가 설정되지 않았습니다. 키는 브라우저 localStorage에 저장됩니다.';
    apiKeyStatus.className = 'help-text';
  }
};

/** 소스 토글 렌더링 */
const renderSourceToggles = (allSources) => {
  sourceTogglesContainer.innerHTML = '';
  const customIds = new Set((state.customSources || []).map(s => s.id));

  allSources.forEach(src => {
    const item = document.createElement('div');
    item.className = 'toggle-item';

    const sourceInfo = document.createElement('div');
    sourceInfo.className = 'source-info';

    const label = document.createElement('span');
    label.textContent = src.name;
    sourceInfo.appendChild(label);

    // 커스텀 소스만 삭제 버튼 표시
    if (customIds.has(src.id)) {
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'btn-delete-source';
      deleteBtn.textContent = '✕';
      deleteBtn.title = '소스 삭제';
      deleteBtn.setAttribute('aria-label', `${src.name} 삭제`);
      deleteBtn.addEventListener('click', () => deleteCustomSource(src.id, allSources));
      sourceInfo.appendChild(deleteBtn);
    }

    const labelEl = document.createElement('label');
    labelEl.className = 'switch';

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = state.sourcesConfig[src.id] !== undefined ? state.sourcesConfig[src.id] : (src.defaultEnabled !== false);

    input.addEventListener('change', (e) => {
      state.sourcesConfig[src.id] = e.target.checked;
      saveState();
    });

    const slider = document.createElement('span');
    slider.className = 'slider';

    labelEl.appendChild(input);
    labelEl.appendChild(slider);

    item.appendChild(sourceInfo);
    item.appendChild(labelEl);
    sourceTogglesContainer.appendChild(item);
  });
};

/** 커스텀 소스 추가 */
const addCustomSource = (allSourcesFn) => {
  const name = newSourceName.value.trim();
  const url = newSourceUrl.value.trim();
  const category = newSourceCategory.value;

  if (!name) { showToast('소스 이름을 입력하세요.', 'error'); return; }
  if (!url || !url.startsWith('http')) { showToast('유효한 RSS URL을 입력하세요.', 'error'); return; }

  const id = 'custom_' + Date.now();
  const newSource = { id, name, url, category, custom: true };

  if (!state.customSources) state.customSources = [];
  state.customSources.push(newSource);
  state.sourcesConfig[id] = true;
  saveState();

  newSourceName.value = '';
  newSourceUrl.value = '';
  renderSourceToggles(allSourcesFn());
  showToast(`"${name}" 소스가 추가되었습니다.`);
};

/** 커스텀 소스 삭제 */
const deleteCustomSource = (id, allSources) => {
  if (!confirm('이 소스를 삭제하시겠습니까?')) return;
  state.customSources = (state.customSources || []).filter(s => s.id !== id);
  delete state.sourcesConfig[id];
  saveState();
  renderSourceToggles(allSources);
  showToast('소스가 삭제되었습니다.');
};

/** 설정 내보내기 (API 키 제외) */
const exportSettings = () => {
  const exportData = { ...state };
  delete exportData.apiKey; // 보안: API 키 제외
  const data = JSON.stringify(exportData, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ai-daily-settings-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('설정이 내보내기 되었습니다. (API 키는 보안상 제외)');
};

/** 설정 가져오기 */
const importSettings = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (evt) => {
    try {
      const imported = JSON.parse(evt.target.result);
      // API 키는 덮어쓰지 않음
      const currentApiKey = state.apiKey;
      Object.assign(state, imported);
      state.apiKey = currentApiKey;
      saveState();
      geminiApiKeyInput.value = state.apiKey;
      initTheme();
      showToast('설정이 가져오기 되었습니다. 새로고침하면 적용됩니다.');
    } catch {
      showToast('잘못된 설정 파일입니다.', 'error');
    }
  };
  reader.readAsText(file);
  importFileInput.value = '';
};

/** 설정 초기화 및 이벤트 바인딩 */
export const initSettings = (getActiveSourcesFn) => {
  // API 키
  geminiApiKeyInput.value = state.apiKey;
  geminiApiKeyInput.addEventListener('change', (e) => {
    state.apiKey = e.target.value.trim();
    saveState();
    updateApiKeyStatus();
    showToast('API 키가 저장되었습니다.');
  });

  // API 키 마스킹 토글
  apiKeyToggleBtn.addEventListener('click', () => {
    const isPassword = geminiApiKeyInput.type === 'password';
    geminiApiKeyInput.type = isPassword ? 'text' : 'password';
    apiKeyToggleBtn.textContent = isPassword ? '🔒' : '👁️';
    apiKeyToggleBtn.title = isPassword ? '키 숨기기' : '키 보기';
  });

  renderSourceToggles(getActiveSourcesFn());

  // 언어 설정
  summaryLangSelect.value = state.summaryLang || 'ko';
  summaryLangSelect.addEventListener('change', (e) => {
    state.summaryLang = e.target.value;
    saveState();
    showToast(`요약 언어: ${LANG_MAP[e.target.value].name}`);
  });

  // 소스 추가
  addSourceBtn.addEventListener('click', () => addCustomSource(getActiveSourcesFn));

  // Import/Export
  exportBtn.addEventListener('click', exportSettings);
  importBtn.addEventListener('click', () => importFileInput.click());
  importFileInput.addEventListener('change', importSettings);

  // 패널 토글
  settingsBtn.addEventListener('click', () => toggleSettings(true));
  closeSettingsBtn.addEventListener('click', () => toggleSettings(false));
  backdrop.addEventListener('click', () => toggleSettings(false));

  // 초기 상태 표시
  updateApiKeyStatus();
};
