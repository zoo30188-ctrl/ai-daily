// === AI Daily — Service Worker ===
const CACHE_NAME = 'ai-daily-v2.2.0';

// 프리캐시할 App Shell (빌드 후 경로는 Vite가 결정)
const APP_SHELL = [
  '/ai-daily/',
  '/ai-daily/index.html',
  '/ai-daily/icon.svg',
  '/ai-daily/manifest.json',
];

// Install: App Shell 프리캐싱
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Pre-caching app shell');
      return cache.addAll(APP_SHELL);
    })
  );
  self.skipWaiting();
});

// Activate: 이전 캐시 정리
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) => {
      return Promise.all(
        names.filter(name => name !== CACHE_NAME)
             .map(name => {
               console.log('[SW] Deleting old cache:', name);
               return caches.delete(name);
             })
      );
    })
  );
  self.clients.claim();
});

// Fetch: 전략별 분기
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // API 호출은 Network Only (Gemini, rss2json)
  if (url.hostname.includes('googleapis.com') || url.hostname.includes('rss2json.com')) {
    event.respondWith(
      fetch(request).catch(() => {
        return new Response(JSON.stringify({ error: 'Offline' }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        });
      })
    );
    return;
  }

  // 폰트는 Cache First
  if (url.hostname.includes('fontshare.com') || url.hostname.includes('fonts.googleapis.com')) {
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached;
        return fetch(request).then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
          return response;
        });
      })
    );
    return;
  }

  // App Shell: Cache First, Network Fallback
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) {
        // 백그라운드에서 업데이트 (Stale While Revalidate)
        fetch(request).then(response => {
          if (response && response.ok) {
            caches.open(CACHE_NAME).then(cache => cache.put(request, response));
          }
        }).catch(() => {});
        return cached;
      }
      return fetch(request).then(response => {
        if (response && response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
        }
        return response;
      }).catch(() => {
        // 오프라인 폴백: 메인 페이지 반환
        if (request.destination === 'document') {
          return caches.match('/ai-daily/index.html');
        }
        return new Response('Offline', { status: 503 });
      });
    })
  );
});
