// === AI Daily — 상태 관리 (localStorage) ===
import { DEFAULT_SOURCES } from './config.js';

const STATE_KEY = 'ai_daily_state';

/** 기본 상태 */
const defaultState = {
  apiKey: '',
  sourcesConfig: DEFAULT_SOURCES.reduce((acc, source) => {
    acc[source.id] = source.defaultEnabled !== false;
    return acc;
  }, {}),
  readItems: [],
  lastSeenVersion: '',
  customSources: [],
  theme: 'dark',
  bookmarks: [],
  summaryLang: 'ko',
};

/** 현재 상태 (localStorage에서 로드) */
let state = { ...defaultState };

try {
  const saved = localStorage.getItem(STATE_KEY);
  if (saved) {
    state = { ...defaultState, ...JSON.parse(saved) };
  }
} catch (e) {
  console.error('Failed to parse localStorage', e);
}

/** 상태를 localStorage에 저장 */
export const saveState = () => {
  localStorage.setItem(STATE_KEY, JSON.stringify(state));
};

/** 현재 상태 반환 (읽기용) */
export const getState = () => state;

/** 상태 업데이트 (부분 업데이트 + 자동 저장) */
export const updateState = (updates) => {
  Object.assign(state, updates);
  saveState();
};

export default state;
