import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { fetchSpecterEvents } from '../../services/specter';
import Loader from '../../components/Loader/Loader';
import {
  Eye, FlaskConical, Zap, Shield, Skull, Heart, AlertTriangle, Globe,
  ChevronRight, Clock, RadioTower
} from 'lucide-react';
import './Specter.scss';

// ─── Threat families ────────────────────────────────────────────────────────

export const SPECTER_FAMILIES = {
  ALL: { label: 'Toutes', color: '#9CA3AF', bg: 'rgba(156, 163, 175, 0.12)', icon: Eye },
  NATURAL: { label: 'Naturel', color: '#22C55E', bg: 'rgba(34, 197, 94, 0.12)', icon: Globe },
  TECH: { label: 'Techno', color: '#F97316', bg: 'rgba(249, 115, 22, 0.12)', icon: Zap },
  HEALTH: { label: 'Sanitaire', color: '#EF4444', bg: 'rgba(239, 68, 68, 0.12)', icon: Heart },
  CYBER: { label: 'Cyber', color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.12)', icon: Shield },
  TERROR: { label: 'Terroriste', color: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.12)', icon: Skull },
};

const SEVERITY_ORDER = { catastrophic: 4, critical: 3, warning: 2, watch: 1 };

const SEVERITY_LABELS = {
  watch: { label: 'Veille', color: '#6B7280' },
  warning: { label: 'Avertissement', color: '#F59E0B' },
  critical: { label: 'Critique', color: '#EF4444' },
  catastrophic: { label: 'Catastrophique', color: '#DC2626' },
};

// ─── Helpers ────────────────────────────────────────────────────────────────

function getYear(event) {
  return new Date(event.attributes?.startDate || event.startDate).getFullYear();
}

function groupByYear(events) {
  const map = {};
  events.forEach((e) => {
    const y = getYear(e);
    if (!map[y]) map[y] = [];
    map[y].push(e);
  });
  return Object.entries(map).sort((a, b) => Number(a[0]) - Number(b[0]));
}

function attr(event, key) {
  return event.attributes?.[key] ?? event[key];
}

// ─── Subcomponents ──────────────────────────────────────────────────────────

function FamilyChip({ family, active, onClick }) {
  const def = SPECTER_FAMILIES[family];
  const Icon = def.icon;
  return (
    <button
      className={`specter-chip ${active ? 'specter-chip--active' : ''}`}
      style={active ? { '--chip-color': def.color, '--chip-bg': def.bg } : {}}
      onClick={onClick}
    >
      <Icon size={13} />
      <span>{def.label}</span>
    </button>
  );
}

function EventCard({ event, dimmed }) {
  const type = attr(event, 'type');
  const category = attr(event, 'category');
  const severity = attr(event, 'severity');
  const isOngoing = attr(event, 'isOngoing');
  const title = attr(event, 'title');
  const slug = attr(event, 'slug');
  const summary = attr(event, 'summary');
  const startDate = attr(event, 'startDate');
  const endDate = attr(event, 'endDate');
  const location = attr(event, 'location');
  const family = SPECTER_FAMILIES[category] || SPECTER_FAMILIES.HEALTH;
  const sevDef = SEVERITY_LABELS[severity] || SEVERITY_LABELS.warning;

  const dateStr = endDate
    ? `${new Date(startDate).getFullYear()} — ${new Date(endDate).getFullYear()}`
    : new Date(startDate).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });

  return (
    <Link
      to={`/specter/${slug}`}
      className={`specter-card specter-card--${type} ${isOngoing ? 'specter-card--ongoing' : ''} ${dimmed ? 'specter-card--dimmed' : ''}`}
      style={{ '--family-color': family.color, '--family-bg': family.bg }}
    >
      <div className="specter-card__header">
        <span className="specter-card__type-badge">
          {type === 'simulation' ? <FlaskConical size={11} /> : <RadioTower size={11} />}
          {type === 'simulation' ? 'Simulation' : 'Crise réelle'}
        </span>
        {isOngoing && (
          <span className="specter-card__ongoing-badge">
            <span className="specter-card__pulse" />
            EN COURS
          </span>
        )}
        <span className="specter-card__severity" style={{ color: sevDef.color }}>
          {sevDef.label}
        </span>
      </div>

      <div className="specter-card__title">{title}</div>

      {location && <div className="specter-card__location">{location}</div>}
      <div className="specter-card__date">
        <Clock size={11} />
        {dateStr}
      </div>
      <p className="specter-card__summary">{summary}</p>

      <div className="specter-card__footer">
        <span
          className="specter-card__family-tag"
          style={{ color: family.color, background: family.bg }}
        >
          {SPECTER_FAMILIES[category]?.label || category}
        </span>
        <ChevronRight size={14} className="specter-card__chevron" />
      </div>
    </Link>
  );
}

function YearRow({ year, events, activeFamily, activeType }) {
  const sims = events.filter((e) => attr(e, 'type') === 'simulation');
  const crises = events.filter((e) => attr(e, 'type') === 'crisis');

  // Interleave: pair sim+crisis by index
  const maxLen = Math.max(sims.length, crises.length);
  const rows = [];
  for (let i = 0; i < maxLen; i++) {
    rows.push({ sim: sims[i] || null, crisis: crises[i] || null });
  }

  const isDimmed = (event) => {
    if (!event) return false;
    const cat = attr(event, 'type');
    const family = attr(event, 'category');
    if (activeFamily !== 'ALL' && family !== activeFamily) return true;
    if (activeType !== 'ALL' && cat !== activeType) return true;
    return false;
  };

  const allDimmed = events.every((e) => isDimmed(e));

  return (
    <div className={`specter-year-block ${allDimmed ? 'specter-year-block--hidden' : ''}`}>
      <div className="specter-year-marker">
        <span>{year}</span>
      </div>
      {rows.map((row, i) => (
        <div key={i} className="specter-row">
          <div className="specter-row__left">
            {row.sim && (
              <EventCard event={row.sim} dimmed={isDimmed(row.sim)} />
            )}
          </div>
          <div className="specter-row__spine">
            <div className="specter-row__line" />
            <div
              className={`specter-row__dot ${row.sim ? 'specter-row__dot--sim' : ''} ${row.crisis ? 'specter-row__dot--crisis' : ''}`}
            />
          </div>
          <div className="specter-row__right">
            {row.crisis && (
              <EventCard event={row.crisis} dimmed={isDimmed(row.crisis)} />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function Specter() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFamily, setActiveFamily] = useState('ALL');
  const [activeType, setActiveType] = useState('ALL');

  useEffect(() => {
    setLoading(true);
    fetchSpecterEvents()
      .then((data) => {
        setEvents(data.sort((a, b) => new Date(attr(a, 'startDate')) - new Date(attr(b, 'startDate'))));
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const grouped = useMemo(() => groupByYear(events), [events]);

  const visibleCount = useMemo(() => {
    return events.filter((e) => {
      if (activeFamily !== 'ALL' && attr(e, 'category') !== activeFamily) return false;
      if (activeType !== 'ALL' && attr(e, 'type') !== activeType) return false;
      return true;
    }).length;
  }, [events, activeFamily, activeType]);

  const toggleFamily = (f) => setActiveFamily((prev) => (prev === f ? 'ALL' : f));

  return (
    <div className="specter-page">
      <div className="specter-page__header">
        <div className="specter-page__title-row">
          <Eye size={22} className="specter-page__icon" />
          <div>
            <h1 className="specter-page__title">SPECTER</h1>
            <p className="specter-page__subtitle">La mémoire des menaces — simulations & crises réelles</p>
          </div>
        </div>

        <p className="specter-page__legend">
          <span className="specter-legend__sim"><FlaskConical size={12} /> Simulations (gauche)</span>
          <span className="specter-legend__sep">·</span>
          <span className="specter-legend__crisis"><RadioTower size={12} /> Crises réelles (droite)</span>
        </p>

        <div className="specter-page__filters">
          <div className="specter-filters__family">
            {Object.keys(SPECTER_FAMILIES).map((f) => (
              <FamilyChip
                key={f}
                family={f}
                active={activeFamily === f}
                onClick={() => toggleFamily(f)}
              />
            ))}
          </div>
          <div className="specter-filters__type">
            {['ALL', 'simulation', 'crisis'].map((t) => (
              <button
                key={t}
                className={`specter-type-btn ${activeType === t ? 'specter-type-btn--active' : ''}`}
                onClick={() => setActiveType((prev) => (prev === t ? 'ALL' : t))}
              >
                {t === 'ALL' ? 'Tous' : t === 'simulation' ? 'Simulations' : 'Crises'}
              </button>
            ))}
          </div>
          <div className="specter-filters__count">
            {visibleCount} événement{visibleCount !== 1 ? 's' : ''}
            {(activeFamily !== 'ALL' || activeType !== 'ALL') && ` / ${events.length} total`}
          </div>
        </div>
      </div>

      {loading && <Loader text="Chargement de la mémoire..." />}

      {error && (
        <div className="specter-page__error">
          <AlertTriangle size={16} />
          Impossible de charger SPECTER. Vérifiez la connexion.
        </div>
      )}

      {!loading && !error && events.length === 0 && (
        <div className="specter-page__empty">
          Aucun événement enregistré. Ajoutez-en via Strapi Admin.
        </div>
      )}

      {!loading && !error && grouped.length > 0 && (
        <div className="specter-timeline">
          <div className="specter-timeline__header">
            <div className="specter-timeline__col-label specter-timeline__col-label--left">
              <FlaskConical size={13} /> Simulations & Exercices
            </div>
            <div className="specter-timeline__col-label specter-timeline__col-label--right">
              <RadioTower size={13} /> Crises & Épidémies
            </div>
          </div>
          {grouped.map(([year, yearEvents]) => (
            <YearRow
              key={year}
              year={year}
              events={yearEvents}
              activeFamily={activeFamily}
              activeType={activeType}
            />
          ))}
        </div>
      )}
    </div>
  );
}
