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
    // Finances & Paiement
    STRIPE: 'https://status.stripe.com/api/v2/status.json',
    PAYPAL: 'https://www.paypal-status.com/api/v2/status.json',
    WISE: 'https://status.wise.com/api/v2/status.json',
    COINBASE: 'https://status.coinbase.com/api/v2/status.json',
    // Cloud & Hébergement
    GITHUB: 'https://www.githubstatus.com/api/v2/status.json',
    CLOUDFLARE: 'https://www.cloudflarestatus.com/api/v2/status.json',
    VERCEL: 'https://www.vercel-status.com/api/v2/status.json',
    NETLIFY: 'https://www.netlifystatus.com/api/v2/status.json',
    RENDER: 'https://status.render.com/api/v2/status.json',
    DIGITALOCEAN: 'https://status.digitalocean.com/api/v2/status.json',
    // Communication & Réseaux sociaux
    DISCORD: 'https://discordstatus.com/api/v2/status.json',
    SLACK: 'https://status.slack.com/api/v2.0.0/current',
    ZOOM: 'https://status.zoom.us/api/v2/status.json',
    TWITCH: 'https://status.twitch.tv/api/v2/status.json',
    REDDIT: 'https://www.redditstatus.com/api/v2/status.json',
    // Outils & Productivité
    OPENAI: 'https://status.openai.com/api/v2/status.json',
    NOTION: 'https://status.notion.so/api/v2/status.json',
    FIGMA: 'https://status.figma.com/api/v2/status.json',
    BITBUCKET: 'https://bitbucket.status.atlassian.com/api/v2/status.json',
    DATADOG: 'https://status.datadoghq.com/api/v2/status.json',
    DROPBOX: 'https://status.dropbox.com/api/v2/status.json',
    ATLASSIAN: 'https://status.atlassian.com/api/v2/status.json',
  },

  PING_SERVICES: {
    // Santé & Services publics
    DOCTOLIB: 'https://www.doctolib.fr',
    AMELI: 'https://www.ameli.fr',
    SERVICE_PUBLIC: 'https://www.service-public.fr',
    IMPOTS: 'https://www.impots.gouv.fr',
    CNAM: 'https://www.complementaire-sante-solidaire.gouv.fr',
    // Logistique & Transport
    SNCF: 'https://www.sncf-connect.com',
    RATP: 'https://www.ratp.fr',
    UBER: 'https://www.uber.com',
    // Grandes plateformes (pas de statuspage public)
    GOOGLE: 'https://www.google.fr',
    YOUTUBE: 'https://www.youtube.com',
    WHATSAPP: 'https://web.whatsapp.com',
    INSTAGRAM: 'https://www.instagram.com',
    AMAZON: 'https://www.amazon.fr',
  },

  CORS_PROXIES: [
    'https://api.allorigins.win/raw?url=',
    'https://corsproxy.io/?url=',
  ],

  RSS2JSON: 'https://api.rss2json.com/v1/api.json?rss_url=',

  GDELT: {
    DOC_API: 'https://api.gdeltproject.org/api/v2/doc/doc',
  },

  OPEN_METEO_AQ: {
    BASE: 'https://air-quality-api.open-meteo.com/v1/air-quality',
  },

  NASA_EONET: {
    BASE: 'https://eonet.gsfc.nasa.gov/api/v3/events',
  },

  NASA_FIRMS: {
    BASE: 'https://firms.modaps.eosdis.nasa.gov/api/area/csv',
    MAP_KEY: '88b7cebaab82b8e81a7f76a9f321f603',
  },

  NOAA_SWPC: {
    ALERTS: 'https://services.swpc.noaa.gov/products/alerts.json',
    KP_INDEX: 'https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json',
  },

  DISEASE_SH: {
    BASE: 'https://disease.sh/v3/covid-19',
  },
};

export const POLLING_INTERVALS = {
  EARTHQUAKES: 3 * 60 * 1000,
  WEATHER: 10 * 60 * 1000,
  GDACS: 10 * 60 * 1000,
  CYBER: 30 * 60 * 1000,
  ENERGY: 15 * 60 * 1000,
  STATUS: 5 * 60 * 1000,
  AIR_QUALITY: 15 * 60 * 1000,
  FIRES: 10 * 60 * 1000,
  SPACE_WEATHER: 15 * 60 * 1000,
  HEALTH: 60 * 60 * 1000,
};
