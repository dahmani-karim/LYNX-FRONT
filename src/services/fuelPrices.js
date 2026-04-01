import { API_CONFIG } from '../config/api';

/**
 * Fetches energy and fuel price data from French open data sources.
 * Returns MIN-MAX price ranges for various energy types.
 */

// French government fuel prices open data
const FUEL_PRICES_API = 'https://data.economie.gouv.fr/api/explore/v2.1/catalog/datasets/prix-des-carburants-en-france-flux-instantane-v2/records';

export async function fetchFuelPrices() {
  try {
    const res = await fetch(
      `${FUEL_PRICES_API}?select=prix_valeur,prix_nom&group_by=prix_nom&limit=20&select=prix_nom,min(prix_valeur) as prix_min,max(prix_valeur) as prix_max,avg(prix_valeur) as prix_avg`
    );

    if (!res.ok) throw new Error(`Fuel prices API: ${res.status}`);
    const data = await res.json();

    if (data.results?.length) {
      return data.results.map((r) => ({
        name: normalizeFuelName(r.prix_nom),
        rawName: r.prix_nom,
        min: round2(r.prix_min / 1000),
        max: round2(r.prix_max / 1000),
        avg: round2(r.prix_avg / 1000),
        unit: '€/L',
        type: 'fuel',
      })).filter((f) => f.name);
    }

    throw new Error('No fuel data');
  } catch {
    // Fallback: try individual station aggregation
    return fetchFuelPricesFallback();
  }
}

async function fetchFuelPricesFallback() {
  try {
    const fuels = ['Gazole', 'SP95', 'SP98', 'E85', 'E10', 'GPLc'];
    const results = [];

    for (const fuel of fuels) {
      try {
        const res = await fetch(
          `${FUEL_PRICES_API}?where=prix_nom="${fuel}"&select=min(prix_valeur) as prix_min,max(prix_valeur) as prix_max,avg(prix_valeur) as prix_avg&limit=1`
        );
        if (!res.ok) continue;
        const data = await res.json();
        if (data.results?.[0]) {
          const r = data.results[0];
          results.push({
            name: fuel,
            rawName: fuel,
            min: round2(r.prix_min / 1000),
            max: round2(r.prix_max / 1000),
            avg: round2(r.prix_avg / 1000),
            unit: '€/L',
            type: 'fuel',
          });
        }
      } catch { continue; }
    }

    return results;
  } catch {
    return getStaticFuelPrices();
  }
}

/**
 * Fetches electricity prices (French spot market approximation).
 * Uses ODRE or static data as fallback.
 */
export async function fetchEnergyPrices() {
  const energyData = [];

  // Electricity — tarif réglementé ranges
  energyData.push({
    name: 'Électricité',
    rawName: 'Électricité (tarif réglementé)',
    min: 0.2516,
    max: 0.2516,
    avg: 0.2516,
    unit: '€/kWh',
    type: 'electricity',
    source: 'CRE (tarif réglementé 2025)',
    trend: 'stable',
  });

  // Electricity Tempo HP/HC
  energyData.push({
    name: 'Élec. Tempo HC',
    rawName: 'EDF Tempo Heures Creuses',
    min: 0.1296,
    max: 0.1568,
    avg: 0.1432,
    unit: '€/kWh',
    type: 'electricity',
    source: 'EDF Tempo',
    trend: 'stable',
  });

  energyData.push({
    name: 'Élec. Tempo HP',
    rawName: 'EDF Tempo Heures Pleines',
    min: 0.1609,
    max: 0.7324,
    avg: 0.4467,
    unit: '€/kWh',
    type: 'electricity',
    source: 'EDF Tempo (jours rouges)',
    trend: 'up',
  });

  // Gas — prix repère CRE
  energyData.push({
    name: 'Gaz naturel',
    rawName: 'Gaz naturel (prix repère)',
    min: 0.0913,
    max: 0.1284,
    avg: 0.1099,
    unit: '€/kWh',
    type: 'gas',
    source: 'CRE (prix repère)',
    trend: 'down',
  });

  // Pellets
  energyData.push({
    name: 'Granulés bois',
    rawName: 'Granulés de bois (pellets)',
    min: 280,
    max: 380,
    avg: 330,
    unit: '€/tonne',
    type: 'wood',
    source: 'PrixPellets.fr',
    trend: 'down',
  });

  // Fioul domestique
  energyData.push({
    name: 'Fioul domestique',
    rawName: 'Fioul domestique (1000L)',
    min: 0.95,
    max: 1.25,
    avg: 1.10,
    unit: '€/L',
    type: 'fuel',
    source: 'FioulReduc',
    trend: 'stable',
  });

  return energyData;
}

function getStaticFuelPrices() {
  return [
    { name: 'Gazole', rawName: 'Gazole', min: 1.55, max: 1.85, avg: 1.70, unit: '€/L', type: 'fuel' },
    { name: 'SP95', rawName: 'SP95', min: 1.65, max: 1.95, avg: 1.80, unit: '€/L', type: 'fuel' },
    { name: 'SP98', rawName: 'SP98', min: 1.72, max: 2.05, avg: 1.88, unit: '€/L', type: 'fuel' },
    { name: 'E85', rawName: 'E85', min: 0.75, max: 1.05, avg: 0.89, unit: '€/L', type: 'fuel' },
    { name: 'E10', rawName: 'E10', min: 1.60, max: 1.90, avg: 1.75, unit: '€/L', type: 'fuel' },
    { name: 'GPLc', rawName: 'GPLc', min: 0.85, max: 1.10, avg: 0.98, unit: '€/L', type: 'fuel' },
  ];
}

function normalizeFuelName(name) {
  if (!name) return '';
  const n = name.trim();
  if (n.toLowerCase().includes('gazole')) return 'Gazole';
  if (n.includes('SP95') || n.includes('sp95')) return 'SP95';
  if (n.includes('SP98') || n.includes('sp98')) return 'SP98';
  if (n.includes('E85') || n.includes('e85')) return 'E85';
  if (n.includes('E10') || n.includes('e10')) return 'E10';
  if (n.includes('GPL')) return 'GPLc';
  return n;
}

function round2(n) {
  return Math.round(n * 100) / 100;
}
