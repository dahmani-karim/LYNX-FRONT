export const API_CONFIG = {
  STRAPI_URL: import.meta.env.VITE_STRAPI_URL || 'https://smart-cellar-api.onrender.com',

  USGS: {
    FEED_BASE: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary',
    feeds: {
      significant_day: '/significant_day.geojson',
      m45_day: '/4.5_day.geojson',
      m25_day: '/2.5_day.geojson',
      all_day: '/all_day.geojson',
      significant_week: '/significant_week.geojson',
      m45_week: '/4.5_week.geojson',
      m25_week: '/2.5_week.geojson',
      all_week: '/all_week.geojson',
    },
  },

  OPEN_METEO: {
    BASE: 'https://api.open-meteo.com/v1/forecast',
  },

  GDACS: {
    EVENTS: 'https://www.gdacs.org/gdacsapi/api/events/geteventlist/SEARCH',
    RSS: 'https://www.gdacs.org/xml/rss.xml',
  },

  CERT_FR: {
    ALERTES_RSS: 'https://www.cert.ssi.gouv.fr/alerte/feed/',
    AVIS_RSS: 'https://www.cert.ssi.gouv.fr/avis/feed/',
  },

  ODRE: {
    BASE: 'https://odre.opendatasoft.com/api/explore/v2.1/catalog/datasets',
    ECOGAZ: '/signal-ecogaz/records',
    NUCLEAR: '/production-nette-nucleaire/records',
  },

  STATUS_PAGES: {
    GITHUB: 'https://www.githubstatus.com/api/v2/status.json',
    CLOUDFLARE: 'https://www.cloudflarestatus.com/api/v2/status.json',
  },

  CORS_PROXIES: [
    'https://corsproxy.io/?',
    'https://api.allorigins.win/raw?url=',
    'https://api.codetabs.com/v1/proxy?quest=',
  ],
};

export const POLLING_INTERVALS = {
  EARTHQUAKES: 3 * 60 * 1000,
  WEATHER: 10 * 60 * 1000,
  GDACS: 10 * 60 * 1000,
  CYBER: 30 * 60 * 1000,
  ENERGY: 15 * 60 * 1000,
  STATUS: 5 * 60 * 1000,
};
