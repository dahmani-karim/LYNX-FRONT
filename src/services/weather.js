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
    if (current.wind_gusts_10m > 100) {
      alerts.push({
        id: `weather-wind-now`,
        type: 'weather',
        title: 'Rafales violentes en cours',
        description: `Rafales de ${current.wind_gusts_10m} km/h détectées`,
        severity: current.wind_gusts_10m > 130 ? 'critical' : 'high',
        latitude: lat,
        longitude: lng,
        sourceName: 'Open-Meteo',
        sourceReliability: 90,
        eventDate: new Date().toISOString(),
      });
    }
    if (current.temperature_2m > 40) {
      alerts.push({
        id: `weather-heat-now`,
        type: 'weather',
        title: 'Canicule en cours',
        description: `Température de ${current.temperature_2m}°C`,
        severity: current.temperature_2m > 44 ? 'critical' : 'high',
        latitude: lat,
        longitude: lng,
        sourceName: 'Open-Meteo',
        sourceReliability: 92,
        eventDate: new Date().toISOString(),
      });
    }
    if (current.temperature_2m < -15) {
      alerts.push({
        id: `weather-cold-now`,
        type: 'weather',
        title: 'Grand froid en cours',
        description: `Température de ${current.temperature_2m}°C`,
        severity: current.temperature_2m < -25 ? 'critical' : 'high',
        latitude: lat,
        longitude: lng,
        sourceName: 'Open-Meteo',
        sourceReliability: 92,
        eventDate: new Date().toISOString(),
      });
    }
  }

  if (daily) {
    daily.time.forEach((date, i) => {
      if (daily.wind_speed_10m_max[i] > 90) {
        alerts.push({
          id: `weather-wind-${date}`,
          type: 'weather',
          title: `Tempête prévue le ${date}`,
          description: `Vents jusqu'à ${daily.wind_speed_10m_max[i]} km/h`,
          severity: daily.wind_speed_10m_max[i] > 120 ? 'high' : 'medium',
          latitude: lat,
          longitude: lng,
          sourceName: 'Open-Meteo',
          sourceReliability: 85,
          eventDate: new Date(date).toISOString(),
        });
      }
      if (daily.precipitation_sum[i] > 50) {
        alerts.push({
          id: `weather-rain-${date}`,
          type: 'weather',
          title: `Fortes précipitations le ${date}`,
          description: `${daily.precipitation_sum[i]} mm attendus – risque d'inondation`,
          severity: daily.precipitation_sum[i] > 100 ? 'high' : 'medium',
          latitude: lat,
          longitude: lng,
          sourceName: 'Open-Meteo',
          sourceReliability: 82,
          eventDate: new Date(date).toISOString(),
        });
      }
      if (daily.temperature_2m_max[i] > 38) {
        alerts.push({
          id: `weather-heat-${date}`,
          type: 'weather',
          title: `Forte chaleur prévue le ${date}`,
          description: `Maximum ${daily.temperature_2m_max[i]}°C`,
          severity: daily.temperature_2m_max[i] > 42 ? 'high' : 'medium',
          latitude: lat,
          longitude: lng,
          sourceName: 'Open-Meteo',
          sourceReliability: 85,
          eventDate: new Date(date).toISOString(),
        });
      }
      if (daily.uv_index_max[i] > 10) {
        alerts.push({
          id: `weather-uv-${date}`,
          type: 'weather',
          title: `UV extrême le ${date}`,
          description: `Index UV ${daily.uv_index_max[i]}`,
          severity: 'low',
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
