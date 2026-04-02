import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState, useRef } from 'react';
import { useAlertStore } from '../../stores/alertStore';
import { CATEGORIES } from '../../config/categories';
import SeverityBadge from '../../components/SeverityBadge/SeverityBadge';
import { formatDate, timeAgo } from '../../utils/date';
import { ArrowLeft, ExternalLink, MapPin, Clock, Shield, Share2, Bookmark, Globe, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import { useSavedAlertStore } from '../../stores/savedAlertStore';
import { useAuthStore } from '../../stores/authStore';
import './AlertDetail.scss';

export default function AlertDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const events = useAlertStore((s) => s.events);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { isSaved, toggleSave } = useSavedAlertStore();

  const event = events.find((e) => e.id === decodeURIComponent(id));

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(true);
  const [previewError, setPreviewError] = useState(false);
  const iframeRef = useRef(null);

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


      {/* Source Preview */}
      {event.sourceUrl && (
        <div className="alert-detail__preview">
          <button
            className="alert-detail__preview-toggle"
            onClick={() => {
              setPreviewOpen((o) => !o);
              setPreviewLoading(true);
              setPreviewError(false);
            }}
          >
            <Globe size={16} />
            <span>Aperçu de la source</span>
            {previewOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {previewOpen && (
            <div className="alert-detail__preview-container">
              {previewLoading && !previewError && (
                <div className="alert-detail__preview-loading">
                  <div className="alert-detail__preview-spinner" />
                  <p>Chargement de l'aperçu…</p>
                </div>
              )}

              {previewError && (
                <div className="alert-detail__preview-error">
                  <AlertTriangle size={24} />
                  <p>Aperçu non disponible</p>
                  <span>Ce site empêche l'intégration dans un cadre externe.</span>
                  <a
                    href={event.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="alert-detail__preview-error-link"
                  >
                    Ouvrir dans un nouvel onglet <ExternalLink size={14} />
                  </a>
                </div>
              )}

              <iframe
                ref={iframeRef}
                src={event.sourceUrl}
                title="Aperçu de la source"
                sandbox="allow-scripts allow-same-origin"
                className={`alert-detail__preview-iframe ${previewError ? 'alert-detail__preview-iframe--hidden' : ''}`}
                onLoad={() => setPreviewLoading(false)}
                onError={() => {
                  setPreviewLoading(false);
                  setPreviewError(true);
                }}
              />
            </div>
          )}
        </div>
      )}
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
        {isAuthenticated && (
          <button
            onClick={() => toggleSave(event)}
            className={`alert-detail__save-btn ${isSaved(event.id) ? 'alert-detail__save-btn--active' : ''}`}
          >
            <Bookmark size={16} fill={isSaved(event.id) ? 'currentColor' : 'none'} />
            {isSaved(event.id) ? 'Sauvegardée' : 'Sauvegarder'}
          </button>
        )}
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
