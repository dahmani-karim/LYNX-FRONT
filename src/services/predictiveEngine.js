/**
 * Predictive Scoring Engine
 * Analyses trends in event frequency and severity to predict
 * risk trajectory (rising, stable, declining) per category.
 */

import { CATEGORIES } from '../config/categories';

const SEV_WEIGHT = { critical: 5, high: 4, medium: 3, low: 2, info: 1 };
const TREND_WINDOW_H = 6; // Compare last 6h vs previous 6h

function getEventsBetween(events, startMs, endMs) {
  return events.filter((e) => {
    const t = new Date(e.eventDate).getTime();
    return t >= startMs && t < endMs;
  });
}

function weightedCount(events) {
  return events.reduce((sum, e) => sum + (SEV_WEIGHT[e.severity] || 1), 0);
}

/**
 * Calculate risk trend per category.
 * Returns array of { category, label, currentScore, previousScore, trend, delta }
 */
export function calculateTrends(events) {
  const now = Date.now();
  const windowMs = TREND_WINDOW_H * 3600000;
  const recentStart = now - windowMs;
  const previousStart = recentStart - windowMs;

  const categories = [...new Set(events.map((e) => e.type))];

  return categories
    .map((cat) => {
      const catEvents = events.filter((e) => e.type === cat);
      const recent = getEventsBetween(catEvents, recentStart, now);
      const previous = getEventsBetween(catEvents, previousStart, recentStart);

      const currentScore = weightedCount(recent);
      const previousScore = weightedCount(previous);
      const delta = currentScore - previousScore;

      let trend = 'stable';
      if (delta > 2) trend = 'rising';
      else if (delta < -2) trend = 'declining';

      return {
        category: cat,
        label: CATEGORIES[cat]?.label || cat,
        color: CATEGORIES[cat]?.color || '#9CA3AF',
        currentScore,
        previousScore,
        delta,
        trend,
      };
    })
    .sort((a, b) => b.currentScore - a.currentScore);
}

/**
 * Generate predictive alerts for categories with rising trends.
 */
export function getPredictiveAlerts(events) {
  const trends = calculateTrends(events);
  return trends
    .filter((t) => t.trend === 'rising')
    .map((t) => ({
      category: t.category,
      label: t.label,
      color: t.color,
      message: `Tendance haussière : +${t.delta} en ${TREND_WINDOW_H}h`,
      severity: t.delta > 5 ? 'high' : 'medium',
    }));
}
