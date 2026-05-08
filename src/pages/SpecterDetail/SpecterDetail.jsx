import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchSpecterEventBySlug } from '../../services/specter';
import { SPECTER_FAMILIES } from '../Specter/Specter';
import Loader from '../../components/Loader/Loader';
import {
  ArrowLeft, FlaskConical, RadioTower, Clock, MapPin,
  AlertTriangle, ExternalLink, Link2, Eye
} from 'lucide-react';
import './SpecterDetail.scss';

const SEVERITY_LABELS = {
  watch: { label: 'Veille', color: '#6B7280' },
  warning: { label: 'Avertissement', color: '#F59E0B' },
  critical: { label: 'Critique', color: '#EF4444' },
  catastrophic: { label: 'Catastrophique', color: '#DC2626' },
};

function attr(event, key) {
  return event?.attributes?.[key] ?? event?.[key];
}

export default function SpecterDetail() {
  const { slug } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetchSpecterEventBySlug(slug)
      .then((data) => {
        setEvent(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [slug]);

  if (loading) return <Loader text="Chargement..." />;
  if (error || !event) {
    return (
      <div className="specter-detail__error">
        <AlertTriangle size={18} />
        <span>Événement introuvable.</span>
        <Link to="/specter">← Retour à SPECTER</Link>
      </div>
    );
  }

  const type = attr(event, 'type');
  const category = attr(event, 'category');
  const severity = attr(event, 'severity');
  const title = attr(event, 'title');
  const summary = attr(event, 'summary');
  const fullContent = attr(event, 'fullContent');
  const startDate = attr(event, 'startDate');
  const endDate = attr(event, 'endDate');
  const isOngoing = attr(event, 'isOngoing');
  const location = attr(event, 'location');
  const sources = attr(event, 'sources') || [];
  const tags = attr(event, 'tags') || [];
  const linkedEvents = attr(event, 'linkedEvents')?.data || event?.linkedEvents || [];
  const casualtiesEstimate = attr(event, 'casualtiesEstimate');
  const organizerOrSource = attr(event, 'organizerOrSource');
  const keyLesson = attr(event, 'keyLesson');
  const geographicScope = attr(event, 'geographicScope');

  const family = SPECTER_FAMILIES[category] || SPECTER_FAMILIES.HEALTH;
  const sevDef = SEVERITY_LABELS[severity] || SEVERITY_LABELS.warning;

  const dateStr = endDate
    ? `${new Date(startDate).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })} — ${new Date(endDate).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`
    : new Date(startDate).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

  const SCOPE_LABELS = {
    local: 'Local', national: 'National', regional: 'Régional', global: 'Mondial'
  };

  return (
    <div className="specter-detail" style={{ '--family-color': family.color, '--family-bg': family.bg }}>
      {/* Back */}
      <div className="specter-detail__back">
        <Link to="/specter" className="specter-detail__back-btn">
          <ArrowLeft size={15} /> SPECTER
        </Link>
      </div>

      {/* Hero */}
      <div className="specter-detail__hero">
        <div className="specter-detail__meta-row">
          <span className={`specter-detail__type-chip specter-detail__type-chip--${type}`}>
            {type === 'simulation' ? <FlaskConical size={12} /> : <RadioTower size={12} />}
            {type === 'simulation' ? 'Simulation / Exercice' : 'Crise réelle'}
          </span>
          <span className="specter-detail__family-chip" style={{ color: family.color, background: family.bg }}>
            {family.label}
          </span>
          {isOngoing && (
            <span className="specter-detail__ongoing">
              <span className="specter-detail__pulse" />
              EN COURS
            </span>
          )}
        </div>

        <h1 className="specter-detail__title">{title}</h1>

        <div className="specter-detail__info-row">
          <span><Clock size={13} />{dateStr}</span>
          {location && <span><MapPin size={13} />{location}</span>}
          {geographicScope && <span><Eye size={13} />{SCOPE_LABELS[geographicScope] || geographicScope}</span>}
          <span style={{ color: sevDef.color }}><AlertTriangle size={13} />{sevDef.label}</span>
        </div>
      </div>

      {/* Summary */}
      <div className="specter-detail__section">
        <p className="specter-detail__summary">{summary}</p>
      </div>

      {/* Stats row */}
      {(casualtiesEstimate || organizerOrSource) && (
        <div className="specter-detail__stats">
          {casualtiesEstimate && (
            <div className="specter-detail__stat">
              <span className="specter-detail__stat-label">Victimes estimées</span>
              <span className="specter-detail__stat-value">{casualtiesEstimate}</span>
            </div>
          )}
          {organizerOrSource && (
            <div className="specter-detail__stat">
              <span className="specter-detail__stat-label">
                {type === 'simulation' ? 'Organisateur' : 'Source principale'}
              </span>
              <span className="specter-detail__stat-value">{organizerOrSource}</span>
            </div>
          )}
        </div>
      )}

      {/* Full content */}
      {fullContent && (
        <div className="specter-detail__section specter-detail__section--full">
          <h2 className="specter-detail__section-title">Détails</h2>
          <div
            className="specter-detail__richtext"
            dangerouslySetInnerHTML={{ __html: fullContent }}
          />
        </div>
      )}

      {/* Key lesson */}
      {keyLesson && (
        <div className="specter-detail__section specter-detail__lesson">
          <div className="specter-detail__lesson-icon">💡</div>
          <div>
            <div className="specter-detail__lesson-label">Enseignement clé</div>
            <p className="specter-detail__lesson-text">{keyLesson}</p>
          </div>
        </div>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <div className="specter-detail__section">
          <div className="specter-detail__tags">
            {tags.map((tag, i) => (
              <span key={i} className="specter-detail__tag">{tag}</span>
            ))}
          </div>
        </div>
      )}

      {/* Linked events */}
      {linkedEvents.length > 0 && (
        <div className="specter-detail__section">
          <h2 className="specter-detail__section-title">
            <Link2 size={14} /> Événements liés
          </h2>
          <div className="specter-detail__linked">
            {linkedEvents.map((le) => {
              const leAttrs = le.attributes || le;
              const leFamily = SPECTER_FAMILIES[leAttrs.category] || SPECTER_FAMILIES.HEALTH;
              return (
                <Link
                  key={le.id || leAttrs.slug}
                  to={`/specter/${leAttrs.slug}`}
                  className="specter-detail__linked-card"
                  style={{ '--linked-color': leFamily.color }}
                >
                  <span className="specter-detail__linked-type">
                    {leAttrs.type === 'simulation' ? <FlaskConical size={11} /> : <RadioTower size={11} />}
                  </span>
                  <span className="specter-detail__linked-title">{leAttrs.title}</span>
                  <span className="specter-detail__linked-year">
                    {new Date(leAttrs.startDate).getFullYear()}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Sources */}
      {sources.length > 0 && (
        <div className="specter-detail__section">
          <h2 className="specter-detail__section-title">Sources</h2>
          <div className="specter-detail__sources">
            {sources.map((src, i) => (
              <a
                key={i}
                href={src.url}
                target="_blank"
                rel="noopener noreferrer"
                className="specter-detail__source-link"
              >
                <ExternalLink size={12} />
                {src.label || src.url}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
