import { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { useAlertStore } from '../../stores/alertStore';
import { CATEGORIES, SEVERITY_LEVELS } from '../../config/categories';
import { getScoreColor } from '../../services/riskEngine';
import { generateReport } from '../../utils/pdfExport';
import { downloadRssFeed } from '../../utils/rssFeed';
import { FileDown, Rss } from 'lucide-react';
import './StatsPage.scss';

export default function StatsPage() {
  const { events, riskScores } = useAlertStore();
  const [timeView, setTimeView] = useState('24h');

  const categoryData = useMemo(() => {
    const counts = {};
    events.forEach((e) => {
      const cat = e.type || 'other';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([key, value]) => ({
        name: CATEGORIES[key]?.label || key,
        value,
        color: CATEGORIES[key]?.color || '#9CA3AF',
      }))
      .sort((a, b) => b.value - a.value);
  }, [events]);

  const severityData = useMemo(() => {
    const counts = {};
    events.forEach((e) => {
      const sev = e.severity || 'info';
      counts[sev] = (counts[sev] || 0) + 1;
    });
    return Object.entries(SEVERITY_LEVELS)
      .map(([key, config]) => ({
        name: config.label,
        value: counts[key] || 0,
        color: config.color,
      }))
      .filter((d) => d.value > 0);
  }, [events]);

  const timelineData = useMemo(() => {
    const now = new Date();
    const hours = timeView === '24h' ? 24 : 24 * 7;
    const bucketSize = timeView === '24h' ? 1 : 24;
    const buckets = [];

    for (let i = hours / bucketSize - 1; i >= 0; i--) {
      const start = new Date(now.getTime() - (i + 1) * bucketSize * 60 * 60 * 1000);
      const end = new Date(now.getTime() - i * bucketSize * 60 * 60 * 1000);
      const count = events.filter((e) => {
        const d = new Date(e.eventDate);
        return d >= start && d < end;
      }).length;
      const label = timeView === '24h'
        ? `${start.getHours()}h`
        : `${start.getDate()}/${start.getMonth() + 1}`;
      buckets.push({ time: label, events: count });
    }
    return buckets;
  }, [events, timeView]);

  const moduleScores = useMemo(() => {
    return Object.entries(riskScores)
      .filter(([key]) => key !== 'global' && CATEGORIES[key])
      .map(([key, score]) => ({
        key,
        label: CATEGORIES[key].label,
        score,
        color: CATEGORIES[key].color,
      }))
      .sort((a, b) => b.score - a.score);
  }, [riskScores]);

  const tooltipStyle = {
    contentStyle: {
      backgroundColor: '#111827',
      border: '1px solid #374151',
      borderRadius: '8px',
      fontSize: '12px',
      color: '#F9FAFB',
    },
  };

  return (
    <div className="stats-page">
      <div className="stats-page__header">
        <h1 className="stats-page__title">Statistiques</h1>
        <div className="stats-page__header-actions">
          <button
            className="stats-page__export-btn"
            onClick={() => downloadRssFeed(events)}
          >
            <Rss size={16} />
            RSS
          </button>
          <button
            className="stats-page__export-btn"
            onClick={() => generateReport(events, riskScores)}
          >
            <FileDown size={16} />
            PDF
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="stats-page__summary">
        <div className="stats-page__summary-card">
          <p className="stats-page__summary-value">{events.length}</p>
          <p className="stats-page__summary-label">Événements</p>
        </div>
        <div className="stats-page__summary-card">
          <p className="stats-page__summary-value stats-page__summary-value--danger">
            {events.filter((e) => e.severity === 'critical' || e.severity === 'high').length}
          </p>
          <p className="stats-page__summary-label">Critiques</p>
        </div>
        <div className="stats-page__summary-card">
          <p className="stats-page__summary-value">{categoryData.length}</p>
          <p className="stats-page__summary-label">Catégories</p>
        </div>
      </div>

      {/* Module scores */}
      <section className="stats-page__section">
        <h3 className="stats-page__section-title">Scores par module</h3>
        <div className="stats-page__scores">
          {moduleScores.map((mod) => (
            <div key={mod.key} className="stats-page__score-row">
              <span className="stats-page__score-label">{mod.label}</span>
              <div className="stats-page__score-track">
                <div
                  className="stats-page__score-bar"
                  style={{ width: `${mod.score}%`, backgroundColor: getScoreColor(mod.score) }}
                />
              </div>
              <span className="stats-page__score-value" style={{ color: getScoreColor(mod.score) }}>
                {mod.score}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Timeline */}
      <section className="stats-page__section">
        <div className="stats-page__section-header">
          <h3 className="stats-page__section-title">Événements dans le temps</h3>
          <div className="stats-page__time-toggle">
            {['24h', '7d'].map((v) => (
              <button
                key={v}
                onClick={() => setTimeView(v)}
                className={`stats-page__time-btn ${timeView === v ? 'stats-page__time-btn--active' : ''}`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={timelineData}>
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#6B7280' }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip {...tooltipStyle} />
            <Area type="monotone" dataKey="events" stroke="#3B82F6" fill="url(#areaGrad)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </section>

      {/* Category breakdown */}
      <section className="stats-page__section">
        <h3 className="stats-page__section-title" style={{ marginBottom: '0.75rem' }}>Répartition par catégorie</h3>
        {categoryData.length > 0 ? (
          <div className="stats-page__cat-row">
            <ResponsiveContainer width={140} height={140}>
              <PieChart>
                <Pie data={categoryData} innerRadius={40} outerRadius={65} dataKey="value" paddingAngle={2}>
                  {categoryData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="stats-page__cat-legend">
              {categoryData.map((cat) => (
                <div key={cat.name} className="stats-page__cat-item">
                  <span className="stats-page__cat-dot" style={{ backgroundColor: cat.color }} />
                  <span className="stats-page__cat-name">{cat.name}</span>
                  <span className="stats-page__cat-count">{cat.value}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="stats-page__empty">Aucune donnée</p>
        )}
      </section>

      {/* Severity breakdown */}
      <section className="stats-page__section">
        <h3 className="stats-page__section-title" style={{ marginBottom: '0.75rem' }}>Répartition par sévérité</h3>
        {severityData.length > 0 ? (
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={severityData} barSize={24}>
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#6B7280' }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {severityData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="stats-page__empty">Aucune donnée</p>
        )}
      </section>
    </div>
  );
}
