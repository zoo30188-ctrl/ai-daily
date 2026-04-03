// === AI Daily — 설정 및 상수 ===

export const APP_VERSION = 'v2.3.0';

export const CHANGELOG = [
  {
    version: 'v2.3.0',
    date: '2026-04-03',
    changes: [
      { type: 'feat', text: '데일리 모닝 브리핑 엔진 탑재 (단 1회의 API 호출 절약형 큐레이션)' },
      { type: 'feat', text: '인앱 리더 모드(In-app Reader) 추가 (앱 스크롤 단절 및 이탈 방지)' },
      { type: 'feat', text: 'API 미설정자를 위한 우아한 Fallback (RSS 미리보기) 노출 구현' },
      { type: 'feat', text: '자동 생성된 핫클립 기사에 🔥 HOT 뱃지 및 해시태그 지원' }
    ]
  },
  {
    version: 'v2.2.0',
    date: '2026-04-03',
    changes: [
      { type: 'feat', text: '백그라운드 자동 새로고침(15/30/60분) 설정 추가 (UX 고도화)' },
      { type: 'feat', text: '북마크 데이터 영구 저장화 — 피드 만료 후에도 접근 가능' },
      { type: 'perf', text: 'AI 요약 결과 localStorage 캐싱 — 브라우저 재시작 시에도 유지' },
      { type: 'feat', text: '기사 목록에 예상 읽기 시간(⏱️ N분 읽기) 표시 추가' },
      { type: 'feat', text: '요약 박스 강제 재요약(🔄) 버튼 추가 — 캐시된 잘못된 요약 수정' },
      { type: 'feat', text: '설정 패널에 모든 데이터 비우기(초기화) 버튼 추가' }
    ]
  },
  {
    version: 'v2.1.0',
    date: '2026-04-03',
    changes: [
      { type: 'security', text: 'API 키 .env.local 환경변수 지원 — localStorage 폴백 병행' },
      { type: 'feat', text: 'Focus Trap — 설정 패널·체인지로그 모달에서 Tab 키 순환' },
      { type: 'feat', text: 'API 키 마스킹 토글 (👁️) — 키 확인/숨기기 전환' },
      { type: 'feat', text: '설정 패널 하단 앱 정보 표시' },
      { type: 'fix', text: '색상 대비 개선 — --text-muted WCAG AA 4.5:1 준수' },
    ]
  },
  {
    version: 'v2.0.0',
    date: '2026-04-03',
    changes: [
      { type: 'arch', text: 'Vite 빌드 시스템 도입 — 모듈 분리 및 개발 경험 개선' },
      { type: 'arch', text: 'CSS/JS 16개 파일로 분리 — 유지보수성 대폭 향상' },
      { type: 'feat', text: 'Service Worker 구현 — 진정한 PWA (오프라인, 앱 설치)' },
      { type: 'fix', text: 'CSS .card-actions 중복 정의 버그 수정' },
      { type: 'fix', text: '오프라인 캐시 경합 조건 수정' },
      { type: 'fix', text: '설정 내보내기에서 API 키 제외 (보안)' },
    ]
  },
  {
    version: 'v1.4.0',
    date: '2026-04-03',
    changes: [
      { type: 'feat', text: '⭐ 북마크/즐겨찾기 기능 — 기사별 즐겨찾기 저장 및 필터' },
      { type: 'feat', text: '멀티 언어 요약 — 한국어/영어/일본어/중국어 전환' },
      { type: 'feat', text: '기사 공유 버튼 (Web Share API / 클립보드 폴백)' },
      { type: 'feat', text: '요약 결과 클립보드 복사 버튼' },
    ]
  },
  {
    version: 'v1.3.0',
    date: '2026-04-03',
    changes: [
      { type: 'feat', text: '사용자 정의 RSS 소스 추가/삭제 기능' },
      { type: 'feat', text: 'AI 요약 결과 캐싱 — 같은 기사 재요약 시 API 비용 절약' },
      { type: 'feat', text: '다크/라이트 테마 전환 (🌙/☀️ 버튼)' },
      { type: 'feat', text: '설정 내보내기/가져오기 (JSON 백업/복원)' },
    ]
  },
  {
    version: 'v1.2.0',
    date: '2026-04-03',
    changes: [
      { type: 'feat', text: 'RSS 응답 캐싱 (5분 TTL) — Rate Limit 방지 및 로딩 속도 개선' },
      { type: 'feat', text: '페이지네이션: 20개씩 "더 보기" 버튼으로 점진적 로드' },
      { type: 'feat', text: 'ARIA 역할 및 키보드 네비게이션 추가 (Tab/Enter/방향키)' },
      { type: 'feat', text: '오프라인 감지 배너 + 캐시 기사 자동 표시' },
      { type: 'feat', text: '필터 탭별 기사 카운트 배지 표시' },
      { type: 'feat', text: '맨 위로 스크롤 버튼 추가' },
      { type: 'fix', text: 'API 에러 메시지 사용자 친화적 변환 (403/429/500 매핑)' },
      { type: 'perf', text: 'RSS 캐시 히트 시 네트워크 요청 생략으로 속도 대폭 향상' },
    ]
  },
  {
    version: 'v1.1.0',
    date: '2026-04-03',
    changes: [
      { type: 'security', text: 'XSS 방지: 모든 외부 입력에 HTML 이스케이프 적용' },
      { type: 'security', text: 'API 키 보안 경고 문구를 사실에 맞게 수정' },
      { type: 'fix', text: 'YouTube 플레이스홀더 소스를 기본 비활성화로 변경' },
      { type: 'fix', text: '읽은 기사 목록(readItems) 500개 제한 — localStorage 폭발 방지' },
      { type: 'fix', text: 'user-scalable=no 제거 — 접근성 개선' },
      { type: 'perf', text: '검색 입력 디바운싱(300ms) 적용' },
      { type: 'feat', text: '버전 배지 및 패치노트 팝업 추가' },
    ]
  },
  {
    version: 'v1.0.0',
    date: '2026-03-29',
    changes: [
      { type: 'feat', text: 'AI Daily Dashboard 최초 릴리스' },
      { type: 'feat', text: 'RSS 피드 수집 및 카드형 뉴스 그리드' },
      { type: 'feat', text: 'Gemini API 기반 기사 요약 기능' },
      { type: 'feat', text: '카테고리 필터 및 실시간 검색' },
      { type: 'feat', text: 'PWA 매니페스트 및 모바일 최적화' },
    ]
  }
];

export const CATEGORY = {
  BLOG: 'blog',
  NEWSLETTER: 'newsletter',
  YOUTUBE: 'youtube'
};

export const DEFAULT_SOURCES = [
  // 블로그/미디어
  { id: 'openai', name: 'OpenAI', url: 'https://openai.com/blog/rss.xml', category: CATEGORY.BLOG },
  { id: 'anthropic', name: 'Anthropic', url: 'https://www.anthropic.com/news/rss', category: CATEGORY.BLOG },
  { id: 'deepmind', name: 'Google DeepMind', url: 'https://deepmind.google/blog/rss/', category: CATEGORY.BLOG },
  { id: 'huggingface', name: 'Hugging Face', url: 'https://huggingface.co/blog/feed.xml', category: CATEGORY.BLOG },
  { id: 'verge', name: 'The Verge AI', url: 'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml', category: CATEGORY.BLOG },
  { id: 'geeknews', name: 'GeekNews', url: 'https://news.hada.io/rss', category: CATEGORY.BLOG },
  // 뉴스레터
  { id: 'lenny', name: "Lenny's Newsletter", url: 'https://www.lennysnewsletter.com/feed', category: CATEGORY.NEWSLETTER },
  { id: 'chamath', name: 'Chamath', url: 'https://chamath.substack.com/feed', category: CATEGORY.NEWSLETTER },
  { id: 'sandhill', name: 'sandhill.io', url: 'https://www.sandhill.io/feed', category: CATEGORY.NEWSLETTER },
  // YouTube (기본 비활성화)
  { id: 'yt_openai', name: 'YouTube (OpenAI)', url: 'https://www.youtube.com/feeds/videos.xml?channel_id={OPENAI_CHANNEL_ID}', category: CATEGORY.YOUTUBE, defaultEnabled: false },
  { id: 'yt_anthropic', name: 'YouTube (Anthropic)', url: 'https://www.youtube.com/feeds/videos.xml?channel_id={ANTHROPIC_CHANNEL_ID}', category: CATEGORY.YOUTUBE, defaultEnabled: false },
  { id: 'yt_species', name: 'YouTube (Species)', url: 'https://www.youtube.com/feeds/videos.xml?channel_id={SPECIES_CHANNEL_ID}', category: CATEGORY.YOUTUBE, defaultEnabled: false },
  { id: 'yt_josh', name: 'YouTube (빌더조쉬)', url: 'https://www.youtube.com/feeds/videos.xml?channel_id={BUILDERJOSH_CHANNEL_ID}', category: CATEGORY.YOUTUBE, defaultEnabled: false },
];

/** 기본 소스 + 사용자 커스텀 소스 병합 */
export const getActiveSources = (customSources = []) => {
  return [...DEFAULT_SOURCES, ...customSources];
};

/** 다국어 요약 프롬프트 매핑 */
export const LANG_MAP = {
  ko: { name: '한국어', instruction: '한국어로 요약하세요.' },
  en: { name: 'English', instruction: 'Summarize in English.' },
  ja: { name: '日本語', instruction: '日本語で要約してください。' },
  zh: { name: '中文', instruction: '请用中文总结。' },
};

export const PAGE_SIZE = 20;
export const RSS_CACHE_TTL = 5 * 60 * 1000; // 5분
export const MAX_READ_ITEMS = 500;
export const MAX_SUMMARY_CACHE = 100;
