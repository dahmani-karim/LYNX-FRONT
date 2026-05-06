import { useAlertStore } from '../../stores/alertStore';
import { CATEGORIES } from '../../config/categories';
import { SEVERITY_LEVELS } from '../../config/categories';
import { formatDate, timeAgo } from '../../utils/date';
import { Link } from 'react-router-dom';
import './NewsTicker.scss';

export default function NewsTicker() {
  const events = useAlertStore((s) => s.events);

  const tickerEvents = events
    .filter((e) => e.type !== 'blackout' && new Date(e.eventDate).getTime() <= Date.now())
    .sort((a, b) => new Date(b.eventDate) - new Date(a.eventDate))
    .slice(0, 20);

  if (tickerEvents.length === 0) return null;

  // Duplicate for seamless infinite scroll
  const items = [...tickerEvents, ...tickerEvents];

  return (
    <div className="news-ticker">
      <div className="news-ticker__track">
        {items.map((e, i) => {
          const cat = CATEGORIES[e.type] || CATEGORIES.other;
          const sev = SEVERITY_LEVELS[e.severity];
          const Icon = cat.icon;
          return (
            <Link
              key={`${e.id}-${i}`}
              to={`/alert/${encodeURIComponent(e.id)}`}
              className="news-ticker__item"
            >
              <span className="news-ticker__dot" style={{ backgroundColor: sev?.color || cat.color }} />
              <Icon size={12} style={{ color: cat.color, flexShrink: 0 }} />
              <span className="news-ticker__text">{e.title}</span>
              <span className="news-ticker__time" title={timeAgo(e.eventDate)}>{formatDate(e.eventDate)}</span>
              <span className="news-ticker__sep">•</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
