import { Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import {
  Activity, CloudLightning, Globe, Shield, Zap, Swords,
  Wifi, Heart, Users, Fuel, ArrowRight, MapPin, Clock, Filter
} from 'lucide-react';
import { CATEGORIES } from '../../config/categories';
import './Discover.scss';

const MODULES = [
  {
    id: 'earthquake',
    icon: Activity,
    color: '#EF4444',
    title: 'Séismes',
    source: 'USGS',
    desc: 'Surveillance mondiale des tremblements de terre en temps réel. Magnitude, profondeur, localisation et alerte tsunami.',
    features: ['Séismes M4+ mondiaux', 'Alerte tsunami', 'Historique 30 jours', 'Distance du point d\'impact'],
  },
  {
    id: 'weather',
    icon: CloudLightning,
    color: '#3B82F6',
    title: 'Météo extrême',
    source: 'Open-Meteo',
    desc: 'Détection automatique des événements météorologiques dangereux : canicule, tempête, précipitations extrêmes, UV critiques.',
    features: ['Vent > 100 km/h', 'Température > 40°C', 'Précipitations > 50mm', 'Index UV > 10'],
  },
  {
    id: 'disaster',
    icon: Globe,
    color: '#F59E0B',
    title: 'Catastrophes naturelles',
    source: 'GDACS',
    desc: 'Alertes du Global Disaster Alert and Coordination System : inondations, cyclones, éruptions volcaniques, sécheresses.',
    features: ['Alertes et signaux d\'urgence', 'Couverture mondiale', 'Niveau d\'alerte officiel', 'Zone d\'impact estimée'],
  },
  {
    id: 'conflict',
    icon: Swords,
    color: '#DC2626',
    title: 'Conflits internationaux',
    source: 'ReliefWeb (UN OCHA)',
    desc: 'Suivi des crises et conflits armés dans le monde. Analyse des répercussions potentielles sur votre quotidien : énergie, alimentation, cyber, flux migratoires.',
    features: ['Crises actives mondiales', 'Analyse d\'impact local', 'Chaîne alimentaire', 'Tensions énergétiques'],
  },
  {
    id: 'cyber',
    icon: Shield,
    color: '#8B5CF6',
    title: 'Cybersécurité',
    source: 'CERT-FR',
    desc: 'Alertes de l\'Agence nationale de la sécurité des systèmes d\'information. CVE critiques, campagnes de phishing, vulnérabilités zero-day.',
    features: ['Alertes CERT-FR', 'CVE critiques', 'Vulnérabilités actives', 'Recommandations'],
  },
  {
    id: 'energy',
    icon: Zap,
    color: '#F97316',
    title: 'Énergie',
    source: 'ODRÉ / Ecogaz',
    desc: 'Surveillance du réseau énergétique français : signal Ecogaz, tensions d\'approvisionnement, production nucléaire.',
    features: ['Signal Ecogaz quotidien', 'Alerte tension réseau', 'Production nucléaire', 'Prévision consommation'],
  },
  {
    id: 'blackout',
    icon: Wifi,
    color: '#6366F1',
    title: 'Pannes & Services',
    source: 'Status Pages',
    desc: 'Monitoring des grandes plateformes : GitHub, Cloudflare et services critiques. Détection des incidents majeurs.',
    features: ['GitHub Status', 'Cloudflare Status', 'Détection pannes', 'Historique incidents'],
  },
];

export default function Discover() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return (
    <div className="discover">
      {/* Back nav */}
      <nav className="discover__nav">
        <div className="discover__nav-inner">
          <Link to="/" className="discover__back">
            <span>🐆</span> LYNX
          </Link>
          {isAuthenticated ? (
            <Link to="/dashboard" className="discover__nav-cta">Dashboard</Link>
          ) : (
            <Link to="/register" className="discover__nav-cta">Commencer</Link>
          )}
        </div>
      </nav>

      {/* Header */}
      <header className="discover__header">
        <h1 className="discover__title">Modules de surveillance</h1>
        <p className="discover__desc">
          Chaque module est une source de données indépendante. LYNX les agrège, les analyse
          et calcule un score de risque composite en temps réel.
        </p>
        <div className="discover__meta">
          <div className="discover__meta-item">
            <MapPin size={16} />
            <span>Couverture mondiale</span>
          </div>
          <div className="discover__meta-item">
            <Clock size={16} />
            <span>Rafraîchissement 5 min</span>
          </div>
          <div className="discover__meta-item">
            <Filter size={16} />
            <span>Filtres avancés</span>
          </div>
        </div>
      </header>

      {/* Modules */}
      <section className="discover__modules">
        {MODULES.map((mod) => (
          <article key={mod.id} className="discover__module" style={{ borderLeftColor: mod.color }}>
            <div className="discover__module-header">
              <div className="discover__module-icon" style={{ backgroundColor: `${mod.color}20` }}>
                <mod.icon size={24} style={{ color: mod.color }} />
              </div>
              <div>
                <h2 className="discover__module-title">{mod.title}</h2>
                <span className="discover__module-source">Source : {mod.source}</span>
              </div>
            </div>
            <p className="discover__module-desc">{mod.desc}</p>
            <ul className="discover__module-features">
              {mod.features.map((f) => (
                <li key={f} className="discover__module-feature">
                  <span className="discover__module-dot" style={{ backgroundColor: mod.color }} />
                  {f}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      {/* CTA */}
      <section className="discover__cta">
        <h2 className="discover__cta-title">Explorez vos données en temps réel</h2>
        <Link
          to={isAuthenticated ? '/dashboard' : '/register'}
          className="discover__cta-btn"
        >
          {isAuthenticated ? 'Aller au Dashboard' : 'Créer un compte gratuit'}
          <ArrowRight size={18} />
        </Link>
      </section>
    </div>
  );
}
