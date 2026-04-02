import { useMemo, useState } from 'react';
import { useAlertStore } from '../../stores/alertStore';
import { useAuthStore } from '../../stores/authStore';
import { CATEGORIES, SEVERITY_LEVELS } from '../../config/categories';
import { findCorrelations, generateInsights } from '../../services/correlationEngine';
import { calculateTrends, getPredictiveAlerts } from '../../services/predictiveEngine';
import SeverityBadge from '../../components/SeverityBadge/SeverityBadge';
import PremiumGate from '../../components/PremiumGate/PremiumGate';
import { Link2, TrendingUp, TrendingDown, Minus, MapPin, Clock, ArrowRight, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import { timeAgo } from '../../utils/date';
import './AnalysisPage.scss';

export default function AnalysisPage() {
  const events = useAlertStore((s) => s.events);
  const isPremium = useAuthStore((s) => s.isPremium);
  const [tab, setTab] = useState('correlations'); // 'correlations' | 'trends'
  const [expandedCorr, setExpandedCorr] = useState(new Set());

  const correlations = useMemo(() => findCorrelations(events), [events]);
  const insights = useMemo(() => generateInsights(correlations), [correlations]);
  const trends = useMemo(() => calculateTrends(events), [events]);
  const predictions = useMemo(() => getPredictiveAlerts(events), [events]);

  const toggleCorrelation = (id) => {
    setExpandedCorr((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  };

  const TrendIcon = ({ trend }) => {
    if (trend === 'rising') return <TrendingUp size={14} style={{ color: '#EF4444' }} />;
    if (trend === 'declining') return <TrendingDown size={14} style={{ color: '#10B981' }} />;
    return <Minus size={14} style={{ color: '#9CA3AF' }} />;
  };

  return (
    <PremiumGate feature="Analyse avancée">
    <div className="analysis-page">
      <header className="analysis-page__header">
        <h1 className="analysis-page__title">Analyse avancée</h1>
        <p className="analysis-page__subtitle">
          Corrélations entre événements et tendances prédictives basées sur {events.length} alertes actives
        </p>
      </header>

      {/* Tabs */}
      <div className="analysis-page__tabs">
        <button
          className={`analysis-page__tab ${tab === 'correlations' ? 'analysis-page__tab--active' : ''}`}
          onClick={() => setTab('correlations')}
        >
          <Link2 size={14} />
          Corrélations ({correlations.length})
        </button>
        <button
          className={`analysis-page__tab ${tab === 'trends' ? 'analysis-page__tab--active' : ''}`}
          onClick={() => setTab('trends')}
        >
          <TrendingUp size={14} />
          Tendances ({trends.length})
        </button>
      </div>

      {/* Correlations Tab */}
      {tab === 'correlations' && (
        <div className="analysis-page__section">
          {/* Summary insights */}
          {insights.length > 0 && (
            <div className="analysis-page__insights">
              <h2 className="analysis-page__section-title">
                <AlertTriangle size={16} />
                Résumé des corrélations
              </h2>
              <div className="analysis-page__insights-grid">
                {insights.map((ins, i) => (
                  <div key={i} className={`analysis-page__insight analysis-page__insight--${ins.severity}`}>
                    <p className="analysis-page__insight-title">{ins.title}</p>
                    <p className="analysis-page__insight-desc">{ins.description}</p>
                    {ins.type === 'cluster' && (
                      <p className="analysis-page__insight-meta">
                        <MapPin size={12} /> Événements géographiquement proches
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Full correlation list */}
          <h2 className="analysis-page__section-title">
            Détail des corrélations ({correlations.length})
          </h2>

          {correlations.length === 0 ? (
            <div className="analysis-page__empty">
              <Link2 size={24} />
              <p>Aucune corrélation détectée avec les alertes actuelles.</p>
              <p className="analysis-page__empty-sub">Les corrélations sont détectées entre événements proches temporellement (48h) ou géographiquement (500 km).</p>
            </div>
          ) : (
            <div className="analysis-page__correlations">
              {correlations.map((corr) => {
                const srcCat = CATEGORIES[corr.source.type] || CATEGORIES.other;
                const impCat = CATEGORIES[corr.impact.type] || CATEGORIES.other;
                const isExpanded = expandedCorr.has(corr.id);

                return (
                  <div key={corr.id} className="analysis-page__corr-card" onClick={() => toggleCorrelation(corr.id)}>
                    <div className="analysis-page__corr-header">
                      <div className="analysis-page__corr-chain">
                        <span className="analysis-page__corr-cat" style={{ color: srcCat.color }}>
                          {srcCat.label}
                        </span>
                        <ArrowRight size={12} style={{ color: '#6B7280' }} />
                        <span className="analysis-page__corr-cat" style={{ color: impCat.color }}>
                          {impCat.label}
                        </span>
                      </div>
                      <div className="analysis-page__corr-meta">
                        <span className={`analysis-page__confidence analysis-page__confidence--${corr.confidence >= 70 ? 'high' : corr.confidence >= 40 ? 'med' : 'low'}`}>
                          {corr.confidence}%
                        </span>
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </div>
                    </div>

                    <p className="analysis-page__corr-pattern">{corr.pattern}</p>

                    <div className="analysis-page__corr-badges">
                      {corr.temporal && <span className="analysis-page__badge">⏱ Temporelle</span>}
                      {corr.geographic && <span className="analysis-page__badge">📍 Géographique{corr.distance ? ` (${corr.distance} km)` : ''}</span>}
                    </div>

                    {isExpanded && (
                      <div className="analysis-page__corr-detail">
                        <div className="analysis-page__corr-event">
                          <SeverityBadge severity={corr.source.severity} size="xs" />
                          <div>
                            <p className="analysis-page__corr-event-title">{corr.source.title}</p>
                            <p className="analysis-page__corr-event-meta">
                              {corr.source.sourceName} · {timeAgo(corr.source.eventDate)}
                            </p>
                          </div>
                        </div>
                        <div className="analysis-page__corr-arrow">
                          <ArrowRight size={14} />
                        </div>
                        <div className="analysis-page__corr-event">
                          <SeverityBadge severity={corr.impact.severity} size="xs" />
                          <div>
                            <p className="analysis-page__corr-event-title">{corr.impact.title}</p>
                            <p className="analysis-page__corr-event-meta">
                              {corr.impact.sourceName} · {timeAgo(corr.impact.eventDate)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Trends Tab */}
      {tab === 'trends' && (
        <div className="analysis-page__section">
          {/* Predictions alerts */}
          {predictions.length > 0 && (
            <div className="analysis-page__predictions">
              <h2 className="analysis-page__section-title">
                <AlertTriangle size={16} />
                Tendances haussières détectées
              </h2>
              <div className="analysis-page__insights-grid">
                {predictions.map((pred, i) => (
                  <div key={i} className={`analysis-page__insight analysis-page__insight--${pred.severity}`}>
                    <div className="analysis-page__pred-head">
                      <TrendingUp size={14} style={{ color: pred.color }} />
                      <span style={{ color: pred.color, fontWeight: 600 }}>{pred.label}</span>
                    </div>
                    <p className="analysis-page__insight-desc">{pred.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Full trend table */}
          <h2 className="analysis-page__section-title">
            Évolution par catégorie (6h glissantes)
          </h2>

          {trends.length === 0 ? (
            <div className="analysis-page__empty">
              <TrendingUp size={24} />
              <p>Pas assez de données pour calculer les tendances.</p>
            </div>
          ) : (
            <div className="analysis-page__trends">
              {trends.map((t) => {
                const cat = CATEGORIES[t.category] || CATEGORIES.other;
                const Icon = cat.icon;
                return (
                  <div key={t.category} className="analysis-page__trend-row">
                    <div className="analysis-page__trend-cat">
                      <div className="analysis-page__trend-icon" style={{ backgroundColor: cat.bgColor }}>
                        <Icon size={14} style={{ color: cat.color }} />
                      </div>
                      <span className="analysis-page__trend-label">{t.label}</span>
                    </div>

                    <div className="analysis-page__trend-scores">
                      <span className="analysis-page__trend-prev">{t.previousScore}</span>
                      <ArrowRight size={10} style={{ color: '#6B7280' }} />
                      <span className="analysis-page__trend-curr">{t.currentScore}</span>
                    </div>

                    <div className="analysis-page__trend-delta">
                      <TrendIcon trend={t.trend} />
                      <span className={`analysis-page__trend-value analysis-page__trend-value--${t.trend}`}>
                        {t.delta > 0 ? '+' : ''}{t.delta}
                      </span>
                    </div>

                    {/* Mini bar */}
                    <div className="analysis-page__trend-bar">
                      <div
                        className="analysis-page__trend-fill"
                        style={{
                          width: `${Math.min(100, t.currentScore * 5)}%`,
                          backgroundColor: t.trend === 'rising' ? '#EF4444' : t.trend === 'declining' ? '#10B981' : cat.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Explanation */}
          <div className="analysis-page__explain">
            <h3>Comment ça fonctionne ?</h3>
            <p>
              Les tendances sont calculées en comparant le score pondéré des alertes des 6 dernières heures
              avec les 6 heures précédentes. Chaque alerte est pondérée par sa sévérité :
              critique (×5), élevée (×4), modérée (×3), faible (×2), info (×1).
            </p>
            <p>
              Une tendance <strong>haussière</strong> indique une augmentation significative du risque (delta &gt; 2).
              Une tendance <strong>baissière</strong> indique une amélioration (delta &lt; -2).
            </p>
          </div>
        </div>
      )}
    </div>
    </PremiumGate>
  );
}
