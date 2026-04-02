import { Link } from 'react-router-dom';
import { CATEGORIES } from '../../config/categories';
import SeverityBadge from '../SeverityBadge/SeverityBadge';
import { getAlertTier, TIER_CONFIG } from '../../services/deltaEngine';
import { timeAgo } from '../../utils/date';
import { ChevronRight } from 'lucide-react';
import './AlertCard.scss';

function TierBadge({ event }) {
  const tier = getAlertTier(event);
  if (tier === 'routine') return null;
  const cfg = TIER_CONFIG[tier];
  return (
    <span className={`alert-card__tier alert-card__tier--${tier}`} style={{ backgroundColor: cfg.bg, color: cfg.color }}>
      {cfg.label}
    </span>
  );
}

export default function AlertCard({ event, compact = false }) {
  const category = CATEGORIES[event.type] || CATEGORIES.other;
  const Icon = category.icon;

  if (compact) {
    return (
      <Link
        to={`/alert/${encodeURIComponent(event.id)}`}
        className="alert-card alert-card--compact"
      >
        <div className="alert-card__icon" style={{ backgroundColor: category.bgColor }}>
          <Icon size={18} style={{ color: category.color }} />
        </div>
        <div className="alert-card__compact-body">
          <p className="alert-card__compact-title">{event.title}</p>
          <p className="alert-card__compact-time">{timeAgo(event.eventDate)}</p>
        </div>
        <SeverityBadge severity={event.severity} size="xs" />
        <TierBadge event={event} />
      </Link>
    );
  }

  return (
    <Link
      to={`/alert/${encodeURIComponent(event.id)}`}
      className="alert-card alert-card--full"
    >
      <div className="alert-card__row">
        <div className="alert-card__icon alert-card__icon--lg" style={{ backgroundColor: category.bgColor }}>
          <Icon size={20} style={{ color: category.color }} />
        </div>
        <div className="alert-card__body">
          <div className="alert-card__meta">
            <SeverityBadge severity={event.severity} size="xs" />
            <TierBadge event={event} />
            <span className="alert-card__category">{category.label}</span>
          </div>
          <h3 className="alert-card__title">{event.title}</h3>
          <p className="alert-card__desc">{event.description}</p>
          <div className="alert-card__footer">
            <div className="alert-card__source-info">
              <span>{event.sourceName}</span>
              <span>·</span>
              <span>{timeAgo(event.eventDate)}</span>
            </div>
            <ChevronRight size={14} className="alert-card__chevron" />
          </div>
        </div>
      </div>
    </Link>
  );
}
