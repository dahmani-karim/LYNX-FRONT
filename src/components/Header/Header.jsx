import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { RefreshCw, Menu, X, Home, Map, Bell, BarChart3, Settings, Eye, Zap, Info, Compass, CreditCard, Link2, User, ShieldAlert, MoonStar, Sun } from 'lucide-react';
import { useAlertStore } from '../../stores/alertStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { playSuccessSound, playErrorSound, playFlashSound, playPrioritySound, playRoutineSound } from '../../services/sounds';
import LynxLogo from '../LynxLogo/LynxLogo';
import { ECOSYSTEM_APPS, getAppUrl } from '../../config/ecosystem';
import './Header.scss';

// ─── Inline EcosystemSwitcher (dropdown, like PRÊT·E) ───────────────────────
function EcosystemSwitcher() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="eco-switcher" ref={ref}>
      <button
        className={`eco-switcher__btn ${open ? 'eco-switcher__btn--active' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-label="Changer d'application"
        title="Écosystème La Caverne"
      >
        <span className="eco-switcher__dots">
          <span /><span /><span />
          <span /><span /><span />
          <span /><span /><span />
        </span>
      </button>

      {open && (
        <div className="eco-switcher__dropdown">
          <p className="eco-switcher__label">Écosystème La Caverne</p>
          <div className="eco-switcher__grid">
            {ECOSYSTEM_APPS.map((app) => {
              if (app.current) {
                return (
                  <div key={app.id} className="eco-switcher__app eco-switcher__app--current">
                    <span className="eco-switcher__app-icon" style={{ background: `${app.color}22`, color: app.color }}>{app.emoji}</span>
                    <span className="eco-switcher__app-name">{app.name}</span>
                  </div>
                );
              }
              if (app.disabled) {
                return (
                  <div key={app.id} className="eco-switcher__app eco-switcher__app--disabled">
                    <span className="eco-switcher__app-icon" style={{ background: 'rgba(255,255,255,0.05)', color: '#4B5563' }}>{app.emoji}</span>
                    <span className="eco-switcher__app-name">{app.name}</span>
                    {app.comingSoon && <span className="eco-switcher__soon">bientôt</span>}
                  </div>
                );
              }
              return (
                <a
                  key={app.id}
                  href={getAppUrl(app)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="eco-switcher__app"
                  onClick={() => setOpen(false)}
                >
                  <span className="eco-switcher__app-icon" style={{ background: `${app.color}22`, color: app.color }}>{app.emoji}</span>
                  <span className="eco-switcher__app-name">{app.name}</span>
                </a>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

const NAV_MAIN = [
  { to: '/dashboard', icon: Home, label: 'Dashboard' },
  { to: '/alerts', icon: Bell, label: 'Alertes' },
  { to: '/energy', icon: Zap, label: 'Énergie' },
  { to: '/blackout', icon: ShieldAlert, label: 'Blackout' },
  { to: '/map', icon: Map, label: 'Carte' },
  { to: '/analysis', icon: Link2, label: 'Analyse' },
  { to: '/stats', icon: BarChart3, label: 'Stats' },
  { to: '/specter', icon: Eye, label: 'Specter' },
  { to: '/account', icon: User, label: 'Mon compte' },
  { to: '/settings', icon: Settings, label: 'Réglages' },
];

const NAV_SECONDARY = [
  { to: '/discover', icon: Compass, label: 'Découvrir' },
  { to: '/pricing', icon: CreditCard, label: 'Tarifs' },
  { to: '/about', icon: Info, label: 'À propos' },
];

export default function Header() {
  const { pathname } = useLocation();
  const isLoading = useAlertStore((s) => s.isLoading);
  const fetchAllData = useAlertStore((s) => s.fetchAllData);
  const userLocation = useSettingsStore((s) => s.userLocation);
  const zones = useSettingsStore((s) => s.zones);
  const events = useAlertStore((s) => s.events);
  const [showSidebar, setShowSidebar] = useState(false);

  const weatherLocation = zones.length > 0
    ? { lat: zones[0].lat, lng: zones[0].lng }
    : userLocation;

  const soundEnabled = useSettingsStore((s) => s.soundEnabled !== false);
  const veilleMode = useSettingsStore((s) => s.veilleMode);
  const setVeilleMode = useSettingsStore((s) => s.setVeilleMode);

  const handleManualRefresh = async () => {
    try {
      const result = await fetchAllData(userLocation, weatherLocation);
      if (!soundEnabled) return;
      if (!result?.ok) {
        playErrorSound();
      } else if (result.newCount > 0) {
        if (result.highestTier === 'flash') playFlashSound();
        else if (result.highestTier === 'priority') playPrioritySound();
        else playRoutineSound();
      } else {
        playSuccessSound();
      }
    } catch {
      if (soundEnabled) playErrorSound();
    }
  };

  const criticalCount = events.filter(
    (e) => e.severity === 'critical' || e.severity === 'high'
  ).length;

  const isActive = (to) => pathname === to || (to !== '/dashboard' && pathname.startsWith(to));

  return (
    <>
      <header className="header">
        <div className="header__bar">
          <div className="header__left">
            <button
              onClick={() => setShowSidebar(true)}
              className="header__menu-btn"
              aria-label="Menu"
            >
              <Menu size={20} />
            </button>
          </div>

            <Link to="/dashboard" className="header__logo">
              <LynxLogo size={38} />
            </Link>
          <div className="header__right">
            <button
              onClick={() => setVeilleMode(!veilleMode)}
              className={`header__icon-btn${veilleMode ? ' header__icon-btn--active' : ''}`}
              aria-label="Mode veille"
              title={veilleMode ? 'Désactiver mode veille' : 'Mode veille'}
            >
              {veilleMode ? <Sun size={18} /> : <MoonStar size={18} />}
            </button>
            <button
              onClick={handleManualRefresh}
              disabled={isLoading}
              className="header__icon-btn"
              aria-label="Rafraîchir"
            >
              <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
            </button>
            <EcosystemSwitcher />
          </div>
        </div>
      </header>

      {/* Desktop sidebar */}
      <nav className="sidebar">
        <div className="sidebar__nav">
          {NAV_MAIN.map(({ to, icon: Icon, label }) => (
            <Link
              key={to}
              to={to}
              className={`sidebar__link ${isActive(to) ? 'sidebar__link--active' : ''}`}
            >
              <Icon size={20} />
              <span>{label}</span>
            </Link>
          ))}
          <div className="sidebar__separator" />
          {NAV_SECONDARY.map(({ to, icon: Icon, label }) => (
            <Link
              key={to}
              to={to}
              className={`sidebar__link ${isActive(to) ? 'sidebar__link--active' : ''}`}
            >
              <Icon size={20} />
              <span>{label}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* Mobile sidebar overlay */}
      {showSidebar && (
        <div className="mobile-sidebar">
          <div className="mobile-sidebar__overlay" onClick={() => setShowSidebar(false)} />
          <div className="mobile-sidebar__panel">
            <div className="mobile-sidebar__header">
              <div className="mobile-sidebar__brand">
                <Eye size={24} />
                <span>LYNX</span>
              </div>
              <button onClick={() => setShowSidebar(false)} className="mobile-sidebar__close">
                <X size={20} />
              </button>
            </div>
            <div className="mobile-sidebar__nav">
              {NAV_MAIN.map(({ to, icon: Icon, label }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setShowSidebar(false)}
                  className={`mobile-sidebar__link ${isActive(to) ? 'mobile-sidebar__link--active' : ''}`}
                >
                  <Icon size={20} />
                  <span>{label}</span>
                </Link>
              ))}
              <div className="mobile-sidebar__separator" />
              {NAV_SECONDARY.map(({ to, icon: Icon, label }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setShowSidebar(false)}
                  className={`mobile-sidebar__link ${isActive(to) ? 'mobile-sidebar__link--active' : ''}`}
                >
                  <Icon size={20} />
                  <span>{label}</span>
                </Link>
              ))}
            </div>

          </div>
        </div>
      )}

    </>
  );
}
