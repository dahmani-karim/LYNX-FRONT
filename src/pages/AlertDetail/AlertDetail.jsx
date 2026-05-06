import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker } from 'react-leaflet';
import { useAlertStore } from '../../stores/alertStore';
import { CATEGORIES } from '../../config/categories';
import SeverityBadge from '../../components/SeverityBadge/SeverityBadge';
import { getAlertTier, TIER_CONFIG } from '../../services/deltaEngine';
import { formatDate, timeAgo } from '../../utils/date';
import {
  ArrowLeft, ExternalLink, MapPin, Clock, Shield, Share2, Bookmark,
  Globe, ChevronDown, ChevronUp, AlertTriangle, Flag,
} from 'lucide-react';
import { useSavedAlertStore } from '../../stores/savedAlertStore';
import { useAuthStore } from '../../stores/authStore';
import './AlertDetail.scss';

const DARK_TILES = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

/** Strip GDELT raw descriptions like "Source: domain.com | 20260506T1" */
function cleanDescription(desc) {
  if (!desc) return '';
  const str = desc.trim();
  if (/^(\[[\d-]+\]\s*)?Source:\s*[\w.-]+(\s*\|\s*[\dT]+)?$/i.test(str)) return '';
  if (/^\[[\d-]+\]\s*[\w.-]+$/.test(str)) return '';
  return str.replace(/\s*\|\s*\d{8}T\d+Z?/g, '').trim();
}

/** Parse and capitalize a domain from a URL */
function parseDomain(url, fallback = '') {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, '');
    const label = hostname.split('.').slice(0, -1).join('.');
    const name = label || hostname;
    return name.charAt(0).toUpperCase() + name.slice(1);
  } catch {
    return fallback;
  }
}

/** Type-specific metadata block */
function MetadataSection({ event }) {
  const { type, metadata: m = {} } = event;

  if (type === 'earthquake') {
    return (
      <div className="alert-detail__meta-section">
        <h3 className="alert-detail__section-title">Données sismiques</h3>
        <div className="alert-detail__meta-grid">
          {m.magnitude != null && (
            <div className="alert-detail__meta-cell">
              <span className="alert-detail__meta-label">Magnitude</span>
              <span className="alert-detail__meta-value alert-detail__meta-value--big">{m.magnitude}</span>
            </div>
          )}
          {m.depth != null && (
            <div className="alert-detail__meta-cell">
              <span className="alert-detail__meta-label">Profondeur</span>
              <span className="alert-detail__meta-value">{Number(m.depth).toFixed(1)} km</span>
            </div>
          )}
          {m.felt != null && (
            <div className="alert-detail__meta-cell">
              <span className="alert-detail__meta-label">Ressenti par</span>
              <span className="alert-detail__meta-value">{Number(m.felt).toLocaleString('fr')} pers.</span>
            </div>
          )}
          {m.tsunami && (
            <div className="alert-detail__meta-cell">
              <span className="alert-detail__meta-label">Alerte tsunami</span>
              <span className="alert-detail__meta-value alert-detail__meta-value--warning">âš  Oui</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (type === 'radiation') {
    return (
      <div className="alert-detail__meta-section">
        <h3 className="alert-detail__section-title">Données de radiation</h3>
        <div className="alert-detail__meta-grid">
          {m.doseRate != null && (
            <div className="alert-detail__meta-cell">
              <span className="alert-detail__meta-label">Dose mesurée</span>
              <span className="alert-detail__meta-value alert-detail__meta-value--big">
                {Number(m.doseRate).toFixed(3)} {m.unit || 'µSv/h'}
              </span>
            </div>
          )}
          {m.stationId && (
            <div className="alert-detail__meta-cell">
              <span className="alert-detail__meta-label">Station</span>
              <span className="alert-detail__meta-value">{m.stationId}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (type === 'health') {
    const hasData = m.todayCases != null || m.todayDeaths != null || m.active != null || m.risques || m.categorie;
    if (!hasData) return null;
    return (
      <div className="alert-detail__meta-section">
        <h3 className="alert-detail__section-title">Données sanitaires</h3>
        <div className="alert-detail__meta-grid">
          {m.todayCases != null && (
            <div className="alert-detail__meta-cell">
              <span className="alert-detail__meta-label">Nouveaux cas</span>
              <span className="alert-detail__meta-value">{Number(m.todayCases).toLocaleString('fr')}</span>
            </div>
          )}
          {m.todayDeaths != null && (
            <div className="alert-detail__meta-cell">
              <span className="alert-detail__meta-label">Décès (J)</span>
              <span className="alert-detail__meta-value">{Number(m.todayDeaths).toLocaleString('fr')}</span>
            </div>
          )}
          {m.active != null && (
            <div className="alert-detail__meta-cell">
              <span className="alert-detail__meta-label">Cas actifs</span>
              <span className="alert-detail__meta-value">{Number(m.active).toLocaleString('fr')}</span>
            </div>
          )}
          {m.categorie && (
            <div className="alert-detail__meta-cell">
              <span className="alert-detail__meta-label">Catégorie</span>
              <span className="alert-detail__meta-value">{m.categorie}</span>
            </div>
          )}
          {m.risques && (
            <div className="alert-detail__meta-cell alert-detail__meta-cell--full">
              <span className="alert-detail__meta-label">Risques</span>
              <span className="alert-detail__meta-value alert-detail__meta-value--sm">{m.risques}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (type === 'energy' && m.signal) {
    return (
      <div className="alert-detail__meta-section">
        <h3 className="alert-detail__section-title">Signal réseau gaz</h3>
        <div className="alert-detail__meta-grid">
          <div className="alert-detail__meta-cell">
            <span className="alert-detail__meta-label">Signal Ecogaz</span>
            <span className="alert-detail__meta-value">{m.signal}</span>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'space_weather' && m.kp_index != null) {
    return (
      <div className="alert-detail__meta-section">
        <h3 className="alert-detail__section-title">Météo spatiale</h3>
        <div className="alert-detail__meta-grid">
          <div className="alert-detail__meta-cell">
            <span className="alert-detail__meta-label">Indice Kp</span>
            <span className="alert-detail__meta-value alert-detail__meta-value--big">
              {Number(m.kp_index).toFixed(1)}
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'disaster' && m.niveau) {
    return (
      <div className="alert-detail__meta-section">
        <h3 className="alert-detail__section-title">Vigilance crues</h3>
        <div className="alert-detail__meta-grid">
          <div className="alert-detail__meta-cell">
            <span className="alert-detail__meta-label">Niveau</span>
            <span className="alert-detail__meta-value alert-detail__meta-value--big">{m.niveau}/4</span>
          </div>
          {m.coursEau && (
            <div className="alert-detail__meta-cell">
              <span className="alert-detail__meta-label">Cours d'eau</span>
              <span className="alert-detail__meta-value">{m.coursEau}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}

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
  const timeoutRef = useRef(null);

  // Related alerts — same type, sorted by date desc, exclude current, top 3
  const relatedAlerts = useMemo(() => {
    if (!event) return [];
    return events
      .filter((e) => e.id !== event.id && e.type === event.type)
      .sort((a, b) => new Date(b.eventDate) - new Date(a.eventDate))
      .slice(0, 3);
  }, [events, event]);

  useEffect(() => {
    if (previewOpen && previewLoading && !previewError) {
      timeoutRef.current = setTimeout(() => {
        setPreviewLoading(false);
        setPreviewError(true);
      }, 5000);
      return () => clearTimeout(timeoutRef.current);
    }
  }, [previewOpen, previewLoading, previewError]);

  const handleIframeLoad = useCallback(() => {
    clearTimeout(timeoutRef.current);
    setPreviewLoading(false);
    try {
      const doc = iframeRef.current?.contentDocument;
      if (doc && doc.URL && !doc.URL.startsWith(event?.sourceUrl?.slice(0, 20))) {
        setPreviewError(true);
      }
    } catch { }
  }, [event?.sourceUrl]);

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
  const tier = getAlertTier(event);
  const tierCfg = TIER_CONFIG[tier];
  const description = cleanDescription(event.description);
  const sourceDomain = parseDomain(event.sourceUrl, event.sourceName);
  const hasMap = Boolean(event.latitude && event.longitude);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: `LYNX — ${event.title}`, text: event.description, url: window.location.href });
      } catch { }
    } else {
      await navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className="alert-detail">

      {/* ── Back ── */}
      <button onClick={() => navigate(-1)} className="alert-detail__back">
        <ArrowLeft size={16} />
        Retour
      </button>

      {/* ── Header ── */}
      <div className="alert-detail__header">
        <div className="alert-detail__header-row">
          <div className="alert-detail__icon" style={{ backgroundColor: category.bgColor }}>
            <Icon size={24} style={{ color: category.color }} />
          </div>
          <div className="alert-detail__header-body">
            <div className="alert-detail__meta">
              <SeverityBadge severity={event.severity} size="sm" />
              {tier !== 'routine' && (
                <span className="alert-detail__tier" style={{ backgroundColor: tierCfg.bg, color: tierCfg.color }}>
                  {tierCfg.label}
                </span>
              )}
              <span className="alert-detail__category">{category.label}</span>
            </div>
            <h1 className="alert-detail__title">{event.title}</h1>
          </div>
        </div>

        {description && <p className="alert-detail__desc">{description}</p>}

        {/* Info chips — source time, country, source name, coords */}
        <div className="alert-detail__chips">
          <span className="alert-detail__chip" title={timeAgo(event.eventDate)}>
            <Clock size={12} />
            {formatDate(event.eventDate)}
          </span>
          {event.country && (
            <span className="alert-detail__chip">
              <Flag size={12} />
              {event.country}
            </span>
          )}
          <span className="alert-detail__chip">
            <Shield size={12} />
            {sourceDomain || event.sourceName}
            {event.sourceReliability && <em className="alert-detail__chip-reliability">{event.sourceReliability}%</em>}
          </span>
          {hasMap && (
            <span className="alert-detail__chip alert-detail__chip--muted">
              <MapPin size={12} />
              {event.latitude.toFixed(2)}, {event.longitude.toFixed(2)}
            </span>
          )}
        </div>

        {/* Import timestamp — secondary info */}
        {event.importedAt && (
          <p className="alert-detail__imported">
            Importé dans LYNX le {formatDate(event.importedAt)}
          </p>
        )}
      </div>

      {/* ── Mini map ── */}
      {hasMap && (
        <div className="alert-detail__mini-map">
          <MapContainer
            center={[event.latitude, event.longitude]}
            zoom={5}
            scrollWheelZoom={false}
            zoomControl={false}
            attributionControl={false}
            style={{ height: '180px', width: '100%' }}
          >
            <TileLayer url={DARK_TILES} />
            <CircleMarker
              center={[event.latitude, event.longitude]}
              radius={10}
              pathOptions={{
                color: category.color,
                fillColor: category.color,
                fillOpacity: 0.75,
                weight: 2,
              }}
            />
          </MapContainer>
        </div>
      )}

      {/* ── Type-specific metadata ── */}
      <MetadataSection event={event} />

      {/* ── Related alerts ── */}
      {relatedAlerts.length > 0 && (
        <div className="alert-detail__related">
          <h3 className="alert-detail__section-title">Alertes similaires</h3>
          <div className="alert-detail__related-list">
            {relatedAlerts.map((rel) => {
              const relCat = CATEGORIES[rel.type] || CATEGORIES.other;
              return (
                <Link
                  key={rel.id}
                  to={`/alerts/${encodeURIComponent(rel.id)}`}
                  className="alert-detail__related-item"
                >
                  <div className="alert-detail__related-header">
                    <SeverityBadge severity={rel.severity} size="sm" />
                    <span className="alert-detail__related-cat">{relCat.label}</span>
                    <span className="alert-detail__related-date">{formatDate(rel.eventDate)}</span>
                  </div>
                  <p className="alert-detail__related-title">{rel.title}</p>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Source ── */}
      <div className="alert-detail__source">
        <h3 className="alert-detail__section-title">Source</h3>
        <div className="alert-detail__source-row">
          <div className="alert-detail__source-name">
            <Shield size={14} />
            <span>{sourceDomain || event.sourceName}</span>
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

      {/* ── Source preview ── */}
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
              {previewError ? (
                <div className="alert-detail__preview-error">
                  <AlertTriangle size={24} />
                  <p>Aperçu non disponible</p>
                  <span>Ce site ne permet pas l'affichage dans un cadre intégré.</span>
                  <a
                    href={event.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="alert-detail__preview-error-link"
                  >
                    Ouvrir dans un nouvel onglet <ExternalLink size={14} />
                  </a>
                </div>
              ) : (
                <>
                  <iframe
                    ref={iframeRef}
                    src={event.sourceUrl}
                    title="Aperçu de la source"
                    sandbox="allow-scripts allow-same-origin"
                    className="alert-detail__preview-iframe"
                    onLoad={handleIframeLoad}
                    onError={() => {
                      clearTimeout(timeoutRef.current);
                      setPreviewLoading(false);
                      setPreviewError(true);
                    }}
                  />
                  {!previewLoading && (
                    <a
                      href={event.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="alert-detail__preview-open-link"
                    >
                      Ouvrir dans un nouvel onglet <ExternalLink size={12} />
                    </a>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Actions ── */}
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
        {hasMap && (
          <Link to="/map" className="alert-detail__map-btn">
            <MapPin size={16} />
            Voir sur la carte
          </Link>
        )}
      </div>

    </div>
  );
}

