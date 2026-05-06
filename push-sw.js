// Push notification handler — Ecosystem shared
self.addEventListener('push', (event) => {
  if (!event.data) return;

  let data;
  try {
    data = event.data.json();
  } catch (e) {
    data = { title: 'Notification', body: event.data.text() };
  }

  const options = {
    body: data.body || '',
    icon: data.icon && data.icon.startsWith('/') ? data.icon : './icons/icon-192x192.png',
    badge: './icons/icon-72x72.png',
    tag: data.tag || 'ecosystem-notification',
    vibrate: [200, 100, 200],
    data: {
      url: data.data?.url || '/',
      ...(data.data || {}),
      dateOfArrival: Date.now(),
    },
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Notification', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const notifUrl = event.notification.data?.url || '/';
  const base = self.registration.scope;
  const targetUrl = notifUrl.startsWith('http') ? notifUrl : base + (notifUrl.startsWith('#') ? notifUrl : '');

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('navigate' in client) {
          return client.navigate(targetUrl).then((c) => c && c.focus ? c.focus() : null);
        }
        if ('focus' in client) return client.focus();
      }
      return self.clients.openWindow(targetUrl);
    })
  );
});
