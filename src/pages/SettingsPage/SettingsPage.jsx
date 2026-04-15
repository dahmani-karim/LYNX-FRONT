import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useSettingsStore } from '../../stores/settingsStore';
import { useAuthStore } from '../../stores/authStore';
import InstallPrompt from '../../components/InstallPrompt/InstallPrompt';
import AppSwitcher from '../../components/AppSwitcher/AppSwitcher';
import { EcosystemPush } from '../../services/EcosystemPushService';
import { requestPermission } from '../../services/notifications';
import { playSuccessSound, playErrorSound, playFlashSound, playPrioritySound, playRoutineSound } from '../../services/sounds';
import { fetchZones as apiFetchZones, createZone as apiCreateZone, deleteZone as apiDeleteZone } from '../../services/strapi';
import {
  MapPin, Bell, Eye, Trash2, Plus, ChevronRight, Info, Globe, Loader,
  User, Crown, LogOut, Crosshair, Volume2, VolumeX, Play, Sun, Moon, Monitor, Activity, Handshake, Megaphone
} from 'lucide-react';
import './SettingsPage.scss';

const SEVERITY_OPTIONS = [
  { value: 'info', label: 'Tout' },
  { value: 'low', label: 'Faible+' },
  { value: 'medium', label: 'Modéré+' },
  { value: 'high', label: 'Élevé+' },
  { value: 'critical', label: 'Critique uniquement' },
];

export default function SettingsPage() {
  const {
    userLocation, setUserLocation,
    zones, addZone, removeZone,
    notifications, setNotifications,
    soundEnabled, setSoundEnabled,
    theme, setTheme,
    earthquakeMinMagnitude, setEarthquakeMinMagnitude,
  } = useSettingsStore();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isPremium = useAuthStore((s) => s.isPremium);
  const premiumPlan = useAuthStore((s) => s.premiumPlan);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const MAX_FREE_ZONES = 1;

  const [showSwitcher, setShowSwitcher] = useState(false);
  const [showAddZone, setShowAddZone] = useState(false);
  const [newZone, setNewZone] = useState({ label: '', lat: '', lng: '', radiusKm: 50 });
  const [locationInput, setLocationInput] = useState(userLocation.label);
  const [syncing, setSyncing] = useState(false);
  const [zoneGpsLoading, setZoneGpsLoading] = useState(false);

  // ─── Push Notifications (Ecosystem) ───────────────────────
  const [pushSubscribed, setPushSubscribed] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);
  const [notifHistory, setNotifHistory] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // ─── Admin Push ───
  const ADMIN_ICONS = ['🔔', '⭐', '🎉', '📢', '💡', '⚡', '🎯', '🔥', '✨', '📱'];
  const ADMIN_APPS = [
    { value: '', label: 'Toutes les apps' },
    { value: 'smartcellar', label: 'SmartCellar' },
    { value: 'progarden', label: 'ProGarden' },
    { value: 'farmly', label: 'Farmly' },
    { value: 'lynx', label: 'LYNX' },
    { value: 'prete', label: 'PRÊT·E' },
    { value: 'partner', label: 'Partner' },
  ];
  const adminApiBase = import.meta.env.VITE_STRAPI_URL || 'https://smart-cellar-api.onrender.com';
  const getAdminToken = () => { try { return JSON.parse(localStorage.getItem('lynx-auth'))?.state?.jwt || null; } catch { return null; } };
  const [adminPushForm, setAdminPushForm] = useState({ title: '', body: '', icon: '🔔', app: '', targetAudience: 'all' });
  const [adminPushSending, setAdminPushSending] = useState(false);
  const [adminSearchQuery, setAdminSearchQuery] = useState('');
  const [adminSearchResults, setAdminSearchResults] = useState([]);
  const [adminSelectedUsers, setAdminSelectedUsers] = useState([]);
  const [adminSearching, setAdminSearching] = useState(false);
  const [adminPushHistory, setAdminPushHistory] = useState([]);

  const pushService = useState(() => {
    const apiBase = import.meta.env.VITE_STRAPI_URL || 'https://smart-cellar-api.onrender.com';
    return new EcosystemPush('lynx', apiBase, () => {
      try {
        const raw = localStorage.getItem('lynx-auth');
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        return parsed?.state?.jwt || null;
      } catch { return null; }
    });
  })[0];

  useEffect(() => {
    if (EcosystemPush.isSupported() && isAuthenticated) {
      pushService.isSubscribed().then(setPushSubscribed);
      pushService.getHistory(1, 20).then((data) => {
        setNotifHistory(data.notifications || []);
        setUnreadCount(data.unread || 0);
      }).catch(() => {});
    }
  }, [isAuthenticated, pushService]);

  // Sync zones from Strapi when authenticated
  const syncZonesFromStrapi = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await apiFetchZones();
      const remote = (res.data || []).map((z) => ({
        id: String(z.id),
        strapiId: z.id,
        label: z.attributes?.label || z.label,
        lat: z.attributes?.lat || z.lat,
        lng: z.attributes?.lng || z.lng,
        radiusKm: z.attributes?.radiusKm || z.radiusKm || 50,
      }));
      // Merge: keep local zones not in Strapi, add Strapi zones
      const localOnly = zones.filter((lz) => !lz.strapiId);
      const merged = [...remote, ...localOnly];
      useSettingsStore.setState({ zones: merged });
    } catch {
      // Strapi unavailable — keep local zones
    }
  }, [isAuthenticated, zones]);

  useEffect(() => {
    syncZonesFromStrapi();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const handleAddZone = async () => {
    if (!newZone.label || !newZone.lat || !newZone.lng) return;
    const zoneData = {
      label: newZone.label,
      lat: parseFloat(newZone.lat),
      lng: parseFloat(newZone.lng),
      radiusKm: parseInt(newZone.radiusKm) || 50,
    };

    // Save to Strapi if authenticated
    if (isAuthenticated) {
      setSyncing(true);
      try {
        const res = await apiCreateZone({ data: zoneData });
        const created = res.data;
        addZone({
          ...zoneData,
          strapiId: created.id,
        });
      } catch {
        // Fallback: save locally only
        addZone(zoneData);
      }
      setSyncing(false);
    } else {
      addZone(zoneData);
    }

    setNewZone({ label: '', lat: '', lng: '', radiusKm: 50 });
    setShowAddZone(false);
  };

  const handleZoneGps = () => {
    if (!navigator.geolocation) return;
    setZoneGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setNewZone((z) => ({
          ...z,
          lat: pos.coords.latitude.toFixed(4),
          lng: pos.coords.longitude.toFixed(4),
          label: z.label || 'Ma position',
        }));
        setZoneGpsLoading(false);
      },
      () => setZoneGpsLoading(false)
    );
  };

  const handleRemoveZone = async (zone) => {
    if (isAuthenticated && zone.strapiId) {
      try {
        await apiDeleteZone(zone.strapiId);
      } catch {
        // Continue with local removal even if Strapi fails
      }
    }
    removeZone(zone.id);
  };

  const handleUseGeolocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          label: 'Ma position GPS',
        });
        setLocationInput('Ma position GPS');
      },
      () => {}
    );
  };

  return (
    <div className="settings-page">
      <h1 className="settings-page__title">Réglages</h1>

      <InstallPrompt />

      {/* User Profile */}
      {isAuthenticated && user && (
        <section className="settings-page__section">
          <div className="settings-page__profile">
            <div className="settings-page__profile-avatar">
              {user.username?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="settings-page__profile-info">
              <p className="settings-page__profile-name">{user.username}</p>
              <p className="settings-page__profile-email">{user.email}</p>
              {isPremium && (
                <span className={`settings-page__profile-badge${premiumPlan === 'Partner' ? ' settings-page__profile-badge--partner' : ''}`}>
                  {premiumPlan === 'Partner' ? <Handshake size={12} /> : <Crown size={12} />}
                  {premiumPlan || 'Premium'}
                </span>
              )}
            </div>
          </div>
          <div className="settings-page__profile-actions">
            <Link to="/account" className="settings-page__profile-link">
              <User size={16} />
              Mon compte
              <ChevronRight size={14} />
            </Link>
            <button onClick={() => { logout(); }} className="settings-page__profile-logout">
              <LogOut size={16} />
              Se déconnecter
            </button>
          </div>
        </section>
      )}

      {/* Location */}
      <section className="settings-page__section">
        <div className="settings-page__section-header">
          <MapPin size={18} />
          <h3>Localisation principale</h3>
        </div>
        <div>
          <div className="settings-page__location-row">
            <input
              type="text"
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              placeholder="Ville ou coordonnées..."
              className="settings-page__location-input"
            />
            <button onClick={handleUseGeolocation} className="settings-page__gps-btn">GPS</button>
          </div>
          <p className="settings-page__coords" style={{ marginTop: '0.5rem' }}>
            Lat: {userLocation.lat.toFixed(4)} · Lng: {userLocation.lng.toFixed(4)}
          </p>
        </div>
      </section>

      {/* Zones */}
      <section className="settings-page__section">
        <div className="settings-page__section-header-row">
          <div className="settings-page__section-header">
            <Eye size={18} />
            <h3>Zones surveillées</h3>
          </div>
          <button
            onClick={() => setShowAddZone(!showAddZone)}
            className="settings-page__add-btn"
            disabled={!isPremium && zones.length >= MAX_FREE_ZONES}
            title={!isPremium && zones.length >= MAX_FREE_ZONES ? 'Premium requis pour plus de zones' : ''}
          >
            <Plus size={16} />
          </button>
        </div>

        {showAddZone && (
          <div className="settings-page__zone-form">
            <input
              type="text"
              value={newZone.label}
              onChange={(e) => setNewZone({ ...newZone, label: e.target.value })}
              placeholder="Nom de la zone"
              className="settings-page__zone-input"
            />
            <div className="settings-page__zone-grid">
              <input
                type="number"
                value={newZone.lat}
                onChange={(e) => setNewZone({ ...newZone, lat: e.target.value })}
                placeholder="Latitude"
                step="0.001"
                className="settings-page__zone-grid-input"
              />
              <input
                type="number"
                value={newZone.lng}
                onChange={(e) => setNewZone({ ...newZone, lng: e.target.value })}
                placeholder="Longitude"
                step="0.001"
                className="settings-page__zone-grid-input"
              />
              <input
                type="number"
                value={newZone.radiusKm}
                onChange={(e) => setNewZone({ ...newZone, radiusKm: e.target.value })}
                placeholder="Rayon km"
                className="settings-page__zone-grid-input"
              />
              <button
                type="button"
                onClick={handleZoneGps}
                className="settings-page__gps-btn"
                disabled={zoneGpsLoading}
                title="Utiliser ma position GPS"
              >
                {zoneGpsLoading ? <Loader size={14} className="spin" /> : <Crosshair size={14} />}
                GPS
              </button>
            </div>
            <button onClick={handleAddZone} className="settings-page__zone-submit" disabled={syncing}>
              {syncing ? <><Loader size={14} className="spin" /> Synchronisation...</> : 'Ajouter la zone'}
            </button>
          </div>
        )}

        {zones.length === 0 ? (
          <p className="settings-page__zone-empty">Aucune zone surveillée</p>
        ) : (
          <div className="settings-page__zone-list">
            {zones.map((zone) => (
              <div key={zone.id} className="settings-page__zone-item">
                <div>
                  <p className="settings-page__zone-name">{zone.label}</p>
                  <p className="settings-page__zone-coords">
                    {zone.lat.toFixed(2)}, {zone.lng.toFixed(2)} · {zone.radiusKm}km
                  </p>
                </div>
                <button onClick={() => handleRemoveZone(zone)} className="settings-page__zone-delete">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Notifications */}
      <section className="settings-page__section settings-page__section--half">
        <div className="settings-page__section-header">
          <Bell size={18} />
          <h3>Notifications {unreadCount > 0 && <span className="settings-page__badge">{unreadCount}</span>}</h3>
        </div>

        {/* Push Web (backend) */}
        {EcosystemPush.isSupported() && isAuthenticated && (
          <div className="settings-page__toggle-row">
            <span className="settings-page__toggle-label">Push web (alertes serveur)</span>
            <button
              disabled={pushLoading}
              onClick={async () => {
                setPushLoading(true);
                try {
                  if (pushSubscribed) {
                    await pushService.unsubscribe();
                    setPushSubscribed(false);
                  } else {
                    await pushService.subscribe();
                    setPushSubscribed(true);
                  }
                } catch (err) {
                  console.error('Push toggle error:', err);
                }
                setPushLoading(false);
              }}
              className={`settings-page__toggle ${pushSubscribed ? 'settings-page__toggle--on' : 'settings-page__toggle--off'}`}
            >
              <span className={`settings-page__toggle-knob ${pushSubscribed ? 'settings-page__toggle-knob--on' : ''}`} />
            </button>
          </div>
        )}

        {/* Local alerts toggle */}
        <div className="settings-page__toggle-row">
          <span className="settings-page__toggle-label">Alertes locales</span>
          <button
            onClick={async () => {
              const newVal = !notifications.enabled;
              if (newVal) await requestPermission();
              setNotifications({ enabled: newVal });
            }}
            className={`settings-page__toggle ${notifications.enabled ? 'settings-page__toggle--on' : 'settings-page__toggle--off'}`}
          >
            <span className={`settings-page__toggle-knob ${notifications.enabled ? 'settings-page__toggle-knob--on' : ''}`} />
          </button>
        </div>
        <div>
          <p className="settings-page__severity-label">Sévérité minimum</p>
          <div className="settings-page__chip-group">
            {SEVERITY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setNotifications({ minSeverity: opt.value })}
                className={`settings-page__chip ${notifications.minSeverity === opt.value ? 'settings-page__chip--active' : ''}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Test + Actions */}
        {pushSubscribed && (
          <div className="settings-page__push-actions">
            <button
              className="settings-page__chip settings-page__chip--active"
              onClick={async () => {
                try { await pushService.sendTest('Test LYNX', 'Notification de test LYNX'); }
                catch (err) { console.error(err); }
              }}
            >
              Tester
            </button>
            {unreadCount > 0 && (
              <button
                className="settings-page__chip"
                onClick={async () => {
                  await pushService.markRead();
                  setNotifHistory((h) => h.map((n) => ({ ...n, read: true })));
                  setUnreadCount(0);
                }}
              >
                Tout marquer lu
              </button>
            )}
          </div>
        )}

        {/* Notification History */}
        {notifHistory.length > 0 && (
          <div className="settings-page__notif-history">
            <p className="settings-page__severity-label">Historique récent</p>
            {notifHistory.slice(0, 5).map((n) => (
              <div key={n.id} className={`settings-page__notif-item ${n.read ? '' : 'settings-page__notif-item--unread'}`}>
                <div>
                  <strong>{n.title}</strong>
                  <p>{n.body}</p>
                </div>
                <small>{new Date(n.sentAt || n.createdAt).toLocaleDateString('fr-FR')}</small>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Séismes */}
      <section className="settings-page__section settings-page__section--half">
        <div className="settings-page__section-header">
          <Activity size={18} />
          <h3>Filtre séismes</h3>
        </div>
        <p className="settings-page__severity-label">
          Magnitude minimum (échelle de Richter) — les séismes inférieurs sont masqués
        </p>
        <div className="settings-page__magnitude-row">
          <input
            type="range"
            min={0}
            max={8}
            step={0.5}
            value={earthquakeMinMagnitude ?? 4}
            onChange={(e) => setEarthquakeMinMagnitude(parseFloat(e.target.value))}
            className="settings-page__magnitude-slider"
          />
          <span className="settings-page__magnitude-value">{earthquakeMinMagnitude ?? 4}</span>
        </div>
        <div className="settings-page__magnitude-legend">
          <span>0 (tout)</span>
          <span>4 (ressenti)</span>
          <span>6 (dégâts)</span>
          <span>8 (majeur)</span>
        </div>
      </section>

      {/* Sons */}
      <section className="settings-page__section settings-page__section--half">
        <div className="settings-page__section-header">
          {soundEnabled !== false ? <Volume2 size={18} /> : <VolumeX size={18} />}
          <h3>Sons de notification</h3>
        </div>
        <div className="settings-page__toggle-row">
          <span className="settings-page__toggle-label">Retour sonore lors du rafraîchissement</span>
          <button
            onClick={() => setSoundEnabled(!(soundEnabled !== false))}
            className={`settings-page__toggle ${soundEnabled !== false ? 'settings-page__toggle--on' : 'settings-page__toggle--off'}`}
          >
            <span className={`settings-page__toggle-knob ${soundEnabled !== false ? 'settings-page__toggle-knob--on' : ''}`} />
          </button>
        </div>
        <div className="settings-page__sound-preview">
          <p className="settings-page__sound-preview-label">Écouter les sons</p>
          <div className="settings-page__sound-list">
            <button className="settings-page__sound-item settings-page__sound-item--success" onClick={playSuccessSound}>
              <Play size={14} />
              <div>
                <span className="settings-page__sound-name">Succès</span>
                <span className="settings-page__sound-desc">Rafraîchissement OK, aucune nouvelle alerte</span>
              </div>
            </button>
            <button className="settings-page__sound-item settings-page__sound-item--flash" onClick={playFlashSound}>
              <Play size={14} />
              <div>
                <span className="settings-page__sound-name">⚡ FLASH</span>
                <span className="settings-page__sound-desc">Alerte critique urgente (séisme, catastrophe…)</span>
              </div>
            </button>
            <button className="settings-page__sound-item settings-page__sound-item--priority" onClick={playPrioritySound}>
              <Play size={14} />
              <div>
                <span className="settings-page__sound-name">PRIORITY</span>
                <span className="settings-page__sound-desc">Alerte importante nécessitant attention</span>
              </div>
            </button>
            <button className="settings-page__sound-item settings-page__sound-item--routine" onClick={playRoutineSound}>
              <Play size={14} />
              <div>
                <span className="settings-page__sound-name">ROUTINE</span>
                <span className="settings-page__sound-desc">Nouvelle alerte de routine</span>
              </div>
            </button>
            <button className="settings-page__sound-item settings-page__sound-item--error" onClick={playErrorSound}>
              <Play size={14} />
              <div>
                <span className="settings-page__sound-name">Erreur</span>
                <span className="settings-page__sound-desc">Échec du rafraîchissement</span>
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* Apparence */}
      <section className="settings-page__section settings-page__section--half">
        <div className="settings-page__section-header">
          <Sun size={18} />
          <h3>Apparence</h3>
        </div>
        <div className="settings-page__theme-group">
          {[
            { value: 'dark', icon: Moon, label: 'Sombre' },
            { value: 'light', icon: Sun, label: 'Clair' },
          ].map(({ value, icon: Icon, label }) => (
            <button
              key={value}
              onClick={() => setTheme(value)}
              className={`settings-page__theme-btn ${theme === value ? 'settings-page__theme-btn--active' : ''}`}
            >
              <Icon size={18} />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="settings-page__section">
        <button onClick={() => setShowSwitcher(true)} className="settings-page__eco-btn">
          <Globe size={18} />
          <div className="settings-page__eco-body">
            <h3>Applications écosystème</h3>
            <p>SmartCellar, ProGarden, Farmly, PRÊT·E</p>
          </div>
          <ChevronRight size={16} className="settings-page__eco-chevron" />
        </button>
      </section>

      {/* About & Legal */}
      <section className="settings-page__section">
        <Link to="/about" className="settings-page__eco-btn">
          <Info size={18} />
          <div className="settings-page__eco-body">
            <h3>À propos & Mentions légales</h3>
            <p>Guide d'utilisation, CGU, CGV, RGPD</p>
          </div>
          <ChevronRight size={16} className="settings-page__eco-chevron" />
        </Link>
      </section>

      {/* Admin Push Notifications - only for admin user */}
      {isAuthenticated && user?.id === 1 && (
        <section className="settings-page__section">
          <div className="settings-page__section-header">
            <Megaphone size={18} />
            <h3>Administration Push</h3>
          </div>

          <div className="settings-page__admin-push">
            <div className="settings-page__admin-group">
              <label className="settings-page__severity-label">Icône</label>
              <div className="settings-page__chip-group">
                {ADMIN_ICONS.map((ic) => (
                  <button key={ic} className={`settings-page__chip ${adminPushForm.icon === ic ? 'settings-page__chip--active' : ''}`} onClick={() => setAdminPushForm({ ...adminPushForm, icon: ic })}>{ic}</button>
                ))}
              </div>
            </div>

            <div className="settings-page__admin-group">
              <label className="settings-page__severity-label">Titre *</label>
              <input type="text" value={adminPushForm.title} onChange={(e) => setAdminPushForm({ ...adminPushForm, title: e.target.value })} placeholder="Titre" maxLength={50} className="settings-page__location-input" />
            </div>

            <div className="settings-page__admin-group">
              <label className="settings-page__severity-label">Message *</label>
              <textarea value={adminPushForm.body} onChange={(e) => setAdminPushForm({ ...adminPushForm, body: e.target.value })} placeholder="Contenu" rows={3} maxLength={200} className="settings-page__location-input" style={{ resize: 'vertical', minHeight: 60 }} />
            </div>

            <div className="settings-page__admin-group">
              <label className="settings-page__severity-label">Application cible</label>
              <select value={adminPushForm.app} onChange={(e) => setAdminPushForm({ ...adminPushForm, app: e.target.value })} className="settings-page__location-input">
                {ADMIN_APPS.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
              </select>
            </div>

            <div className="settings-page__admin-group">
              <label className="settings-page__severity-label">Audience</label>
              <select value={adminPushForm.targetAudience} onChange={(e) => { setAdminPushForm({ ...adminPushForm, targetAudience: e.target.value }); setAdminSelectedUsers([]); setAdminSearchQuery(''); }} className="settings-page__location-input">
                <option value="all">Tous</option>
                <option value="premium">Premium / VIP</option>
                <option value="free">Gratuits</option>
                <option value="specific">Spécifiques</option>
              </select>
            </div>

            {adminPushForm.targetAudience === 'specific' && (
              <div className="settings-page__admin-group">
                <input type="text" value={adminSearchQuery} onChange={(e) => {
                  const q = e.target.value;
                  setAdminSearchQuery(q);
                  if (q.length < 2) { setAdminSearchResults([]); return; }
                  setAdminSearching(true);
                  fetch(`${adminApiBase}/api/admin/users?search=${encodeURIComponent(q)}`, {
                    headers: { Authorization: `Bearer ${getAdminToken()}` },
                  }).then(r => r.json()).then(d => setAdminSearchResults(d.users || []))
                    .catch(() => setAdminSearchResults([]))
                    .finally(() => setAdminSearching(false));
                }} placeholder="Rechercher un utilisateur..." className="settings-page__location-input" />
                {adminSearching && <small style={{ color: 'var(--lynx-dim)' }}>Recherche...</small>}

                {adminSearchResults.length > 0 && (
                  <div className="settings-page__admin-results">
                    {adminSearchResults.map((u) => (
                      <div key={u.id} className={`settings-page__admin-result ${adminSelectedUsers.find((s) => s.id === u.id) ? 'settings-page__admin-result--selected' : ''}`}
                        onClick={() => setAdminSelectedUsers((prev) => prev.find((s) => s.id === u.id) ? prev.filter((s) => s.id !== u.id) : [...prev, u])}>
                        <span>{u.username} — <small>{u.email}</small></span>
                        {adminSelectedUsers.find((s) => s.id === u.id) && <span>✓</span>}
                      </div>
                    ))}
                  </div>
                )}

                {adminSelectedUsers.length > 0 && (
                  <div className="settings-page__admin-chips">
                    {adminSelectedUsers.map((u) => (
                      <span key={u.id} className="settings-page__chip settings-page__chip--active" onClick={() => setAdminSelectedUsers((prev) => prev.filter((s) => s.id !== u.id))}>{u.username} ✕</span>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="settings-page__push-actions">
              <button className="settings-page__chip" disabled={adminPushSending} onClick={async () => {
                if (!adminPushForm.title || !adminPushForm.body) return alert('Titre et message obligatoires');
                try {
                  await fetch(`${adminApiBase}/api/admin/notifications/push/test`, {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${getAdminToken()}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ title: adminPushForm.title, body: adminPushForm.body, icon: adminPushForm.icon }),
                  });
                  alert('Test envoyé');
                } catch { alert('Erreur test'); }
              }}>🧪 Tester</button>

              <button className="settings-page__chip settings-page__chip--active" disabled={adminPushSending} onClick={async () => {
                if (!adminPushForm.title || !adminPushForm.body) return alert('Titre et message obligatoires');
                if (adminPushForm.targetAudience === 'specific' && adminSelectedUsers.length === 0) return alert('Sélectionnez au moins un utilisateur');
                const label = adminPushForm.targetAudience === 'specific' ? `${adminSelectedUsers.length} utilisateur(s)` : adminPushForm.targetAudience === 'all' ? 'Tous' : adminPushForm.targetAudience;
                if (!window.confirm(`Envoyer à : ${label} ?`)) return;
                try {
                  setAdminPushSending(true);
                  const res = await fetch(`${adminApiBase}/api/admin/notifications/push/send`, {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${getAdminToken()}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      title: adminPushForm.title, body: adminPushForm.body, icon: adminPushForm.icon,
                      app: adminPushForm.app || undefined, targetAudience: adminPushForm.targetAudience,
                      targetUserIds: adminPushForm.targetAudience === 'specific' ? adminSelectedUsers.map((u) => u.id) : undefined,
                    }),
                  });
                  const result = await res.json();
                  setAdminPushHistory([{ ...adminPushForm, sentAt: new Date().toISOString(), ...result }, ...adminPushHistory]);
                  setAdminPushForm({ title: '', body: '', icon: '🔔', app: adminPushForm.app, targetAudience: 'all' });
                  setAdminSelectedUsers([]); setAdminSearchQuery('');
                  alert(`Envoyé : ${result.successCount} réussi(s), ${result.failureCount} échoué(s)`);
                } catch { alert('Erreur envoi'); }
                finally { setAdminPushSending(false); }
              }}>{adminPushSending ? 'Envoi...' : '📤 Envoyer'}</button>
            </div>

            {adminPushHistory.length > 0 && (
              <div className="settings-page__notif-history" style={{ marginTop: '0.75rem' }}>
                <p className="settings-page__severity-label">Historique session</p>
                {adminPushHistory.map((h, i) => (
                  <div key={i} className="settings-page__notif-item">
                    <div><strong>{h.icon} {h.title}</strong></div>
                    <div className="settings-page__notif-actions">
                      <small>{new Date(h.sentAt).toLocaleTimeString('fr-FR')} — {h.successCount || 0} envoyé(s)</small>
                      <button className="settings-page__notif-delete" onClick={() => setAdminPushHistory(prev => prev.filter((_, idx) => idx !== i))} title="Supprimer">🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      <p className="settings-page__copyright">© 2026 La Caverne du Réfractaire – Tous droits réservés</p>

      {showSwitcher && <AppSwitcher onClose={() => setShowSwitcher(false)} />}
    </div>
  );
}
