import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAlertStore } from '../../stores/alertStore';
import { CATEGORIES, SEVERITY_LEVELS } from '../../config/categories';
import SeverityBadge from '../../components/SeverityBadge/SeverityBadge';
import { formatDate, timeAgo } from '../../utils/date';
import { Clock, ChevronDown, ChevronUp } from 'lucide-react';
import './Timeline.scss';

const TIME_FILTERS = [
  { value: '6h', label: '6h' },
  { value: '24h', label: '24h' },
  { value: '7d', label: '7j' },
  { value: '30d', label: '30j' },
  { value: 'all', label: 'Tout' },
];

function getTimeLimit(value) {
  const now = Date.now();
  const ms = { '6h': 6 * 3600000, '24h': 86400000, '7d': 604800000, '30d': 2592000000 };
  return ms[value] ? now - ms[value] : 0;
}

function groupByDate(events) {
  const groups = {};
  events.forEach((e) => {
    const d = new Date(e.eventDate);
    const key = d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
    if (!groups[key]) groups[key] = [];
    groups[key].push(e);
  });
  return Object.entries(groups);
}

export default function Timeline() {
  const events = useAlertStore((s) => s.events);
  const [timeFilter, setTimeFilter] = useState('24h');
  const [expandedGroups, setExpandedGroups] = useState(new Set());

  const filteredEvents = useMemo(() => {
    const limit = getTimeLimit(timeFilter);
    return [...events]
      .filter((e) => new Date(e.eventDate).getTime() >= limit)
      .sort((a, b) => new Date(b.eventDate) - new Date(a.eventDate));
  }, [events, timeFilter]);

  const groups = useMemo(() => groupByDate(filteredEvents), [filteredEvents]);

  const toggleGroup = (key) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  // Default: all groups expanded
  const isExpanded = (key) => expandedGroups.size === 0 || !expandedGroups.has(key);

  return (
    <div className="timeline">
      <div className="timeline__header">
        <h1 className="timeline__title">
          <Clock size={20} />
          Chronologie
        </h1>
        <div className="timeline__filters">
          {TIME_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setTimeFilter(f.value)}
              className={`timeline__chip ${timeFilter === f.value ? 'timeline__chip--active' : ''}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <p className="timeline__count">
        {filteredEvents.length} événement{filteredEvents.length > 1 ? 's' : ''}
      </p>

      {groups.length === 0 ? (
        <div className="timeline__empty">
          <p>🕊️</p>
          <p>Aucun événement dans cette période</p>
        </div>
      ) : (
        <div className="timeline__stream">
          {groups.map(([dateLabel, dayEvents]) => (
            <div key={dateLabel} className="timeline__group">
              <button
                className="timeline__group-header"
                onClick={() => toggleGroup(dateLabel)}
              >
                <span className="timeline__group-date">{dateLabel}</span>
                <span className="timeline__group-meta">
                  <span className="timeline__group-count">{dayEvents.length}</span>
                  {isExpanded(dateLabel) ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </span>
              </button>

              {isExpanded(dateLabel) && (
                <div className="timeline__events">
                  {dayEvents.map((event) => {
                    const cat = CATEGORIES[event.type] || CATEGORIES.other;
                    const Icon = cat.icon;
                    const d = new Date(event.eventDate);
                    const time = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

                    return (
                      <Link
                        to={`/alert/${encodeURIComponent(event.id)}`}
                        key={event.id}
                        className="timeline__event"
                      >
                        <div className="timeline__line">
                          <div
                            className="timeline__dot"
                            style={{ backgroundColor: SEVERITY_LEVELS[event.severity]?.color || '#6B7280' }}
                          />
                        </div>
                        <div className="timeline__event-body">
                          <div className="timeline__event-top">
                            <span className="timeline__event-time">{time}</span>
                            <SeverityBadge severity={event.severity} size="xs" />
                          </div>
                          <h4 className="timeline__event-title">{event.title}</h4>
                          <div className="timeline__event-meta">
                            <span className="timeline__event-cat" style={{ color: cat.color }}>
                              <Icon size={12} />
                              {cat.label}
                            </span>
                            <span className="timeline__event-source">{event.sourceName}</span>
                            <span className="timeline__event-ago">{timeAgo(event.eventDate)}</span>
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
      )}
    </div>
  );
}
