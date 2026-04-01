import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { RefreshCw, Menu, X, Home, Map, Bell, BarChart3, Settings, Eye, Clock, Zap, Info } from 'lucide-react';
import { useAlertStore } from '../../stores/alertStore';
import { useSettingsStore } from '../../stores/settingsStore';
import LynxLogo from '../LynxLogo/LynxLogo';
import AppSwitcher from '../AppSwitcher/AppSwitcher';
import './Header.scss';

const NAV_ITEMS = [
  { to: '/dashboard', icon: Home, label: 'Dashboard' },
  { to: '/map', icon: Map, label: 'Carte' },
  { to: '/alerts', icon: Bell, label: 'Alertes' },
  { to: '/stats', icon: BarChart3, label: 'Stats' },
  { to: '/timeline', icon: Clock, label: 'Chronologie' },
  { to: '/energy', icon: Zap, label: 'Énergie' },
  { to: '/settings', icon: Settings, label: 'Réglages' },
  { to: '/about', icon: Info, label: 'À propos' },
];

export default function Header() {
  const { pathname } = useLocation();
  const isLoading = useAlertStore((s) => s.isLoading);
  const fetchAllData = useAlertStore((s) => s.fetchAllData);
  const userLocation = useSettingsStore((s) => s.userLocation);
  const events = useAlertStore((s) => s.events);
  const [showSwitcher, setShowSwitcher] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);

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
              onClick={() => fetchAllData(userLocation)}
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
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
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
              {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
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
