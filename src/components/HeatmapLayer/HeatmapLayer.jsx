import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';

export default function HeatmapLayer({ points, options = {} }) {
  const map = useMap();

  useEffect(() => {
    if (!points || points.length === 0) return;

    const heatLayer = L.heatLayer(points, {
      radius: 25,
      blur: 15,
      maxZoom: 12,
      max: 1.0,
      gradient: {
        0.2: '#1a237e',
        0.4: '#0d47a1',
        0.5: '#2196f3',
        0.6: '#ffeb3b',
        0.8: '#ff9800',
        1.0: '#f44336',
      },
      ...options,
    });

    heatLayer.addTo(map);
    return () => map.removeLayer(heatLayer);
  }, [map, points, options]);

  return null;
}
