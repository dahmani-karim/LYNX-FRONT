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
    const url = `${API_CONFIG.ODRE.BASE}${API_CONFIG.ODRE.NUCLEAR}?limit=48&order_by=horodate%20DESC`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`ODRÉ Nuclear: ${res.status}`);
    const data = await res.json();
    const records = data.results || [];

    if (records.length < 2) return [];

    const alerts = [];
    const latest = records[0];
    const previous = records[1];
    const production = latest.production_nette || 0;
    const prevProd = previous.production_nette || 0;

    // Alert if production dropped significantly (>15% in one hour)
    if (prevProd > 0) {
      const drop = (prevProd - production) / prevProd;
      if (drop > 0.15) {
        const severity = drop > 0.3 ? 'high' : 'medium';
        alerts.push({
          id: `nuclear-drop`,
          type: 'nuclear',
          title: `Baisse de production nucléaire (${Math.round(drop * 100)}%)`,
          description: `Production : ${production.toFixed(1)} GWh (précédent : ${prevProd.toFixed(1)} GWh). Baisse de ${Math.round(drop * 100)}% en 1h.`,
          severity,
          eventDate: latest.horodate ? new Date(latest.horodate).toISOString() : new Date().toISOString(),
          latitude: 46.603354,
          longitude: 1.888334,
          sourceName: 'ODRÉ',
          sourceUrl: 'https://odre.opendatasoft.com/explore/dataset/production-nette-nucleaire/',
          sourceReliability: 95,
          metadata: { production, previousProduction: prevProd, dropPercent: Math.round(drop * 100) },
        });
      }
    }

    return alerts;
  } catch (err) {
    console.warn('ODRÉ Nuclear: module indisponible', err.message);
    return [];
  }
}
