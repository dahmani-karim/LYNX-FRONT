import { Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import {
  Activity, CloudLightning, Globe, Shield, Zap, Swords,
  Wifi, Heart, Users, Fuel, ArrowRight, MapPin, Clock, Filter,
  Wind, Flame, Sun, Atom, Radiation, Plane, Ship, Satellite,
  BarChart3, TrendingUp, Bell, Lock, ChevronRight, Monitor, Smartphone
} from 'lucide-react';
import { ECOSYSTEM_APPS, getAppUrl } from '../../config/ecosystem';
import './Discover.scss';
import LynxLogo from '../../components/LynxLogo/LynxLogo';

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
    source: 'ReliefWeb / GDELT',
    desc: 'Suivi des crises et conflits armés dans le monde. Analyse des répercussions sur votre quotidien : énergie, alimentation, cyber.',
    features: ['Crises actives mondiales', 'Analyse d\'impact local', 'Chaîne alimentaire', 'Tensions géopolitiques'],
  },
  {
    id: 'cyber',
    icon: Shield,
    color: '#8B5CF6',
    title: 'Cybersécurité & Fuites de données',
    source: 'CERT-FR / ZATAZ',
    desc: 'Alertes ANSSI, CVE critiques, campagnes de phishing, vulnérabilités zero-day et suivi des fuites de données en France.',
    features: ['Alertes CERT-FR', 'CVE critiques', 'Fuites de données', 'Cyber-attaques France'],
  },
  {
    id: 'energy',
    icon: Zap,
    color: '#F97316',
    title: 'Énergie',
    source: 'ODRÉ / Ecogaz / CRE',
    desc: 'Surveillance du réseau énergétique français : signal Ecogaz, tensions d\'approvisionnement, production nucléaire.',
    features: ['Signal Ecogaz quotidien', 'Production nucléaire', 'Prévision consommation', 'Alerte tension réseau'],
  },
  {
    id: 'fuel',
    icon: Fuel,
    color: '#14B8A6',
    title: 'Prix carburants & énergie',
    source: 'data.gouv.fr / CRE',
    desc: 'Suivi des prix des carburants et de l\'énergie en France avec fourchettes MIN-MAX pour chaque type.',
    features: ['Gazole, SP95, SP98, E85', 'Électricité (tarifs)', 'Gaz naturel', 'Tendances de prix'],
  },
  {
    id: 'fire',
    icon: Flame,
    color: '#EA580C',
    title: 'Incendies',
    source: 'NASA FIRMS / EONET',
    desc: 'Détection des feux de forêt par satellite via NASA FIRMS et le système EONET de la NASA.',
    features: ['Détection satellite', 'Feux actifs mondiaux', 'Alerte zone proche', 'Historique incendies'],
  },
  {
    id: 'air_quality',
    icon: Wind,
    color: '#06B6D4',
    title: 'Qualité de l\'air',
    source: 'Open-Meteo AQ',
    desc: 'Monitoring de la qualité de l\'air : PM2.5, PM10, ozone, NO₂ et index AQI européen.',
    features: ['Index AQI temps réel', 'PM2.5 et PM10', 'Ozone et NO₂', 'Alertes seuils dépassés'],
  },
  {
    id: 'health',
    icon: Heart,
    color: '#10B981',
    title: 'Sanitaire',
    source: 'Disease.sh / OMS / GDELT',
    desc: 'Suivi des épidémies et pandémies mondiales : COVID-19, grippe aviaire, variole du singe et autres pathogènes.',
    features: ['COVID-19 global', 'Épidémies émergentes', 'Vaccination mondiale', 'Alertes sanitaires'],
  },
  {
    id: 'nuclear',
    icon: Atom,
    color: '#FBBF24',
    title: 'Nucléaire',
    source: 'ODRÉ',
    desc: 'Production nette nucléaire française en temps réel et alertes sur les anomalies de production.',
    features: ['Production temps réel', 'Tendances MW', 'Alertes baisse production', 'Historique parc'],
  },
  {
    id: 'radiation',
    icon: Radiation,
    color: '#F59E0B',
    title: 'Radiation',
    source: 'BfS (Allemagne)',
    desc: 'Monitoring des niveaux de radiation ambiante via le réseau ODL du Bundesamt für Strahlenschutz.',
    features: ['Niveaux µSv/h', 'Stations européennes', 'Seuils d\'alerte', 'Historique mesures'],
  },
  {
    id: 'space_weather',
    icon: Sun,
    color: '#D946EF',
    title: 'Météo spatiale',
    source: 'NOAA SWPC',
    desc: 'Alertes tempêtes solaires, éruptions CME, index Kp et impacts potentiels sur les communications.',
    features: ['Tempêtes géomagnétiques', 'Index Kp', 'Éruptions solaires', 'Impact GPS/Radio'],
  },
  {
    id: 'blackout',
    icon: Wifi,
    color: '#6366F1',
    title: 'Pannes & Coupures Internet',
    source: 'Status Pages / IODA',
    desc: 'Monitoring des grandes plateformes et détection des coupures internet nationales via IODA (Georgia Tech). 20 pays surveillés.',
    features: ['GitHub / Cloudflare Status', 'Coupures internet (IODA)', '20 pays monitorés', 'Historique incidents'],
  },
  {
    id: 'social',
    icon: Users,
    color: '#EC4899',
    title: 'Mouvements sociaux',
    source: 'GDELT / ReliefWeb',
    desc: 'Suivi des mouvements sociaux, manifestations et tensions civiles dans le monde et en France.',
    features: ['Protestations mondiales', 'Grèves nationales', 'Analyse de tendances', 'Impact transport'],
  },
  {
    id: 'tracking',
    icon: Plane,
    color: '#3B82F6',
    title: 'Tracking en temps réel',
    source: 'OpenSky / N2YO / Digitraffic',
    desc: 'Suivi en temps réel du trafic aérien, maritime et satellitaire intégré à la carte interactive.',
    features: ['Trafic aérien (OpenSky)', 'Satellites & ISS', 'Navigation maritime', 'Mode temps réel 30s'],
  },
];

const STATS = [
  { value: '18+', label: 'Sources de données' },
  { value: '24/7', label: 'Monitoring continu' },
  { value: '16', label: 'Catégories de risque' },
  { value: '5 min', label: 'Gratuit' },
  { value: '1 min', label: 'Premium' },
  { value: 'Temps réel', label: 'Pro' },
];

export default function Discover() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const ecoApps = ECOSYSTEM_APPS.filter((a) => !a.current);

  return (
    <div className="discover">
      {/* Back nav */}
      <nav className="discover__nav">
        <div className="discover__nav-inner">
          <Link to="/" className="discover__back">
            <LynxLogo size={38} />
            {/* <span>LYNX</span> */}
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
        <h1 className="discover__title">Découvrir LYNX</h1>
        <p className="discover__desc">
          Plateforme OSINT d'anticipation multi-risques. Chaque module est une source de données
          indépendante que LYNX agrège, analyse et transforme en score de risque composite en temps réel.
        </p>
      </header>

      {/* Stats */}
      <section className="discover__stats">
        {STATS.map((s) => (
          <div key={s.label} className="discover__stat">
            <p className="discover__stat-value">{s.value}</p>
            <p className="discover__stat-label">{s.label}</p>
          </div>
        ))}
      </section>

      {/* Features overview */}
      <section className="discover__features">
        <div className="discover__feature-item">
          <BarChart3 size={20} />
          <div>
            <h4>Score de risque composite</h4>
            <p>Algorithme multi-facteurs combinant gravité, volume et tendances pour un score global de 0 à 100.</p>
          </div>
        </div>
        <div className="discover__feature-item">
          <TrendingUp size={20} />
          <div>
            <h4>Analyse prédictive</h4>
            <p>Détection de tendances et corrélations entre les sources pour anticiper les escalades.</p>
          </div>
        </div>
        <div className="discover__feature-item">
          <MapPin size={20} />
          <div>
            <h4>Géofencing personnalisé</h4>
            <p>Définissez vos zones de surveillance et recevez des alertes ciblées dans vos périmètres.</p>
          </div>
        </div>
        <div className="discover__feature-item">
          <Bell size={20} />
          <div>
            <h4>Alertes en temps réel</h4>
            <p>Notifications push pour les événements critiques dans vos zones surveillées.</p>
          </div>
        </div>
        <div className="discover__feature-item">
          <Globe size={20} />
          <div>
            <h4>Dossier pays & choropleth</h4>
            <p>Carte mondiale des niveaux de risque par pays avec dossier détaillé par nation.</p>
          </div>
        </div>
        <div className="discover__feature-item">
          <Satellite size={20} />
          <div>
            <h4>Imagerie satellite NASA</h4>
            <p>Couches NASA GIBS et terminateur jour/nuit en temps réel sur la carte interactive.</p>
          </div>
        </div>
        <div className="discover__feature-item">
          <Filter size={20} />
          <div>
            <h4>Triage FLASH / PRIORITY</h4>
            <p>Classification automatique des alertes par urgence grâce au Delta Engine.</p>
          </div>
        </div>
        <div className="discover__feature-item">
          <Monitor size={20} />
          <div>
            <h4>News Ticker & Delta</h4>
            <p>Bandeau d'actualité défilant et panneau de variation des alertes en temps réel.</p>
          </div>
        </div>
      </section>

      {/* Modules */}
      <section className="discover__modules-section">
        <h2 className="discover__section-title">
          {MODULES.length} modules de surveillance
        </h2>
        <div className="discover__modules">
          {MODULES.map((mod) => (
            <article key={mod.id} className="discover__module" style={{ borderLeftColor: mod.color }}>
              <div className="discover__module-header">
                <div className="discover__module-icon" style={{ backgroundColor: `${mod.color}20` }}>
                  <mod.icon size={24} style={{ color: mod.color }} />
                </div>
                <div>
                  <h3 className="discover__module-title">{mod.title}</h3>
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
        </div>
      </section>

      {/* Premium features */}
      <section className="discover__premium">
        <h2 className="discover__section-title">
          <Lock size={18} />
          Fonctionnalités Premium
        </h2>
        <div className="discover__premium-grid">
          <div className="discover__premium-item">
            <span>📊</span>
            <h4>Export PDF & RSS</h4>
            <p>Exportez vos rapports et créez des flux RSS personnalisés.</p>
          </div>
          <div className="discover__premium-item">
            <span>🗺️</span>
            <h4>Heatmap avancée</h4>
            <p>Visualisation thermique des zones à risque sur la carte.</p>
          </div>
          <div className="discover__premium-item">
            <span>🔮</span>
            <h4>Tendances prédictives</h4>
            <p>Analyse de corrélations et prédictions d'escalade.</p>
          </div>
          <div className="discover__premium-item">
            <span>📅</span>
            <h4>Historique 30 jours</h4>
            <p>Accès à la chronologie complète et aux filtres étendus.</p>
          </div>
        </div>
      </section>

      {/* PWA */}
      <section className="discover__pwa">
        <h2 className="discover__section-title">Application installable</h2>
        <p className="discover__desc">
          LYNX est une Progressive Web App. Ajoutez-la à votre écran d'accueil pour un accès instantané.
        </p>
        <div className="discover__pwa-grid">
          <div className="discover__pwa-item">
            <Smartphone size={20} />
            <span>Mobile & Tablette</span>
          </div>
          <div className="discover__pwa-item">
            <Monitor size={20} />
            <span>Desktop</span>
          </div>
          <div className="discover__pwa-item">
            <Wifi size={20} />
            <span>Hors-ligne</span>
          </div>
          <div className="discover__pwa-item">
            <Lock size={20} />
            <span>HTTPS sécurisé</span>
          </div>
        </div>
      </section>

      {/* Ecosystem */}
      <section className="discover__ecosystem">
        <h2 className="discover__section-title">Écosystème de résilience</h2>
        <p className="discover__desc">
          LYNX s'intègre à nos autres applications pour une préparation à 360°.
        </p>
        <div className="discover__eco-grid">
          {ecoApps.map((app) => (
            <a
              key={app.id}
              href={getAppUrl(app)}
              target="_blank"
              rel="noopener noreferrer"
              className="discover__eco-card"
              style={{ borderColor: app.color }}
            >
              <span className="discover__eco-emoji">{app.emoji}</span>
              <div>
                <h4 className="discover__eco-name">{app.name}</h4>
                <p className="discover__eco-desc">{app.description}</p>
              </div>
              <ChevronRight size={16} style={{ color: app.color }} />
            </a>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="discover__cta">
        <h2 className="discover__cta-title">Prêt à voir au-delà ?</h2>
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
