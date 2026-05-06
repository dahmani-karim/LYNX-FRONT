import { Link } from 'react-router-dom';
import {
  Shield, Info, BookOpen, FileText, Lock, Scale, ArrowLeft,
  MapPin, Bell, Eye, BarChart3, Clock, Zap, Map, Fuel, Settings
} from 'lucide-react';
import LynxLogo from '../../components/LynxLogo/LynxLogo';
import './About.scss';

const GUIDE_SECTIONS = [
  {
    icon: BarChart3,
    title: 'Dashboard',
    desc: 'Vue d\'ensemble de tous les risques. Chaque module affiche les alertes actives avec un code couleur par sévérité. Le score de risque composite (0-100) est calculé en temps réel à partir de toutes les sources.',
  },
  {
    icon: Map,
    title: 'Carte interactive',
    desc: 'Visualisez les alertes géolocalisées sur une carte plein écran. Utilisez le switch Alertes/Tracking pour basculer entre la vue alertes et le suivi du trafic aérien, maritime et satellitaire en temps réel.',
  },
  {
    icon: Bell,
    title: 'Alertes',
    desc: 'Filtrez les alertes par catégorie, sévérité et période. Les utilisateurs Premium accèdent aux filtres étendus (7 jours, 30 jours, tout l\'historique).',
  },
  {
    icon: Clock,
    title: 'Chronologie',
    desc: 'Suivez l\'évolution des événements dans le temps. Accessible depuis la page Alertes (onglet Timeline). Les Premium accèdent à l\'historique complet et aux analyses de tendances.',
  },
  {
    icon: Fuel,
    title: 'Énergie & Carburants',
    desc: 'Consultez les prix des carburants et de l\'énergie en France avec fourchettes MIN-MAX, tendances et sources officielles.',
  },
  {
    icon: Eye,
    title: 'Zones surveillées',
    desc: 'Définissez des zones de surveillance géographiques dans les Réglages. Les alertes seront filtrées par proximité avec vos zones.',
  },
  {
    icon: MapPin,
    title: 'Géolocalisation',
    desc: 'LYNX utilise votre position pour calculer la distance aux événements et prioriser les alertes proches. Configurable dans les Réglages.',
  },
  {
    icon: Settings,
    title: 'Réglages',
    desc: 'Configurez votre localisation, vos zones de surveillance, les notifications push et le seuil minimum de sévérité.',
  },
  {
    icon: Eye,
    title: 'Mode veille',
    desc: 'Activez le mode veille via le bouton lune dans le header pour assombrir l\'écran. Un tap sur l\'écran le réactive temporairement. Idéal pour surveiller LYNX de nuit sans éblouissement.',
  },
];

export default function About() {
  return (
    <div className="about">
      {/* <nav className="about__nav">
        <div className="about__nav-inner">
          <Link to="/settings" className="about__back">
            <ArrowLeft size={18} />
            Retour
          </Link>
          <LynxLogo size={28} />
        </div>
      </nav> */}

      {/* About / Version */}
      <section className="about__section">
        <div className="about__section-header">
          <Info size={18} />
          <h2>À propos</h2>
        </div>
        <div className="about__card">
          <p><strong>LYNX</strong> — Voyez ce que les autres ne voient pas</p>
          <p>Version 1.3.0</p>
          <p>Plateforme OSINT d'anticipation & d'alertes multi-risques en temps réel.</p>
          <div className="about__sources">
            <p className="about__sources-label">Sources de données :</p>
            <div className="about__sources-tags">
              {['USGS', 'Open-Meteo', 'GDACS', 'CERT-FR', 'ZATAZ', 'ODRÉ', 'Ecogaz', 'NASA FIRMS', 'NOAA SWPC', 'OpenSky', 'N2YO', 'Digitraffic', 'BfS', 'Disease.sh', 'data.gouv.fr', 'CRE', 'ReliefWeb', 'GDELT'].map((src) => (
                <span key={src} className="about__source-tag">{src}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* User Guide */}
      <section className="about__section">
        <div className="about__section-header">
          <BookOpen size={18} />
          <h2>Guide d'utilisation</h2>
        </div>
        <div className="about__guide">
          {GUIDE_SECTIONS.map((s) => (
            <div key={s.title} className="about__guide-item">
              <div className="about__guide-icon">
                <s.icon size={18} />
              </div>
              <div>
                <h4>{s.title}</h4>
                <p>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Mentions légales */}
      <section className="about__section">
        <div className="about__section-header">
          <Scale size={18} />
          <h2>Mentions légales</h2>
        </div>
        <div className="about__card about__legal">
          <h4>Éditeur</h4>
          <p>La Caverne du Réfractaire</p>
          <p>Contact : via le formulaire disponible sur <a href="https://lacavernedurefractaire.fr" target="_blank" rel="noopener noreferrer">lacavernedurefractaire.fr</a></p>

          <h4>Hébergement</h4>
          <p>Application front-end hébergée sur GitHub Pages (GitHub, Inc. — San Francisco, CA, USA).</p>
          <p>API hébergée sur Render (Render Services, Inc. — San Francisco, CA, USA).</p>

          <h4>Propriété intellectuelle</h4>
          <p>L'ensemble du contenu de LYNX (textes, design, code, logos) est la propriété de La Caverne du Réfractaire. Toute reproduction est interdite sans autorisation préalable.</p>
          <p>Les données affichées proviennent de sources publiques tierces (USGS, GDACS, CERT-FR, etc.) et restent la propriété de leurs éditeurs respectifs.</p>
        </div>
      </section>

      {/* CGU */}
      <section className="about__section">
        <div className="about__section-header">
          <FileText size={18} />
          <h2>Conditions Générales d'Utilisation (CGU)</h2>
        </div>
        <div className="about__card about__legal">
          <h4>1. Objet</h4>
          <p>Les présentes CGU régissent l'accès et l'utilisation de la plateforme LYNX. En créant un compte, vous acceptez ces conditions sans réserve.</p>

          <h4>2. Accès au service</h4>
          <p>LYNX est accessible gratuitement avec des fonctionnalités limitées. L'accès Premium est conditionné à un abonnement via Fourthwall ou à un statut VIP accordé manuellement par l'éditeur.</p>

          <h4>3. Responsabilité</h4>
          <p>LYNX fournit des informations à titre indicatif uniquement. Cette application ne se substitue en aucun cas aux autorités officielles, services d'urgence ou organismes compétents. En cas de danger immédiat, contactez le <strong>112</strong> (urgences européennes) ou le <strong>114</strong> (urgences par SMS).</p>
          <p>Les données proviennent de sources publiques et peuvent être incomplètes, retardées ou erronées. Aucune garantie n'est apportée quant à l'exactitude, l'exhaustivité ou la fiabilité des alertes.</p>

          <h4>4. Compte utilisateur</h4>
          <p>L'utilisateur est responsable de la confidentialité de ses identifiants. Tout accès réalisé avec ses identifiants est réputé fait par lui.</p>

          <h4>5. Comportement</h4>
          <p>Il est interdit d'utiliser LYNX à des fins illégales, de tenter de contourner les mécanismes de sécurité, d'accéder de manière automatisée aux données sans autorisation, ou de revendre les données collectées.</p>

          <h4>6. Modification des CGU</h4>
          <p>L'éditeur se réserve le droit de modifier les présentes CGU à tout moment. Les utilisateurs seront informés de toute modification substantielle.</p>
        </div>
      </section>

      {/* CGV */}
      <section className="about__section">
        <div className="about__section-header">
          <FileText size={18} />
          <h2>Conditions Générales de Vente (CGV)</h2>
        </div>
        <div className="about__card about__legal">
          <h4>1. Offres</h4>
          <p>LYNX propose un accès gratuit (fonctionnalités de base) et un accès Premium (fonctionnalités avancées). Les tarifs sont consultables sur la page Tarifs.</p>

          <h4>2. Paiement</h4>
          <p>Les paiements sont gérés par la plateforme Fourthwall. Aucune donnée bancaire n'est stockée par LYNX ou La Caverne du Réfractaire.</p>

          <h4>3. Abonnement</h4>
          <p>L'abonnement Premium est mensuel et renouvelable. Il peut être résilié à tout moment depuis votre espace Fourthwall. La résiliation prend effet à la fin de la période en cours.</p>

          <h4>4. Droit de rétractation</h4>
          <p>Conformément à l'article L221-28 du Code de la consommation, le droit de rétractation ne s'applique pas aux contenus numériques fournis immédiatement après l'achat avec le consentement exprès du consommateur.</p>
        </div>
      </section>

      {/* RGPD */}
      <section className="about__section">
        <div className="about__section-header">
          <Lock size={18} />
          <h2>Politique de confidentialité (RGPD)</h2>
        </div>
        <div className="about__card about__legal">
          <h4>1. Données collectées</h4>
          <p>LYNX collecte les données suivantes lors de l'inscription : adresse e-mail, nom d'utilisateur. Ces données sont nécessaires à la création et la gestion de votre compte.</p>
          <p>La géolocalisation est optionnelle et traitée localement sur votre appareil (localStorage). Elle n'est pas transmise à nos serveurs.</p>

          <h4>2. Finalité du traitement</h4>
          <p>Les données sont utilisées exclusivement pour : la gestion de compte, l'authentification, la vérification du statut Premium, et l'envoi de notifications d'alertes si activé.</p>

          <h4>3. Base légale</h4>
          <p>Le traitement est fondé sur le consentement (article 6.1.a du RGPD) et l'exécution du contrat (article 6.1.b).</p>

          <h4>4. Durée de conservation</h4>
          <p>Les données sont conservées pendant la durée d'utilisation du service. À la suppression du compte, les données sont effacées dans un délai de 30 jours.</p>

          <h4>5. Sous-traitants</h4>
          <p>Hébergement API : Render (USA, conforme aux clauses contractuelles types EU-US). Hébergement front-end : GitHub Pages (USA). Paiements : Fourthwall (USA).</p>

          <h4>6. Vos droits</h4>
          <p>Conformément au RGPD, vous disposez des droits suivants : accès, rectification, suppression, portabilité, opposition et limitation du traitement. Pour exercer ces droits, contactez-nous via <a href="https://lacavernedurefractaire.fr" target="_blank" rel="noopener noreferrer">lacavernedurefractaire.fr</a>.</p>

          <h4>7. Cookies</h4>
          <p>LYNX n'utilise pas de cookies tiers ni de trackers publicitaires. Seul le localStorage du navigateur est utilisé pour stocker vos préférences et votre session d'authentification.</p>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="about__section">
        <div className="about__disclaimer">
          <Shield size={18} />
          <div>
            <p className="about__disclaimer-title">Avertissement</p>
            <p>
              LYNX fournit des informations à titre indicatif uniquement. En cas de danger immédiat,
              contactez le <strong>112</strong> (urgences européennes) ou le <strong>114</strong> (urgences par SMS).
              Les données proviennent de sources publiques et peuvent être incomplètes ou retardées.
            </p>
          </div>
        </div>
      </section>

      <p className="about__copyright">© 2026 La Caverne du Réfractaire — Tous droits réservés</p>
    </div>
  );
}
