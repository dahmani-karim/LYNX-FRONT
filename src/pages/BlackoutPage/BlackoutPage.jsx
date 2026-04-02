import { useAlertStore } from '../../stores/alertStore';
import { timeAgo } from '../../utils/date';
import {
  Wifi, WifiOff, Cloud, Globe, MessageCircle, Server,
  CheckCircle, AlertTriangle, XCircle, HelpCircle, ExternalLink, ShieldAlert
} from 'lucide-react';
import './BlackoutPage.scss';

const STATUS_CONFIG = {
  operational: { label: 'Opérationnel', color: 'success', Icon: CheckCircle },
  minor: { label: 'Incident mineur', color: 'warning', Icon: AlertTriangle },
  major: { label: 'Panne majeure', color: 'danger', Icon: XCircle },
  critical: { label: 'Panne critique', color: 'critical', Icon: XCircle },
  unknown: { label: 'Inconnu', color: 'dim', Icon: HelpCircle },
};

const CATEGORY_ICONS = {
  internet: Globe,
  cloud: Cloud,
  communication: MessageCircle,
  default: Server,
};

function getStatusConfig(status) {
  return STATUS_CONFIG[status] || STATUS_CONFIG.unknown;
}

export default function BlackoutPage() {
  const serviceStatuses = useAlertStore((s) => s.serviceStatuses);
  const events = useAlertStore((s) => s.events);
  const lastFetch = useAlertStore((s) => s.lastFetch);

  // Blackout-type alerts (service outages that generate actual alert events)
  const blackoutAlerts = events.filter((e) => e.type === 'blackout');

  const operational = serviceStatuses.filter((s) => s.status === 'operational');
  const degraded = serviceStatuses.filter((s) => s.status !== 'operational' && s.status !== 'unknown');
  const unknown = serviceStatuses.filter((s) => s.status === 'unknown');

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

      {/* Active incidents */}
      {blackoutAlerts.length > 0 && (
        <section className="blackout-page__incidents">
          <h2 className="blackout-page__section-title">
            <AlertTriangle size={16} />
            Incidents en cours
          </h2>
          <div className="blackout-page__incident-list">
            {blackoutAlerts.map((alert) => {
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

      {/* Service grid */}
      <section className="blackout-page__grid-section">
        <h2 className="blackout-page__section-title">
          <Server size={16} />
          Services surveillés
        </h2>
        <div className="blackout-page__grid">
          {serviceStatuses.map((svc) => {
            const cfg = getStatusConfig(svc.status);
            const CatIcon = CATEGORY_ICONS[svc.category] || CATEGORY_ICONS.default;
            return (
              <div key={svc.name} className={`blackout-page__card blackout-page__card--${cfg.color}`}>
                <div className="blackout-page__card-header">
                  <CatIcon size={18} />
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
                    Vérifié {timeAgo(svc.lastChecked)}
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
