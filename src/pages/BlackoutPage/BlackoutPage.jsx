import { useMemo, useState } from 'react';
import { useAlertStore } from '../../stores/alertStore';
import { SERVICE_CATEGORIES } from '../../services/status';
import { timeAgo } from '../../utils/date';
import {
  Wifi, WifiOff, Cloud, Globe, MessageCircle, Server,
  CheckCircle, AlertTriangle, XCircle, HelpCircle, ExternalLink, ShieldAlert,
  CreditCard, Wrench, Truck, Heart, ChevronDown, ChevronUp
} from 'lucide-react';
import './BlackoutPage.scss';

const STATUS_CONFIG = {
  operational: { label: 'Opérationnel', color: 'success', Icon: CheckCircle },
  minor: { label: 'Incident mineur', color: 'warning', Icon: AlertTriangle },
  major: { label: 'Panne majeure', color: 'danger', Icon: XCircle },
  critical: { label: 'Panne critique', color: 'critical', Icon: XCircle },
  unreachable: { label: 'Inaccessible', color: 'danger', Icon: WifiOff },
  unknown: { label: 'Inconnu', color: 'dim', Icon: HelpCircle },
};

const CATEGORY_ICONS = {
  finance: CreditCard,
  cloud: Cloud,
  communication: MessageCircle,
  tools: Wrench,
  logistics: Truck,
  health: Heart,
  platforms: Globe,
  internet: Globe,
  default: Server,
};

// 20 countries monitored by IODA
const IODA_COUNTRIES = [
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'DE', name: 'Allemagne', flag: '🇩🇪' },
  { code: 'GB', name: 'Royaume-Uni', flag: '🇬🇧' },
  { code: 'US', name: 'États-Unis', flag: '🇺🇸' },
  { code: 'CN', name: 'Chine', flag: '🇨🇳' },
  { code: 'RU', name: 'Russie', flag: '🇷🇺' },
  { code: 'UA', name: 'Ukraine', flag: '🇺🇦' },
  { code: 'IR', name: 'Iran', flag: '🇮🇷' },
  { code: 'TR', name: 'Turquie', flag: '🇹🇷' },
  { code: 'SY', name: 'Syrie', flag: '🇸🇾' },
  { code: 'IL', name: 'Israël', flag: '🇮🇱' },
  { code: 'IN', name: 'Inde', flag: '🇮🇳' },
  { code: 'BR', name: 'Brésil', flag: '🇧🇷' },
  { code: 'EG', name: 'Égypte', flag: '🇪🇬' },
  { code: 'SD', name: 'Soudan', flag: '🇸🇩' },
  { code: 'MM', name: 'Myanmar', flag: '🇲🇲' },
  { code: 'VE', name: 'Venezuela', flag: '🇻🇪' },
  { code: 'PK', name: 'Pakistan', flag: '🇵🇰' },
  { code: 'BD', name: 'Bangladesh', flag: '🇧🇩' },
  { code: 'ET', name: 'Éthiopie', flag: '🇪🇹' },
];

function getStatusConfig(status) {
  return STATUS_CONFIG[status] || STATUS_CONFIG.unknown;
}

function severityRank(sev) {
  return { info: 0, low: 1, medium: 2, high: 3, critical: 4 }[sev] || 0;
}

function getSeverityColor(sev) {
  return { critical: 'critical', high: 'danger', medium: 'warning', low: 'success' }[sev] || 'success';
}

export default function BlackoutPage() {
  const serviceStatuses = useAlertStore((s) => s.serviceStatuses);
  const events = useAlertStore((s) => s.events);
  const lastFetch = useAlertStore((s) => s.lastFetch);
  const [collapsedCats, setCollapsedCats] = useState(new Set());

  const toggleCategory = (cat) => {
    setCollapsedCats((prev) => {
      const n = new Set(prev);
      if (n.has(cat)) n.delete(cat);
      else n.add(cat);
      return n;
    });
  };

  // Blackout-type alerts (service outages that generate actual alert events)
  const blackoutAlerts = events.filter((e) => e.type === 'blackout');

  // Separate IODA alerts from service status alerts
  const iodaAlerts = useMemo(() => blackoutAlerts.filter((e) => e.sourceName === 'IODA'), [blackoutAlerts]);
  const serviceAlerts = useMemo(() => blackoutAlerts.filter((e) => e.sourceName !== 'IODA'), [blackoutAlerts]);

  // Build country status map from IODA alerts
  const countryStatus = useMemo(() => {
    const map = {};
    for (const alert of iodaAlerts) {
      const existing = map[alert.country];
      if (!existing || severityRank(alert.severity) > severityRank(existing.severity)) {
        map[alert.country] = alert;
      }
    }
    return map;
  }, [iodaAlerts]);

  const operational = serviceStatuses.filter((s) => s.status === 'operational');
  const degraded = serviceStatuses.filter((s) => s.status !== 'operational' && s.status !== 'unknown');
  const unknown = serviceStatuses.filter((s) => s.status === 'unknown');

  // Group services by category — sorted by SERVICE_CATEGORIES order
  const groupedServices = useMemo(() => {
    const groups = {};
    for (const svc of serviceStatuses) {
      const cat = svc.category || 'cloud';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(svc);
    }
    return Object.entries(groups)
      .sort(([a], [b]) => (SERVICE_CATEGORIES[a]?.order || 99) - (SERVICE_CATEGORIES[b]?.order || 99));
  }, [serviceStatuses]);

  const overallStatus = degraded.some((s) => s.status === 'critical' || s.status === 'major')
    ? 'critical'
    : degraded.length > 0
      ? 'degraded'
      : unknown.length === serviceStatuses.length
        ? 'unknown'
        : 'ok';

  return (
    <div className="blackout-page">
      <div className="blackout-page__header">
        <div className="blackout-page__header-icon">
          <ShieldAlert size={24} />
        </div>
        <div>
          <h1 className="blackout-page__title">Blackout Watcher</h1>
          <p className="blackout-page__subtitle">Surveillance des services critiques</p>
        </div>
      </div>

      {/* Global status banner */}
      <div className={`blackout-page__banner blackout-page__banner--${overallStatus}`}>
        {overallStatus === 'ok' && (
          <>
            <CheckCircle size={20} />
            <div>
              <p className="blackout-page__banner-title">Tous les services sont opérationnels</p>
              <p className="blackout-page__banner-sub">{serviceStatuses.length} services surveillés</p>
            </div>
          </>
        )}
        {overallStatus === 'degraded' && (
          <>
            <AlertTriangle size={20} />
            <div>
              <p className="blackout-page__banner-title">{degraded.length} service{degraded.length > 1 ? 's' : ''} dégradé{degraded.length > 1 ? 's' : ''}</p>
              <p className="blackout-page__banner-sub">{operational.length}/{serviceStatuses.length} opérationnels</p>
            </div>
          </>
        )}
        {overallStatus === 'critical' && (
          <>
            <XCircle size={20} />
            <div>
              <p className="blackout-page__banner-title">Panne majeure détectée</p>
              <p className="blackout-page__banner-sub">{degraded.length} service{degraded.length > 1 ? 's' : ''} affecté{degraded.length > 1 ? 's' : ''}</p>
            </div>
          </>
        )}
        {overallStatus === 'unknown' && (
          <>
            <HelpCircle size={20} />
            <div>
              <p className="blackout-page__banner-title">Statut indéterminé</p>
              <p className="blackout-page__banner-sub">Vérification en cours…</p>
            </div>
          </>
        )}
      </div>

      {/* IODA Internet Outages — 20 monitored countries */}
      <section className="blackout-page__ioda">
        <h2 className="blackout-page__section-title">
          <Globe size={16} />
          Coupures Internet — IODA ({IODA_COUNTRIES.length} pays)
        </h2>
        <p className="blackout-page__ioda-desc">
          Surveillance de la connectivité nationale via <a href="https://ioda.inetintel.cc.gatech.edu" target="_blank" rel="noopener noreferrer" className="blackout-page__ioda-link">IODA</a> (Georgia Tech) — BGP, Active Probing, Telescope.
        </p>
        <div className="blackout-page__ioda-grid">
          {IODA_COUNTRIES.map((c) => {
            const alert = countryStatus[c.name];
            const color = alert ? getSeverityColor(alert.severity) : 'success';
            return (
              <a
                key={c.code}
                href={`https://ioda.inetintel.cc.gatech.edu/country/${c.code}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`blackout-page__ioda-card blackout-page__ioda-card--${color}`}
              >
                <span className="blackout-page__ioda-flag">{c.flag}</span>
                <span className="blackout-page__ioda-name">{c.name}</span>
                <span className={`blackout-page__card-dot blackout-page__card-dot--${color}`} />
                {alert && (
                  <span className="blackout-page__ioda-alert">{alert.title.replace(`Coupure internet ${c.name} `, '')}</span>
                )}
              </a>
            );
          })}
        </div>
        {iodaAlerts.length === 0 && (
          <p className="blackout-page__ioda-ok">
            <CheckCircle size={14} /> Aucune perturbation internet détectée sur les {IODA_COUNTRIES.length} pays surveillés
          </p>
        )}
      </section>

      {/* Active IODA incidents */}
      {iodaAlerts.length > 0 && (
        <section className="blackout-page__incidents">
          <h2 className="blackout-page__section-title">
            <WifiOff size={16} />
            Coupures internet en cours ({iodaAlerts.length})
          </h2>
          <div className="blackout-page__incident-list">
            {iodaAlerts.map((alert) => {
              const color = getSeverityColor(alert.severity);
              return (
                <div key={alert.id} className={`blackout-page__incident blackout-page__incident--${color}`}>
                  <WifiOff size={16} />
                  <div className="blackout-page__incident-body">
                    <p className="blackout-page__incident-title">{alert.title}</p>
                    <p className="blackout-page__incident-desc">{alert.description}</p>
                    <p className="blackout-page__incident-time">{timeAgo(alert.eventDate)}</p>
                  </div>
                  {alert.sourceUrl && (
                    <a href={alert.sourceUrl} target="_blank" rel="noopener noreferrer" className="blackout-page__card-link">
                      <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Service incidents */}
      {serviceAlerts.length > 0 && (
        <section className="blackout-page__incidents">
          <h2 className="blackout-page__section-title">
            <AlertTriangle size={16} />
            Incidents services ({serviceAlerts.length})
          </h2>
          <div className="blackout-page__incident-list">
            {serviceAlerts.map((alert) => {
              const cfg = getStatusConfig(alert.serviceInfo?.indicator || 'minor');
              return (
                <div key={alert.id} className={`blackout-page__incident blackout-page__incident--${cfg.color}`}>
                  <cfg.Icon size={16} />
                  <div className="blackout-page__incident-body">
                    <p className="blackout-page__incident-title">{alert.title}</p>
                    <p className="blackout-page__incident-desc">{alert.description}</p>
                    <p className="blackout-page__incident-time">{timeAgo(alert.eventDate)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Service grid — grouped by category */}
      <section className="blackout-page__grid-section">
        <h2 className="blackout-page__section-title">
          <Server size={16} />
          Services surveillés ({serviceStatuses.length})
        </h2>

        {groupedServices.map(([catKey, services]) => {
          const catConfig = SERVICE_CATEGORIES[catKey] || { label: catKey, icon: 'Server' };
          const CatIcon = CATEGORY_ICONS[catKey] || CATEGORY_ICONS.default;
          const isCollapsed = collapsedCats.has(catKey);
          const catDegraded = services.filter((s) => s.status !== 'operational' && s.status !== 'unknown');
          const catOk = services.filter((s) => s.status === 'operational');

          return (
            <div key={catKey} className="blackout-page__cat-group">
              <button
                className="blackout-page__cat-header"
                onClick={() => toggleCategory(catKey)}
              >
                <CatIcon size={16} className="blackout-page__cat-icon" />
                <span className="blackout-page__cat-label">{catConfig.label}</span>
                <span className="blackout-page__cat-count">
                  {catDegraded.length > 0 ? (
                    <span className="blackout-page__cat-badge blackout-page__cat-badge--danger">{catDegraded.length} incident{catDegraded.length > 1 ? 's' : ''}</span>
                  ) : (
                    <span className="blackout-page__cat-badge blackout-page__cat-badge--ok">{catOk.length}/{services.length}</span>
                  )}
                </span>
                {isCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
              </button>

              {!isCollapsed && (
                <div className="blackout-page__grid">
                  {services.map((svc) => {
                    const cfg = getStatusConfig(svc.status === 'unreachable' ? 'major' : svc.status);
                    return (
                      <div key={svc.name} className={`blackout-page__card blackout-page__card--${cfg.color}`}>
                        <div className="blackout-page__card-header">
                          <span className="blackout-page__card-name">{svc.name}</span>
                          <span className={`blackout-page__card-dot blackout-page__card-dot--${cfg.color}`} />
                        </div>
                        <div className="blackout-page__card-status">
                          <cfg.Icon size={14} />
                          <span>{cfg.label}</span>
                        </div>
                        <p className="blackout-page__card-desc">{svc.description}</p>
                        <div className="blackout-page__card-footer">
                          <span className="blackout-page__card-time">
                            {svc.method === 'ping' ? '🔍 Ping' : '📡 API'} · {timeAgo(svc.lastChecked)}
                          </span>
                          {svc.pageUrl && (
                            <a
                              href={svc.pageUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="blackout-page__card-link"
                            >
                              <ExternalLink size={12} />
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </section>

      {/* Legend */}
      <div className="blackout-page__legend">
        <div className="blackout-page__legend-item">
          <span className="blackout-page__card-dot blackout-page__card-dot--success" />
          <span>Opérationnel</span>
        </div>
        <div className="blackout-page__legend-item">
          <span className="blackout-page__card-dot blackout-page__card-dot--warning" />
          <span>Dégradé</span>
        </div>
        <div className="blackout-page__legend-item">
          <span className="blackout-page__card-dot blackout-page__card-dot--danger" />
          <span>Panne</span>
        </div>
        <div className="blackout-page__legend-item">
          <span className="blackout-page__card-dot blackout-page__card-dot--dim" />
          <span>Inconnu</span>
        </div>
      </div>

      {lastFetch && (
        <p className="blackout-page__footer">
          Dernière vérification : {timeAgo(lastFetch)} · Mise à jour automatique à chaque cycle
        </p>
      )}
    </div>
  );
}
