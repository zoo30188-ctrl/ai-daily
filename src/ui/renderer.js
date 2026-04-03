// === AI Daily — 그리드 렌더링 & 페이지네이션 ===
import state, { saveState } from '../state.js';
import { CATEGORY, PAGE_SIZE, MAX_READ_ITEMS } from '../config.js';
import { escapeHTML, timeAgo, calculateReadingTime } from '../utils.js';
import { isBookmarked, toggleBookmark } from '../features/bookmarks.js';
import { shareArticle, copySummaryText } from '../features/share.js';
import { handleSummary } from '../api.js';

const newsGrid = document.getElementById('newsGrid');

// 세션 상태
let allNewsItems = [];
let currentFilter = 'all';
let currentSearch = '';
let displayedCount = 0;

// 읽은 기사 추적 (Set 기반)
let readItemsSet = new Set(state.readItems);

/** 뉴스 아이템 업데이트 (fetchRSS 콜백용) */
export const setNewsItems = (items) => {
  allNewsItems = items;
  displayedCount = 0;
  updateFilterCounts();
  renderGrid();
};

/** 현재 필터/검색 기준으로 아이템 필터링 */
const getFilteredItems = () => {
  let filtered = allNewsItems;
  if (currentFilter === 'bookmarks') {
    filtered = state.bookmarks; // R7: 북마크 탭은 로컬 저장된 전체 북마크 객체 배열을 사용
  } else if (currentFilter !== 'all') {
    filtered = filtered.filter(item => item.category === currentFilter);
  }
  if (currentSearch) {
    const query = currentSearch.toLowerCase();
    filtered = filtered.filter(item =>
      item.title.toLowerCase().includes(query) ||
      item.sourceName.toLowerCase().includes(query)
    );
  }
  return filtered;
};

/** 그리드 렌더링 */
const renderGrid = () => {
  const filtered = getFilteredItems();

  if (filtered.length === 0) {
    newsGrid.innerHTML = `<div class="status-message">조건에 맞는 기사가 없습니다.</div>`;
    return;
  }

  displayedCount = Math.min(PAGE_SIZE, filtered.length);
  newsGrid.innerHTML = '';

  renderItems(filtered, 0, displayedCount);
  renderLoadMoreUI(filtered);
};

/** 카드 아이템 렌더링 */
const renderItems = (filtered, from, to) => {
  for (let i = from; i < to; i++) {
    const item = filtered[i];
    const card = document.createElement('div');
    const isRead = readItemsSet.has(item.link);
    card.className = `card ${isRead ? 'read' : ''}`;
    card.setAttribute('role', 'article');
    card.setAttribute('aria-label', item.title);

    const safeTitle = escapeHTML(item.title);
    const safeSourceName = escapeHTML(item.sourceName);
    const safeLink = escapeHTML(item.link);
    const bookmarked = isBookmarked(item.link);

    card.innerHTML = `
      <div class="card-header">
        <span class="source-badge">${safeSourceName}</span>
        <span class="pub-date">${timeAgo(item.pubDate)} · ⏱️ ${calculateReadingTime(item.content || item.description)}분 읽기</span>
      </div>
      <a href="${safeLink}" target="_blank" rel="noopener noreferrer" class="card-title js-link">${safeTitle}</a>
      <div class="card-actions">
        <button class="btn-summary js-summary-btn" aria-label="${safeTitle} 요약보기">✨ 요약보기</button>
        <div class="card-actions-right">
          <button class="btn-share js-share-btn" aria-label="공유">🔗 공유</button>
          <button class="btn-bookmark js-bookmark-btn" aria-label="즐겨찾기" title="즐겨찾기">${bookmarked ? '⭐' : '☆'}</button>
        </div>
      </div>
      <div class="summary-box js-summary-box" role="region" aria-label="요약 결과"></div>
    `;

    // 링크 클릭 → 읽음 처리
    card.querySelector('.js-link').addEventListener('click', () => markAsRead(item.link, card));

    // 요약 버튼
    const sumBtn = card.querySelector('.js-summary-btn');
    const sumBox = card.querySelector('.js-summary-box');
    
    // 강제 요약 이벤트를 위한 래퍼 함수
    const doSummary = async (forceOptions = {}) => {
      markAsRead(item.link, card);
      const res = await handleSummary(item, sumBtn, sumBox, forceOptions);
      if (res?.copyBtn) {
        res.copyBtn.addEventListener('click', () => copySummaryText(sumBox));
      }
      if (res?.forceBtn) {
        res.forceBtn.addEventListener('click', () => doSummary({ force: true }));
      }
    };
    
    sumBtn.addEventListener('click', () => doSummary({ force: false }));

    // 북마크 토글
    const bmBtn = card.querySelector('.js-bookmark-btn');
    bmBtn.addEventListener('click', () => {
      toggleBookmark(item); // R7: 객체 자체 전달
      bmBtn.textContent = isBookmarked(item.link) ? '⭐' : '☆';
      bmBtn.classList.toggle('active');
      updateFilterCounts();
      if (currentFilter === 'bookmarks') {
        displayedCount = 0;
        renderGrid();
      }
    });

    // 공유
    card.querySelector('.js-share-btn').addEventListener('click', () => shareArticle(item.title, item.link));

    newsGrid.appendChild(card);
  }
};

/** 더 보기 UI */
const renderLoadMoreUI = (filtered) => {
  const countInfo = document.createElement('div');
  countInfo.className = 'items-count-info';
  countInfo.textContent = `${displayedCount} / ${filtered.length}개 기사`;
  newsGrid.appendChild(countInfo);

  if (displayedCount < filtered.length) {
    const loadMoreContainer = document.createElement('div');
    loadMoreContainer.className = 'load-more-container';
    const remaining = filtered.length - displayedCount;
    loadMoreContainer.innerHTML = `
      <button class="btn-load-more" aria-label="기사 더 보기">
        📄 더 보기 (${Math.min(PAGE_SIZE, remaining)}개)
      </button>
    `;
    loadMoreContainer.querySelector('.btn-load-more').addEventListener('click', loadMore);
    newsGrid.appendChild(loadMoreContainer);
  }
};

/** 더 보기 로드 */
const loadMore = () => {
  const filtered = getFilteredItems();
  const prevCount = displayedCount;
  displayedCount = Math.min(displayedCount + PAGE_SIZE, filtered.length);

  const existingLoadMore = newsGrid.querySelector('.load-more-container');
  const existingCount = newsGrid.querySelector('.items-count-info');
  if (existingLoadMore) existingLoadMore.remove();
  if (existingCount) existingCount.remove();

  renderItems(filtered, prevCount, displayedCount);
  renderLoadMoreUI(filtered);
};

/** 필터 탭 카운트 업데이트 */
const updateFilterCounts = () => {
  const filterTabs = document.querySelectorAll('.tab-btn');
  const counts = {
    all: allNewsItems.length,
    bookmarks: state.bookmarks.length // R7: 전체 북마크 길이
  };
  Object.values(CATEGORY).forEach(cat => {
    counts[cat] = allNewsItems.filter(item => item.category === cat).length;
  });

  filterTabs.forEach(tab => {
    const filter = tab.dataset.filter;
    const count = counts[filter] || 0;
    const existing = tab.querySelector('.tab-count');
    if (existing) existing.remove();
    if (count > 0 || filter === 'all') {
      const badge = document.createElement('span');
      badge.className = 'tab-count';
      badge.textContent = count;
      tab.appendChild(badge);
    }
  });
};

/** 기사 읽음 처리 */
const markAsRead = (link, cardEl) => {
  if (!readItemsSet.has(link)) {
    readItemsSet.add(link);
    if (readItemsSet.size > MAX_READ_ITEMS) {
      const first = readItemsSet.values().next().value;
      readItemsSet.delete(first);
    }
    state.readItems = [...readItemsSet];
    saveState();
    cardEl.classList.add('read');
  }
};

/** 필터/검색 이벤트 바인딩 */
export const initFilters = () => {
  const filterTabs = document.querySelectorAll('.tab-btn');
  const searchInput = document.getElementById('searchInput');
  const filterTabsContainer = document.getElementById('filterTabs');

  // 필터 탭 클릭
  filterTabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      filterTabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      e.currentTarget.classList.add('active');
      e.currentTarget.setAttribute('aria-selected', 'true');
      currentFilter = e.currentTarget.dataset.filter;
      displayedCount = 0;
      renderGrid();
    });
  });

  // 키보드 네비게이션 (좌우 방향키)
  filterTabsContainer.addEventListener('keydown', (e) => {
    const tabs = [...filterTabsContainer.querySelectorAll('.tab-btn')];
    const currentIndex = tabs.indexOf(document.activeElement);
    if (currentIndex === -1) return;

    let nextIndex;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      nextIndex = (currentIndex + 1) % tabs.length;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      tabs[currentIndex].click();
      return;
    } else {
      return;
    }
    tabs[nextIndex].focus();
  });

  // 검색 (디바운싱 300ms)
  let searchTimeout;
  searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      currentSearch = e.target.value;
      displayedCount = 0;
      renderGrid();
    }, 300);
  });
};
