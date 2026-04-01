import { useState, useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Circle, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useAlertStore } from '../../stores/alertStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { useTrackerStore } from '../../stores/trackerStore';
import { useAuthStore } from '../../stores/authStore';
import { CATEGORIES, SEVERITY_LEVELS } from '../../config/categories';
import SeverityBadge from '../../components/SeverityBadge/SeverityBadge';
import PremiumGate from '../../components/PremiumGate/PremiumGate';
import { timeAgo } from '../../utils/date';
import { Locate, ExternalLink, Layers, Radio, Plane, Satellite, Ship, Eye, EyeOff } from 'lucide-react';
import HeatmapLayer from '../../components/HeatmapLayer/HeatmapLayer';
import './MapPage.scss';

const DARK_TILES = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
const DARK_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>';

function severityToRadius(severity) {
  const map = { info: 4, low: 5, medium: 7, high: 9, critical: 12 };
  return map[severity] || 5;
}

function LocationButton() {
  const map = useMap();
  const setUserLocation = useSettingsStore((s) => s.setUserLocation);

  const handleClick = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        map.flyTo([latitude, longitude], 10);
        setUserLocation({ lat: latitude, lng: longitude, label: 'Ma position' });
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

const TRACKER_TYPES = [
  { key: 'aircraft', label: 'Aéronefs', icon: Plane, color: '#3B82F6' },
  { key: 'satellite', label: 'Satellites', icon: Satellite, color: '#D946EF' },
  { key: 'ship', label: 'Navires', icon: Ship, color: '#06B6D4' },
];

function createTrackerIcon(type, heading = 0) {
  const colors = { aircraft: '#3B82F6', satellite: '#D946EF', ship: '#06B6D4' };
  const arrows = { aircraft: '✈️', satellite: '🛰️', ship: '⬆' };
  const sizes = { aircraft: 28, satellite: 28, ship: 26 };
  const sz = sizes[type];
  const isShip = type === 'ship';
  return L.divIcon({
    className: 'tracker-icon',
    html: `<div style="width:${sz}px;height:${sz}px;display:flex;align-items:center;justify-content:center;transform:rotate(${heading}deg);transition:transform 0.5s ease;font-size:${isShip ? 14 : 16}px;${isShip ? `background:${colors[type]};border-radius:50%;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,.4);color:white;font-weight:bold` : ''}">${arrows[type]}</div>`,
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
  const [mode, setMode] = useState('alerts'); // 'alerts' | 'tracking'
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Tracker store
  const { aircraft, satellites, ships, activeTrackers, isLoading: trackersLoading, lastFetch, fetchTrackers, toggleTracker } =
    useTrackerStore();

  const lat = userLocation?.lat || 48.8566;
  const lng = userLocation?.lng || 2.3522;

  // Auto-fetch trackers when in tracking mode
  useEffect(() => {
    if (mode !== 'tracking') return;
    fetchTrackers(lat, lng);
    if (!autoRefresh) return;
    const interval = setInterval(() => fetchTrackers(lat, lng), 30 * 1000);
    return () => clearInterval(interval);
  }, [lat, lng, autoRefresh, fetchTrackers, mode]);

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
          Alertes
        </button>
        <button
          onClick={() => setMode('tracking')}
          className={`map-page__mode-btn ${mode === 'tracking' ? 'map-page__mode-btn--active' : ''}`}
        >
          <Plane size={14} />
          Tracking
        </button>
      </div>

      {/* Alert mode filters */}
      {mode === 'alerts' && (
        <div className="map-page__filters">
          <PremiumGate feature="Heatmap">
            <button
              onClick={() => setShowHeatmap(!showHeatmap)}
              className={`map-page__chip ${showHeatmap ? 'map-page__chip--active' : 'map-page__chip--inactive'}`}
            >
              <Layers size={14} />
              Heatmap
            </button>
          </PremiumGate>
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
        </div>
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
        zoom={mode === 'tracking' ? 8 : 4}
        className="map-page__map"
        zoomControl={false}
      >
        <TileLayer url={DARK_TILES} attribution={DARK_ATTRIBUTION} />

        {/* Alert markers */}
        {mode === 'alerts' && (
          <>
            {showHeatmap && isPremium && <HeatmapLayer points={heatPoints} />}

            {filteredEvents.map((event) => {
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

        {/* Tracker markers */}
        {mode === 'tracking' && allTrackerPoints
          .filter((p) => p.latitude && p.longitude)
          .map((point) => (
            <Marker
              key={point.id}
              position={[point.latitude, point.longitude]}
              icon={createTrackerIcon(point.type, point.heading || 0)}
            >
              <Popup>
                <div className="map-page__popup">
                  {point.type === 'aircraft' && (
                    <>
                      <h4 className="map-page__popup-title">{point.callsign || point.icao24}</h4>
                      <p className="map-page__popup-desc">
                        Altitude: {Math.round(point.altitude)}m<br />
                        Vitesse: {Math.round(point.velocity * 3.6)} km/h<br />
                        Origine: {point.origin}
                      </p>
                    </>
                  )}
                  {point.type === 'satellite' && (
                    <>
                      <h4 className="map-page__popup-title">{point.name}</h4>
                      <p className="map-page__popup-desc">
                        Altitude: {Math.round(point.altitude)} km<br />
                        ID: {point.satid}
                      </p>
                    </>
                  )}
                  {point.type === 'ship' && (
                    <>
                      <h4 className="map-page__popup-title">{point.name}</h4>
                      <p className="map-page__popup-desc">
                        Vitesse: {point.speed} kn<br />
                        Cap: {Math.round(point.heading)}°
                      </p>
                    </>
                  )}
                </div>
              </Popup>
            </Marker>
          ))
        }

        {/* User location */}
        <CircleMarker
          center={[lat, lng]}
          radius={6}
          pathOptions={{ color: '#3B82F6', fillColor: '#3B82F6', fillOpacity: 1, weight: 3 }}
        >
          <Popup><p style={{ fontSize: '0.875rem', fontWeight: 500 }}>{userLocation.label}</p></Popup>
        </CircleMarker>

        {/* Geofence zones */}
        {zones.map((zone) => (
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

      {/* Bottom info bar */}
      <div className="map-page__count">
        {mode === 'alerts'
          ? `${filteredEvents.length} événement${filteredEvents.length > 1 ? 's' : ''}`
          : `${allTrackerPoints.length} objet${allTrackerPoints.length > 1 ? 's' : ''} suivi${allTrackerPoints.length > 1 ? 's' : ''}`
        }
        {mode === 'tracking' && ships.length === 0 && activeTrackers.includes('ship') && !trackersLoading && (
          <span className="map-page__last-update"> · Navires: zone non couverte</span>
        )}
        {mode === 'tracking' && lastFetch && (
          <span className="map-page__last-update"> · MAJ {new Date(lastFetch).toLocaleTimeString('fr-FR')}</span>
        )}
      </div>
    </div>
  );
}
