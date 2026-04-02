/**
 * Delta Engine — detects what changed between two event snapshots.
 * Inspired by Crucix's sweep delta system.
 *
 * Returns: { newEvents, resolved, escalated, deescalated }
 */

const SEVERITY_ORDER = ['info', 'low', 'medium', 'high', 'critical'];

function sevIdx(sev) {
  return SEVERITY_ORDER.indexOf(sev) ?? 0;
}

export function computeDelta(previousEvents, currentEvents) {
  const prevMap = new Map(previousEvents.map((e) => [e.id, e]));
  const currMap = new Map(currentEvents.map((e) => [e.id, e]));

  const newEvents = [];
  const resolved = [];
  const escalated = [];
  const deescalated = [];

  // New events (in current but not in previous) — exclude blackout
  for (const [id, event] of currMap) {
    if (!prevMap.has(id) && event.type !== 'blackout') {
      newEvents.push(event);
    }
  }

  // Resolved events (in previous but not in current) — exclude blackout
  for (const [id, event] of prevMap) {
    if (!currMap.has(id) && event.type !== 'blackout') {
      resolved.push(event);
    }
  }

  // Escalated / De-escalated (same ID, different severity)
  for (const [id, curr] of currMap) {
    const prev = prevMap.get(id);
    if (!prev || prev.type === 'blackout') continue;

    const prevSev = sevIdx(prev.severity);
    const currSev = sevIdx(curr.severity);

    if (currSev > prevSev) {
      escalated.push({ event: curr, from: prev.severity, to: curr.severity });
    } else if (currSev < prevSev) {
      deescalated.push({ event: curr, from: prev.severity, to: curr.severity });
    }
  }

  return {
    newEvents: newEvents.sort((a, b) => sevIdx(b.severity) - sevIdx(a.severity)),
    resolved: resolved.sort((a, b) => sevIdx(b.severity) - sevIdx(a.severity)),
    escalated: escalated.sort((a, b) => sevIdx(b.to) - sevIdx(a.to)),
    deescalated,
  };
}

/**
 * Compute alert tier based on severity + age.
 * FLASH = critical < 1h
 * PRIORITY = critical > 1h OR high < 3h
 * ROUTINE = everything else
 */
export function getAlertTier(event) {
  const ageMs = Date.now() - new Date(event.eventDate).getTime();
  const ageH = ageMs / 3600000;

  if (event.severity === 'critical' && ageH < 1) return 'flash';
  if (event.severity === 'critical' || (event.severity === 'high' && ageH < 3)) return 'priority';
  return 'routine';
}

export const TIER_CONFIG = {
  flash: { label: 'FLASH', color: '#EF4444', bg: 'rgba(239, 68, 68, 0.15)' },
  priority: { label: 'PRIORITÉ', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.15)' },
  routine: { label: 'ROUTINE', color: '#6366F1', bg: 'rgba(99, 102, 241, 0.15)' },
};
