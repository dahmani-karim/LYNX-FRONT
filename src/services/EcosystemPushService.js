/**
 * Service Push Notifications unifié pour l'écosystème SmartCellar
 * Utilisable par : SmartCellar, ProGarden, Farmly, Lynx, PRÊT·E
 *
 * Usage :
 *   import { EcosystemPush } from './EcosystemPushService';
 *   const push = new EcosystemPush('smartcellar', API_BASE_URL, getToken);
 *   await push.subscribe();
 */

export class EcosystemPush {
  constructor(appName, apiBaseUrl, getTokenFn) {
    this.app = appName;
    this.apiBase = apiBaseUrl.replace(/\/+$/, '');
    this.getToken = getTokenFn;
    this._vapidKey = null;
  }

  // ─── Support check ────────────────────────────────────────

  static isSupported() {
    return 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
  }

  static getPermission() {
    if (!EcosystemPush.isSupported()) return 'not-supported';
    return Notification.permission;
  }

  static async requestPermission() {
    if (!EcosystemPush.isSupported()) throw new Error('Notifications non supportées');
    if (Notification.permission === 'denied') {
      throw new Error('Notifications bloquées. Activez-les dans les paramètres du navigateur.');
    }
    return Notification.requestPermission();
  }

  // ─── VAPID key ────────────────────────────────────────────

  async getVapidPublicKey() {
    if (this._vapidKey) return this._vapidKey;
    const res = await fetch(`${this.apiBase}/api/push-subscription/vapid-public-key`);
    if (!res.ok) throw new Error('Impossible de récupérer la clé VAPID');
    const data = await res.json();
    this._vapidKey = data.publicKey;
    return this._vapidKey;
  }

  // ─── Subscribe ────────────────────────────────────────────

  async subscribe() {
    const permission = await EcosystemPush.requestPermission();
    if (permission !== 'granted') throw new Error('Permission refusée');

    const registration = await navigator.serviceWorker.ready;
    const publicKey = await this.getVapidPublicKey();
    const applicationServerKey = this._urlBase64ToUint8Array(publicKey);

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey,
    });

    const subData = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')))),
        auth: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')))),
      },
      app: this.app,
    };

    const token = this.getToken();
    const res = await fetch(`${this.apiBase}/api/push-subscription/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(subData),
    });

    if (!res.ok) throw new Error(`Erreur subscribe: ${res.status}`);
    return subscription;
  }

  // ─── Unsubscribe ──────────────────────────────────────────

  async unsubscribe() {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      await subscription.unsubscribe();

      const token = this.getToken();
      await fetch(`${this.apiBase}/api/push-subscription/unsubscribe`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ endpoint: subscription.endpoint, app: this.app }),
      });
    }
    return true;
  }

  // ─── Check subscription status ────────────────────────────

  async isSubscribed() {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      return !!subscription;
    } catch {
      return false;
    }
  }

  // ─── Send test notification ───────────────────────────────

  async sendTest(title, body) {
    const token = this.getToken();
    const res = await fetch(`${this.apiBase}/api/push-subscription/send-notification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        title: title || 'Test notification',
        body: body || `Notification de test — ${this.app}`,
        app: this.app,
      }),
    });
    if (!res.ok) throw new Error(`Erreur test: ${res.status}`);
    return res.json();
  }

  // ─── History ──────────────────────────────────────────────

  async getHistory(page = 1, pageSize = 25) {
    const token = this.getToken();
    const params = new URLSearchParams({ app: this.app, page, pageSize });
    const res = await fetch(`${this.apiBase}/api/push-subscription/history?${params}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!res.ok) throw new Error(`Erreur history: ${res.status}`);
    return res.json();
  }

  async markRead(ids) {
    const token = this.getToken();
    const res = await fetch(`${this.apiBase}/api/push-subscription/mark-read`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(ids ? { ids } : { all: true, app: this.app }),
    });
    if (!res.ok) throw new Error(`Erreur markRead: ${res.status}`);
    return res.json();
  }

  async getUnreadCount() {
    const data = await this.getHistory(1, 1);
    return data.unread || 0;
  }

  // ─── Preferences (via user-profile) ──────────────────────

  async getPreferences() {
    const token = this.getToken();
    const res = await fetch(`${this.apiBase}/api/user-profiles/me`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!res.ok) return null;
    const profile = await res.json();
    return profile.notificationPreferences || null;
  }

  async updatePreferences(preferences) {
    const token = this.getToken();
    const res = await fetch(`${this.apiBase}/api/user-profiles/me`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ notificationPreferences: preferences }),
    });
    if (!res.ok) throw new Error(`Erreur update preferences: ${res.status}`);
    return res.json();
  }

  // ─── Private ──────────────────────────────────────────────

  _urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
}

export default EcosystemPush;
