import { API_CONFIG } from '../config/api';

function parseEcogazSignal(records) {
  if (!records || !records.results) return [];
  const alerts = [];

  records.results.forEach((r) => {
    const signal = r.couleur_du_signal_fr || r.color || '';
    const colorIndex = r.indice_de_couleur || '';
    const date = r.gas_day || '';

    if (!signal && !date) return;

    let severity = 'info';
    let title = 'Réseau gaz normal';

    const signalLower = signal.toString().toLowerCase();
    if (signalLower.includes('rouge') || signalLower.includes('red') || colorIndex === '3') {
      severity = 'critical';
      title = 'Tension critique réseau gaz';
    } else if (signalLower.includes('orange') || colorIndex === '2') {
      severity = 'high';
      title = 'Tension élevée réseau gaz';
    } else if (signalLower.includes('jaune') || signalLower.includes('yellow') || colorIndex === '1') {
      severity = 'medium';
      title = 'Tension modérée réseau gaz';
    }

    if (severity !== 'info') {
      alerts.push({
        id: `ecogaz-${date}`,
        type: 'energy',
        title,
        description: `Signal Ecogaz : ${signal} pour le ${date}`,
        severity,
        sourceName: 'ODRÉ / Ecogaz',
        sourceReliability: 95,
        sourceUrl: 'https://odre.opendatasoft.com/explore/dataset/signal-ecogaz/',
        eventDate: date ? new Date(date).toISOString() : new Date().toISOString(),
        latitude: 46.603354,
        longitude: 1.888334,
      });
    }
  });

  return alerts;
}

export async function fetchEnergyData() {
  try {
    const url = `${API_CONFIG.ODRE.BASE}${API_CONFIG.ODRE.ECOGAZ}?limit=7&order_by=gas_day%20DESC`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`ODRÉ API: ${res.status}`);
    const data = await res.json();
    return parseEcogazSignal(data);
  } catch {
    console.warn('ODRÉ Ecogaz: module indisponible');
    return [];
  }
}

export async function fetchNuclearProduction() {
  try {
    const url = `${API_CONFIG.ODRE.BASE}${API_CONFIG.ODRE.NUCLEAR}?limit=24&order_by=date_heure%20DESC`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`ODRÉ Nuclear: ${res.status}`);
    const data = await res.json();
    const records = data.results || [];

    const alerts = [];
    const seen = new Set();

    for (const r of records) {
      const plant = r.centrale || r.nom_site || '';
      if (!plant || seen.has(plant)) continue;
      seen.add(plant);

      const production = r.puissance_mw || r.production_nette || 0;
      const capacity = r.puissance_maximale_mw || r.puissance_installee || 0;
      const ratio = capacity > 0 ? production / capacity : 1;

      // Alert if plant is stopped or producing below 10% capacity
      if (ratio < 0.1) {
        const severity = production <= 0 ? 'high' : 'medium';
        alerts.push({
          id: `nuclear-${plant}-${Date.now()}`,
          type: 'nuclear',
          title: production <= 0
            ? `Centrale nucléaire arrêtée — ${plant}`
            : `Production nucléaire faible — ${plant}`,
          description: `${plant}: ${production} MW / ${capacity} MW (${Math.round(ratio * 100)}% de capacité).`,
          severity,
          eventDate: r.date_heure ? new Date(r.date_heure).toISOString() : new Date().toISOString(),
          latitude: r.latitude || 46.6,
          longitude: r.longitude || 1.9,
          sourceName: 'ODRÉ',
          sourceUrl: 'https://odre.opendatasoft.com/explore/dataset/production-nette-nucleaire/',
          sourceReliability: 95,
          metadata: { plant, production, capacity, ratio },
        });
      }
    }

    return alerts;
  } catch {
    console.warn('ODRÉ Nuclear: module indisponible');
    return [];
  }
}
