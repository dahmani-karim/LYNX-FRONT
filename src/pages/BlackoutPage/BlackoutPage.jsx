import { useMemo, useState } from 'react';
import { useAlertStore } from '../../stores/alertStore';
import { SERVICE_CATEGORIES } from '../../services/status';
import { timeAgo } from '../../utils/date';
import {
  Wifi, WifiOff, Cloud, Globe, MessageCircle, Server,
  CheckCircle, AlertTriangle, XCircle, HelpCircle, ExternalLink, ShieldAlert,
  CreditCard, Wrench, Truck, Heart, ChevronDown, ChevronUp, Sun, Zap
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
  const spaceWeatherData = useAlertStore((s) => s.spaceWeatherData);
  const lastFetch = useAlertStore((s) => s.lastFetch);
  const [collapsedCats, setCollapsedCats] = useState(() => {
    const all = Object.keys(SERVICE_CATEGORIES);
    all.push('ioda', 'solar');
    return new Set(all);
  });

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

  // Space weather: extract Kp event and alert events
  const kpEvent = useMemo(() => (spaceWeatherData || []).find((e) => e.metadata?.kp_index != null), [spaceWeatherData]);
  const solarAlerts = useMemo(() => (spaceWeatherData || []).filter((e) => !e.metadata?.kp_index), [spaceWeatherData]);
  const kpValue = kpEvent?.metadata?.kp_index ?? null;

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

      {/* Top summary: degraded (1/3) + incidents (2/3) */}
      <div className="blackout-page__top-summary">
        <div className="blackout-page__degraded-block">
          <h2 className="blackout-page__section-title">
            <AlertTriangle size={16} />
            Services dégradés ({degraded.length})
          </h2>
          {degraded.length === 0 ? (
            <p className="blackout-page__degraded-ok">
              <CheckCircle size={14} /> Tous les services sont opérationnels
            </p>
          ) : (
            <ul className="blackout-page__degraded-list">
              {degraded.map((svc) => {
                const cfg = getStatusConfig(svc.status === 'unreachable' ? 'major' : svc.status);
                return (
                  <li key={svc.name} className={`blackout-page__degraded-item blackout-page__degraded-item--${cfg.color}`}>
                    <span className={`blackout-page__card-dot blackout-page__card-dot--${cfg.color}`} />
                    <span className="blackout-page__degraded-name">{svc.name}</span>
                    <span className="blackout-page__degraded-status">{cfg.label}</span>
                  </li>
                );
              })}
            </ul>
          )}
          {iodaAlerts.length > 0 && (
            <div className="blackout-page__degraded-ioda">
              <WifiOff size={14} />
              <span>{iodaAlerts.length} coupure{iodaAlerts.length > 1 ? 's' : ''} internet</span>
            </div>
          )}
        </div>

        <div className="blackout-page__incidents-block">
          <h2 className="blackout-page__section-title">
            <WifiOff size={16} />
            Incidents ({iodaAlerts.length + serviceAlerts.length})
          </h2>
          {iodaAlerts.length === 0 && serviceAlerts.length === 0 ? (
            <p className="blackout-page__degraded-ok">
              <CheckCircle size={14} /> Aucun incident en cours
            </p>
          ) : (
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
          )}
        </div>
      </div>

      {/* IODA Internet Outages — collapsible */}
      <div className="blackout-page__cat-group">
        <button
          className="blackout-page__cat-header"
          onClick={() => toggleCategory('ioda')}
        >
          <Globe size={16} className="blackout-page__cat-icon" />
          <span className="blackout-page__cat-label">Coupures Internet — IODA ({IODA_COUNTRIES.length} pays)</span>
          <span className="blackout-page__cat-count">
            {iodaAlerts.length > 0 ? (
              <span className="blackout-page__cat-badge blackout-page__cat-badge--danger">{iodaAlerts.length} alerte{iodaAlerts.length > 1 ? 's' : ''}</span>
            ) : (
              <span className="blackout-page__cat-badge blackout-page__cat-badge--ok">{IODA_COUNTRIES.length} pays</span>
            )}
          </span>
          {collapsedCats.has('ioda') ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </button>

        {!collapsedCats.has('ioda') && (
          <div className="blackout-page__ioda-content">
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
          </div>
        )}
      </div>

      {/* Solar Weather — NOAA SWPC */}
      <div className="blackout-page__cat-group">
        <button
          className="blackout-page__cat-header"
          onClick={() => toggleCategory('solar')}
        >
          <Sun size={16} className="blackout-page__cat-icon" />
          <span className="blackout-page__cat-label">Météo Spatiale — NOAA SWPC</span>
          <span className="blackout-page__cat-count">
            {kpValue != null && kpValue >= 5 ? (
              <span className="blackout-page__cat-badge blackout-page__cat-badge--danger">Kp {kpValue.toFixed(0)}</span>
            ) : kpValue != null ? (
              <span className="blackout-page__cat-badge blackout-page__cat-badge--ok">Kp {kpValue.toFixed(0)}</span>
            ) : (
              <span className="blackout-page__cat-badge blackout-page__cat-badge--ok">OK</span>
            )}
          </span>
          {collapsedCats.has('solar') ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </button>

        {!collapsedCats.has('solar') && (
          <div className="blackout-page__solar-content">
            <p className="blackout-page__ioda-desc">
              Données temps réel du <a href="https://www.swpc.noaa.gov" target="_blank" rel="noopener noreferrer" className="blackout-page__ioda-link">Space Weather Prediction Center</a> (NOAA) — Tempêtes géomagnétiques, éruptions solaires, Kp index.
            </p>

            {/* Kp Gauge */}
            <div className="blackout-page__kp-gauge">
              <div className="blackout-page__kp-bar">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((level) => (
                  <div
                    key={level}
                    className={`blackout-page__kp-segment blackout-page__kp-segment--${level <= 3 ? 'green' : level <= 4 ? 'yellow' : level <= 6 ? 'orange' : 'red'}${kpValue != null && Math.floor(kpValue) >= level ? ' blackout-page__kp-segment--active' : ''}`}
                  >
                    <span className="blackout-page__kp-label">{level}</span>
                  </div>
                ))}
              </div>
              <div className="blackout-page__kp-info">
                {kpValue != null ? (
                  <>
                    <span className={`blackout-page__kp-value blackout-page__kp-value--${kpValue >= 7 ? 'critical' : kpValue >= 5 ? 'high' : kpValue >= 4 ? 'medium' : 'low'}`}>
                      Kp {kpValue.toFixed(1)}
                    </span>
                    <span className="blackout-page__kp-desc">
                      {kpValue >= 8 ? '⚠️ Tempête extrême — Risque blackout réseau' :
                       kpValue >= 7 ? '⚠️ Tempête forte — Perturbations GPS/radio' :
                       kpValue >= 6 ? '🔶 Tempête modérée — Aurores visibles à basse latitude' :
                       kpValue >= 5 ? '🟡 Tempête mineure — Activité géomagnétique élevée' :
                       kpValue >= 4 ? '🟢 Activité légèrement élevée' :
                       '🟢 Activité normale'}
                    </span>
                  </>
                ) : (
                  <span className="blackout-page__kp-desc">Données Kp en cours de chargement…</span>
                )}
              </div>
            </div>

            {/* Solar alerts list */}
            {solarAlerts.length > 0 && (
              <div className="blackout-page__solar-alerts">
                <h3 className="blackout-page__solar-subtitle">
                  <Zap size={14} /> Bulletins SWPC récents ({solarAlerts.length})
                </h3>
                {solarAlerts.slice(0, 8).map((alert) => {
                  const color = getSeverityColor(alert.severity);
                  return (
                    <div key={alert.id} className={`blackout-page__incident blackout-page__incident--${color}`}>
                      <Zap size={16} />
                      <div className="blackout-page__incident-body">
                        <p className="blackout-page__incident-title">{alert.title}</p>
                        <p className="blackout-page__incident-desc">{alert.description?.slice(0, 200)}</p>
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
            )}

            {solarAlerts.length === 0 && kpValue != null && kpValue < 4 && (
              <p className="blackout-page__ioda-ok">
                <CheckCircle size={14} /> Aucune alerte solaire — Activité géomagnétique calme
              </p>
            )}
          </div>
        )}
      </div>

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
