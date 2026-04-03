// === AI Daily — 데일리 모닝 브리핑 ===
import { fetchBatchBriefing } from '../api.js';
import { getApiKey } from '../state.js';
import { showToast } from '../ui/toast.js';

export const renderBriefingPanel = (container, topItems, onComplete) => {
  const { key: apiKey } = getApiKey();
  if (!apiKey) {
    showToast('브리핑을 생성하려면 설정에서 API 키를 등록하세요.', 'error');
    return;
  }

  // 로딩 상태 UI 렌더링
  container.innerHTML = `
    <div class="briefing-panel loading">
      <h3>☀️ 오늘의 AI 브리핑 준비 중...</h3>
      <div class="skeleton sk-title"></div>
      <div class="skeleton sk-line short"></div>
      <div class="skeleton sk-line"></div>
    </div>
  `;

  fetchBatchBriefing(topItems)
    .then(result => {
      // insight: string
      // tags: string[]
      // hotLinks: string[]
      
      const insightHtml = result.insight
        .split('\n')
        .map(line => line.trim() ? `<p>${line}</p>` : '')
        .join('');
      
      const tagsHtml = (result.tags || [])
        .map(tag => `<span class="hashtag">${tag}</span>`)
        .join(' ');

      container.innerHTML = `
        <div class="briefing-panel">
          <h3>☀️ 오늘의 AI 브리핑</h3>
          <div class="briefing-content">
            ${insightHtml}
          </div>
          <div class="hashtags-container" style="margin-top: 10px;">
            ${tagsHtml}
          </div>
        </div>
      `;

      if (onComplete) onComplete(result.hotLinks || []);
    })
    .catch(err => {
      container.innerHTML = `
        <div class="briefing-panel error">
          <h3>⚠️ 브리핑 생성 실패</h3>
          <p>${err.message}</p>
        </div>
      `;
    });
};
