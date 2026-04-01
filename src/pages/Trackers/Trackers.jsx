import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useTrackerStore } from '../../stores/trackerStore';
import { useSettingsStore } from '../../stores/settingsStore';
import Loader from '../../components/Loader/Loader';
import { Plane, Satellite, Ship, RefreshCw, Eye, EyeOff } from 'lucide-react';
import './Trackers.scss';

const TRACKER_TYPES = [
  { key: 'aircraft', label: 'Aéronefs', icon: Plane, color: '#3B82F6' },
  { key: 'satellite', label: 'Satellites', icon: Satellite, color: '#D946EF' },
  { key: 'ship', label: 'Navires', icon: Ship, color: '#06B6D4' },
];

function createTrackerIcon(type) {
  const colors = { aircraft: '#3B82F6', satellite: '#D946EF', ship: '#06B6D4' };
  const symbols = { aircraft: '✈', satellite: '🛰', ship: '🚢' };
  return L.divIcon({
    className: 'tracker-icon',
    html: `<div style="background:${colors[type]};width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,.4)">${symbols[type]}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

function RecenterMap({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom());
  }, [lat, lng, map]);
  return null;
}

export default function Trackers() {
  const { aircraft, satellites, ships, activeTrackers, isLoading, lastFetch, fetchTrackers, toggleTracker } =
    useTrackerStore();
  const userLocation = useSettingsStore((s) => s.userLocation);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const lat = userLocation?.lat || 48.8566;
  const lng = userLocation?.lng || 2.3522;

  useEffect(() => {
    fetchTrackers(lat, lng);
    if (!autoRefresh) return;
    const interval = setInterval(() => fetchTrackers(lat, lng), 30 * 1000);
    return () => clearInterval(interval);
  }, [lat, lng, autoRefresh, fetchTrackers]);

  const counts = {
    aircraft: aircraft.length,
    satellite: satellites.length,
    ship: ships.length,
  };

  const allPoints = useTrackerStore((s) => s.getAllTrackerPoints());

  return (
    <div className="trackers">
      <div className="trackers__header">
        <h1 className="trackers__title">Trackers en temps réel</h1>
        <div className="trackers__controls">
          <button
            className={`trackers__auto-btn ${autoRefresh ? 'trackers__auto-btn--active' : ''}`}
            onClick={() => setAutoRefresh(!autoRefresh)}
            title={autoRefresh ? 'Désactiver auto-refresh' : 'Activer auto-refresh'}
          >
            {autoRefresh ? <Eye size={16} /> : <EyeOff size={16} />}
            <span>Auto</span>
          </button>
          <button
            className="trackers__refresh-btn"
            onClick={() => fetchTrackers(lat, lng)}
            disabled={isLoading}
          >
            <RefreshCw size={16} className={isLoading ? 'spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Toggle buttons */}
      <div className="trackers__toggles">
        {TRACKER_TYPES.map(({ key, label, icon: Icon, color }) => {
          const active = activeTrackers.includes(key);
          return (
            <button
              key={key}
              className={`trackers__toggle ${active ? 'trackers__toggle--active' : ''}`}
              style={{ '--tracker-color': color }}
              onClick={() => toggleTracker(key)}
            >
              <Icon size={18} />
              <span>{label}</span>
              <span className="trackers__toggle-count">{counts[key]}</span>
            </button>
          );
        })}
      </div>

      {/* Map */}
      <div className="trackers__map-container">
        {isLoading && allPoints.length === 0 ? (
          <Loader text="Recherche des trackers..." />
        ) : (
          <MapContainer center={[lat, lng]} zoom={8} className="trackers__map">
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            />
            <RecenterMap lat={lat} lng={lng} />

            {allPoints
              .filter((p) => p.latitude && p.longitude)
              .map((point) => (
                <Marker
                  key={point.id}
                  position={[point.latitude, point.longitude]}
                  icon={createTrackerIcon(point.type)}
                >
                  <Popup>
                    <div className="tracker-popup">
                      {point.type === 'aircraft' && (
                        <>
                          <strong>{point.callsign || point.icao24}</strong>
                          <br />
                          Altitude: {Math.round(point.altitude)}m
                          <br />
                          Vitesse: {Math.round(point.velocity * 3.6)} km/h
                          <br />
                          Origine: {point.origin}
                        </>
                      )}
                      {point.type === 'satellite' && (
                        <>
                          <strong>{point.name}</strong>
                          <br />
                          Altitude: {Math.round(point.altitude)} km
                          <br />
                          ID: {point.satid}
                        </>
                      )}
                      {point.type === 'ship' && (
                        <>
                          <strong>{point.name}</strong>
                          <br />
                          Vitesse: {point.speed} kn
                          <br />
                          Cap: {Math.round(point.heading)}°
                        </>
                      )}
                    </div>
                  </Popup>
                </Marker>
              ))}
          </MapContainer>
        )}
      </div>

      {/* Stats bar */}
      <div className="trackers__stats">
        {lastFetch && (
          <span className="trackers__last-update">
            Dernière MAJ: {new Date(lastFetch).toLocaleTimeString('fr-FR')}
          </span>
        )}
        <span className="trackers__total">
          {allPoints.length} objets suivis
        </span>
      </div>
    </div>
  );
}
