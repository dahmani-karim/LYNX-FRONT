import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAlertStore } from '../../stores/alertStore';
import { CATEGORIES } from '../../config/categories';
import SeverityBadge from '../../components/SeverityBadge/SeverityBadge';
import { formatDate, timeAgo } from '../../utils/date';
import { ArrowLeft, ExternalLink, MapPin, Clock, Shield, Share2 } from 'lucide-react';
import './AlertDetail.scss';

export default function AlertDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const events = useAlertStore((s) => s.events);

  const event = events.find((e) => e.id === decodeURIComponent(id));

  if (!event) {
    return (
      <div className="alert-detail__not-found">
        <p className="alert-detail__not-found-icon">🔍</p>
        <p className="alert-detail__not-found-text">Alerte introuvable</p>
        <Link to="/alerts" className="alert-detail__not-found-link">
          Retour aux alertes
        </Link>
      </div>
    );
  }

  const category = CATEGORIES[event.type] || CATEGORIES.other;
  const Icon = category.icon;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `LYNX – ${event.title}`,
          text: event.description,
          url: window.location.href,
        });
      } catch {}
    } else {
      await navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className="alert-detail">
      {/* Back */}
      <button onClick={() => navigate(-1)} className="alert-detail__back">
        <ArrowLeft size={16} />
        Retour
      </button>

      {/* Header */}
      <div className="alert-detail__header">
        <div className="alert-detail__header-row">
          <div className="alert-detail__icon" style={{ backgroundColor: category.bgColor }}>
            <Icon size={24} style={{ color: category.color }} />
          </div>
          <div className="alert-detail__header-body">
            <div className="alert-detail__meta">
              <SeverityBadge severity={event.severity} size="sm" />
              <span className="alert-detail__category">{category.label}</span>
            </div>
            <h1 className="alert-detail__title">{event.title}</h1>
          </div>
        </div>

        <p className="alert-detail__desc">{event.description}</p>

        <div className="alert-detail__info-grid">
          <div className="alert-detail__info-item">
            <Clock size={14} />
            <div>
              <p>{formatDate(event.eventDate)}</p>
              <p>{timeAgo(event.eventDate)}</p>
            </div>
          </div>
          {event.latitude && event.longitude && (
            <div className="alert-detail__info-item">
              <MapPin size={14} />
              <p>{event.latitude.toFixed(3)}, {event.longitude.toFixed(3)}</p>
            </div>
          )}
        </div>
      </div>

      {/* Source */}
      <div className="alert-detail__source">
        <h3 className="alert-detail__source-title">Source</h3>
        <div className="alert-detail__source-row">
          <div className="alert-detail__source-name">
            <Shield size={14} />
            <span>{event.sourceName}</span>
          </div>
          {event.sourceReliability && (
            <span className="alert-detail__source-reliability">
              Fiabilité : <strong>{event.sourceReliability}%</strong>
            </span>
          )}
        </div>
        {event.sourceUrl && (
          <a
            href={event.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="alert-detail__source-link"
          >
            Voir la source originale <ExternalLink size={14} />
          </a>
        )}
      </div>

      {/* Seismic data */}
      {event.type === 'earthquake' && (
        <div className="alert-detail__seismic">
          <h3 className="alert-detail__seismic-title">Données sismiques</h3>
          <div className="alert-detail__seismic-grid">
            {event.magnitude && (
              <div>
                <p className="alert-detail__seismic-label">Magnitude</p>
                <p className="alert-detail__seismic-value">{event.magnitude}</p>
              </div>
            )}
            {event.depth && (
              <div>
                <p className="alert-detail__seismic-label">Profondeur</p>
                <p className="alert-detail__seismic-value">{event.depth.toFixed(1)} km</p>
              </div>
            )}
            {event.felt && (
              <div>
                <p className="alert-detail__seismic-label">Ressenti par</p>
                <p className="alert-detail__seismic-value alert-detail__seismic-value--sm">{event.felt} personnes</p>
              </div>
            )}
            {event.tsunami && (
              <div>
                <p className="alert-detail__seismic-label">Alerte tsunami</p>
                <p className="alert-detail__seismic-value alert-detail__seismic-value--warning">Oui</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="alert-detail__actions">
        <button onClick={handleShare} className="alert-detail__share-btn">
          <Share2 size={16} />
          Partager
        </button>
        {event.latitude && event.longitude && (
          <Link to="/map" className="alert-detail__map-btn">
            <MapPin size={16} />
            Voir sur la carte
          </Link>
        )}
      </div>
    </div>
  );
}
