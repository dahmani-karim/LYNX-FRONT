/**
 * Delta History — Persists delta snapshots in localStorage for trend visualization.
 * Stores up to 7 days of hourly snapshots.
 */

const STORAGE_KEY = 'lynx-delta-history';
const MAX_ENTRIES = 168; // 7 days × 24h

export function getDeltaHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Record a delta snapshot. Call after each fetchAllData.
 * @param {number} totalEvents - Current total event count
 * @param {number} globalScore - Current global risk score
 * @param {object} delta - { newEvents, resolved, escalated, deescalated }
 */
export function recordDeltaSnapshot(totalEvents, globalScore, delta) {
  try {
    const history = getDeltaHistory();
    const now = new Date();
    const hourKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}T${String(now.getHours()).padStart(2, '0')}`;

    // Only store one snapshot per hour (update if same hour)
    const lastIdx = history.findIndex((h) => h.hour === hourKey);
    const snapshot = {
      hour: hourKey,
      ts: now.toISOString(),
      total: totalEvents,
      score: globalScore,
      new: delta.newEvents?.length || 0,
      resolved: delta.resolved?.length || 0,
      escalated: delta.escalated?.length || 0,
      deescalated: delta.deescalated?.length || 0,
    };

    if (lastIdx >= 0) {
      // Accumulate within same hour
      history[lastIdx].new += snapshot.new;
      history[lastIdx].resolved += snapshot.resolved;
      history[lastIdx].escalated += snapshot.escalated;
      history[lastIdx].deescalated += snapshot.deescalated;
      history[lastIdx].total = snapshot.total;
      history[lastIdx].score = snapshot.score;
      history[lastIdx].ts = snapshot.ts;
    } else {
      history.push(snapshot);
    }

    // Trim to max entries
    while (history.length > MAX_ENTRIES) history.shift();

    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch {
    // localStorage full or unavailable
  }
}

/**
 * Get history formatted for chart display.
 * @param {'24h' | '7d'} range
 * @returns {{ hour: string, score: number, total: number, new: number, resolved: number }[]}
 */
export function getChartData(range = '24h') {
  const history = getDeltaHistory();
  if (!history.length) return [];

  const now = Date.now();
  const maxAge = range === '24h' ? 24 * 3600 * 1000 : 7 * 24 * 3600 * 1000;

  return history
    .filter((h) => now - new Date(h.ts).getTime() < maxAge)
    .map((h) => ({
      time: range === '24h' ? h.hour.slice(11) + 'h' : h.hour.slice(5, 10),
      score: h.score,
      total: h.total,
      new: h.new,
      resolved: h.resolved,
    }));
}
