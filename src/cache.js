// === AI Daily — 캐시 관리 (sessionStorage) ===
import { RSS_CACHE_TTL, MAX_SUMMARY_CACHE } from './config.js';

// --- RSS 캐시 ---

/** RSS 캐시 조회 (TTL 만료 시 staleOk=true면 만료 데이터도 반환) */
export const getRSSCache = (url, staleOk = false) => {
  try {
    const cached = sessionStorage.getItem(`rss_${url}`);
    if (!cached) return null;
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp > RSS_CACHE_TTL) {
      if (staleOk) return data; // 오프라인 폴백용: 만료되었지만 반환
      sessionStorage.removeItem(`rss_${url}`);
      return null;
    }
    return data;
  } catch { return null; }
};

/** RSS 캐시 저장 */
export const setRSSCache = (url, data) => {
  try {
    sessionStorage.setItem(`rss_${url}`, JSON.stringify({ data, timestamp: Date.now() }));
  } catch { /* sessionStorage 용량 초과 무시 */ }
};

// --- 요약 캐시 ---

const SUMMARY_CACHE_KEY = 'ai_daily_summary_cache';

/** 요약 캐시 조회 */
export const getSummaryCache = (url) => {
  try {
    const cache = JSON.parse(localStorage.getItem(SUMMARY_CACHE_KEY) || '{}');
    return cache[url] || null;
  } catch { return null; }
};

/** 요약 캐시 저장 (FIFO 100건 제한) */
export const setSummaryCache = (url, html) => {
  try {
    const cache = JSON.parse(localStorage.getItem(SUMMARY_CACHE_KEY) || '{}');
    const keys = Object.keys(cache);
    if (keys.length >= MAX_SUMMARY_CACHE) {
      delete cache[keys[0]];
    }
    cache[url] = html;
    localStorage.setItem(SUMMARY_CACHE_KEY, JSON.stringify(cache));
  } catch { /* 무시 */ }
};
