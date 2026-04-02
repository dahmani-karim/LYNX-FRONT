import { useState, useMemo } from 'react';
import { useAlertStore } from '../../stores/alertStore';
import { CATEGORIES } from '../../config/categories';
import { getAlertTier, TIER_CONFIG } from '../../services/deltaEngine';
import { getChartData } from '../../services/deltaHistory';
import { timeAgo } from '../../utils/date';
import { Link } from 'react-router-dom';
import {
  ArrowUp, ArrowDown, Plus, CheckCircle, ChevronDown, ChevronUp, Zap, BarChart3
} from 'lucide-react';
import './DeltaPanel.scss';

export default function DeltaPanel() {
  const delta = useAlertStore((s) => s.delta);
  const [expanded, setExpanded] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const { newEvents, resolved, escalated, deescalated } = delta;
  const totalChanges = newEvents.length + resolved.length + escalated.length + deescalated.length;

  const historyData = useMemo(() => showHistory ? getChartData('24h') : [], [showHistory, totalChanges]);

  if (totalChanges === 0) return null;

  const flashCount = newEvents.filter((e) => getAlertTier(e) === 'flash').length;
  const priorityCount = newEvents.filter((e) => getAlertTier(e) === 'priority').length;

  return (
    <section className="delta-panel">
      <button
        className="delta-panel__header"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="delta-panel__header-left">
          <Zap size={14} className="delta-panel__icon" />
          <span className="delta-panel__title">Changements détectés</span>
        </div>
        <div className="delta-panel__badges">
          {newEvents.length > 0 && (
            <span className="delta-panel__badge delta-panel__badge--new">
              <Plus size={10} /> {newEvents.length} nouveau{newEvents.length > 1 ? 'x' : ''}
            </span>
          )}
          {escalated.length > 0 && (
            <span className="delta-panel__badge delta-panel__badge--escalated">
              <ArrowUp size={10} /> {escalated.length} escalade{escalated.length > 1 ? 's' : ''}
            </span>
          )}
          {resolved.length > 0 && (
            <span className="delta-panel__badge delta-panel__badge--resolved">
              <CheckCircle size={10} /> {resolved.length} résolu{resolved.length > 1 ? 's' : ''}
            </span>
          )}
          {deescalated.length > 0 && (
            <span className="delta-panel__badge delta-panel__badge--deescalated">
              <ArrowDown size={10} /> {deescalated.length}
            </span>
          )}
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </button>

      {/* FLASH / PRIORITY badges */}
      {(flashCount > 0 || priorityCount > 0) && (
        <div className="delta-panel__tiers">
          {flashCount > 0 && (
            <span className="delta-panel__tier delta-panel__tier--flash">
              FLASH × {flashCount}
            </span>
          )}
          {priorityCount > 0 && (
            <span className="delta-panel__tier delta-panel__tier--priority">
              PRIORITÉ × {priorityCount}
            </span>
          )}
        </div>
      )}

      {expanded && (
        <div className="delta-panel__body">
          {/* New Events */}
          {newEvents.length > 0 && (
            <div className="delta-panel__section">
              <p className="delta-panel__section-label delta-panel__section-label--new">
                <Plus size={12} /> Nouvelles alertes
              </p>
              {newEvents.slice(0, 5).map((e) => {
                const cat = CATEGORIES[e.type] || CATEGORIES.other;
                const tier = getAlertTier(e);
                const tierCfg = TIER_CONFIG[tier];
                return (
                  <Link key={e.id} to={`/alert/${encodeURIComponent(e.id)}`} className="delta-panel__item">
                    <span className="delta-panel__item-dot" style={{ backgroundColor: cat.color }} />
                    <span className="delta-panel__item-title">{e.title}</span>
                    <span className="delta-panel__item-tier" style={{ color: tierCfg.color, backgroundColor: tierCfg.bg }}>
                      {tierCfg.label}
                    </span>
                    <span className="delta-panel__item-time">{timeAgo(e.eventDate)}</span>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Escalated */}
          {escalated.length > 0 && (
            <div className="delta-panel__section">
              <p className="delta-panel__section-label delta-panel__section-label--escalated">
                <ArrowUp size={12} /> Escalades
              </p>
              {escalated.slice(0, 3).map(({ event, from, to }) => (
                <div key={event.id} className="delta-panel__item">
                  <span className="delta-panel__item-dot" style={{ backgroundColor: '#EF4444' }} />
                  <span className="delta-panel__item-title">{event.title}</span>
                  <span className="delta-panel__item-change">
                    {from} → {to}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Resolved */}
          {resolved.length > 0 && (
            <div className="delta-panel__section">
              <p className="delta-panel__section-label delta-panel__section-label--resolved">
                <CheckCircle size={12} /> Résolues
              </p>
              {resolved.slice(0, 3).map((e) => (
                <div key={e.id} className="delta-panel__item delta-panel__item--resolved">
                  <span className="delta-panel__item-dot" style={{ backgroundColor: '#10B981' }} />
                  <span className="delta-panel__item-title">{e.title}</span>
                </div>
              ))}
            </div>
          )}

          {/* De-escalated */}
          {deescalated.length > 0 && (
            <div className="delta-panel__section">
              <p className="delta-panel__section-label delta-panel__section-label--deescalated">
                <ArrowDown size={12} /> Dé-escalades
              </p>
              {deescalated.slice(0, 3).map(({ event, from, to }) => (
                <div key={event.id} className="delta-panel__item">
                  <span className="delta-panel__item-dot" style={{ backgroundColor: '#3B82F6' }} />
                  <span className="delta-panel__item-title">{event.title}</span>
                  <span className="delta-panel__item-change">
                    {from} → {to}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Delta History mini chart */}
          <button
            className="delta-panel__history-toggle"
            onClick={() => setShowHistory(!showHistory)}
          >
            <BarChart3 size={12} />
            {showHistory ? 'Masquer l\'historique' : 'Historique 24h'}
          </button>

          {showHistory && historyData.length > 0 && (
            <div className="delta-panel__history">
              <div className="delta-panel__history-bars">
                {historyData.map((d, i) => {
                  const maxScore = Math.max(...historyData.map((h) => h.score), 1);
                  const height = Math.max(2, (d.score / maxScore) * 40);
                  const color = d.score >= 75 ? '#EF4444' : d.score >= 50 ? '#F97316' : d.score >= 25 ? '#F59E0B' : '#10B981';
                  return (
                    <div key={i} className="delta-panel__history-col" title={`${d.time} — Score: ${d.score}, ${d.total} alertes`}>
                      <div className="delta-panel__history-bar" style={{ height: `${height}px`, backgroundColor: color }} />
                      {i % 4 === 0 && <span className="delta-panel__history-label">{d.time}</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {showHistory && historyData.length === 0 && (
            <p className="delta-panel__history-empty">Pas encore de données — l'historique se remplit au fil des cycles.</p>
          )}
        </div>
      )}
    </section>
  );
}
