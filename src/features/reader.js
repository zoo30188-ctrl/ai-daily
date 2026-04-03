// === AI Daily — 인앱 리더 모드 ===
import { escapeHTML } from '../utils.js';

let readerOverlay = null;

const createReaderOverlay = () => {
  if (readerOverlay) return;
  readerOverlay = document.createElement('div');
  readerOverlay.className = 'reader-overlay';
  readerOverlay.id = 'readerOverlay';
  readerOverlay.setAttribute('role', 'dialog');
  readerOverlay.innerHTML = `
    <div class="reader-modal">
      <div class="reader-header">
        <div style="display:flex; align-items:center; gap:10px;">
          <h2 id="readerTitle" class="reader-title">읽기 모드</h2>
          <a id="readerOriginalLink" href="#" target="_blank" rel="noopener noreferrer" class="btn-icon-small" title="원본 보기" style="text-decoration:none;">🌐</a>
        </div>
        <button class="icon-btn" id="closeReaderBtn" aria-label="닫기">✕</button>
      </div>
      <div class="reader-content" id="readerContent">
        <div class="loading-spinner">본문을 파싱하는 중...</div>
      </div>
    </div>
  `;
  document.body.appendChild(readerOverlay);

  readerOverlay.querySelector('#closeReaderBtn').addEventListener('click', closeReader);
  // ESC 닫기를 위해 main.js에 추가해야 하지만 여기서도 처리 가능 (간단히)
};

export const openInAppReader = async (url, title) => {
  createReaderOverlay();
  readerOverlay.classList.add('open');
  
  const contentEl = readerOverlay.querySelector('#readerContent');
  const titleEl = readerOverlay.querySelector('#readerTitle');
  const linkEl = readerOverlay.querySelector('#readerOriginalLink');
  
  titleEl.textContent = title;
  linkEl.href = url;
  contentEl.innerHTML = `
    <div class="skeleton sk-title"></div>
    <div class="skeleton sk-line"></div>
    <div class="skeleton sk-line"></div>
    <div class="skeleton sk-line short"></div>
    <div style="font-size:0.8rem; color:var(--text-muted); margin-top:1rem;">외부 사이트에서 본문을 가져오는 중입니다...</div>
  `;

  try {
    // allorigins CORS proxy
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
    const res = await fetch(proxyUrl);
    if (!res.ok) throw new Error('페이지를 가져올 수 없습니다.');
    const htmlText = await res.text();

    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlText, 'text/html');

    // 매우 간단한 Readability 파싱 (실제 Readability.js 대신 경량화된 DOM 추출)
    // 1. 불필요한 태그 제거
    const trashSelectors = ['script', 'style', 'nav', 'header', 'footer', 'aside', 'iframe', 'noscript', 'button', 'form'];
    trashSelectors.forEach(sel => {
      doc.querySelectorAll(sel).forEach(el => el.remove());
    });

    // 2. 가장 문단(<p>)이 많은 부모 컨테이너 찾기
    const paragraphs = Array.from(doc.querySelectorAll('p')).filter(p => p.textContent.trim().length > 20);
    let bestNode = doc.body;

    if (paragraphs.length > 0) {
      // 투표 방식으로 부모 컨테이너 선정
      const parentScores = new Map();
      paragraphs.forEach(p => {
        let parent = p.parentElement;
        for (let i=0; i<3; i++) { // 위로 3단계까지
          if (parent) {
            parentScores.set(parent, (parentScores.get(parent) || 0) + p.textContent.length);
            parent = parent.parentElement;
          }
        }
      });
      let maxScore = 0;
      for (const [node, score] of parentScores.entries()) {
        if (score > maxScore && node.tagName !== 'BODY' && node.tagName !== 'HTML') {
          maxScore = score;
          bestNode = node;
        }
      }
    }

    // 약간의 텍스트 정제
    let articleHtml = bestNode.innerHTML || '본문을 추출할 수 없습니다. 원본 링크를 확인하세요.';
    
    // a태그 클릭 방지 또는 target _blank로
    contentEl.innerHTML = `<div class="reader-article">${articleHtml}</div>`;
    contentEl.querySelectorAll('a').forEach(a => {
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
    });

  } catch (err) {
    contentEl.innerHTML = `
      <div class="status-message error-text">
        본문 파싱에 실패했습니다.<br>보안 규칙에 의해 막혀있거나 스크래핑을 차단한 사이트일 수 있습니다.<br>
        <a href="${escapeHTML(url)}" target="_blank" style="color:#5c7ce2; margin-top:10px; display:inline-block;">원본 사이트에서 보기 ➔</a>
      </div>
    `;
  }
};

export const closeReader = () => {
  if (readerOverlay) {
    readerOverlay.classList.remove('open');
    readerOverlay.querySelector('#readerContent').innerHTML = '';
  }
};
