import { useState, useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { useAlertStore } from '../../stores/alertStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { CATEGORIES, SEVERITY_LEVELS } from '../../config/categories';
import SeverityBadge from '../../components/SeverityBadge/SeverityBadge';
import { timeAgo } from '../../utils/date';
import { Locate, ExternalLink } from 'lucide-react';
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

export default function MapPage() {
  const events = useAlertStore((s) => s.events);
  const userLocation = useSettingsStore((s) => s.userLocation);
  const [activeCategories, setActiveCategories] = useState(new Set());

  const filteredEvents = useMemo(() => {
    let items = events.filter((e) => e.latitude && e.longitude);
    if (activeCategories.size > 0) {
      items = items.filter((e) => activeCategories.has(e.type));
    }
    return items;
  }, [events, activeCategories]);

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
      {/* Filter chips */}
      <div className="map-page__filters">
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

      {/* Map */}
      <MapContainer
        center={[userLocation.lat, userLocation.lng]}
        zoom={4}
        className="map-page__map"
        zoomControl={false}
      >
        <TileLayer url={DARK_TILES} attribution={DARK_ATTRIBUTION} />

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

        {/* User location */}
        <CircleMarker
          center={[userLocation.lat, userLocation.lng]}
          radius={6}
          pathOptions={{ color: '#3B82F6', fillColor: '#3B82F6', fillOpacity: 1, weight: 3 }}
        >
          <Popup><p style={{ fontSize: '0.875rem', fontWeight: 500 }}>{userLocation.label}</p></Popup>
        </CircleMarker>

        <LocationButton />
      </MapContainer>

      {/* Event count */}
      <div className="map-page__count">
        {filteredEvents.length} événement{filteredEvents.length > 1 ? 's' : ''}
      </div>
    </div>
  );
}
