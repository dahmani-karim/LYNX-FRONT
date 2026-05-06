import { SEVERITY_ORDER } from '../config/categories';

function countBySeverity(events, minSeverity = 'medium') {
  const minIdx = SEVERITY_ORDER.indexOf(minSeverity);
  return events.filter((e) => SEVERITY_ORDER.indexOf(e.severity) >= minIdx).length;
}

function latestSeverity(events) {
  if (!events.length) return 'info';
  return events.reduce((max, e) => {
    return SEVERITY_ORDER.indexOf(e.severity) > SEVERITY_ORDER.indexOf(max) ? e.severity : max;
  }, 'info');
}

function categoryScore(events) {
  if (!events.length) return 0;

  const criticals = countBySeverity(events, 'critical');
  // Highs/mediums are raw counts at that exact level (not cumulative)
  const highs = events.filter((e) => e.severity === 'high').length;
  const mediums = events.filter((e) => e.severity === 'medium').length;

  // Weighted sum capped at 100, normalised by a reference volume of 10 alerts
  // so that 1 critical alone = 30pts, 4 criticals = 100pts max
  // regardless of how many medium/low articles GDELT injects
  const raw = criticals * 30 + highs * 15 + mediums * 5;
  const score = Math.min(100, raw);
  return Math.round(score);
}

export function calculateRiskScores(allEvents) {
  const byCategory = {};
  allEvents.forEach((e) => {
    const cat = e.type || 'other';
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(e);
  });

  const scores = {
    earthquake: categoryScore(byCategory.earthquake || []),
    weather: categoryScore(byCategory.weather || []),
    disaster: categoryScore(byCategory.disaster || []),
    cyber: categoryScore(byCategory.cyber || []),
    energy: categoryScore(byCategory.energy || []),
    social: categoryScore(byCategory.social || []),
    fuel: categoryScore(byCategory.fuel || []),
    health: categoryScore(byCategory.health || []),
    blackout: categoryScore(byCategory.blackout || []),
    conflict: categoryScore(byCategory.conflict || []),
    air_quality: categoryScore(byCategory.air_quality || []),
    fire: categoryScore(byCategory.fire || []),
    space_weather: categoryScore(byCategory.space_weather || []),
    nuclear: categoryScore(byCategory.nuclear || []),
    radiation: categoryScore(byCategory.radiation || []),
  };

  const activeScores = Object.values(scores).filter((s) => s > 0);
  const maxScore = Math.max(...Object.values(scores), 0);
  const avgScore = activeScores.length > 0
    ? activeScores.reduce((a, b) => a + b, 0) / activeScores.length
    : 0;

  scores.global = Math.round(Math.min(100, maxScore * 0.6 + avgScore * 0.4));

  return scores;
}

export function getGlobalTrend(currentScore, previousScore) {
  if (previousScore === null || previousScore === undefined) return 'stable';
  const diff = currentScore - previousScore;
  if (diff > 10) return 'degrading';
  if (diff > 5) return 'degrading';
  if (diff < -10) return 'improving';
  if (diff < -5) return 'improving';
  return 'stable';
}

export function getScoreLabel(score) {
  if (score >= 75) return 'Critique';
  if (score >= 50) return 'Élevé';
  if (score >= 25) return 'Modéré';
  if (score >= 10) return 'Faible';
  return 'Stable';
}

export function getScoreColor(score) {
  if (score >= 75) return '#EF4444';
  if (score >= 50) return '#F97316';
  if (score >= 25) return '#F59E0B';
  if (score >= 10) return '#10B981';
  return '#6366F1';
}
