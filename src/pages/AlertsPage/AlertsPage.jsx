import { useState } from 'react';
import { useAlertStore } from '../../stores/alertStore';
import AlertCard from '../../components/AlertCard/AlertCard';
import Loader from '../../components/Loader/Loader';
import { CATEGORIES } from '../../config/categories';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import './AlertsPage.scss';

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
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEvents = getFilteredEvents();

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
      {showFilters && (
        <div className="alerts-page__filters">
          <div>
            <p className="alerts-page__filter-label">Période</p>
            <div className="alerts-page__chip-group">
              {TIME_RANGES.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setFilter('timeRange', t.value)}
                  className={`alerts-page__chip ${filters.timeRange === t.value ? 'alerts-page__chip--active' : ''}`}
                >
                  {t.label}
                </button>
              ))}
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
          {filteredEvents.length} alerte{filteredEvents.length > 1 ? 's' : ''}
        </p>
        <p className="alerts-page__results-period">
          Période : {TIME_RANGES.find((t) => t.value === filters.timeRange)?.label}
        </p>
      </div>

      {/* Alert list */}
      {isLoading && filteredEvents.length === 0 ? (
        <Loader text="Chargement des alertes..." />
      ) : filteredEvents.length === 0 ? (
        <div className="alerts-page__empty">
          <p className="alerts-page__empty-icon">🟢</p>
          <p className="alerts-page__empty-title">Aucune alerte</p>
          <p className="alerts-page__empty-hint">
            {hasActiveFilters ? 'Modifiez vos filtres' : 'Tout est calme pour le moment'}
          </p>
        </div>
      ) : (
        <div className="alerts-page__list">
          {filteredEvents.map((event) => (
            <AlertCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
