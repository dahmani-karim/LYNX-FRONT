import { Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { ArrowRight, Shield, Eye } from 'lucide-react';
import LynxLogo from '../../components/LynxLogo/LynxLogo';
import InstallPrompt from '../../components/InstallPrompt/InstallPrompt';
import './Landing.scss';

export default function Landing() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return (
    <div className="landing">
      {/* Animated background */}
      <div className="landing__bg">
        <div className="landing__float landing__float--1">🛡️</div>
        <div className="landing__float landing__float--2">🛰️</div>
        <div className="landing__float landing__float--3">⚡</div>
        <div className="landing__float landing__float--4">🌍</div>
        <div className="landing__float landing__float--5">🔒</div>
        <div className="landing__float landing__float--6">📡</div>
        <div className="landing__float landing__float--7">⚠️</div>
        <div className="landing__float landing__float--8">🌋</div>
      </div>

      {/* Content */}
      <div className="landing__content">
        {/* Nav bar */}
        <nav className="landing__nav">
          {/* <div className="landing__nav-links">
            <Link to="/discover" className="landing__nav-link">Découvrir</Link>
            <Link to="/pricing" className="landing__nav-link">Tarifs</Link>
            {isAuthenticated ? (
              <Link to="/dashboard" className="landing__nav-link">Dashboard</Link>
            ) : (
              <Link to="/login" className="landing__nav-link">Connexion</Link>
            )}
          </div> */}
        </nav>

        {/* Hero card */}
        <div className="landing__hero">
          <div className="landing__hero-logo">
            <LynxLogo size={72} />
          </div>
          <div className="landing__badge">
            <Eye size={14} />
            <span>Plateforme OSINT d'anticipation</span>
          </div>

          <h1 className="landing__title">
            Voyez ce que les autres
            <span className="landing__accent"> ne voient pas</span>
          </h1>

          <p className="landing__desc">
            LYNX agrège des données OSINT en temps réel — séismes, météo, cybermenaces,
            conflits, énergie — pour anticiper les risques avant qu'ils ne vous impactent.
          </p>

          <div className="landing__actions">
            <Link
              to={isAuthenticated ? '/dashboard' : '/register'}
              className="landing__btn landing__btn--primary"
            >
              {isAuthenticated ? 'Mon Dashboard' : 'Commencer gratuitement'}
              <ArrowRight size={18} />
            </Link>
            <Link to="/discover" className="landing__btn landing__btn--ghost">
              Découvrir les modules
            </Link>
          </div>

          <div className="landing__install">
            <InstallPrompt />
          </div>
        </div>

        {/* Footer */}
        <div className="landing__footer">
          <span>© 2026 La Caverne du Réfractaire</span>
        </div>
      </div>
    </div>
  );
}
