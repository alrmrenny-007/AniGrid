self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', (e) => {
  if (e.request.mode !== 'navigate') return;
  e.respondWith(
    fetch(e.request).catch(() => new Response(
      '<body style="background:#000;color:#F28500;font-family:sans-serif;display:grid;place-items:center;height:100vh;text-align:center"><div><h1>You are offline</h1><p style="color:#aaa">Reconnect to keep earning AP.</p></div>',
      { headers: { 'Content-Type': 'text/html' } })));
});
self.addEventListener('push', (e) => {
  let d = {};
  try { d = e.data.json(); } catch {}
  e.waitUntil(self.registration.showNotification(d.title || 'Senpai Hub', { body: d.body || '', icon: '/icon-192.png', badge: '/icon-192.png', data: { url: d.url || '/' } }));
});
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  e.waitUntil(clients.openWindow(e.notification.data.url || '/'));
});
