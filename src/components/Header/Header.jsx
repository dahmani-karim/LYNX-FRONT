import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { RefreshCw, Menu, X, Home, Map, Bell, BarChart3, Settings, Eye, Zap, Info, Compass, CreditCard, Link2, User } from 'lucide-react';
import { useAlertStore } from '../../stores/alertStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { playSuccessSound, playAttentionSound, playErrorSound } from '../../services/sounds';
import LynxLogo from '../LynxLogo/LynxLogo';
import AppSwitcher from '../AppSwitcher/AppSwitcher';
import './Header.scss';

const NAV_MAIN = [
  { to: '/dashboard', icon: Home, label: 'Dashboard' },
  { to: '/map', icon: Map, label: 'Carte' },
  { to: '/alerts', icon: Bell, label: 'Alertes' },
  { to: '/analysis', icon: Link2, label: 'Analyse' },
  { to: '/stats', icon: BarChart3, label: 'Stats' },
  { to: '/energy', icon: Zap, label: 'Énergie' },
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
  const [showSwitcher, setShowSwitcher] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);

  const weatherLocation = zones.length > 0
    ? { lat: zones[0].lat, lng: zones[0].lng }
    : userLocation;

  const soundEnabled = useSettingsStore((s) => s.soundEnabled !== false);

  const handleManualRefresh = async () => {
    try {
      const result = await fetchAllData(userLocation, weatherLocation);
      if (!soundEnabled) return;
      if (!result?.ok) {
        playErrorSound();
      } else if (result.newCount > 0) {
        playAttentionSound();
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
            {/* {criticalCount > 0 && (
              <span className="header__badge">{criticalCount}</span>
            )} */}
            <button
              onClick={handleManualRefresh}
              disabled={isLoading}
              className="header__icon-btn"
              aria-label="Rafraîchir"
            >
              <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
            </button>
            {/* <button
              onClick={() => setShowSwitcher(true)}
              className="header__emoji-btn"
              aria-label="Applications"
            >
              🐆
            </button> */}
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
        <div className="sidebar__footer">
          <button onClick={() => setShowSwitcher(true)} className="sidebar__eco-btn">
            <span className="emoji">🌐</span>
            <span>Switcher</span>
          </button>
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
            <div className="mobile-sidebar__footer">
              <button
                onClick={() => { setShowSidebar(false); setShowSwitcher(true); }}
                className="sidebar__eco-btn"
              >
                <span className="emoji">🌐</span>
                <span>Switcher</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {showSwitcher && <AppSwitcher onClose={() => setShowSwitcher(false)} />}
    </>
  );
}
