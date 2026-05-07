const CACHE = 'steuner-v1';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(clients.claim()));

self.addEventListener('fetch', (e) => {
  const { request } = e;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  // Don't intercept API calls or Next.js internals
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/_next/')) return;

  e.respondWith(
    caches.match(request).then((cached) =>
      cached ||
      fetch(request).then((res) => {
        if (res.ok && url.origin === self.location.origin) {
          const clone = res.clone();
          caches.open(CACHE).then((c) => c.put(request, clone));
        }
        return res;
      })
    )
  );
});

self.addEventListener('push', (e) => {
  const data = e.data?.json() ?? {};
  e.waitUntil(
    self.registration.showNotification(data.title ?? 'Steuner', {
      body: data.body ?? 'Hoe was jouw dag?',
      icon: '/icons/icon.svg',
      badge: '/icons/icon.svg',
      tag: 'daily-checkin',
      renotify: true,
      data: { url: '/log' },
    })
  );
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const url = e.notification.data?.url ?? '/dashboard';
  e.waitUntil(
    clients.matchAll({ type: 'window' }).then((cs) => {
      const match = cs.find((c) => c.url.includes(url) && 'focus' in c);
      return match ? match.focus() : clients.openWindow(url);
    })
  );
});
