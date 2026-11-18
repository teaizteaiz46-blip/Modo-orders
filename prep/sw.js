// MODO تجهيز: يخزّن واجهة التطبيق بس (حتى ينفتح بسرعة ويصير قابل للتثبيت).
// الطلبات والصور تنجاب دائماً من الإنترنت، وماكو أي بيانات زبائن تنخزن هنا.
const CACHE = 'modo-prep-v1';
const SHELL = ['./', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png', './favicon-32.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

// الإنترنت أولاً (حتى أي تحديث للصفحة يوصل فوراً)، والنسخة المخزنة إذا ماكو إنترنت
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  const base = new URL('./', self.location).pathname;
  if (!url.pathname.startsWith(base)) return;
  e.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      })
      .catch(() => caches.match(req).then((r) => r || caches.match('./'))),
  );
});
