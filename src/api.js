// === AI Daily — API (RSS 페칭 + Gemini 요약) ===
import state, { getApiKey } from './state.js';
import { getActiveSources, LANG_MAP } from './config.js';
import { getRSSCache, setRSSCache, getSummaryCache, setSummaryCache } from './cache.js';
import { escapeHTML, friendlyError } from './utils.js';
import { showToast } from './ui/toast.js';
import { toggleSettings } from './ui/settings.js';

const newsGrid = document.getElementById('newsGrid');
const refreshBtn = document.getElementById('refreshBtn');
const lastUpdatedText = document.getElementById('lastUpdatedText');

/**
 * RSS 피드 수집
 * @param {boolean} forceRefresh - true면 캐시 무시
 * @param {Function} onComplete - 완료 후 콜백 (allNewsItems 전달)
 */
export const fetchRSS = async (forceRefresh = false, onComplete) => {
  refreshBtn.style.transform = 'rotate(180deg)';
  refreshBtn.style.transition = 'transform 0.5s';
  newsGrid.setAttribute('aria-busy', 'true');

  // 스켈레톤 UI
  newsGrid.innerHTML = Array.from({ length: 6 }).map(() => `
    <div class="card" aria-hidden="true">
      <div class="skeleton sk-line short" style="margin-bottom: 20px;"></div>
      <div class="skeleton sk-title"></div>
      <div class="skeleton sk-title short"></div>
      <div style="margin-top: auto; padding-top: 10px;">
        <div class="skeleton sk-line" style="width: 80px;"></div>
      </div>
    </div>
  `).join('');

  const allSources = getActiveSources(state.customSources);
  const activeSources = allSources.filter(src => state.sourcesConfig[src.id] !== false);

  try {
    let cacheHits = 0;

    const requests = activeSources.map(async src => {
      const rss2jsonUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(src.url)}&api_key=`;

      // 캐시 확인
      if (!forceRefresh) {
        const cached = getRSSCache(rss2jsonUrl);
        if (cached) {
          cacheHits++;
          return { source: src, data: cached, fromCache: true };
        }
      }

      try {
        const res = await fetch(rss2jsonUrl);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setRSSCache(rss2jsonUrl, data);
        return { source: src, data, fromCache: false };
      } catch (err) {
        // 오프라인 폴백: stale 캐시도 허용
        if (!navigator.onLine) {
          const stale = getRSSCache(rss2jsonUrl, true);
          if (stale) return { source: src, data: stale, fromCache: true };
        }
        return { source: src, error: err };
      }
    });

    const results = await Promise.all(requests);
    let items = [];
    let failedSources = [];

    results.forEach(res => {
      if (res.data && res.data.items) {
        const feedSource = res.source;
        const fetchedItems = res.data.items.map(item => ({
          ...item,
          sourceId: feedSource.id,
          sourceName: feedSource.name,
          category: feedSource.category
        }));
        items = items.concat(fetchedItems);
      } else {
        console.error('Fetch failed for source:', res.source?.name, res.error);
        failedSources.push(res.source?.name || '알 수 없음');
      }
    });

    // 사용자 친화적 에러 메시지
    if (failedSources.length > 0) {
      showToast(`${failedSources.join(', ')} 소스를 불러오지 못했습니다.`, 'error');
    } else if (items.length > 0) {
      const cacheMsg = cacheHits > 0 ? ` (캐시 ${cacheHits}건)` : '';
      showToast(`${items.length}개 기사를 불러왔습니다.${cacheMsg}`);
    }

    // 날짜순 정렬 (최신 먼저)
    items.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

    const now = new Date();
    lastUpdatedText.textContent = `마지막 갱신: ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    if (onComplete) onComplete(items);

  } catch (err) {
    showToast(friendlyError(err), 'error');
    newsGrid.innerHTML = `<div class="status-message error-text">데이터 로드 실패: ${escapeHTML(friendlyError(err))}</div>`;
  } finally {
    newsGrid.setAttribute('aria-busy', 'false');
    setTimeout(() => refreshBtn.style.transform = 'none', 500);
  }
};

/** Gemini API로 기사 요약 처리 */
export const handleSummary = async (item, btnEl, boxEl) => {
  // 캐시 확인
  const cached = getSummaryCache(item.link);
  if (cached) {
    boxEl.innerHTML = cached + `<button class="btn-copy-summary js-copy-btn">📋 요약 복사</button><span class="summary-cached-badge">(캐시됨)</span>`;
    boxEl.classList.add('active');
    boxEl.style.display = 'block';
    btnEl.innerHTML = '✨ 다시 요약하기';
    return boxEl.querySelector('.js-copy-btn');
  }

  const { key: apiKey, source: keySource } = getApiKey();
  if (!apiKey) {
    showToast('우측 상단 ⚙️ 설정에서 Gemini API 키를 먼저 입력해주세요.', 'error');
    toggleSettings(true);
    return null;
  }

  // 로딩 UI
  btnEl.disabled = true;
  btnEl.innerHTML = '⏳ 요약 중...';
  boxEl.classList.remove('active');
  boxEl.innerHTML = `
    <div class="skeleton sk-title"></div>
    <div class="skeleton sk-line short"></div>
    <div class="skeleton sk-line"></div>
  `;
  boxEl.style.display = 'block';

  try {
    const summaryHtml = await fetchGeminiSummary(item.title, item.description || item.content || '');
    boxEl.innerHTML = summaryHtml + `<button class="btn-copy-summary js-copy-btn">📋 요약 복사</button>`;
    boxEl.classList.add('active');
    btnEl.innerHTML = '✨ 다시 요약하기';
    setSummaryCache(item.link, summaryHtml);
    return boxEl.querySelector('.js-copy-btn');
  } catch (err) {
    boxEl.innerHTML = `<span class="error-text">요약 실패: ${escapeHTML(friendlyError(err))}</span>`;
    btnEl.innerHTML = '✨ 요약보기';
    return null;
  } finally {
    btnEl.disabled = false;
  }
};

/** Gemini API 호출 */
const fetchGeminiSummary = async (title, rawContent) => {
  const { key: apiKey } = getApiKey();
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  const safeContent = rawContent.replace(/<[^>]*>?/gm, '').substring(0, 3000);

  const lang = state.summaryLang || 'ko';
  const langInstruction = LANG_MAP[lang]?.instruction || LANG_MAP.ko.instruction;

  const prompt = `
당신은 AI 뉴스 요약 로봇입니다. 다음 기사의 제목과 본문을 읽고 요약하세요.
${langInstruction}
주의사항: '다음은 요약입니다' 같은 서론/인사말을 절대 출력하지 말고 바로 본론만 출력하세요. 
본문이 너무 짧거나 비어있다면, 제목을 바탕으로 기술/IT 관점에서 유추하여 1~2줄이라도 요약하세요.

[출력 형식]
• 핵심 내용 요약 1
• 핵심 내용 요약 2
• 핵심 내용 요약 3
#키워드1 #키워드2 #키워드3

기사 제목: ${title}
기사 본문: ${safeContent}
  `;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.2, maxOutputTokens: 2048 }
    })
  });

  if (!response.ok) {
    const errData = await response.json();
    throw new Error(errData.error?.message || `HTTP ${response.status}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  if (!text) throw new Error('응답 메시지가 비어있습니다.');

  return parseGeminiOutput(text);
};

/** Gemini 응답 텍스트를 HTML로 파싱 */
const parseGeminiOutput = (text) => {
  const lines = text.split('\n').filter(l => l.trim() !== '');
  let bulletsHTML = '';
  let hashtagsHTML = '';

  lines.forEach(line => {
    const trimmed = line.trim();

    if (trimmed.match(/#[^\s#]+/) && !trimmed.match(/^[\u2022\u2023\u25E6\u2043\-*1-9]/)) {
      const tags = trimmed.match(/#[^\s#]+/g);
      if (tags) {
        tags.forEach(tag => { hashtagsHTML += `<span class="hashtag">${tag}</span>`; });
      }
    } else {
      const cleanedLine = trimmed.replace(/^[\u2022\u2023\u25E6\u2043\-*]\s*|^\d+\.\s*/, '').trim();
      const inlineTags = cleanedLine.match(/#[^\s#]+/g);
      if (inlineTags && hashtagsHTML === '') {
        inlineTags.forEach(tag => { hashtagsHTML += `<span class="hashtag">${tag}</span>`; });
      }
      let finalLine = cleanedLine.replace(/#[^\s#]+/g, '').trim();
      if (finalLine) {
        bulletsHTML += `<li>${finalLine}</li>`;
      }
    }
  });

  if (!bulletsHTML && !hashtagsHTML) {
    return `<div style="white-space: pre-wrap; font-size: 0.85rem; padding: 0.5rem 0;">${text}</div>`;
  }

  return `
    <ul class="summary-list">${bulletsHTML}</ul>
    <div class="hashtags-container">${hashtagsHTML}</div>
  `;
};
