import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Circle, Popup, useMap, useMapEvents, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import { useAlertStore } from '../../stores/alertStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { useTrackerStore } from '../../stores/trackerStore';
import { useAuthStore } from '../../stores/authStore';
import { CATEGORIES, SEVERITY_LEVELS } from '../../config/categories';
import SeverityBadge from '../../components/SeverityBadge/SeverityBadge';
import PremiumGate from '../../components/PremiumGate/PremiumGate';
import CountryDossier from '../../components/CountryDossier/CountryDossier';
import { timeAgo } from '../../utils/date';
import { Locate, ExternalLink, Layers, Radio, Plane, Satellite, Ship, Eye, EyeOff, SlidersHorizontal, X, Globe, Sun, Moon, Activity, Biohazard, Newspaper } from 'lucide-react';
import HeatmapLayer from '../../components/HeatmapLayer/HeatmapLayer';
import { fetchHantavirusCases, MV_HONDIUS_CASES, ENDEMIC_ZONES, OUTBREAK_SUMMARY } from '../../services/hantavirus';
import { fetchGDELTNews, fetchWikiStats, parseGDELTDate } from '../../services/hantaLive';
import { computeTerminator } from '../../services/terminator';
import { loadCountryBoundaries, computeCountryRisks, getRiskColor, getRiskOpacity } from '../../services/choropleth';
import TrackerClusterLayer from '../../components/TrackerClusterLayer/TrackerClusterLayer';
import './MapPage.scss';

const DARK_TILES = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
const DARK_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>';
const GIBS_TILES = 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_CorrectedReflectance_TrueColor/default/{time}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg';

function severityToRadius(severity) {
  const map = { info: 4, low: 5, medium: 7, high: 9, critical: 12 };
  return map[severity] || 5;
}

function LocationButton() {
  const map = useMap();

  const handleClick = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        map.flyTo([latitude, longitude], 10);
      },
      () => {},
      { enableHighAccuracy: false, timeout: 10000 }
    );
  };

  return (
    <button onClick={handleClick} className="map-page__locate-btn" aria-label="Ma position">
      <Locate size={20} />
    </button>
  );
}

function MapContextMenu({ onContextMenu }) {
  useMapEvents({
    contextmenu: (e) => {
      e.originalEvent.preventDefault();
      onContextMenu({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

const TRACKER_TYPES = [
  { key: 'aircraft', label: 'Aéronefs', icon: Plane, color: '#3B82F6' },
  { key: 'satellite', label: 'Satellites', icon: Satellite, color: '#D946EF' },
  { key: 'ship', label: 'Navires', icon: Ship, color: '#06B6D4' },
];

function MapCenterTracker({ onCenterChange }) {
  useMapEvents({
    moveend: (e) => {
      const c = e.target.getCenter();
      onCenterChange(c.lat, c.lng);
    },
  });
  return null;
}

function createTrackerIcon(type, heading = 0) {
  const colors = { aircraft: '#3B82F6', satellite: '#D946EF', ship: '#06B6D4' };
  const sz = type === 'satellite' ? 24 : 30;
  const glow = colors[type] || colors.aircraft;

  const svgs = {
    aircraft: `<svg viewBox="0 0 24 24" width="18" height="18" fill="${colors.aircraft}" style="filter:drop-shadow(0 0 6px ${glow}99)"><path d="M21 16v-2l-8-5V3.5A1.5 1.5 0 0 0 11.5 2 1.5 1.5 0 0 0 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg>`,
    satellite: `<svg viewBox="0 0 24 24" width="14" height="14" fill="${colors.satellite}" style="filter:drop-shadow(0 0 8px ${glow}AA)"><circle cx="12" cy="12" r="3"/><path d="M4.93 4.93a10 10 0 0 0 0 14.14M7.76 7.76a6 6 0 0 0 0 8.49M19.07 4.93a10 10 0 0 1 0 14.14M16.24 7.76a6 6 0 0 1 0 8.49" stroke="${colors.satellite}" fill="none" stroke-width="1.5"/></svg>`,
    ship: `<svg viewBox="0 0 24 24" width="16" height="16" fill="${colors.ship}" style="filter:drop-shadow(0 0 6px ${glow}99)"><path d="M3 18h1l2-7h12l2 7h1a1 1 0 0 1 0 2H3a1 1 0 0 1 0-2zM6 8h12l1 3H5l1-3zm3-5h6v3H9V3z"/></svg>`,
  };

  const animClass = type === 'satellite' ? 'tracker-icon--sat' : '';
  return L.divIcon({
    className: `tracker-icon ${animClass}`,
    html: `<div style="width:${sz}px;height:${sz}px;display:flex;align-items:center;justify-content:center;transform:rotate(${heading}deg);transition:transform 0.6s ease">${svgs[type]}</div>`,
    iconSize: [sz, sz],
    iconAnchor: [sz / 2, sz / 2],
  });
}

export default function MapPage() {
  const events = useAlertStore((s) => s.events);
  const { userLocation, zones } = useSettingsStore();
  const isPremium = useAuthStore((s) => s.isPremium);
  const [activeCategories, setActiveCategories] = useState(new Set());
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showCatPanel, setShowCatPanel] = useState(false);
  const [mode, setMode] = useState('alerts'); // 'alerts' | 'tracking' | 'hantavirus'
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [showSatellite, setShowSatellite] = useState(false);
  const [showTerminator, setShowTerminator] = useState(false);
  const [showChoropleth, setShowChoropleth] = useState(false);
  const [countryGeoJSON, setCountryGeoJSON] = useState(null);
  const [dossierPos, setDossierPos] = useState(null); // { lat, lng }
  const [showHantavirus, setShowHantavirus] = useState(false);
  const [hantavirusCases, setHantavirusCases] = useState([]);
  const [hantavirusLoading, setHantavirusLoading] = useState(false);
  const [showEndemic, setShowEndemic] = useState(true);
  const [showMonitoring, setShowMonitoring] = useState(true);
  const [showBaseAlerts, setShowBaseAlerts] = useState(true);
  const [showLayersPanel, setShowLayersPanel] = useState(false);

  // Hantavirus live data (GDELT + Wikipedia)
  const [liveStats, setLiveStats] = useState(null);    // { confirmed, suspected, deaths, timestamp }
  const [liveNews, setLiveNews] = useState([]);          // articles GDELT
  const [showNews, setShowNews] = useState(false);
  const [newsLoading, setNewsLoading] = useState(false);

  // GIBS date (yesterday — imagery has 24-48h delay)
  const gibsDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  }, []);

  // Terminator GeoJSON
  const terminatorGeoJSON = useMemo(() => {
    if (!showTerminator) return null;
    return computeTerminator();
  }, [showTerminator]);

  // Load country boundaries for choropleth
  useEffect(() => {
    if (showChoropleth && !countryGeoJSON) {
      loadCountryBoundaries().then((data) => { if (data) setCountryGeoJSON(data); });
    }
  }, [showChoropleth, countryGeoJSON]);

  // Fetch hantavirus cases when layer is toggled on OR when entering hantavirus mode
  useEffect(() => {
    const shouldFetch = showHantavirus || mode === 'hantavirus';
    if (!shouldFetch || hantavirusCases.length > 0) return;
    setHantavirusLoading(true);
    fetchHantavirusCases()
      .then((cases) => setHantavirusCases(cases))
      .catch((err) => console.warn('[hantavirus] fetch failed:', err.message))
      .finally(() => setHantavirusLoading(false));
  }, [showHantavirus, mode]);

  // Wikipedia — stats live au chargement du mode hantavirus
  useEffect(() => {
    if (mode !== 'hantavirus') return;
    fetchWikiStats()
      .then(setLiveStats)
      .catch((e) => console.warn('[wiki-stats]', e.message));
  }, [mode]);

  // GDELT — actualités, chargement différé à l'ouverture du drawer
  useEffect(() => {
    if (!showNews || liveNews.length > 0) return;
    setNewsLoading(true);
    fetchGDELTNews()
      .then(setLiveNews)
      .catch((e) => console.warn('[gdelt]', e.message))
      .finally(() => setNewsLoading(false));
  }, [showNews]);

  // Compute country risks
  const countryRisks = useMemo(() => computeCountryRisks(events), [events]);

  // Choropleth style per feature
  const choroplethStyle = useCallback((feature) => {
    const name = (feature.properties.ADMIN || feature.properties.NAME || feature.properties.name || '').toLowerCase();
    const risk = countryRisks.get(name);
    const score = risk?.score || 0;
    return {
      fillColor: getRiskColor(score),
      fillOpacity: getRiskOpacity(score),
      color: score > 0 ? getRiskColor(score) : '#334155',
      weight: score > 0 ? 1.5 : 0.3,
      opacity: score > 0 ? 0.7 : 0.2,
    };
  }, [countryRisks]);

  // Tracker store
  const { aircraft, satellites, ships, maritimeCoverage, activeTrackers, isLoading: trackersLoading, lastFetch, fetchTrackers, toggleTracker } =
    useTrackerStore();

  const lat = userLocation?.lat || 48.8566;
  const lng = userLocation?.lng || 2.3522;

  // Map center tracking for viewport-based refetch
  const mapCenterRef = useRef({ lat, lng });
  const lastPanFetchRef = useRef(0);

  const handleCenterChange = useCallback((newLat, newLng) => {
    mapCenterRef.current = { lat: newLat, lng: newLng };
    if (mode !== 'tracking') return;
    const now = Date.now();
    if (now - lastPanFetchRef.current > 5000) {
      lastPanFetchRef.current = now;
      fetchTrackers(newLat, newLng);
    }
  }, [mode, fetchTrackers]);

  // Auto-fetch trackers when in tracking mode
  useEffect(() => {
    if (mode !== 'tracking') return;
    fetchTrackers(mapCenterRef.current.lat, mapCenterRef.current.lng);
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      const c = mapCenterRef.current;
      fetchTrackers(c.lat, c.lng);
    }, 30 * 1000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchTrackers, mode]);

  const trackerCounts = {
    aircraft: aircraft.length,
    satellite: satellites.length,
    ship: ships.length,
  };

  const allTrackerPoints = useMemo(() => {
    const points = [];
    if (activeTrackers.includes('aircraft')) points.push(...aircraft);
    if (activeTrackers.includes('satellite')) points.push(...satellites);
    if (activeTrackers.includes('ship')) points.push(...ships);
    return points;
  }, [aircraft, satellites, ships, activeTrackers]);

  const filteredEvents = useMemo(() => {
    let items = events.filter((e) => e.latitude && e.longitude);
    if (activeCategories.size > 0) {
      items = items.filter((e) => activeCategories.has(e.type));
    }
    return items;
  }, [events, activeCategories]);

  const heatPoints = useMemo(() => {
    const intensityMap = { info: 0.2, low: 0.3, medium: 0.5, high: 0.8, critical: 1.0 };
    return filteredEvents.map((e) => [
      e.latitude,
      e.longitude,
      intensityMap[e.severity] || 0.3,
    ]);
  }, [filteredEvents]);

  const toggleCategory = (catId) => {
    setActiveCategories((prev) => {
      const next = new Set(prev);
      if (next.has(catId)) next.delete(catId);
      else next.add(catId);
      return next;
    });
  };

  const availableCategories = useMemo(() => {
    const cats = new Set(events.map((e) => e.type));
    return Object.values(CATEGORIES).filter((c) => cats.has(c.id));
  }, [events]);

  return (
    <div className="map-page">
      {/* Mode switch */}
      <div className="map-page__mode-switch">
        <button
          onClick={() => setMode('alerts')}
          className={`map-page__mode-btn ${mode === 'alerts' ? 'map-page__mode-btn--active' : ''}`}
        >
          <Radio size={14} />
          <span className="map-page__mode-label">Alertes</span>
        </button>
        <button
          onClick={() => setMode('tracking')}
          className={`map-page__mode-btn ${mode === 'tracking' ? 'map-page__mode-btn--active' : ''}`}
        >
          <Plane size={14} />
          <span className="map-page__mode-label">Tracking</span>
        </button>
        <button
          onClick={() => setMode('hantavirus')}
          className={`map-page__mode-btn ${mode === 'hantavirus' ? 'map-page__mode-btn--hanta' : ''}`}
        >
          <Biohazard size={14} />
          <span className="map-page__mode-label">Hantavirus</span>
        </button>
      </div>

      {/* Alert mode: layers left, filter toggle right */}
      {mode === 'alerts' && (
        <>
          {/* Calques button — top left */}
          {(() => {
            const activeLayersCount = [showHeatmap, showSatellite, showTerminator, showChoropleth, showHantavirus].filter(Boolean).length;
            return (
              <>
                <button
                  className={`map-page__layers-toggle ${activeLayersCount > 0 ? 'map-page__layers-toggle--active' : ''}`}
                  onClick={() => setShowLayersPanel(!showLayersPanel)}
                >
                  {showLayersPanel ? <X size={16} /> : <Layers size={16} />}
                  <span className="map-page__chip-label">Calques{activeLayersCount > 0 ? ` (${activeLayersCount})` : ''}</span>
                </button>

                {showLayersPanel && (
                  <div className="map-page__layers-panel">
                    <button
                      onClick={() => setShowHeatmap(!showHeatmap)}
                      className={`map-page__chip ${showHeatmap ? 'map-page__chip--active' : 'map-page__chip--inactive'}`}
                    >
                      <Layers size={14} />
                      Heatmap
                    </button>
                    <button
                      onClick={() => setShowSatellite(!showSatellite)}
                      className={`map-page__chip ${showSatellite ? 'map-page__chip--active' : 'map-page__chip--inactive'}`}
                    >
                      <Globe size={14} />
                      Satellite
                    </button>
                    <button
                      onClick={() => setShowTerminator(!showTerminator)}
                      className={`map-page__chip ${showTerminator ? 'map-page__chip--active' : 'map-page__chip--inactive'}`}
                    >
                      <Moon size={14} />
                      Jour / Nuit
                    </button>
                    <button
                      onClick={() => setShowChoropleth(!showChoropleth)}
                      className={`map-page__chip ${showChoropleth ? 'map-page__chip--active' : 'map-page__chip--inactive'}`}
                    >
                      <Globe size={14} />
                      Risques pays
                    </button>

                  </div>
                )}
              </>
            );
          })()}

          {/* Filter toggle — top right */}
          <button
            className={`map-page__filter-toggle ${activeCategories.size > 0 ? 'map-page__filter-toggle--active' : ''}`}
            onClick={() => setShowCatPanel(!showCatPanel)}
          >
            {showCatPanel ? <X size={16} /> : <SlidersHorizontal size={16} />}
            <span className="map-page__chip-label">Filtres{activeCategories.size > 0 ? ` (${activeCategories.size})` : ''}</span>
          </button>

          {/* Collapsible category panel */}
          {showCatPanel && (
            <div className="map-page__cat-panel">
              {availableCategories.map((cat) => {
                const isActive = activeCategories.size === 0 || activeCategories.has(cat.id);
                const count = events.filter((e) => e.type === cat.id).length;
                return (
                  <button
                    key={cat.id}
                    onClick={() => toggleCategory(cat.id)}
                    className={`map-page__chip ${isActive ? 'map-page__chip--active' : 'map-page__chip--inactive'}`}
                  >
                    <span className="map-page__chip-dot" style={{ backgroundColor: cat.color }} />
                    {cat.label}
                    <span className="map-page__chip-count">({count})</span>
                  </button>
                );
              })}
              {activeCategories.size > 0 && (
                <button
                  className="map-page__chip map-page__chip--active"
                  onClick={() => setActiveCategories(new Set())}
                >
                  <X size={12} />
                  Tout afficher
                </button>
              )}
            </div>
          )}
        </>
      )}

      {/* Tracking mode filters */}
      {mode === 'tracking' && (
        <div className="map-page__filters">
          <button
            className={`map-page__chip ${autoRefresh ? 'map-page__chip--active' : 'map-page__chip--inactive'}`}
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            {autoRefresh ? <Eye size={14} /> : <EyeOff size={14} />}
            Auto
          </button>
          {TRACKER_TYPES.map(({ key, label, icon: Icon, color }) => {
            const active = activeTrackers.includes(key);
            return (
              <button
                key={key}
                className={`map-page__chip ${active ? 'map-page__chip--active' : 'map-page__chip--inactive'}`}
                onClick={() => toggleTracker(key)}
              >
                <span className="map-page__chip-dot" style={{ backgroundColor: color }} />
                <Icon size={14} />
                {label}
                <span className="map-page__chip-count">({trackerCounts[key]})</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Hantavirus mode toolbar */}
      {mode === 'hantavirus' && (
        <div className="map-page__hanta-bar">
          <div className="map-page__hanta-summary">
            {liveStats && <span className="map-page__hanta-live-dot" title="Stats Wikipedia live" />}
            <span className="map-page__hanta-stat map-page__hanta-stat--deceased">☠ {liveStats?.deaths ?? OUTBREAK_SUMMARY.totalDeceased} décès</span>
            <span className="map-page__hanta-stat map-page__hanta-stat--confirmed">● {liveStats?.confirmed ?? OUTBREAK_SUMMARY.totalConfirmed} confirmés</span>
            <span className="map-page__hanta-stat map-page__hanta-stat--suspected">◎ {liveStats?.suspected ?? OUTBREAK_SUMMARY.totalSuspected} suspects</span>
            <span className="map-page__hanta-stat map-page__hanta-stat--monitoring">○ ~{OUTBREAK_SUMMARY.totalMonitoring} surveillance</span>
          </div>
          <div className="map-page__hanta-filters">
            <button
              className={`map-page__chip ${showEndemic ? 'map-page__chip--active' : 'map-page__chip--inactive'}`}
              onClick={() => setShowEndemic(!showEndemic)}
            >
              <Globe size={13} />
              <span className="map-page__chip-label">Endémiques</span>
            </button>
            <button
              className={`map-page__chip ${showMonitoring ? 'map-page__chip--active' : 'map-page__chip--inactive'}`}
              onClick={() => setShowMonitoring(!showMonitoring)}
            >
              <Eye size={13} />
              <span className="map-page__chip-label">Surveillance</span>
            </button>
            <button
              className={`map-page__chip ${showNews ? 'map-page__chip--active' : 'map-page__chip--inactive'}`}
              onClick={() => setShowNews(!showNews)}
            >
              <Newspaper size={13} />
              <span className="map-page__chip-label">Actualités</span>
            </button>
            <a
              href={OUTBREAK_SUMMARY.whoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="map-page__chip map-page__chip--active"
              style={{ textDecoration: 'none', borderColor: '#F97316', color: '#F97316' }}
            >
              <ExternalLink size={12} />
              <span className="map-page__chip-label">WHO DON600</span>
            </a>
          </div>
          {showNews && (
            <div className="map-page__hanta-news">
              {newsLoading && (
                <p className="map-page__hanta-news-empty">Chargement…</p>
              )}
              {!newsLoading && liveNews.length === 0 && (
                <p className="map-page__hanta-news-empty">Aucun article récent</p>
              )}
              {liveNews.map((article, i) => {
                const d = parseGDELTDate(article.seendate);
                return (
                  <a
                    key={i}
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="map-page__hanta-news-item"
                  >
                    <span className="map-page__hanta-news-item-title">{article.title}</span>
                    <span className="map-page__hanta-news-item-meta">
                      <span>{article.domain}</span>
                      {d && <span>{timeAgo(d)}</span>}
                    </span>
                  </a>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Map */}
      <div className="map-page__map-wrap">
        {mode === 'tracking' && trackersLoading && allTrackerPoints.length === 0 && (
          <div className="map-page__loading-overlay">
            <div className="map-page__loading-spinner" />
            <p className="map-page__loading-text">Recherche des objets à proximité...</p>
          </div>
        )}
        <MapContainer
        center={[lat, lng]}
        zoom={mode === 'tracking' ? 3 : 4}
        className="map-page__map"
        zoomControl={false}
      >
        <TileLayer url={DARK_TILES} attribution={DARK_ATTRIBUTION} />

        {/* NASA GIBS MODIS satellite imagery */}
        {showSatellite && (
          <TileLayer
            url={GIBS_TILES.replace('{time}', gibsDate)}
            attribution="NASA GIBS"
            opacity={0.5}
            maxZoom={9}
          />
        )}

        {/* Day/Night terminator */}
        {terminatorGeoJSON && (
          <GeoJSON
            key={Date.now()}
            data={terminatorGeoJSON}
            style={{ fillColor: '#000', fillOpacity: 0.25, stroke: true, color: '#F59E0B', weight: 1, opacity: 0.5 }}
          />
        )}

        {/* Country Risk Choropleth */}
        {showChoropleth && countryGeoJSON && (
          <GeoJSON
            key="choropleth"
            data={countryGeoJSON}
            style={choroplethStyle}
          />
        )}

        {/* Context menu handler — long press / right click for Country Dossier */}
        <MapContextMenu onContextMenu={(latlng) => setDossierPos(latlng)} />

        {/* Viewport tracking for refetch */}
        {mode === 'tracking' && <MapCenterTracker onCenterChange={handleCenterChange} />}

        {/* Hantavirus 2026 — onglet dédié */}
        {mode === 'hantavirus' && (
          <>
            {/* Zones endémiques (fond) */}
            {showEndemic && ENDEMIC_ZONES.map((z) => (
              <CircleMarker
                key={z.id}
                center={[z.lat, z.lng]}
                radius={8}
                pathOptions={{ color: '#64748B', fillColor: '#334155', fillOpacity: 0.35, weight: 1.5, dashArray: '4 3' }}
              >
                <Popup>
                  <div className="map-page__popup">
                    <div className="map-page__popup-header">
                      <span style={{ fontSize: '0.65rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>Zone endémique</span>
                    </div>
                    <h4 className="map-page__popup-title">{z.label}</h4>
                    <p className="map-page__popup-desc">{z.country} — Virus : {z.virus}</p>
                    <a href={z.url} target="_blank" rel="noopener noreferrer" className="map-page__popup-link">
                      Source <ExternalLink size={10} />
                    </a>
                  </div>
                </Popup>
              </CircleMarker>
            ))}

            {/* Cas MV Hondius */}
            {MV_HONDIUS_CASES.filter((c) => {
              if (!showMonitoring && c.status === 'monitoring') return false;
              return true;
            }).map((c) => {
              const cfg = {
                deceased:      { color: '#111827', fill: '#1F2937', r: 14, label: '☠' },
                confirmed:     { color: '#EF4444', fill: '#DC2626', r: 11, label: '●' },
                suspected:     { color: '#F97316', fill: '#EA580C', r: 9,  label: '◎' },
                monitoring:    { color: '#FBBF24', fill: '#D97706', r: 7,  label: '○' },
                exposure_site: { color: '#A855F7', fill: '#9333EA', r: 13, label: '★' },
              }[c.status] || { color: '#64748B', fill: '#475569', r: 7, label: '?' };
              return (
                <CircleMarker
                  key={c.id}
                  center={[c.lat, c.lng]}
                  radius={cfg.r}
                  pathOptions={{ color: cfg.color, fillColor: cfg.fill, fillOpacity: 0.85, weight: 2 }}
                >
                  <Popup>
                    <div className="map-page__popup">
                      <div className="map-page__popup-header">
                        <span style={{ color: cfg.color, fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase' }}>
                          {cfg.label} {c.status.replace('_', ' ')}
                          {c.origin === 'imported' && <span style={{ marginLeft: 6, opacity: 0.7 }}>✈ importé</span>}
                          {c.origin === 'response' && <span style={{ marginLeft: 6, opacity: 0.7 }}>&#x1F6E1; réponse</span>}
                        </span>
                      </div>
                      <h4 className="map-page__popup-title">{c.label}</h4>
                      <p className="map-page__popup-desc">{c.detail}</p>
                      <div className="map-page__popup-meta">
                        <span>{c.source}</span>
                        <span>{c.date}</span>
                      </div>
                      <a href={c.url} target="_blank" rel="noopener noreferrer" className="map-page__popup-link">
                        Source <ExternalLink size={10} />
                      </a>
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}
          </>
        )}

        {/* Alert markers */}
        {mode === 'alerts' && (
          <>
            {showHeatmap && showBaseAlerts && <HeatmapLayer points={heatPoints} />}

            {/* Hantavirus layer */}
            {showHantavirus && hantavirusCases.map((c) => {
              const color = c.severity === 'critical' ? '#EF4444' : c.severity === 'high' ? '#F97316' : '#FBBF24';
              return (
                <CircleMarker
                  key={c.id}
                  center={[c.latitude, c.longitude]}
                  radius={c.severity === 'critical' ? 12 : c.severity === 'high' ? 9 : 7}
                  pathOptions={{
                    color: color,
                    fillColor: color,
                    fillOpacity: 0.75,
                    weight: 2,
                  }}
                >
                  <Popup>
                    <div className="map-page__popup">
                      <div className="map-page__popup-header">
                        <span style={{ color, fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase' }}>
                          ⚠ Hantavirus
                        </span>
                      </div>
                      <h4 className="map-page__popup-title">{c.title}</h4>
                      <p className="map-page__popup-desc">{c.description}</p>
                      <div className="map-page__popup-meta">
                        <span>{c.sourceName}</span>
                        <span>{timeAgo(c.eventDate)}</span>
                      </div>
                      {c.sourceUrl && (
                        <a href={c.sourceUrl} target="_blank" rel="noopener noreferrer" className="map-page__popup-link">
                          Source <ExternalLink size={10} />
                        </a>
                      )}
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}

            {showBaseAlerts && filteredEvents.map((event) => {
              const cat = CATEGORIES[event.type] || CATEGORIES.other;
              const sev = SEVERITY_LEVELS[event.severity] || SEVERITY_LEVELS.info;
              return (
                <CircleMarker
                  key={event.id}
                  center={[event.latitude, event.longitude]}
                  radius={severityToRadius(event.severity)}
                  pathOptions={{
                    color: sev.color,
                    fillColor: cat.color,
                    fillOpacity: 0.7,
                    weight: 2,
                  }}
                >
                  <Popup>
                    <div className="map-page__popup">
                      <div className="map-page__popup-header">
                        <SeverityBadge severity={event.severity} size="xs" />
                        <span className="map-page__popup-category">{cat.label}</span>
                      </div>
                      <h4 className="map-page__popup-title">{event.title}</h4>
                      <p className="map-page__popup-desc">{event.description}</p>
                      <div className="map-page__popup-meta">
                        <span>{event.sourceName}</span>
                        <span>{timeAgo(event.eventDate)}</span>
                      </div>
                      {event.sourceUrl && (
                        <a
                          href={event.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="map-page__popup-link"
                        >
                          Source <ExternalLink size={10} />
                        </a>
                      )}
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}
          </>
        )}

        {/* Tracker markers — clustered */}
        {mode === 'tracking' && (
          <TrackerClusterLayer points={allTrackerPoints} createIcon={createTrackerIcon} />
        )}

        {/* User location */}
        <CircleMarker
          center={[lat, lng]}
          radius={6}
          pathOptions={{ color: '#3B82F6', fillColor: '#3B82F6', fillOpacity: 1, weight: 3 }}
        >
          <Popup><p style={{ fontSize: '0.875rem', fontWeight: 500 }}>{userLocation.label}</p></Popup>
        </CircleMarker>

        {/* Geofence zones — tracking mode only (would block clicks in other modes) */}
        {mode === 'tracking' && zones.map((zone) => (
          <Circle
            key={zone.id}
            center={[zone.lat, zone.lng]}
            radius={zone.radiusKm * 1000}
            pathOptions={{
              color: '#6DBE45',
              fillColor: '#6DBE45',
              fillOpacity: 0.08,
              weight: 1.5,
              dashArray: '6 4',
            }}
          >
            <Popup><p style={{ fontSize: '0.875rem', fontWeight: 500 }}>🎯 {zone.label} ({zone.radiusKm} km)</p></Popup>
          </Circle>
        ))}

        <LocationButton />
      </MapContainer>
      </div>

      {/* Country Dossier — right-click / long-press */}
      {dossierPos && (
        <CountryDossier lat={dossierPos.lat} lng={dossierPos.lng} onClose={() => setDossierPos(null)} />
      )}

      {/* Toggle alertes — bas gauche */}
      {mode === 'alerts' && (
        <button
          onClick={() => setShowBaseAlerts(!showBaseAlerts)}
          className="map-page__toggle-alerts"
          aria-label={showBaseAlerts ? 'Masquer les alertes' : 'Afficher les alertes'}
          title={showBaseAlerts ? 'Masquer les alertes' : 'Afficher les alertes'}
        >
          {showBaseAlerts ? <Eye size={18} /> : <EyeOff size={18} />}
        </button>
      )}

      {/* Bottom info bar */}
      <div className="map-page__count">
        {mode === 'alerts' && `${filteredEvents.length} événement${filteredEvents.length > 1 ? 's' : ''}`}
        {mode === 'tracking' && `${allTrackerPoints.length} objet${allTrackerPoints.length > 1 ? 's' : ''} suivi${allTrackerPoints.length > 1 ? 's' : ''}`}
        {mode === 'hantavirus' && `MV Hondius · ${OUTBREAK_SUMMARY.totalConfirmed} confirmés · ${OUTBREAK_SUMMARY.totalDeceased} décès · WHO risque ${OUTBREAK_SUMMARY.whoRisk}`}
        {/* empty placeholder to satisfy original logic */}
        {false && ''}
        {mode === 'tracking' && activeTrackers.includes('ship') && !trackersLoading && lastFetch && maritimeCoverage !== 'global' && (
          <span className="map-page__last-update"> · Navires: {ships.length === 0 ? 'aucun à proximité' : 'couverture régionale'}</span>
        )}
        {mode === 'tracking' && activeTrackers.includes('ship') && !trackersLoading && lastFetch && maritimeCoverage === 'global' && (
          <span className="map-page__last-update"> · Navires: couverture mondiale</span>
        )}
        {mode === 'tracking' && lastFetch && (
          <span className="map-page__last-update"> · MAJ {new Date(lastFetch).toLocaleTimeString('fr-FR')}</span>
        )}
      </div>
    </div>
  );
}
