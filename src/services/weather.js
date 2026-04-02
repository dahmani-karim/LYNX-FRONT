import { API_CONFIG } from '../config/api';

const WEATHER_CODES = {
  0: 'Ciel dégagé',
  1: 'Principalement dégagé',
  2: 'Partiellement nuageux',
  3: 'Couvert',
  45: 'Brouillard',
  48: 'Brouillard givrant',
  51: 'Bruine légère',
  53: 'Bruine modérée',
  55: 'Bruine dense',
  56: 'Bruine verglaçante légère',
  57: 'Bruine verglaçante dense',
  61: 'Pluie légère',
  63: 'Pluie modérée',
  65: 'Pluie forte',
  66: 'Pluie verglaçante légère',
  67: 'Pluie verglaçante forte',
  71: 'Neige légère',
  73: 'Neige modérée',
  75: 'Neige forte',
  77: 'Grains de neige',
  80: 'Averses légères',
  81: 'Averses modérées',
  82: 'Averses violentes',
  85: 'Averses de neige légères',
  86: 'Averses de neige fortes',
  95: 'Orage',
  96: 'Orage avec grêle légère',
  99: 'Orage avec grêle forte',
};

function getWeatherDescription(code) {
  return WEATHER_CODES[code] || 'Inconnu';
}

function detectWeatherAlerts(data, lat, lng) {
  const alerts = [];
  const current = data.current;
  const daily = data.daily;

  if (current) {
    // Rafales violentes (seuils adaptés France)
    if (current.wind_gusts_10m > 70) {
      const severity = current.wind_gusts_10m > 130 ? 'critical' : current.wind_gusts_10m > 100 ? 'high' : 'medium';
      alerts.push({
        id: `weather-wind-now`,
        type: 'weather',
        title: 'Rafales violentes en cours',
        description: `Rafales de ${current.wind_gusts_10m} km/h détectées`,
        severity,
        latitude: lat,
        longitude: lng,
        sourceName: 'Open-Meteo',
        sourceReliability: 90,
        eventDate: new Date().toISOString(),
      });
    }
    // Forte chaleur
    if (current.temperature_2m > 33) {
      const severity = current.temperature_2m > 42 ? 'critical' : current.temperature_2m > 38 ? 'high' : 'medium';
      alerts.push({
        id: `weather-heat-now`,
        type: 'weather',
        title: 'Forte chaleur en cours',
        description: `Température de ${current.temperature_2m}°C`,
        severity,
        latitude: lat,
        longitude: lng,
        sourceName: 'Open-Meteo',
        sourceReliability: 92,
        eventDate: new Date().toISOString(),
      });
    }
    // Grand froid
    if (current.temperature_2m < -5) {
      const severity = current.temperature_2m < -20 ? 'critical' : current.temperature_2m < -10 ? 'high' : 'medium';
      alerts.push({
        id: `weather-cold-now`,
        type: 'weather',
        title: 'Grand froid en cours',
        description: `Température de ${current.temperature_2m}°C`,
        severity,
        latitude: lat,
        longitude: lng,
        sourceName: 'Open-Meteo',
        sourceReliability: 92,
        eventDate: new Date().toISOString(),
      });
    }
    // Orage en cours (weather codes 95, 96, 99)
    if ([95, 96, 99].includes(current.weather_code)) {
      const severity = current.weather_code === 99 ? 'high' : 'medium';
      alerts.push({
        id: `weather-storm-now`,
        type: 'weather',
        title: 'Orage en cours',
        description: getWeatherDescription(current.weather_code),
        severity,
        latitude: lat,
        longitude: lng,
        sourceName: 'Open-Meteo',
        sourceReliability: 92,
        eventDate: new Date().toISOString(),
      });
    }
    // Neige en cours (weather codes 71, 73, 75, 85, 86)
    if ([71, 73, 75, 85, 86].includes(current.weather_code)) {
      const severity = [75, 86].includes(current.weather_code) ? 'high' : 'medium';
      alerts.push({
        id: `weather-snow-now`,
        type: 'weather',
        title: 'Chutes de neige en cours',
        description: getWeatherDescription(current.weather_code),
        severity,
        latitude: lat,
        longitude: lng,
        sourceName: 'Open-Meteo',
        sourceReliability: 90,
        eventDate: new Date().toISOString(),
      });
    }
    // Verglas / pluie verglaçante (weather codes 56, 57, 66, 67)
    if ([56, 57, 66, 67].includes(current.weather_code)) {
      alerts.push({
        id: `weather-ice-now`,
        type: 'weather',
        title: 'Verglas / pluie verglaçante',
        description: `${getWeatherDescription(current.weather_code)} — risque de routes glissantes`,
        severity: [57, 67].includes(current.weather_code) ? 'high' : 'medium',
        latitude: lat,
        longitude: lng,
        sourceName: 'Open-Meteo',
        sourceReliability: 90,
        eventDate: new Date().toISOString(),
      });
    }
    // Brouillard dense (weather codes 45, 48)
    if ([45, 48].includes(current.weather_code)) {
      alerts.push({
        id: `weather-fog-now`,
        type: 'weather',
        title: current.weather_code === 48 ? 'Brouillard givrant' : 'Brouillard dense',
        description: `${getWeatherDescription(current.weather_code)} — visibilité réduite`,
        severity: current.weather_code === 48 ? 'medium' : 'low',
        latitude: lat,
        longitude: lng,
        sourceName: 'Open-Meteo',
        sourceReliability: 85,
        eventDate: new Date().toISOString(),
      });
    }
  }

  if (daily) {
    daily.time.forEach((date, i) => {
      // Vent fort (seuil abaissé: 60 km/h)
      if (daily.wind_speed_10m_max[i] > 60) {
        const severity = daily.wind_speed_10m_max[i] > 120 ? 'high' : daily.wind_speed_10m_max[i] > 80 ? 'medium' : 'low';
        alerts.push({
          id: `weather-wind-${date}`,
          type: 'weather',
          title: `Vent fort prévu le ${date}`,
          description: `Vents jusqu'à ${daily.wind_speed_10m_max[i]} km/h`,
          severity,
          latitude: lat,
          longitude: lng,
          sourceName: 'Open-Meteo',
          sourceReliability: 85,
          eventDate: new Date(date).toISOString(),
        });
      }
      // Précipitations importantes (seuil abaissé: 20 mm)
      if (daily.precipitation_sum[i] > 20) {
        const severity = daily.precipitation_sum[i] > 80 ? 'high' : daily.precipitation_sum[i] > 40 ? 'medium' : 'low';
        alerts.push({
          id: `weather-rain-${date}`,
          type: 'weather',
          title: `Fortes précipitations le ${date}`,
          description: `${daily.precipitation_sum[i]} mm attendus${daily.precipitation_sum[i] > 40 ? ' – risque d\'inondation' : ''}`,
          severity,
          latitude: lat,
          longitude: lng,
          sourceName: 'Open-Meteo',
          sourceReliability: 82,
          eventDate: new Date(date).toISOString(),
        });
      }
      // Chaleur (seuil abaissé: 33°C)
      if (daily.temperature_2m_max[i] > 33) {
        const severity = daily.temperature_2m_max[i] > 42 ? 'critical' : daily.temperature_2m_max[i] > 38 ? 'high' : 'medium';
        alerts.push({
          id: `weather-heat-${date}`,
          type: 'weather',
          title: `Forte chaleur prévue le ${date}`,
          description: `Maximum ${daily.temperature_2m_max[i]}°C`,
          severity,
          latitude: lat,
          longitude: lng,
          sourceName: 'Open-Meteo',
          sourceReliability: 85,
          eventDate: new Date(date).toISOString(),
        });
      }
      // Gel (températures min < 0°C)
      if (daily.temperature_2m_min[i] < -2) {
        const severity = daily.temperature_2m_min[i] < -15 ? 'high' : daily.temperature_2m_min[i] < -5 ? 'medium' : 'low';
        alerts.push({
          id: `weather-frost-${date}`,
          type: 'weather',
          title: `Gel prévu le ${date}`,
          description: `Minimum ${daily.temperature_2m_min[i]}°C — risque de verglas`,
          severity,
          latitude: lat,
          longitude: lng,
          sourceName: 'Open-Meteo',
          sourceReliability: 85,
          eventDate: new Date(date).toISOString(),
        });
      }
      // UV élevé (seuil abaissé: 7)
      if (daily.uv_index_max[i] > 7) {
        const severity = daily.uv_index_max[i] > 10 ? 'medium' : 'low';
        alerts.push({
          id: `weather-uv-${date}`,
          type: 'weather',
          title: `UV élevé le ${date}`,
          description: `Index UV ${daily.uv_index_max[i]}`,
          severity,
          latitude: lat,
          longitude: lng,
          sourceName: 'Open-Meteo',
          sourceReliability: 80,
          eventDate: new Date(date).toISOString(),
        });
      }
    });
  }

  return alerts;
}

export async function fetchWeather(lat, lng) {
  const params = new URLSearchParams({
    latitude: lat,
    longitude: lng,
    current: 'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_gusts_10m,pressure_msl',
    hourly: 'temperature_2m,precipitation_probability,wind_speed_10m,weather_code',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max,wind_gusts_10m_max,uv_index_max',
    timezone: 'Europe/Paris',
    forecast_days: 7,
  });

  const res = await fetch(`${API_CONFIG.OPEN_METEO.BASE}?${params}`);
  if (!res.ok) throw new Error(`Open-Meteo API error: ${res.status}`);
  const data = await res.json();

  const alerts = detectWeatherAlerts(data, lat, lng);

  return {
    current: data.current
      ? {
          temperature: data.current.temperature_2m,
          feelsLike: data.current.apparent_temperature,
          humidity: data.current.relative_humidity_2m,
          windSpeed: data.current.wind_speed_10m,
          windGusts: data.current.wind_gusts_10m,
          pressure: data.current.pressure_msl,
          weatherCode: data.current.weather_code,
          description: getWeatherDescription(data.current.weather_code),
        }
      : null,
    daily: data.daily,
    alerts,
  };
}
