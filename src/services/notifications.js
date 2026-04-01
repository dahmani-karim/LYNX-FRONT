/**
 * Push Notification Service
 * Uses the browser Notification API + service worker for background alerts.
 */

const NOTIFICATION_KEY = 'lynx-notif-permission';

/**
 * Request notification permission from the user.
 */
export async function requestPermission() {
  if (!('Notification' in window)) return 'unsupported';
  if (Notification.permission === 'granted') return 'granted';
  if (Notification.permission === 'denied') return 'denied';

  const result = await Notification.requestPermission();
  localStorage.setItem(NOTIFICATION_KEY, result);
  return result;
}

/**
 * Check if notifications are allowed.
 */
export function isPermissionGranted() {
  return 'Notification' in window && Notification.permission === 'granted';
}

/**
 * Send a local push notification.
 */
export function sendNotification(title, options = {}) {
  if (!isPermissionGranted()) return;

  const defaultOptions = {
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    tag: options.tag || 'lynx-alert',
    renotify: true,
    ...options,
  };

  // Try service worker notification first (works in background)
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.showNotification(title, defaultOptions);
    });
  } else {
    // Fallback to basic Notification
    new Notification(title, defaultOptions);
  }
}

const SEV_ORDER = ['info', 'low', 'medium', 'high', 'critical'];

/**
 * Check new events against previous events and send notifications
 * for new critical/high severity alerts.
 * @param {Array} newEvents - latest events
 * @param {Array} previousIds - Set of known event IDs
 * @param {string} minSeverity - minimum severity to notify
 * @returns {Set} updated set of known IDs
 */
export function notifyNewAlerts(newEvents, previousIds, minSeverity = 'high') {
  if (!isPermissionGranted()) return previousIds;

  const minIdx = SEV_ORDER.indexOf(minSeverity);
  const updatedIds = new Set(previousIds);

  for (const event of newEvents) {
    if (updatedIds.has(event.id)) continue;
    updatedIds.add(event.id);

    const sevIdx = SEV_ORDER.indexOf(event.severity);
    if (sevIdx >= minIdx) {
      sendNotification(`🔴 ${event.title}`, {
        body: event.description?.slice(0, 120) || event.sourceName,
        tag: `lynx-${event.id}`,
        data: { url: `/#/alert/${encodeURIComponent(event.id)}` },
      });
    }
  }

  return updatedIds;
}
