import { useState, useEffect } from 'react';
import { useAlertStore } from '../../stores/alertStore';
import { CATEGORIES } from '../../config/categories';
import { X, MapPin, Users, Globe, Landmark, Clock, Languages, Banknote, AlertTriangle } from 'lucide-react';
import './CountryDossier.scss';

const REST_COUNTRIES_API = 'https://restcountries.com/v3.1';

// Simple reverse-geocoding: find nearest country from coords using our country centroids
const COUNTRY_CENTROIDS = {
  FR: { lat: 46.6, lng: 2.2 }, DE: { lat: 51.1, lng: 10.4 }, GB: { lat: 55.3, lng: -3.4 },
  ES: { lat: 40.5, lng: -3.7 }, IT: { lat: 41.9, lng: 12.6 }, PT: { lat: 39.4, lng: -8.2 },
  BE: { lat: 50.5, lng: 4.5 }, NL: { lat: 52.1, lng: 5.3 }, CH: { lat: 46.8, lng: 8.2 },
  AT: { lat: 47.5, lng: 14.6 }, PL: { lat: 51.9, lng: 19.1 }, CZ: { lat: 49.8, lng: 15.5 },
  SE: { lat: 60.1, lng: 18.6 }, NO: { lat: 60.5, lng: 8.5 }, DK: { lat: 56.3, lng: 9.5 },
  FI: { lat: 61.9, lng: 25.7 }, IE: { lat: 53.4, lng: -8.2 }, GR: { lat: 39.1, lng: 21.8 },
  RO: { lat: 45.9, lng: 24.9 }, HU: { lat: 47.2, lng: 19.5 }, BG: { lat: 42.7, lng: 25.5 },
  HR: { lat: 45.1, lng: 15.2 }, SK: { lat: 48.7, lng: 19.7 }, SI: { lat: 46.2, lng: 14.8 },
  RS: { lat: 44.0, lng: 21.0 }, UA: { lat: 48.4, lng: 31.2 }, RU: { lat: 61.5, lng: 105.3 },
  TR: { lat: 39.9, lng: 32.9 }, US: { lat: 37.1, lng: -95.7 }, CA: { lat: 56.1, lng: -106.3 },
  MX: { lat: 23.6, lng: -102.6 }, BR: { lat: -14.2, lng: -51.9 }, AR: { lat: -38.4, lng: -63.6 },
  CL: { lat: -35.7, lng: -71.5 }, CO: { lat: 4.6, lng: -74.3 }, PE: { lat: -9.2, lng: -75.0 },
  CN: { lat: 35.9, lng: 104.2 }, JP: { lat: 36.2, lng: 138.3 }, KR: { lat: 36.0, lng: 128.0 },
  IN: { lat: 20.6, lng: 79.0 }, PK: { lat: 30.4, lng: 69.3 }, BD: { lat: 23.7, lng: 90.4 },
  ID: { lat: -0.8, lng: 113.9 }, TH: { lat: 15.9, lng: 100.9 }, VN: { lat: 14.1, lng: 108.3 },
  PH: { lat: 12.9, lng: 121.8 }, MY: { lat: 4.2, lng: 101.9 }, SG: { lat: 1.4, lng: 103.8 },
  AU: { lat: -25.3, lng: 133.8 }, NZ: { lat: -40.9, lng: 174.9 },
  EG: { lat: 26.8, lng: 30.8 }, ZA: { lat: -30.6, lng: 22.9 }, NG: { lat: 9.1, lng: 8.7 },
  KE: { lat: -0.0, lng: 37.9 }, ET: { lat: 9.1, lng: 40.5 }, TZ: { lat: -6.4, lng: 34.9 },
  MA: { lat: 31.8, lng: -7.1 }, DZ: { lat: 28.0, lng: 1.7 }, TN: { lat: 34.0, lng: 9.5 },
  LY: { lat: 26.3, lng: 17.2 }, SD: { lat: 12.9, lng: 30.2 },
  SA: { lat: 23.9, lng: 45.1 }, AE: { lat: 23.4, lng: 53.8 }, IL: { lat: 31.0, lng: 34.8 },
  IR: { lat: 32.4, lng: 53.7 }, IQ: { lat: 33.2, lng: 43.7 }, SY: { lat: 34.8, lng: 38.9 },
  LB: { lat: 33.9, lng: 35.9 }, JO: { lat: 30.6, lng: 36.2 }, YE: { lat: 15.6, lng: 48.5 },
  AF: { lat: 33.9, lng: 67.7 }, MM: { lat: 21.9, lng: 95.9 }, VE: { lat: 6.4, lng: -66.6 },
};

function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function findNearestCountry(lat, lng) {
  let best = null;
  let bestDist = Infinity;
  for (const [code, c] of Object.entries(COUNTRY_CENTROIDS)) {
    const d = haversineKm(lat, lng, c.lat, c.lng);
    if (d < bestDist) { bestDist = d; best = code; }
  }
  return best;
}

export default function CountryDossier({ lat, lng, onClose }) {
  const [country, setCountry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const events = useAlertStore((s) => s.events);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        // First try reverse geocoding via Nominatim
        const geoResp = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=fr`,
          { signal: AbortSignal.timeout(8000) }
        );
        const geoData = await geoResp.json();
        const cc = geoData?.address?.country_code?.toUpperCase();

        if (!cc) throw new Error('No country found');

        const resp = await fetch(`${REST_COUNTRIES_API}/alpha/${cc}`, {
          signal: AbortSignal.timeout(8000),
        });
        const data = await resp.json();
        if (cancelled) return;
        setCountry(Array.isArray(data) ? data[0] : data);
      } catch {
        // Fallback to centroid-based lookup
        try {
          const code = findNearestCountry(lat, lng);
          if (!code) throw new Error('No match');
          const resp = await fetch(`${REST_COUNTRIES_API}/alpha/${code}`, {
            signal: AbortSignal.timeout(8000),
          });
          const data = await resp.json();
          if (cancelled) return;
          setCountry(Array.isArray(data) ? data[0] : data);
        } catch {
          if (!cancelled) setError('Impossible de charger les données pays');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [lat, lng]);

  // Count alerts in this country (within ~500km radius)
  const nearbyAlerts = events.filter((e) => {
    if (!e.latitude || !e.longitude) return false;
    return haversineKm(lat, lng, e.latitude, e.longitude) < 500;
  });

  const alertsByCategory = {};
  nearbyAlerts.forEach((e) => {
    alertsByCategory[e.type] = (alertsByCategory[e.type] || 0) + 1;
  });

  const riskLevel = nearbyAlerts.length === 0 ? 'low'
    : nearbyAlerts.some(e => e.severity === 'critical') ? 'critical'
    : nearbyAlerts.some(e => e.severity === 'high') ? 'high'
    : 'medium';

  const riskColors = { low: '#10B981', medium: '#F59E0B', high: '#F97316', critical: '#EF4444' };
  const riskLabels = { low: 'Faible', medium: 'Modéré', high: 'Élevé', critical: 'Critique' };

  return (
    <div className="country-dossier">
      <div className="country-dossier__header">
        <h3 className="country-dossier__title">
          <Globe size={16} />
          Dossier Région
        </h3>
        <button className="country-dossier__close" onClick={onClose}>
          <X size={16} />
        </button>
      </div>

      {loading && <p className="country-dossier__loading">Chargement...</p>}
      {error && <p className="country-dossier__error">{error}</p>}

      {country && !loading && (
        <div className="country-dossier__body">
          {/* Flag + Name */}
          <div className="country-dossier__identity">
            {country.flags?.svg && (
              <img src={country.flags.svg} alt="" className="country-dossier__flag" />
            )}
            <div>
              <p className="country-dossier__name">{country.translations?.fra?.common || country.name?.common}</p>
              <p className="country-dossier__official">{country.translations?.fra?.official || country.name?.official}</p>
            </div>
          </div>

          {/* Risk badge */}
          <div className="country-dossier__risk" style={{ borderColor: riskColors[riskLevel] }}>
            <AlertTriangle size={14} style={{ color: riskColors[riskLevel] }} />
            <span>Niveau de risque :</span>
            <strong style={{ color: riskColors[riskLevel] }}>{riskLabels[riskLevel]}</strong>
            <span className="country-dossier__risk-count">({nearbyAlerts.length} alerte{nearbyAlerts.length !== 1 ? 's' : ''})</span>
          </div>

          {/* Alert breakdown */}
          {Object.keys(alertsByCategory).length > 0 && (
            <div className="country-dossier__alerts-breakdown">
              {Object.entries(alertsByCategory).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([type, count]) => {
                const cat = CATEGORIES[type] || CATEGORIES.other;
                const CatIcon = cat.icon;
                return (
                  <div key={type} className="country-dossier__alert-chip">
                    <CatIcon size={12} style={{ color: cat.color }} />
                    <span>{cat.label}</span>
                    <strong>{count}</strong>
                  </div>
                );
              })}
            </div>
          )}

          {/* Info grid */}
          <div className="country-dossier__grid">
            <div className="country-dossier__info">
              <Landmark size={14} />
              <div>
                <p className="country-dossier__info-label">Capitale</p>
                <p className="country-dossier__info-value">{country.capital?.[0] || '—'}</p>
              </div>
            </div>
            <div className="country-dossier__info">
              <Users size={14} />
              <div>
                <p className="country-dossier__info-label">Population</p>
                <p className="country-dossier__info-value">
                  {country.population ? (country.population / 1e6).toFixed(1) + ' M' : '—'}
                </p>
              </div>
            </div>
            <div className="country-dossier__info">
              <MapPin size={14} />
              <div>
                <p className="country-dossier__info-label">Superficie</p>
                <p className="country-dossier__info-value">
                  {country.area ? Math.round(country.area).toLocaleString('fr-FR') + ' km²' : '—'}
                </p>
              </div>
            </div>
            <div className="country-dossier__info">
              <Languages size={14} />
              <div>
                <p className="country-dossier__info-label">Langues</p>
                <p className="country-dossier__info-value">
                  {country.languages ? Object.values(country.languages).slice(0, 3).join(', ') : '—'}
                </p>
              </div>
            </div>
            <div className="country-dossier__info">
              <Banknote size={14} />
              <div>
                <p className="country-dossier__info-label">Monnaie</p>
                <p className="country-dossier__info-value">
                  {country.currencies
                    ? Object.values(country.currencies).map(c => `${c.name} (${c.symbol || ''})`).join(', ')
                    : '—'}
                </p>
              </div>
            </div>
            <div className="country-dossier__info">
              <Clock size={14} />
              <div>
                <p className="country-dossier__info-label">Fuseau(x)</p>
                <p className="country-dossier__info-value">
                  {country.timezones ? country.timezones.slice(0, 2).join(', ') : '—'}
                </p>
              </div>
            </div>
          </div>

          {/* Region */}
          <div className="country-dossier__region">
            <span>{country.region}</span>
            {country.subregion && <span> · {country.subregion}</span>}
          </div>
        </div>
      )}

      <div className="country-dossier__coords">
        {lat.toFixed(4)}, {lng.toFixed(4)}
      </div>
    </div>
  );
}
