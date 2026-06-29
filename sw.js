const CACHE = 'raiz-v1';

const PRECACHE = [
  './index.html',
  './css/main.css',
  './js/data.js',
  './js/app.js',
  './Typography/Fraunces-VariableFont_SOFT,WONK,opsz,wght.ttf',
  './Typography/Fraunces-Italic-VariableFont_SOFT,WONK,opsz,wght.ttf',
  './Typography/Manrope-VariableFont_wght.ttf',
  './assets/white logo.png',
  './assets/acid logo.png',
  './assets/hero.jpg',
  './assets/background-image.png',
  './assets/compass.png',
];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(c =>
      Promise.allSettled(PRECACHE.map(url => c.add(url)))
    )
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  // Skip videos (demasiado grandes para cachear)
  if (/\.mp4$/.test(url.pathname)) return;
  // Skip cross-origin excepto Google Fonts
  if (url.origin !== self.location.origin && !url.hostname.endsWith('gstatic.com') && !url.hostname.endsWith('googleapis.com') && !url.hostname.endsWith('jsdelivr.net')) return;

  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      }).catch(() => cached);
    })
  );
});
