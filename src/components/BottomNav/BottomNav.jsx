import { NavLink } from 'react-router-dom';
import { Home, Map, Bell, Eye, Settings } from 'lucide-react';
import { useAlertStore } from '../../stores/alertStore';
import './BottomNav.scss';

const TABS = [
  { to: '/dashboard', icon: Home, label: 'Accueil' },
  { to: '/map', icon: Map, label: 'Carte' },
  { to: '/alerts', icon: Bell, label: 'Alertes' },
  { to: '/specter', icon: Eye, label: 'SPECTER' },
  { to: '/settings', icon: Settings, label: 'Plus' },
];

export default function BottomNav() {
  const events = useAlertStore((s) => s.events);
  const criticalCount = events.filter(
    (e) => e.severity === 'critical' || e.severity === 'high'
  ).length;

  return (
    <nav className="bottom-nav">
      <div className="bottom-nav__list">
        {TABS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/dashboard'}
            className={({ isActive }) =>
              `bottom-nav__item ${isActive ? 'bottom-nav__item--active' : ''}`
            }
          >
            {({ isActive }) => (
              <>
                <div className="bottom-nav__icon-wrap">
                  <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                  {label === 'Alertes' && criticalCount > 0 && (
                    <span className="bottom-nav__badge">
                      {criticalCount > 99 ? '99+' : criticalCount}
                    </span>
                  )}
                </div>
                <span className="bottom-nav__label">{label}</span>
                {isActive && <span className="bottom-nav__indicator" />}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
