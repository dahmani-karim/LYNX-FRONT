import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAlertStore } from '../../stores/alertStore';
import { useSavedAlertStore } from '../../stores/savedAlertStore';
import { useAuthStore } from '../../stores/authStore';
import AlertCard from '../../components/AlertCard/AlertCard';
import SeverityBadge from '../../components/SeverityBadge/SeverityBadge';
import Loader from '../../components/Loader/Loader';
import { CATEGORIES, SEVERITY_LEVELS } from '../../config/categories';
import { Search, SlidersHorizontal, X, Bookmark, Radio, Crown, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import './AlertsPage.scss';

const FREE_TIME_RANGES = ['1h', '6h', '24h'];

const TIME_RANGES = [
  { value: '1h', label: '1h' },
  { value: '6h', label: '6h' },
  { value: '24h', label: '24h' },
  { value: '7d', label: '7j' },
  { value: '30d', label: '30j' },
  { value: 'all', label: 'Tout' },
];

const SEVERITY_OPTIONS = [
  { value: 'all', label: 'Toutes' },
  { value: 'low', label: 'Faible+' },
  { value: 'medium', label: 'Modéré+' },
  { value: 'high', label: 'Élevé+' },
  { value: 'critical', label: 'Critique' },
];

export default function AlertsPage() {
  const { events, isLoading, filters, setFilter, getFilteredEvents, resetFilters } = useAlertStore();
  const { isAuthenticated } = useAuthStore();
  const isPremium = useAuthStore((s) => s.isPremium);
  const { savedAlerts, fetchSaved } = useSavedAlertStore();
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [tab, setTab] = useState('live'); // 'live' | 'saved' | 'timeline'
  const [expandedGroups, setExpandedGroups] = useState(new Set());

  const filteredEvents = getFilteredEvents();
  const displayedEvents = tab === 'saved' ? savedAlerts : filteredEvents;

  const handleSearch = (q) => {
    setSearchQuery(q);
    setFilter('searchQuery', q);
  };

  const toggleCategory = (catId) => {
    const current = filters.categories;
    const updated = current.includes(catId)
      ? current.filter((c) => c !== catId)
      : [...current, catId];
    setFilter('categories', updated);
  };

  const availableCategories = Object.values(CATEGORIES).filter((c) => c.id !== 'other');
  const hasActiveFilters = filters.categories.length > 0 || filters.severity !== 'all' || filters.timeRange !== '24h';

  // Timeline grouping by date
  const timelineGroups = useMemo(() => {
    const groups = {};
    filteredEvents.forEach((e) => {
      const d = new Date(e.eventDate);
      const key = d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
      if (!groups[key]) groups[key] = [];
      groups[key].push(e);
    });
    return Object.entries(groups);
  }, [filteredEvents]);

  const toggleGroup = (key) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const isExpanded = (key) => expandedGroups.size === 0 || !expandedGroups.has(key);

  return (
    <div className="alerts-page">
      {/* Tabs */}
      <div className="alerts-page__tabs">
        <button
          onClick={() => setTab('live')}
          className={`alerts-page__tab ${tab === 'live' ? 'alerts-page__tab--active' : ''}`}
        >
          <Radio size={14} />
          En direct
        </button>
        {isAuthenticated && (
          <button
            onClick={() => { setTab('saved'); fetchSaved(); }}
            className={`alerts-page__tab ${tab === 'saved' ? 'alerts-page__tab--active' : ''}`}
          >
            <Bookmark size={14} />
            Sauvegardées
            {savedAlerts.length > 0 && (
              <span className="alerts-page__tab-badge">{savedAlerts.length}</span>
            )}
          </button>
        )}
        <button
          onClick={() => setTab('timeline')}
          className={`alerts-page__tab ${tab === 'timeline' ? 'alerts-page__tab--active' : ''}`}
        >
          <Clock size={14} />
          Chronologie
        </button>
      </div>

      {/* Search bar */}
      <div className="alerts-page__search-row">
        <div className="alerts-page__search-wrap">
          <Search size={16} className="alerts-page__search-icon" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Rechercher une alerte..."
            className="alerts-page__search-input"
          />
          {searchQuery && (
            <button onClick={() => handleSearch('')} className="alerts-page__search-clear">
              <X size={14} />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`alerts-page__filter-btn ${hasActiveFilters ? 'alerts-page__filter-btn--active' : ''}`}
        >
          <SlidersHorizontal size={18} />
        </button>
      </div>

      {/* Filters panel */}
      {showFilters && tab === 'live' && (
        <div className="alerts-page__filters">
          <div>
            <p className="alerts-page__filter-label">Période</p>
            <div className="alerts-page__chip-group">
              {TIME_RANGES.map((t) => {
                const locked = !isPremium && !FREE_TIME_RANGES.includes(t.value);
                return (
                  <button
                    key={t.value}
                    onClick={() => !locked && setFilter('timeRange', t.value)}
                    className={`alerts-page__chip ${filters.timeRange === t.value ? 'alerts-page__chip--active' : ''} ${locked ? 'alerts-page__chip--locked' : ''}`}
                    title={locked ? 'Premium requis' : ''}
                  >
                    {t.label}
                    {locked && <Crown size={10} />}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="alerts-page__filter-label">Sévérité minimum</p>
            <div className="alerts-page__chip-group">
              {SEVERITY_OPTIONS.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setFilter('severity', s.value)}
                  className={`alerts-page__chip ${filters.severity === s.value ? 'alerts-page__chip--active' : ''}`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="alerts-page__filter-label">Catégories</p>
            <div className="alerts-page__chip-group">
              {availableCategories.map((cat) => {
                const isActive = filters.categories.length === 0 || filters.categories.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    onClick={() => toggleCategory(cat.id)}
                    className={`alerts-page__cat-chip ${!isActive ? 'alerts-page__cat-chip--dim' : ''}`}
                  >
                    <span className="alerts-page__cat-dot" style={{ backgroundColor: cat.color }} />
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          {hasActiveFilters && (
            <button onClick={resetFilters} className="alerts-page__reset">
              Réinitialiser les filtres
            </button>
          )}
        </div>
      )}

      {/* Results count */}
      <div className="alerts-page__results">
        <p className="alerts-page__results-count">
          {displayedEvents.length} alerte{displayedEvents.length > 1 ? 's' : ''}
        </p>
        {tab === 'live' && (
          <p className="alerts-page__results-period">
            Période : {TIME_RANGES.find((t) => t.value === filters.timeRange)?.label}
          </p>
        )}
      </div>

      {/* Alert list */}
      {isLoading && displayedEvents.length === 0 ? (
        <Loader text="Chargement des alertes..." />
      ) : tab === 'timeline' ? (
        timelineGroups.length === 0 ? (
          <div className="alerts-page__empty">
            <p className="alerts-page__empty-icon">🕊️</p>
            <p className="alerts-page__empty-title">Aucun événement dans cette période</p>
          </div>
        ) : (
          <div className="alerts-page__stream">
            {timelineGroups.map(([dateLabel, dayEvents]) => (
              <div key={dateLabel} className="alerts-page__tl-group">
                <button
                  className="alerts-page__tl-group-header"
                  onClick={() => toggleGroup(dateLabel)}
                >
                  <span className="alerts-page__tl-group-date">{dateLabel}</span>
                  <span className="alerts-page__tl-group-meta">
                    <span className="alerts-page__tl-group-count">{dayEvents.length}</span>
                    {isExpanded(dateLabel) ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </span>
                </button>
                {isExpanded(dateLabel) && (
                  <div className="alerts-page__tl-events">
                    {dayEvents.map((event) => {
                      const cat = CATEGORIES[event.type] || CATEGORIES.other;
                      const d = new Date(event.eventDate);
                      const time = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
                      return (
                        <Link
                          to={`/alert/${encodeURIComponent(event.id)}`}
                          key={event.id}
                          className="alerts-page__tl-event"
                        >
                          <div className="alerts-page__tl-line">
                            <div
                              className="alerts-page__tl-dot"
                              style={{ backgroundColor: SEVERITY_LEVELS[event.severity]?.color || '#6B7280' }}
                            />
                          </div>
                          <div className="alerts-page__tl-event-body">
                            <div className="alerts-page__tl-event-top">
                              <span className="alerts-page__tl-event-time">{time}</span>
                              <SeverityBadge severity={event.severity} size="xs" />
                            </div>
                            <p className="alerts-page__tl-event-title">{event.title}</p>
                            <div className="alerts-page__tl-event-meta">
                              <span className="alerts-page__tl-event-cat">
                                <span style={{ color: cat.color }}>●</span> {cat.label}
                              </span>
                              <span className="alerts-page__tl-event-source">{event.sourceName}</span>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      ) : displayedEvents.length === 0 ? (
        <div className="alerts-page__empty">
          <p className="alerts-page__empty-icon">{tab === 'saved' ? '📌' : '🟢'}</p>
          <p className="alerts-page__empty-title">
            {tab === 'saved' ? 'Aucune alerte sauvegardée' : 'Aucune alerte'}
          </p>
          <p className="alerts-page__empty-hint">
            {tab === 'saved'
              ? 'Sauvegardez des alertes depuis leur page de détail'
              : hasActiveFilters ? 'Modifiez vos filtres' : 'Tout est calme pour le moment'}
          </p>
        </div>
      ) : (
        <div className="alerts-page__list">
          {displayedEvents.map((event) => (
            <AlertCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
