import { useState } from 'react';
import { useAlertStore } from '../../stores/alertStore';
import { useSavedAlertStore } from '../../stores/savedAlertStore';
import { useAuthStore } from '../../stores/authStore';
import AlertCard from '../../components/AlertCard/AlertCard';
import Loader from '../../components/Loader/Loader';
import { CATEGORIES } from '../../config/categories';
import { Search, SlidersHorizontal, X, Bookmark, Radio, Crown } from 'lucide-react';
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
  const { isLoading, filters, setFilter, getFilteredEvents, resetFilters } = useAlertStore();
  const { isAuthenticated } = useAuthStore();
  const isPremium = useAuthStore((s) => s.isPremium);
  const { savedAlerts, fetchSaved } = useSavedAlertStore();
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [tab, setTab] = useState('live'); // 'live' | 'saved'

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

  return (
    <div className="alerts-page">
      {/* Tabs */}
      {isAuthenticated && (
        <div className="alerts-page__tabs">
          <button
            onClick={() => setTab('live')}
            className={`alerts-page__tab ${tab === 'live' ? 'alerts-page__tab--active' : ''}`}
          >
            <Radio size={14} />
            En direct
          </button>
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
        </div>
      )}

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
