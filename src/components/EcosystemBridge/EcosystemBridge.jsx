import { ArrowRight } from 'lucide-react';
import { getAppUrl, ECOSYSTEM_APPS } from '../../config/ecosystem';
import './EcosystemBridge.scss';

const BRIDGE_RULES = [
  // Priorité absolue : toute alerte critique → checklist PRÊT·E
  {
    triggerCategories: ['earthquake', 'disaster', 'health', 'nuclear', 'social', 'conflict', 'cyber', 'weather', 'energy', 'fuel', 'radiation', 'space_weather'],
    triggerMinSeverity: 'critical',
    appId: 'prete',
    message: 'Alerte critique active — Vérifiez votre checklist d\'urgence',
    cta: 'Ouvrir PRÊT·E',
    highlight: true,
  },
  {
    triggerCategories: ['earthquake', 'disaster'],
    triggerMinSeverity: 'high',
    appId: 'prete',
    message: 'Évaluez votre préparation aux catastrophes',
    cta: 'Ouvrir PRÊT·E',
  },
  {
    triggerCategories: ['fuel', 'social'],
    triggerMinSeverity: 'medium',
    appId: 'smartcellar',
    message: 'Vérifiez vos stocks en cas de pénurie',
    cta: 'Ouvrir SmartCellar',
  },
  {
    triggerCategories: ['weather'],
    triggerMinSeverity: 'medium',
    appId: 'progarden',
    message: 'Protégez vos cultures des intempéries',
    cta: 'Ouvrir ProGarden',
  },
  {
    triggerCategories: ['energy', 'blackout'],
    triggerMinSeverity: 'medium',
    appId: 'smartcellar',
    message: 'Assurez-vous d\'avoir des réserves suffisantes',
    cta: 'Ouvrir SmartCellar',
  },
  {
    triggerCategories: ['weather', 'disaster'],
    triggerMinSeverity: 'medium',
    appId: 'farmly',
    message: 'Vos animaux sont-ils en sécurité ?',
    cta: 'Ouvrir Farmly',
  },
];

const SEVERITY_ORDER = ['info', 'low', 'medium', 'high', 'critical'];

export default function EcosystemBridge({ events }) {
  const activeBridges = [];
  const shown = new Set();

  BRIDGE_RULES.forEach((rule) => {
    if (shown.has(rule.appId)) return;

    const minIdx = SEVERITY_ORDER.indexOf(rule.triggerMinSeverity);
    const hasMatch = events.some(
      (e) =>
        rule.triggerCategories.includes(e.type) &&
        SEVERITY_ORDER.indexOf(e.severity) >= minIdx
    );

    if (hasMatch) {
      const app = ECOSYSTEM_APPS.find((a) => a.id === rule.appId);
      if (app) {
        activeBridges.push({ ...rule, app });
        shown.add(rule.appId);
      }
    }
  });

  if (!activeBridges.length) return null;

  return (
    <div className="eco-bridge">
      <h3 className="eco-bridge__title">Recommandations écosystème</h3>
      {activeBridges.map((bridge) => (
        <a
          key={bridge.appId}
          href={getAppUrl(bridge.app)}
          target="_blank"
          rel="noopener noreferrer"
          className={`eco-bridge__card${bridge.highlight ? ' eco-bridge__card--highlight' : ''}`}
          style={{ borderLeftColor: bridge.app.color }}
        >
          <span className="eco-bridge__emoji">{bridge.app.emoji}</span>
          <div className="eco-bridge__body">
            <p className="eco-bridge__message">{bridge.message}</p>
            <p className="eco-bridge__app-name">{bridge.app.name}</p>
          </div>
          <ArrowRight size={16} className="eco-bridge__arrow" />
        </a>
      ))}
    </div>
  );
}
