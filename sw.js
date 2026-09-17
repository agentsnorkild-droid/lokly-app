const CACHE = 'lokly-portal-v4';
const ASSETS = ['/', '/index.html'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS))); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).pathname.startsWith('/api/')) return;
  e.respondWith(fetch(e.request).then(r => { if (r.ok) { const c = r.clone(); caches.open(CACHE).then(x => x.put(e.request, c)); } return r; }).catch(() => caches.match(e.request)));
});
self.addEventListener('push', e => {
  let d = { title: 'Lokly', body: 'Der er nyt i din portal.', url: '/' };
  try { d = Object.assign(d, e.data.json()); } catch (_) {}
  e.waitUntil(self.registration.showNotification(d.title, { body: d.body, icon: '/static/icon-192.png', badge: '/static/icon-192.png', data: { url: d.url }, tag: 'lokly-' + Date.now() }));
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || '/';
  e.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
    for (const c of list) { if ('focus' in c) { c.navigate(url); return c.focus(); } }
    return clients.openWindow(url);
  }));
});
