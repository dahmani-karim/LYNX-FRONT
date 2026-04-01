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
    devUrl: 'https://smartcellar.lacavernedurefractaire.fr',
    color: '#F59E0B',
  },
  {
    id: 'progarden',
    name: 'ProGarden',
    emoji: '🌱',
    description: 'Potager & autoproduction',
    url: 'https://progarden.lacavernedurefractaire.fr',
    devUrl: 'https://progarden.lacavernedurefractaire.fr',
    color: '#22c55e',
  },
  {
    id: 'farmly',
    name: 'Farmly',
    emoji: '🐔',
    description: 'Élevage & autosuffisance animale',
    url: 'https://farmly.lacavernedurefractaire.fr',
    devUrl: 'https://farmly.lacavernedurefractaire.fr',
    color: '#8B4513',
  },
  {
    id: 'prete',
    name: 'PRÊT·E',
    emoji: '🎒',
    description: 'Scénarios de préparation',
    url: 'https://pret.lacavernedurefractaire.fr',
    devUrl: 'https://pret.lacavernedurefractaire.fr',
    color: '#6B8E7A',
  },
];

export function getAppUrl(app) {
  const isDev = import.meta.env.DEV;
  return isDev ? (app.devUrl || app.url) : app.url;
}
