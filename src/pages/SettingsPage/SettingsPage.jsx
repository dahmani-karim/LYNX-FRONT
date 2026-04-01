import { useState } from 'react';
import { useSettingsStore } from '../../stores/settingsStore';
import InstallPrompt from '../../components/InstallPrompt/InstallPrompt';
import AppSwitcher from '../../components/AppSwitcher/AppSwitcher';
import {
  MapPin, Bell, Eye, Trash2, Plus, Shield, ChevronRight, Info, Globe
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
  } = useSettingsStore();

  const [showSwitcher, setShowSwitcher] = useState(false);
  const [showAddZone, setShowAddZone] = useState(false);
  const [newZone, setNewZone] = useState({ label: '', lat: '', lng: '', radiusKm: 50 });
  const [locationInput, setLocationInput] = useState(userLocation.label);

  const handleAddZone = () => {
    if (!newZone.label || !newZone.lat || !newZone.lng) return;
    addZone({
      label: newZone.label,
      lat: parseFloat(newZone.lat),
      lng: parseFloat(newZone.lng),
      radiusKm: parseInt(newZone.radiusKm) || 50,
    });
    setNewZone({ label: '', lat: '', lng: '', radiusKm: 50 });
    setShowAddZone(false);
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
          <button onClick={() => setShowAddZone(!showAddZone)} className="settings-page__add-btn">
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
            </div>
            <button onClick={handleAddZone} className="settings-page__zone-submit">
              Ajouter la zone
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
                <button onClick={() => removeZone(zone.id)} className="settings-page__zone-delete">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Notifications */}
      <section className="settings-page__section">
        <div className="settings-page__section-header">
          <Bell size={18} />
          <h3>Notifications</h3>
        </div>
        <div className="settings-page__toggle-row">
          <span className="settings-page__toggle-label">Alertes push</span>
          <button
            onClick={() => setNotifications({ enabled: !notifications.enabled })}
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
      </section>

      {/* Ecosystem */}
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

      {/* About */}
      <section className="settings-page__section">
        <div className="settings-page__section-header">
          <Info size={18} />
          <h3>À propos</h3>
        </div>
        <div className="settings-page__about-text">
          <p><strong>LYNX</strong> – Voyez ce que les autres ne voient pas</p>
          <p>Version 1.0.0</p>
          <p>Plateforme d'anticipation & d'alertes en temps réel</p>
        </div>
        <div className="settings-page__sources">
          <p className="settings-page__sources-label">Sources de données :</p>
          <div className="settings-page__sources-list">
            {['USGS', 'Open-Meteo', 'GDACS', 'CERT-FR', 'ODRÉ', 'Statuspage'].map((src) => (
              <span key={src} className="settings-page__source-tag">{src}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Legal */}
      <section className="settings-page__legal">
        <div className="settings-page__legal-inner">
          <Shield size={16} className="settings-page__legal-icon" />
          <div className="settings-page__legal-text">
            <p className="settings-page__legal-title">Avertissement</p>
            <p>
              LYNX fournit des informations à titre indicatif uniquement. Cette application ne se substitue
              en aucun cas aux autorités officielles, services d'urgence ou organismes compétents.
            </p>
            <p>
              En cas de danger immédiat, contactez le <strong>112</strong> (urgences européennes)
              ou le <strong>114</strong> (urgences par SMS).
            </p>
            <p>
              Les données affichées proviennent de sources publiques et peuvent être incomplètes ou retardées.
              Aucune garantie n'est apportée quant à l'exactitude des alertes.
            </p>
          </div>
        </div>
      </section>

      <p className="settings-page__copyright">© 2026 La Caverne du Réfractaire – Tous droits réservés</p>

      {showSwitcher && <AppSwitcher onClose={() => setShowSwitcher(false)} />}
    </div>
  );
}
