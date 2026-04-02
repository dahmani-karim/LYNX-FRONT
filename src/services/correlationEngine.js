/**
 * Correlation Engine – detects relationships between events
 * across different categories based on temporal proximity,
 * geographic proximity, and known causal patterns.
 */

// Known causal chains: source → potential impacts
const CAUSAL_PATTERNS = [
  { source: 'earthquake', impacts: ['disaster', 'energy', 'blackout', 'health'], label: 'Séisme → impacts secondaires' },
  { source: 'weather', impacts: ['disaster', 'energy', 'blackout', 'fire'], label: 'Météo extrême → cascades' },
  { source: 'conflict', impacts: ['energy', 'fuel', 'social', 'cyber', 'health'], label: 'Conflit → instabilité' },
  { source: 'cyber', impacts: ['blackout', 'energy'], label: 'Cyberattaque → infrastructures' },
  { source: 'fire', impacts: ['air_quality', 'health', 'energy'], label: 'Incendies → qualité de l\'air' },
  { source: 'space_weather', impacts: ['blackout', 'cyber'], label: 'Météo spatiale → communications' },
  { source: 'social', impacts: ['fuel', 'energy', 'blackout'], label: 'Troubles sociaux → approvisionnement' },
  // New V5 patterns
  { source: 'blackout', impacts: ['cyber', 'health', 'social'], label: 'Coupure internet → instabilité' },
  { source: 'radiation', impacts: ['health', 'air_quality'], label: 'Radiation → risque sanitaire' },
  { source: 'nuclear', impacts: ['energy', 'radiation', 'health', 'blackout'], label: 'Nucléaire → cascade énergétique' },
  { source: 'earthquake', impacts: ['nuclear', 'fire'], label: 'Séisme → risque nucléaire/incendie' },
  { source: 'conflict', impacts: ['blackout', 'nuclear'], label: 'Conflit → coupures & risque nucléaire' },
];

// Max time window for correlation (hours)
const TIME_WINDOW_H = 48;
// Max distance for geographic correlation (km)
const GEO_RADIUS_KM = 500;

function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function isTemporallyClose(event1, event2) {
  const t1 = new Date(event1.eventDate).getTime();
  const t2 = new Date(event2.eventDate).getTime();
  return Math.abs(t1 - t2) <= TIME_WINDOW_H * 3600000;
}

function isGeographicallyClose(event1, event2) {
  if (!event1.latitude || !event2.latitude) return false;
  const dist = haversineKm(event1.latitude, event1.longitude, event2.latitude, event2.longitude);
  return dist <= GEO_RADIUS_KM;
}

/**
 * Find correlations between events.
 * Returns an array of correlation objects.
 */
export function findCorrelations(events) {
  const correlations = [];
  const seen = new Set();

  for (const pattern of CAUSAL_PATTERNS) {
    const sourceEvents = events.filter((e) => e.type === pattern.source);
    const impactEvents = events.filter((e) => pattern.impacts.includes(e.type));

    for (const src of sourceEvents) {
      for (const imp of impactEvents) {
        if (src.id === imp.id) continue;
        const pairKey = [src.id, imp.id].sort().join('|');
        if (seen.has(pairKey)) continue;

        const temporalMatch = isTemporallyClose(src, imp);
        const geoMatch = isGeographicallyClose(src, imp);

        if (temporalMatch || geoMatch) {
          let confidence = 0;
          if (temporalMatch) confidence += 40;
          if (geoMatch) confidence += 40;
          // Severity boost
          const sevScore = { critical: 20, high: 15, medium: 10, low: 5, info: 0 };
          confidence += (sevScore[src.severity] || 0) / 2 + (sevScore[imp.severity] || 0) / 2;
          confidence = Math.min(confidence, 100);

          seen.add(pairKey);
          correlations.push({
            id: pairKey,
            source: src,
            impact: imp,
            pattern: pattern.label,
            confidence: Math.round(confidence),
            temporal: temporalMatch,
            geographic: geoMatch,
            distance: src.latitude && imp.latitude
              ? Math.round(haversineKm(src.latitude, src.longitude, imp.latitude, imp.longitude))
              : null,
          });
        }
      }
    }
  }

  return correlations.sort((a, b) => b.confidence - a.confidence);
}

/**
 * Generate human-readable insights from correlations.
 */
export function generateInsights(correlations) {
  if (correlations.length === 0) return [];

  const insights = [];

  // Group by pattern
  const patternGroups = {};
  correlations.forEach((c) => {
    if (!patternGroups[c.pattern]) patternGroups[c.pattern] = [];
    patternGroups[c.pattern].push(c);
  });

  for (const [pattern, group] of Object.entries(patternGroups)) {
    const highConf = group.filter((c) => c.confidence >= 60);
    if (highConf.length > 0) {
      insights.push({
        type: 'chain',
        severity: highConf.some((c) => c.confidence >= 80) ? 'high' : 'medium',
        title: pattern,
        description: `${highConf.length} corrélation${highConf.length > 1 ? 's' : ''} détectée${highConf.length > 1 ? 's' : ''} avec une confiance ≥ 60%`,
        correlations: highConf,
      });
    }
  }

  // Cluster alert — many events in a small area/time
  const geoCorr = correlations.filter((c) => c.geographic);
  if (geoCorr.length >= 3) {
    insights.push({
      type: 'cluster',
      severity: 'high',
      title: 'Concentration géographique détectée',
      description: `${geoCorr.length} événements corrélés géographiquement dans un rayon de ${GEO_RADIUS_KM} km`,
      correlations: geoCorr.slice(0, 5),
    });
  }

  return insights;
}
