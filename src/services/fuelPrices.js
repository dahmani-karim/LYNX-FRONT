import { API_CONFIG } from '../config/api';

/**
 * Fetches energy and fuel price data.
 * France: data.economie.gouv.fr (live API)
 * Other countries: static reference data
 */

const FR_FUEL_API = 'https://data.economie.gouv.fr/api/explore/v2.1/catalog/datasets/prix-des-carburants-en-france-flux-instantane-v2/records';

const FUEL_TYPES = ['Gazole', 'SP95', 'SP98', 'E85', 'E10', 'GPLc'];

export async function fetchFuelPrices(countryCode = 'FR') {
  if (countryCode === 'FR') {
    return fetchFrenchFuelPrices();
  }
  return getCountryFuelPrices(countryCode);
}

async function fetchFrenchFuelPrices() {
  const results = [];

  // Query each fuel type individually for reliable aggregation
  for (const fuel of FUEL_TYPES) {
    try {
      const params = new URLSearchParams({
        where: `prix_nom="${fuel}"`,
        select: 'min(prix_valeur) as prix_min, max(prix_valeur) as prix_max, avg(prix_valeur) as prix_avg',
        limit: '1',
      });
      const res = await fetch(`${FR_FUEL_API}?${params}`);
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
          source: 'data.economie.gouv.fr',
          trend: 'stable',
        });
      }
    } catch { continue; }
  }

  if (results.length === 0) return getStaticFuelPrices('FR');
  return results;
}

/**
 * Returns energy prices (electricity, gas, wood, fioul).
 * Country-aware with French data as default.
 */
export async function fetchEnergyPrices(countryCode = 'FR') {
  const prices = ENERGY_DATA[countryCode] || ENERGY_DATA.FR;
  return prices.map((p) => ({ ...p }));
}

const ENERGY_DATA = {
  FR: [
    { name: 'Électricité', rawName: 'Tarif réglementé', min: 0.2516, max: 0.2516, avg: 0.2516, unit: '€/kWh', type: 'electricity', source: 'CRE (tarif réglementé)', trend: 'stable' },
    { name: 'Élec. Tempo HC', rawName: 'EDF Tempo Heures Creuses', min: 0.1296, max: 0.1568, avg: 0.1432, unit: '€/kWh', type: 'electricity', source: 'EDF Tempo', trend: 'stable' },
    { name: 'Élec. Tempo HP', rawName: 'EDF Tempo Heures Pleines', min: 0.1609, max: 0.7324, avg: 0.4467, unit: '€/kWh', type: 'electricity', source: 'EDF Tempo (jours rouges)', trend: 'up' },
    { name: 'Gaz naturel', rawName: 'Prix repère CRE', min: 0.0913, max: 0.1284, avg: 0.1099, unit: '€/kWh', type: 'gas', source: 'CRE (prix repère)', trend: 'down' },
    { name: 'Granulés bois', rawName: 'Pellets', min: 280, max: 380, avg: 330, unit: '€/tonne', type: 'wood', source: 'PrixPellets.fr', trend: 'down' },
    { name: 'Fioul domestique', rawName: 'Fioul (1000L)', min: 0.95, max: 1.25, avg: 1.10, unit: '€/L', type: 'fuel', source: 'FioulReduc', trend: 'stable' },
  ],
  DE: [
    { name: 'Électricité', rawName: 'Strom', min: 0.30, max: 0.42, avg: 0.36, unit: '€/kWh', type: 'electricity', source: 'BDEW', trend: 'down' },
    { name: 'Gaz naturel', rawName: 'Erdgas', min: 0.08, max: 0.14, avg: 0.11, unit: '€/kWh', type: 'gas', source: 'BDEW', trend: 'down' },
  ],
  BE: [
    { name: 'Électricité', rawName: 'Tarif variable', min: 0.25, max: 0.38, avg: 0.31, unit: '€/kWh', type: 'electricity', source: 'CREG', trend: 'stable' },
    { name: 'Gaz naturel', rawName: 'Gaz', min: 0.06, max: 0.12, avg: 0.09, unit: '€/kWh', type: 'gas', source: 'CREG', trend: 'down' },
  ],
  ES: [
    { name: 'Électricité', rawName: 'PVPC', min: 0.15, max: 0.30, avg: 0.22, unit: '€/kWh', type: 'electricity', source: 'REE', trend: 'stable' },
    { name: 'Gaz naturel', rawName: 'Gas natural', min: 0.06, max: 0.10, avg: 0.08, unit: '€/kWh', type: 'gas', source: 'CNMC', trend: 'down' },
  ],
  IT: [
    { name: 'Électricité', rawName: 'Mercato Tutelato', min: 0.22, max: 0.35, avg: 0.28, unit: '€/kWh', type: 'electricity', source: 'ARERA', trend: 'stable' },
    { name: 'Gaz naturel', rawName: 'Gas', min: 0.08, max: 0.13, avg: 0.10, unit: '€/kWh', type: 'gas', source: 'ARERA', trend: 'down' },
  ],
};

function getCountryFuelPrices(countryCode) {
  const data = COUNTRY_FUEL_DATA[countryCode];
  if (data) return data.map((p) => ({ ...p }));
  return getStaticFuelPrices('FR');
}

const COUNTRY_FUEL_DATA = {
  DE: [
    { name: 'Super E10', rawName: 'Super E10', min: 1.55, max: 1.85, avg: 1.70, unit: '€/L', type: 'fuel', source: 'Tankerkönig', trend: 'stable' },
    { name: 'Super E5', rawName: 'Super E5', min: 1.65, max: 1.95, avg: 1.80, unit: '€/L', type: 'fuel', source: 'Tankerkönig', trend: 'stable' },
    { name: 'Diesel', rawName: 'Diesel', min: 1.45, max: 1.75, avg: 1.60, unit: '€/L', type: 'fuel', source: 'Tankerkönig', trend: 'stable' },
  ],
  BE: [
    { name: 'Euro 95', rawName: 'Euro 95', min: 1.60, max: 1.90, avg: 1.75, unit: '€/L', type: 'fuel', source: 'SPF Économie', trend: 'stable' },
    { name: 'Euro 98', rawName: 'Euro 98', min: 1.70, max: 2.00, avg: 1.85, unit: '€/L', type: 'fuel', source: 'SPF Économie', trend: 'stable' },
    { name: 'Diesel', rawName: 'Diesel', min: 1.55, max: 1.85, avg: 1.70, unit: '€/L', type: 'fuel', source: 'SPF Économie', trend: 'stable' },
  ],
  ES: [
    { name: 'Gasolina 95', rawName: 'Gasolina 95', min: 1.45, max: 1.75, avg: 1.60, unit: '€/L', type: 'fuel', source: 'Geoportal', trend: 'stable' },
    { name: 'Gasolina 98', rawName: 'Gasolina 98', min: 1.55, max: 1.85, avg: 1.70, unit: '€/L', type: 'fuel', source: 'Geoportal', trend: 'stable' },
    { name: 'Gasóleo A', rawName: 'Gasóleo A', min: 1.35, max: 1.65, avg: 1.50, unit: '€/L', type: 'fuel', source: 'Geoportal', trend: 'stable' },
  ],
  IT: [
    { name: 'Benzina', rawName: 'Benzina', min: 1.70, max: 2.00, avg: 1.85, unit: '€/L', type: 'fuel', source: 'MISE', trend: 'stable' },
    { name: 'Gasolio', rawName: 'Gasolio', min: 1.55, max: 1.85, avg: 1.70, unit: '€/L', type: 'fuel', source: 'MISE', trend: 'stable' },
    { name: 'GPL', rawName: 'GPL', min: 0.70, max: 0.95, avg: 0.82, unit: '€/L', type: 'fuel', source: 'MISE', trend: 'stable' },
  ],
};

function getStaticFuelPrices(countryCode) {
  if (countryCode !== 'FR' && COUNTRY_FUEL_DATA[countryCode]) {
    return COUNTRY_FUEL_DATA[countryCode];
  }
  return [
    { name: 'Gazole', rawName: 'Gazole', min: 1.55, max: 1.85, avg: 1.70, unit: '€/L', type: 'fuel', source: 'data.gouv.fr (cache)', trend: 'stable' },
    { name: 'SP95', rawName: 'SP95', min: 1.65, max: 1.95, avg: 1.80, unit: '€/L', type: 'fuel', source: 'data.gouv.fr (cache)', trend: 'stable' },
    { name: 'SP98', rawName: 'SP98', min: 1.72, max: 2.05, avg: 1.88, unit: '€/L', type: 'fuel', source: 'data.gouv.fr (cache)', trend: 'stable' },
    { name: 'E85', rawName: 'E85', min: 0.75, max: 1.05, avg: 0.89, unit: '€/L', type: 'fuel', source: 'data.gouv.fr (cache)', trend: 'stable' },
    { name: 'E10', rawName: 'E10', min: 1.60, max: 1.90, avg: 1.75, unit: '€/L', type: 'fuel', source: 'data.gouv.fr (cache)', trend: 'stable' },
    { name: 'GPLc', rawName: 'GPLc', min: 0.85, max: 1.10, avg: 0.98, unit: '€/L', type: 'fuel', source: 'data.gouv.fr (cache)', trend: 'stable' },
  ];
}

function round2(n) {
  return Math.round(n * 100) / 100;
}
