import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { Megaphone, ArrowLeft } from 'lucide-react';
import './AdminPage.scss';

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
const APP_URLS = {
  smartcellar: [
    { value: '/dashboard', label: 'Tableau de bord' },
    { value: '/stock', label: 'Stock / Inventaire' },
    { value: '/recette', label: 'Recettes' },
    { value: '/meal-plan', label: 'Planification repas' },
    { value: '/course', label: 'Liste de courses' },
    { value: '/scan', label: 'Scanner' },
    { value: '/household', label: 'Foyer' },
    { value: '/notification-history', label: 'Historique notifications' },
    { value: '/settings', label: 'Paramètres' },
    { value: '/profile', label: 'Profil' },
    { value: 'custom', label: 'URL personnalisée' },
  ],
  progarden: [
    { value: '/dashboard', label: 'Dashboard' },
    { value: '/garden', label: 'Éditeur jardin' },
    { value: '/calendar', label: 'Calendrier' },
    { value: '/plants', label: 'Catalogue plantes' },
    { value: '/seedbox', label: 'Grainothèque' },
    { value: '/observations', label: 'Observations' },
    { value: '/soil', label: 'Analyse sol' },
    { value: '/settings', label: 'Paramètres' },
    { value: 'custom', label: 'URL personnalisée' },
  ],
  farmly: [
    { value: '/dashboard', label: 'Dashboard' },
    { value: '/animals', label: 'Animaux' },
    { value: '/settings', label: 'Paramètres' },
    { value: 'custom', label: 'URL personnalisée' },
  ],
  lynx: [
    { value: '/dashboard', label: 'Dashboard' },
    { value: '/map', label: 'Carte' },
    { value: '/alerts', label: 'Alertes' },
    { value: '/stats', label: 'Statistiques' },
    { value: '/energy', label: 'Prix énergie' },
    { value: '/blackout', label: 'Coupures' },
    { value: '/analysis', label: 'Analyse' },
    { value: '/settings', label: 'Paramètres' },
    { value: 'custom', label: 'URL personnalisée' },
  ],
  prete: [
    { value: '/dashboard', label: 'Dashboard' },
    { value: '/scenarios', label: 'Scénarios' },
    { value: '/exercices', label: 'Exercices' },
    { value: '/terrain', label: 'Terrain' },
    { value: '/profile', label: 'Profil' },
    { value: '/gamification', label: 'Gamification' },
    { value: 'custom', label: 'URL personnalisée' },
  ],
  partner: [
    { value: '/dashboard', label: 'Dashboard' },
    { value: '/profile', label: 'Profil' },
    { value: 'custom', label: 'URL personnalisée' },
  ],
};

const adminApiBase = import.meta.env.VITE_STRAPI_URL || 'https://smart-cellar-api.onrender.com';
const getAdminToken = () => {
  try { return JSON.parse(localStorage.getItem('lynx-auth'))?.state?.jwt || null; }
  catch { return null; }
};

export default function AdminPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [form, setForm] = useState({ title: '', body: '', icon: '🔔', app: '', targetAudience: 'all', url: '/', urlType: '/' });
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searching, setSearching] = useState(false);
  const [history, setHistory] = useState([]);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch(`${adminApiBase}/api/admin/notifications/push/history`, {
        headers: { Authorization: `Bearer ${getAdminToken()}` },
      });
      if (res.ok) setHistory(await res.json());
    } catch (e) { console.error('Erreur chargement historique:', e); }
  }, []);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const deleteHistoryItem = async (id) => {
    try {
      await fetch(`${adminApiBase}/api/admin/notifications/push/history/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getAdminToken()}` },
      });
      setHistory((prev) => prev.filter((h) => h.id !== id));
    } catch (e) { console.error('Erreur suppression:', e); }
  };

  // Redirect if not admin
  if (!isAuthenticated || user?.id !== 1) {
    navigate('/dashboard');
    return null;
  }

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <button onClick={() => navigate('/settings')} className="admin-page__back">
          <ArrowLeft size={18} />
          Réglages
        </button>
        <h1 className="admin-page__title">
          <Megaphone size={20} />
          Administration Push
        </h1>
      </div>

      <section className="admin-page__section">
        <h2 className="admin-page__section-title">Envoyer une notification</h2>

        {/* Icône */}
        <div className="admin-page__group">
          <label className="admin-page__label">Icône</label>
          <div className="admin-page__chips">
            {ADMIN_ICONS.map((ic) => (
              <button
                key={ic}
                className={`admin-page__chip ${form.icon === ic ? 'admin-page__chip--active' : ''}`}
                onClick={() => setForm({ ...form, icon: ic })}
              >{ic}</button>
            ))}
          </div>
        </div>

        {/* Titre */}
        <div className="admin-page__group">
          <label className="admin-page__label">Titre *</label>
          <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Titre" maxLength={50} className="admin-page__input" />
        </div>

        {/* Message */}
        <div className="admin-page__group">
          <label className="admin-page__label">Message *</label>
          <textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })}
            placeholder="Contenu" rows={3} maxLength={200} className="admin-page__input admin-page__textarea" />
        </div>

        {/* App cible */}
        <div className="admin-page__group">
          <label className="admin-page__label">Application cible</label>
          <select value={form.app} onChange={(e) => setForm({ ...form, app: e.target.value, url: '/', urlType: '/' })}
            className="admin-page__input">
            {ADMIN_APPS.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
          </select>
        </div>

        {/* URL destination */}
        {form.app && APP_URLS[form.app] && (
          <div className="admin-page__group">
            <label className="admin-page__label">URL de destination</label>
            <select value={form.urlType}
              onChange={(e) => { const v = e.target.value; setForm({ ...form, urlType: v, url: v === 'custom' ? '' : v }); }}
              className="admin-page__input">
              {APP_URLS[form.app].map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
            </select>
          </div>
        )}

        {form.urlType === 'custom' && form.app && (
          <div className="admin-page__group">
            <label className="admin-page__label">URL personnalisée</label>
            <input type="text" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })}
              placeholder="/ma-page" className="admin-page__input" />
          </div>
        )}

        {/* Audience */}
        <div className="admin-page__group">
          <label className="admin-page__label">Audience</label>
          <select value={form.targetAudience}
            onChange={(e) => { setForm({ ...form, targetAudience: e.target.value }); setSelectedUsers([]); setSearchQuery(''); }}
            className="admin-page__input">
            <option value="all">Tous</option>
            <option value="premium">Premium / VIP</option>
            <option value="free">Gratuits</option>
            <option value="specific">Spécifiques</option>
          </select>
        </div>

        {/* Recherche utilisateurs */}
        {form.targetAudience === 'specific' && (
          <div className="admin-page__group">
            <input type="text" value={searchQuery} onChange={(e) => {
              const q = e.target.value;
              setSearchQuery(q);
              if (q.length < 2) { setSearchResults([]); return; }
              setSearching(true);
              fetch(`${adminApiBase}/api/admin/users?search=${encodeURIComponent(q)}`, {
                headers: { Authorization: `Bearer ${getAdminToken()}` },
              }).then((r) => r.json()).then((d) => setSearchResults(d.users || []))
                .catch(() => setSearchResults([]))
                .finally(() => setSearching(false));
            }} placeholder="Rechercher un utilisateur..." className="admin-page__input" />
            {searching && <small className="admin-page__hint">Recherche...</small>}

            {searchResults.length > 0 && (
              <div className="admin-page__results">
                {searchResults.map((u) => (
                  <div key={u.id}
                    className={`admin-page__result ${selectedUsers.find((s) => s.id === u.id) ? 'admin-page__result--selected' : ''}`}
                    onClick={() => setSelectedUsers((prev) => prev.find((s) => s.id === u.id) ? prev.filter((s) => s.id !== u.id) : [...prev, u])}>
                    <span>{u.username} — <small>{u.email}</small></span>
                    {selectedUsers.find((s) => s.id === u.id) && <span>✓</span>}
                  </div>
                ))}
              </div>
            )}

            {selectedUsers.length > 0 && (
              <div className="admin-page__chips">
                {selectedUsers.map((u) => (
                  <span key={u.id} className="admin-page__chip admin-page__chip--active"
                    onClick={() => setSelectedUsers((prev) => prev.filter((s) => s.id !== u.id))}>
                    {u.username} ✕
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="admin-page__actions">
          <button className="admin-page__btn" disabled={sending} onClick={async () => {
            if (!form.title || !form.body) return alert('Titre et message obligatoires');
            try {
              await fetch(`${adminApiBase}/api/admin/notifications/push/test`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${getAdminToken()}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: form.title, body: form.body, icon: form.icon }),
              });
              alert('Test envoyé');
            } catch { alert('Erreur test'); }
          }}>🧪 Tester</button>

          <button className="admin-page__btn admin-page__btn--primary" disabled={sending} onClick={async () => {
            if (!form.title || !form.body) return alert('Titre et message obligatoires');
            if (form.targetAudience === 'specific' && selectedUsers.length === 0) return alert('Sélectionnez au moins un utilisateur');
            const label = form.targetAudience === 'specific' ? `${selectedUsers.length} utilisateur(s)` : form.targetAudience === 'all' ? 'Tous' : form.targetAudience;
            if (!window.confirm(`Envoyer à : ${label} ?`)) return;
            try {
              setSending(true);
              const res = await fetch(`${adminApiBase}/api/admin/notifications/push/send`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${getAdminToken()}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  title: form.title, body: form.body, icon: form.icon,
                  data: form.app ? { url: form.url || '/' } : undefined,
                  app: form.app || undefined, targetAudience: form.targetAudience,
                  targetUserIds: form.targetAudience === 'specific' ? selectedUsers.map((u) => u.id) : undefined,
                }),
              });
              const result = await res.json();
              await fetchHistory();
              setForm({ title: '', body: '', icon: '🔔', app: form.app, targetAudience: 'all', url: '/', urlType: '/' });
              setSelectedUsers([]); setSearchQuery('');
              alert(`Envoyé : ${result.successCount} réussi(s), ${result.failureCount} échoué(s)`);
            } catch { alert('Erreur envoi'); }
            finally { setSending(false); }
          }}>{sending ? 'Envoi...' : '📤 Envoyer'}</button>
        </div>
      </section>

      {/* Historique */}
      {history.length > 0 && (
        <section className="admin-page__section">
          <h2 className="admin-page__section-title">Historique</h2>
          <div className="admin-page__history">
            {history.map((h) => (
              <div key={h.id} className="admin-page__history-item">
                <div>
                  <strong>{h.icon} {h.title}</strong>
                  <small className="admin-page__hint">{new Date(h.createdAt).toLocaleString('fr-FR')} — {h.app || 'toutes'}</small>
                </div>
                <button className="admin-page__delete" onClick={() => deleteHistoryItem(h.id)} title="Supprimer">🗑️</button>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
