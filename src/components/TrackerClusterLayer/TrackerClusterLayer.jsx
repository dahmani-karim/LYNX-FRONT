import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';

const COLORS = { aircraft: '#3B82F6', satellite: '#D946EF', ship: '#06B6D4' };

function formatPopup(p) {
  if (p.type === 'aircraft') {
    return `<div class="map-page__popup">
      <h4 class="map-page__popup-title">✈️ ${p.callsign || p.icao24 || 'Inconnu'}</h4>
      <p class="map-page__popup-desc">
        Altitude: ${Math.round(p.altitude || 0)}m · Vitesse: ${Math.round((p.velocity || 0) * 3.6)} km/h<br/>
        Origine: ${p.origin || '—'}
      </p>
    </div>`;
  }
  if (p.type === 'satellite') {
    return `<div class="map-page__popup">
      <h4 class="map-page__popup-title">🛰️ ${p.name || 'Satellite'}</h4>
      <p class="map-page__popup-desc">
        Altitude: ${Math.round(p.altitude || 0)} km${p.satid ? `<br/>NORAD: ${p.satid}` : ''}
      </p>
    </div>`;
  }
  if (p.type === 'ship') {
    return `<div class="map-page__popup">
      <h4 class="map-page__popup-title">🚢 ${p.name || 'Navire'}</h4>
      <p class="map-page__popup-desc">
        Vitesse: ${p.speed || 0} kn · Cap: ${Math.round(p.heading || 0)}°
      </p>
    </div>`;
  }
  return `<b>${p.name || p.id}</b>`;
}

export default function TrackerClusterLayer({ points, createIcon }) {
  const map = useMap();
  const clusterRef = useRef(null);

  useEffect(() => {
    const cluster = L.markerClusterGroup({
      maxClusterRadius: 50,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      disableClusteringAtZoom: 11,
      animate: true,
      chunkedLoading: true,
      iconCreateFunction: (c) => {
        const count = c.getChildCount();
        const types = {};
        c.getAllChildMarkers().forEach((m) => {
          const t = m.options._trackerType || 'aircraft';
          types[t] = (types[t] || 0) + 1;
        });
        const dominant = Object.entries(types).sort((a, b) => b[1] - a[1])[0]?.[0] || 'aircraft';
        const color = COLORS[dominant];
        const size = count > 100 ? 52 : count > 30 ? 42 : 32;
        return L.divIcon({
          html: `<div class="tracker-cluster" style="--c:${color};width:${size}px;height:${size}px"><span>${count}</span></div>`,
          className: 'tracker-cluster-wrapper',
          iconSize: [size, size],
        });
      },
    });
    clusterRef.current = cluster;
    map.addLayer(cluster);

    return () => {
      map.removeLayer(cluster);
    };
  }, [map]);

  useEffect(() => {
    const cluster = clusterRef.current;
    if (!cluster) return;
    cluster.clearLayers();

    const markers = points
      .filter((p) => p.latitude && p.longitude)
      .map((p) => {
        const marker = L.marker([p.latitude, p.longitude], {
          icon: createIcon(p.type, p.heading || 0),
          _trackerType: p.type,
        });
        marker.bindPopup(formatPopup(p));
        return marker;
      });

    if (markers.length > 0) cluster.addLayers(markers);
  }, [points, createIcon]);

  return null;
}
