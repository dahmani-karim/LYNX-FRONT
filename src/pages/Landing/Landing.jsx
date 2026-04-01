import { Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import {
  Shield, Map, BarChart3, Zap, Globe, Bell, Eye, ArrowRight,
  Monitor, Smartphone, Wifi, Lock, ChevronRight, Swords
} from 'lucide-react';
import { ECOSYSTEM_APPS, getAppUrl } from '../../config/ecosystem';
import LynxLogo from '../../components/LynxLogo/LynxLogo';
import InstallPrompt from '../../components/InstallPrompt/InstallPrompt';
import './Landing.scss';

const FEATURES = [
  { icon: Shield, title: 'Multi-risques', desc: 'Séismes, météo, cyber, énergie, conflits — tout sur un seul écran' },
  { icon: Map, title: 'Carte interactive', desc: 'Visualisez les événements géolocalisés en temps réel' },
  { icon: BarChart3, title: 'Score de risque', desc: 'Algorithme composite pour évaluer la situation globale' },
  { icon: Swords, title: 'Conflits internationaux', desc: 'Suivi des conflits et de leurs répercussions sur votre quotidien' },
  { icon: Bell, title: 'Alertes ciblées', desc: 'Notifications personnalisées selon vos zones surveillées' },
  { icon: Eye, title: 'Données OSINT', desc: 'Sources ouvertes vérifiées : USGS, GDACS, CERT-FR, ReliefWeb…' },
];

const STATS = [
  { value: '6+', label: 'Sources surveillées' },
  { value: '24/7', label: 'Monitoring continu' },
  { value: '10', label: 'Catégories de risque' },
  { value: '∞', label: 'Événements traçables' },
];

export default function Landing() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const ecoApps = ECOSYSTEM_APPS.filter((a) => !a.current);

  return (
    <div className="landing">
      {/* Navbar */}
      <nav className="landing__nav">
        <div className="landing__nav-inner">
          <Link to="/" className="landing__logo">
            <LynxLogo size={30} />
          </Link>
          <div className="landing__nav-links">
            <Link to="/discover" className="landing__nav-link">Découvrir</Link>
            <Link to="/pricing" className="landing__nav-link">Tarifs</Link>
            {isAuthenticated ? (
              <Link to="/dashboard" className="landing__nav-cta">Dashboard</Link>
            ) : (
              <>
                <Link to="/login" className="landing__nav-link">Connexion</Link>
                <Link to="/register" className="landing__nav-cta">Commencer</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="landing__hero">
        <div className="landing__hero-content">
          <div className="landing__hero-badge">
            <Zap size={14} />
            <span>Plateforme d'anticipation en temps réel</span>
          </div>
          <h1 className="landing__hero-title">
            Voyez ce que les autres <br />
            <span className="landing__hero-accent">ne voient pas</span>
          </h1>
          <p className="landing__hero-desc">
            LYNX agrège des données OSINT pour vous offrir une vision à 360° des risques :
            séismes, météo extrême, cybermenaces, tensions énergétiques, conflits internationaux
            et leurs répercussions sur votre quotidien.
          </p>
          <div className="landing__hero-actions">
            <Link to={isAuthenticated ? '/dashboard' : '/register'} className="landing__btn landing__btn--primary">
              {isAuthenticated ? 'Mon Dashboard' : 'Créer un compte gratuit'}
              <ArrowRight size={18} />
            </Link>
            <Link to="/discover" className="landing__btn landing__btn--ghost">
              Découvrir les modules
            </Link>
          </div>
        </div>
        <div className="landing__hero-visual">
          <div className="landing__hero-card landing__hero-card--1">
            <div className="landing__hero-card-icon landing__hero-card-icon--red" />
            <div>
              <p className="landing__hero-card-title">Séisme M5.2 — Turquie</p>
              <p className="landing__hero-card-sub">Il y a 12 min</p>
            </div>
          </div>
          <div className="landing__hero-card landing__hero-card--2">
            <div className="landing__hero-card-icon landing__hero-card-icon--orange" />
            <div>
              <p className="landing__hero-card-title">Tension réseau Ecogaz</p>
              <p className="landing__hero-card-sub">Niveau orange</p>
            </div>
          </div>
          <div className="landing__hero-card landing__hero-card--3">
            <div className="landing__hero-card-icon landing__hero-card-icon--purple" />
            <div>
              <p className="landing__hero-card-title">Alerte CERT-FR CVE-2026</p>
              <p className="landing__hero-card-sub">Criticité haute</p>
            </div>
          </div>
          <div className="landing__hero-card landing__hero-card--4">
            <div className="landing__hero-card-icon landing__hero-card-icon--yellow" />
            <div>
              <p className="landing__hero-card-title">Conflit Mer Rouge — impact transport</p>
              <p className="landing__hero-card-sub">Répercussions chaîne logistique</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="landing__stats">
        {STATS.map((s) => (
          <div key={s.label} className="landing__stat">
            <p className="landing__stat-value">{s.value}</p>
            <p className="landing__stat-label">{s.label}</p>
          </div>
        ))}
      </section>

      {/* Features */}
      <section className="landing__features">
        <h2 className="landing__section-title">Surveillance multi-dimensionnelle</h2>
        <p className="landing__section-desc">Un tableau de bord unique pour anticiper, comprendre et réagir.</p>
        <div className="landing__features-grid">
          {FEATURES.map((f) => (
            <div key={f.title} className="landing__feature-card">
              <div className="landing__feature-icon">
                <f.icon size={24} />
              </div>
              <h3 className="landing__feature-title">{f.title}</h3>
              <p className="landing__feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PWA */}
      <section className="landing__pwa">
        <div className="landing__pwa-content">
          <h2 className="landing__section-title">Installable comme une app native</h2>
          <p className="landing__section-desc">
            LYNX est une Progressive Web App. Ajoutez-la à votre écran d'accueil pour un accès instantané, même hors-ligne.
          </p>
          <div className="landing__pwa-features">
            <div className="landing__pwa-item">
              <Smartphone size={20} />
              <span>Widget Android</span>
            </div>
            <div className="landing__pwa-item">
              <Wifi size={20} />
              <span>Fonctionne hors-ligne</span>
            </div>
            <div className="landing__pwa-item">
              <Monitor size={20} />
              <span>Desktop & Mobile</span>
            </div>
            <div className="landing__pwa-item">
              <Lock size={20} />
              <span>HTTPS sécurisé</span>
            </div>
          </div>
          <div className="landing__pwa-install">
            <InstallPrompt />
          </div>
        </div>
      </section>

      {/* Ecosystem */}
      <section className="landing__ecosystem">
        <h2 className="landing__section-title">Un écosystème complet de résilience</h2>
        <p className="landing__section-desc">
          LYNX s'intègre à nos autres applications pour une préparation à 360°.
        </p>
        <div className="landing__eco-grid">
          {ecoApps.map((app) => (
            <a
              key={app.id}
              href={getAppUrl(app)}
              target="_blank"
              rel="noopener noreferrer"
              className="landing__eco-card"
              style={{ borderColor: app.color }}
            >
              <span className="landing__eco-emoji">{app.emoji}</span>
              <h4 className="landing__eco-name">{app.name}</h4>
              <p className="landing__eco-desc">{app.description}</p>
              <ChevronRight size={16} className="landing__eco-arrow" style={{ color: app.color }} />
            </a>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="landing__cta">
        <h2 className="landing__cta-title">Prêt à voir au-delà ?</h2>
        <p className="landing__cta-desc">
          Rejoignez LYNX et gardez une longueur d'avance sur les événements mondiaux.
        </p>
        <Link to={isAuthenticated ? '/dashboard' : '/register'} className="landing__btn landing__btn--primary landing__btn--lg">
          {isAuthenticated ? 'Accéder au Dashboard' : 'Commencer gratuitement'}
          <ArrowRight size={20} />
        </Link>
      </section>

      {/* Footer */}
      <footer className="landing__footer">
        <div className="landing__footer-inner">
          <div className="landing__footer-brand">
            <span>🐆 LYNX</span>
            <p>Voyez ce que les autres ne voient pas</p>
          </div>
          <div className="landing__footer-links">
            <Link to="/discover">Découvrir</Link>
            <Link to="/pricing">Tarifs</Link>
            <Link to="/login">Connexion</Link>
          </div>
          <p className="landing__footer-copy">© 2026 La Caverne du Réfractaire – Tous droits réservés</p>
        </div>
      </footer>
    </div>
  );
}
