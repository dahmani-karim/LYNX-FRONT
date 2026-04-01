export const ECOSYSTEM_APPS = [
  {
    id: 'lynx',
    name: 'LYNX',
    emoji: '🐆',
    description: 'Anticipation & Alertes temps réel',
    url: 'https://lynx.lacavernedurefractaire.fr',
    devUrl: 'http://localhost:5176',
    color: '#3B82F6',
    current: true,
  },
  {
    id: 'smartcellar',
    name: 'SmartCellar',
    emoji: '🏪',
    description: 'Gestion intelligente de vos stocks',
    url: 'https://smartcellar.lacavernedurefractaire.fr',
    devUrl: 'http://localhost:5173',
    color: '#F59E0B',
  },
  {
    id: 'progarden',
    name: 'ProGarden',
    emoji: '🌱',
    description: 'Potager & autoproduction',
    url: 'https://progarden.lacavernedurefractaire.fr',
    devUrl: 'http://localhost:5174',
    color: '#22c55e',
  },
  {
    id: 'farmly',
    name: 'Farmly',
    emoji: '🐔',
    description: 'Élevage & autosuffisance animale',
    url: 'https://farmly.lacavernedurefractaire.fr',
    devUrl: 'http://localhost:5175',
    color: '#8B4513',
  },
  {
    id: 'prete',
    name: 'PRÊT·E',
    emoji: '🎒',
    description: 'Scénarios de préparation',
    url: 'https://pret.lacavernedurefractaire.fr',
    devUrl: 'http://localhost:5177',
    color: '#6B8E7A',
  },
];

export function getAppUrl(app) {
  const isDev = import.meta.env.DEV;
  return isDev ? (app.devUrl || app.url) : app.url;
}
