# LYNX – Voyez ce que les autres ne voient pas

> Plateforme d'anticipation & d'alertes multi-risques en temps réel.

[![Deploy](https://img.shields.io/badge/Déploiement-GitHub%20Pages-blue)](https://lynx.lacavernedurefractaire.fr)

## Aperçu

LYNX agrège des données OSINT (Open Source Intelligence) pour fournir un tableau de bord de surveillance en temps réel couvrant :

- 🌍 **Séismes** – USGS Earthquake Hazards Program
- 🌦️ **Météo extrême** – Open-Meteo (canicules, tempêtes, précipitations, UV)
- 🌊 **Catastrophes** – GDACS (inondations, cyclones, volcans…)
- 🛡️ **Cyber** – CERT-FR alertes de sécurité
- ⚡ **Énergie** – ODRÉ / Ecogaz alertes tension réseau
- 🖥️ **Services** – Surveillance status GitHub & Cloudflare

## Stack technique

| Tech | Version | Usage |
|------|---------|-------|
| React | 19.x | UI |
| Vite | 6.x | Build |
| Tailwind CSS | 4.x | Styles |
| Zustand | 5.x | State management |
| Leaflet / react-leaflet | 1.9 / 5.x | Cartographie |
| Recharts | 2.x | Graphiques |
| Framer Motion | 12.x | Animations |
| Lucide React | – | Icônes |
| vite-plugin-pwa | 0.21 | PWA + Service Worker |

## Démarrage rapide

```bash
# Cloner le repo
git clone https://github.com/dahmani-karim/LYNX-FRONT.git
cd LYNX-FRONT

# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev
# → http://localhost:5176
```

## Scripts

| Commande | Description |
|----------|-------------|
| `npm run dev` | Serveur de dev (port 5176) |
| `npm run build` | Build de production |
| `npm run preview` | Prévisualiser le build |
| `npm run deploy` | Déployer sur GitHub Pages |

## Architecture

```
src/
├── config/          # API endpoints, écosystème, catégories
├── services/        # Fetchers (USGS, Open-Meteo, GDACS, CERT-FR, ODRÉ…)
├── stores/          # Zustand (alertStore, settingsStore)
├── hooks/           # useGeolocation, usePolling, useInstallPrompt
├── utils/           # Date, géo utilitaires
├── components/      # Composants réutilisables (Layout, Header, AlertCard…)
└── pages/           # Dashboard, MapPage, AlertsPage, StatsPage, SettingsPage
```

## Fonctionnalités

- **Score de risque global** – Algorithme composite pondéré par catégorie
- **Carte interactive** – CartoDB Dark Matter tiles, CircleMarkers colorés par sévérité
- **Alertes filtrables** – Par catégorie, sévérité, période, recherche textuelle
- **Statistiques** – Graphiques temporels, répartition par catégorie et sévérité
- **PWA** – Installable, fonctionne hors-ligne (cache des données)
- **Widget Android** – Shortcut PWA depuis l'écran d'accueil
- **Écosystème** – Passerelles contextuelles vers SmartCellar, ProGarden, Farmly, PRÊT·E
- **Mobile-first** – Responsive design avec bottom navigation

## Écosystème La Caverne du Réfractaire

| App | Description |
|-----|-------------|
| **LYNX** | Surveillance & alertes multi-risques |
| [SmartCellar](https://smartcellar.lacavernedurefractaire.fr) | Gestion de cave & stocks alimentaires |
| [ProGarden](https://progarden.lacavernedurefractaire.fr) | Planification de potager |
| [Farmly](https://farmly.lacavernedurefractaire.fr) | Gestion d'exploitation agricole |
| [PRÊT·E](https://prete.lacavernedurefractaire.fr) | Préparation aux situations d'urgence |

## Déploiement

Le site est déployé automatiquement sur GitHub Pages avec le domaine personnalisé `lynx.lacavernedurefractaire.fr`.

```bash
npm run deploy
```

## Sources de données

Toutes les API utilisées sont **gratuites et publiques** :

- [USGS Earthquake API](https://earthquake.usgs.gov/fdsnws/event/1/)
- [Open-Meteo](https://open-meteo.com/)
- [GDACS](https://www.gdacs.org/)
- [CERT-FR](https://www.cert.ssi.gouv.fr/)
- [ODRÉ](https://odre.opendatasoft.com/)

## Avertissement

⚠️ **LYNX fournit des informations à titre indicatif uniquement.** Cette application ne se substitue en aucun cas aux autorités officielles ou services d'urgence. En cas de danger immédiat, contactez le **112**.

## Licence

Projet privé – © 2026 La Caverne du Réfractaire
