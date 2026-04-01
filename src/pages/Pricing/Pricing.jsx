import { Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { Check, X, ArrowRight, Crown, Zap, Shield } from 'lucide-react';
import './Pricing.scss';

const PLANS = [
  {
    id: 'free',
    name: 'Gratuit',
    price: '0€',
    period: 'pour toujours',
    desc: 'Surveillance de base pour rester informé.',
    icon: Shield,
    cta: 'Commencer',
    features: [
      { text: '6 modules de surveillance', included: true },
      { text: 'Carte interactive', included: true },
      { text: 'Score de risque global', included: true },
      { text: 'Rafraîchissement 5 min', included: true },
      { text: '1 zone surveillée', included: true },
      { text: 'Historique 24h', included: true },
      { text: 'Passerelles écosystème', included: true },
      { text: 'Alertes push', included: false },
      { text: 'Zones illimitées', included: false },
      { text: 'Analyse d\'impact conflits', included: false },
      { text: 'Export de données', included: false },
      { text: 'API access', included: false },
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '4,99€',
    period: '/mois',
    desc: 'Pour les veilleurs exigeants et les préparateurs.',
    icon: Crown,
    cta: 'Passer à Premium',
    popular: true,
    features: [
      { text: 'Tous les modules', included: true },
      { text: 'Carte interactive avancée', included: true },
      { text: 'Score de risque détaillé', included: true },
      { text: 'Rafraîchissement 1 min', included: true },
      { text: 'Zones illimitées', included: true },
      { text: 'Historique 30 jours', included: true },
      { text: 'Passerelles écosystème', included: true },
      { text: 'Alertes push prioritaires', included: true },
      { text: 'Analyse d\'impact conflits', included: true },
      { text: 'Export CSV / PDF', included: true },
      { text: 'Widget Android avancé', included: true },
      { text: 'API access', included: false },
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '14,99€',
    period: '/mois',
    desc: 'Pour les organisations et analystes professionnels.',
    icon: Zap,
    cta: 'Contacter',
    features: [
      { text: 'Tout Premium inclus', included: true },
      { text: 'API REST complète', included: true },
      { text: 'Webhooks personnalisés', included: true },
      { text: 'Rafraîchissement temps réel', included: true },
      { text: 'Multi-utilisateurs', included: true },
      { text: 'Historique illimité', included: true },
      { text: 'Dashboard personnalisable', included: true },
      { text: 'Rapports automatisés', included: true },
      { text: 'Support prioritaire', included: true },
      { text: 'SLA 99.9%', included: true },
      { text: 'Sources custom (SIGINT)', included: true },
      { text: 'On-premise disponible', included: true },
    ],
  },
];

export default function Pricing() {
  const { isAuthenticated, isPremium } = useAuthStore();

  const handleSelectPlan = (planId) => {
    if (planId === 'pro') {
      window.open('mailto:contact@lacavernedurefractaire.fr?subject=LYNX%20Pro', '_blank');
      return;
    }
    // In a real app, this would open a payment flow
  };

  return (
    <div className="pricing">
      {/* Nav */}
      <nav className="pricing__nav">
        <div className="pricing__nav-inner">
          <Link to="/" className="pricing__back">
            <span>🐆</span> LYNX
          </Link>
          {isAuthenticated ? (
            <Link to="/dashboard" className="pricing__nav-cta">Dashboard</Link>
          ) : (
            <Link to="/register" className="pricing__nav-cta">Commencer</Link>
          )}
        </div>
      </nav>

      {/* Header */}
      <header className="pricing__header">
        <h1 className="pricing__title">Choisissez votre niveau de vigilance</h1>
        <p className="pricing__desc">
          Commencez gratuitement. Passez à Premium quand vous avez besoin de plus.
        </p>
      </header>

      {/* Plans */}
      <div className="pricing__grid">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`pricing__plan ${plan.popular ? 'pricing__plan--popular' : ''}`}
          >
            {plan.popular && <div className="pricing__popular-badge">Le plus populaire</div>}

            <div className="pricing__plan-header">
              <plan.icon size={24} className="pricing__plan-icon" />
              <h2 className="pricing__plan-name">{plan.name}</h2>
              <div className="pricing__plan-price">
                <span className="pricing__plan-amount">{plan.price}</span>
                <span className="pricing__plan-period">{plan.period}</span>
              </div>
              <p className="pricing__plan-desc">{plan.desc}</p>
            </div>

            <ul className="pricing__features">
              {plan.features.map((f) => (
                <li
                  key={f.text}
                  className={`pricing__feature ${!f.included ? 'pricing__feature--disabled' : ''}`}
                >
                  {f.included ? (
                    <Check size={16} className="pricing__feature-icon pricing__feature-icon--yes" />
                  ) : (
                    <X size={16} className="pricing__feature-icon pricing__feature-icon--no" />
                  )}
                  <span>{f.text}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleSelectPlan(plan.id)}
              className={`pricing__plan-cta ${plan.popular ? 'pricing__plan-cta--primary' : ''}`}
              disabled={plan.id === 'free' && isAuthenticated}
            >
              {plan.id === 'free' && isAuthenticated ? 'Plan actuel' : plan.cta}
              {plan.id !== 'free' || !isAuthenticated ? <ArrowRight size={16} /> : null}
            </button>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <section className="pricing__faq">
        <h2 className="pricing__faq-title">Questions fréquentes</h2>
        <div className="pricing__faq-grid">
          <div className="pricing__faq-item">
            <h3>Puis-je changer de plan à tout moment ?</h3>
            <p>Oui, vous pouvez passer d'un plan à l'autre à tout moment. Le changement prend effet immédiatement.</p>
          </div>
          <div className="pricing__faq-item">
            <h3>Les données sont-elles fiables ?</h3>
            <p>LYNX utilise uniquement des sources officielles et vérifiées (USGS, GDACS, CERT-FR, ReliefWeb). Les données sont indicatives et ne se substituent pas aux autorités.</p>
          </div>
          <div className="pricing__faq-item">
            <h3>Mes données sont-elles sécurisées ?</h3>
            <p>Vos préférences sont stockées localement sur votre appareil. Aucune donnée personnelle n'est envoyée à des tiers.</p>
          </div>
          <div className="pricing__faq-item">
            <h3>Comment fonctionne le plan Pro ?</h3>
            <p>Le plan Pro est conçu pour les organisations. Contactez-nous pour une démonstration et un devis personnalisé.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="pricing__footer">
        <p>© 2026 La Caverne du Réfractaire – Tous droits réservés</p>
      </footer>
    </div>
  );
}
