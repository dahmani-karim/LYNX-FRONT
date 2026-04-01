# 🐆 LYNX – Voyez ce que les autres ne voient pas

## Plateforme d'Anticipation & d'Alertes en Temps Réel

> **Concept** : Application OSINT + alertes multi-risques unifiée pour anticiper les crises (naturelles, géopolitiques, cyber, sociétales, approvisionnement) avant les médias traditionnels.

---

## 📋 TABLE DES MATIÈRES

1. [Vision & Positionnement](#1-vision--positionnement)
2. [Analyse de Faisabilité](#2-analyse-de-faisabilité)
3. [Architecture Technique](#3-architecture-technique)
4. [Modules Détaillés & APIs Gratuites](#4-modules-détaillés--apis-gratuites)
5. [Gestion N8N – Alternatives](#5-gestion-n8n--alternatives)
6. [Modèle de Données Strapi](#6-modèle-de-données-strapi)
7. [UX/UI Mobile-First](#7-uxui-mobile-first)
8. [PWA & Widget Android](#8-pwa--widget-android)
9. [Écosystème & Cross-Promotion](#9-écosystème--cross-promotion)
10. [Monétisation](#10-monétisation)
11. [Roadmap de Développement](#11-roadmap-de-développement)
12. [Risques & Pièges à Éviter](#12-risques--pièges-à-éviter)
13. [Améliorations Proposées](#13-améliorations-proposées)

---

## 1. VISION & POSITIONNEMENT

### Le Problème
- Les alertes sont **dispersées** sur des dizaines de sources (USGS, CERT-FR, RTE, syndicats, réseaux sociaux…)
- Les médias traditionnels ont un **délai de réaction** de plusieurs heures
- Le grand public n'a **aucun outil unifié** pour évaluer la stabilité de son environnement
- Les "fausses alertes" et la désinformation créent de la **panique inutile**

### La Solution LYNX
Un **radar de stabilité sociétale** qui :
- Agrège des dizaines de sources fiables en temps réel
- Calcule un **score de risque** par zone géographique et par type de menace
- Filtre le **bruit** et évalue la **crédibilité** de chaque signal
- Alerte l'utilisateur **avant** les médias (signaux faibles)
- Connecte avec l'écosystème d'autonomie (SmartCellar pour les stocks, ProGarden pour l'autoproduction, etc.)

### Différenciation Clé
| Concurrent | Limite | Avantage LYNX |
|:-----------|:-------|:-------------|
| Downdetector | Pannes tech uniquement | Multi-risques unifié |
| USGS | Séismes uniquement | Corrélation inter-domaines |
| CERT-FR | Cyber uniquement, technique | Vulgarisé + actionnable |
| Apps météo | Météo uniquement | Score global de stabilité |
| **Aucun concurrent** | — | Prédiction pénuries + mouvements sociaux France |

---

## 2. ANALYSE DE FAISABILITÉ

### ✅ Ce qui est Faisable Immédiatement (MVP)

| Module | API Gratuite | Difficulté | Fiabilité |
|:-------|:------------|:-----------|:----------|
| Séismes mondiaux | USGS API (GeoJSON) | ⭐ Facile | 🟢 Excellente |
| Météo extrême | Open-Meteo + alerts | ⭐ Facile | 🟢 Excellente |
| Énergie France | RTE éCO2mix / ODRÉ | ⭐⭐ Moyen | 🟢 Très bonne |
| Cyber alertes | CERT-FR RSS/scraping | ⭐⭐ Moyen | 🟢 Excellente |
| Carburant France | data.gouv.fr open data | ⭐⭐ Moyen | 🟢 Bonne |
| Carte interactive | Leaflet.js (gratuit) | ⭐ Facile | 🟢 Excellente |

### ⚠️ Faisable mais Nécessite du Travail (V2)

| Module | Source | Difficulté | Notes |
|:-------|:-------|:-----------|:------|
| Mouvements sociaux FR | Scraping RSS syndicats + X | ⭐⭐⭐ Complexe | Besoin NLP basique |
| Pénuries / approvisionnement | Croisement multi-sources | ⭐⭐⭐ Complexe | Corrélation de signaux |
| Pannes services (Downdetector) | Pas d'API officielle | ⭐⭐⭐ Complexe | Alternative : monitoring direct |
| Risques sanitaires | WHO Disease Outbreak News | ⭐⭐ Moyen | RSS disponible |

### 🔮 V3 / Nécessite N8N ou Backend Dédié

| Module | Raison | Solution Alternative |
|:-------|:-------|:--------------------|
| Surveillance militaire OSINT | ADS-B / AIS scraping lourd | Intégration via API tierces ou N8N |
| Scoring IA de fiabilité | NLP avancé | Scoring basique client-side d'abord |
| Scraping réseaux sociaux massif | Rate limits + volume | Différé à N8N |
| Alertes push serveur-side | Cron jobs | Utiliser les crons Strapi existants |

### 🚫 Non Recommandé / Non Faisable

| Idée | Problème |
|:-----|:---------|
| Surveillance nucléaire militaire directe | Données classifiées, pas d'API |
| Interception communications | Illégal |
| Prédiction terrorisme | Trop sensible, responsabilité légale |

> **Verdict global** : Le MVP est **très faisable** avec les APIs gratuites disponibles. La vraie valeur sera dans la **corrélation des données** et le **scoring de risque**, pas dans la collecte brute.

---

## 3. ARCHITECTURE TECHNIQUE

### Stack

| Couche | Technologie | Justification |
|:-------|:-----------|:-------------|
| **Frontend** | React 19 + Vite 7 | Cohérent écosystème |
| **UI** | Tailwind CSS + Headless UI | Mobile-first rapide |
| **Cartes** | Leaflet.js + React-Leaflet | Gratuit, léger, OSM |
| **Graphiques** | Recharts | Déjà utilisé (Farmly) |
| **State** | Zustand | Plus léger que Redux pour ce cas |
| **Backend** | Strapi 5.20 (SmartCellar API) | Existant, mutualisé |
| **BDD** | PostgreSQL (Render) | Déjà en place |
| **Hébergement front** | GitHub Pages | Gratuit, CNAME |
| **PWA** | vite-plugin-pwa | Pattern écosystème |
| **Temps réel** | Polling intelligent + SSE | Pas de WebSocket nécessaire |

### Flux de Données (Sans N8N)

```
┌─────────────────────────────────────────────────┐
│                 SOURCES EXTERNES                │
│  USGS │ Open-Meteo │ CERT-FR │ RTE │ data.gouv │
└───────────────┬─────────────────────────────────┘
                │
        ┌───────▼────────┐
        │  STRAPI CRONS  │ ← Fetch périodique (toutes les 5-30 min)
        │  (Smart-Cellar │   selon module
        │     API)       │
        └───────┬────────┘
                │
        ┌───────▼────────┐
        │  PostgreSQL    │ ← Stockage événements + cache
        │  (tables LYNX) │
        └───────┬────────┘
                │
        ┌───────▼────────┐
        │  API REST      │ ← Endpoints Strapi
        │  /api/lynx-*   │
        └───────┬────────┘
                │
        ┌───────▼────────┐         ┌──────────────────┐
        │  LYNX FRONT    │────────►│  Push Notifications│
        │  (React PWA)   │         │  (VAPID existant)  │
        │  GH Pages      │         └──────────────────┘
        └────────────────┘

    + FALLBACK : Fetch client-side direct vers APIs publiques
      (USGS, Open-Meteo) quand Strapi est en cold start
```

### Architecture Client-Side (Stratégie Hybride)

Pour contourner le cold start de Render (gratuit) et l'absence de N8N :

1. **APIs publiques sans auth** → Fetch directement depuis le client React
   - USGS (séismes) → GeoJSON direct
   - Open-Meteo (météo) → REST direct
   - GDACS (catastrophes) → RSS parsé client-side

2. **APIs nécessitant un proxy** → Via Strapi custom controllers
   - CERT-FR (scraping) → Strapi cron + cache
   - data.gouv.fr (carburant) → Strapi proxy
   - RTE (énergie) → Strapi proxy

3. **Données calculées** → Strapi crons enrichissent la BDD
   - Scores de risque
   - Historique
   - Corrélations

---

## 4. MODULES DÉTAILLÉS & APIs GRATUITES

### 🌋 Module A – Catastrophes Naturelles

#### Séismes
- **API** : `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson`
- **Coût** : Gratuit, sans clé API
- **Fréquence** : Temps réel (polling 2-5 min)
- **Données** : Magnitude, localisation, profondeur, PAGER alert level
- **Feature** : Carte live + filtres magnitude + zone perso

#### Météo Extrême
- **API** : `https://api.open-meteo.com/v1/forecast`
- **Coût** : Gratuit, sans clé API (< 10k req/jour)
- **Données** : Alertes européennes, température, précipitations, vent
- **Feature** : Alertes météo géolocalisées, prévisions 7j

#### Tsunamis / Alertes Globales
- **API** : GDACS (Global Disaster Alerting Coordination System)
  - RSS : `https://www.gdacs.org/xml/rss.xml`
  - GeoJSON : `https://www.gdacs.org/gdacsapi/api/events/geteventlist/`
- **Coût** : Gratuit
- **Données** : Séismes, tsunamis, cyclones, inondations, volcans, sécheresses

#### Volcans
- **API** : Smithsonian Global Volcanism Program
  - `https://volcano.si.edu/` (pas d'API REST mais données scrapables)
- **Alternative** : GDACS couvre les éruptions majeures

### ☢️ Module B – Risques Nucléaires & Énergie

#### Production Nucléaire France
- **API** : ODRÉ (Open Data Réseaux Énergies)
  - `https://odre.opendatasoft.com/api/explore/v2.1/catalog/datasets/production-nette-nucleaire/records`
- **Coût** : Gratuit
- **Données** : Production horaire par centrale, anomalies

#### Signal Ecowatt / Ecogaz
- **API** : 
  - Ecogaz : `https://odre.opendatasoft.com/api/explore/v2.1/catalog/datasets/signal-ecogaz/records`
  - Ecowatt RTE : `https://digital.iservices.rte-france.com/open_api/ecowatt/v5/signals`
    (nécessite inscription gratuite sur data.rte-france.com)
- **Feature** : Indicateur tension réseau électrique/gaz, risque délestage

#### Centrales Nucléaires (Incidents)
- **Source** : ASN (Autorité de Sûreté Nucléaire)
  - RSS des avis d'incidents : scraping Strapi cron
- **Feature** : Carte des centrales FR + niveau INES + alertes

### 💻 Module C – Cybersécurité

#### CERT-FR / ANSSI
- **Source** : `https://www.cert.ssi.gouv.fr/` (RSS disponible)
  - Alertes : `https://www.cert.ssi.gouv.fr/alerte/feed/`
  - Avis : `https://www.cert.ssi.gouv.fr/avis/feed/`
  - CTI : `https://www.cert.ssi.gouv.fr/cti/feed/`
- **Coût** : Gratuit
- **Feature** : Alertes vulnérabilités critiques, ransomware, espionnage

#### CVE (Vulnérabilités)
- **API** : NVD (National Vulnerability Database)
  - `https://services.nvd.nist.gov/rest/json/cves/2.0?resultsPerPage=20`
- **Coût** : Gratuit (avec clé API gratuite pour meilleur rate limit)
- **Feature** : Score CVSS, vulnérabilités critiques récentes

### ✊ Module D – Mouvements Sociaux France

#### Approche Sans N8N (MVP)
1. **Sources RSS officielles** :
   - Syndicats (CGT, FO, CFDT) → Pages actualités parsées
   - Service-Public.fr → Alertes grèves transport
   - SNCF/RATP → APIs trafic perturbé

2. **API Transport France** :
   - `https://api.navitia.io/v1/` (gratuit tier basique)
   - Perturbations temps réel SNCF, RATP, bus régionaux

3. **Scoring basique client-side** :
   - Volume d'articles mentionnant "grève" / "blocage" / "manifestation"
   - Sources multiples = score élevé

#### Différé à N8N (V2)
- Scraping X/Twitter (hashtags #greve #blocage)
- Analyse NLP des appels à mobilisation
- Prédiction 48h sur volume de participation

### ⛽ Module E – Pénuries & Approvisionnement

#### Carburant France
- **API** : data.gouv.fr – Prix des carburants
  - `https://data.economie.gouv.fr/api/explore/v2.1/catalog/datasets/prix-des-carburants-en-france-flux-instantane/records`
  - Alternative : téléchargement XML direct sur data.gouv.fr
- **Coût** : Gratuit
- **Données** : Prix, disponibilité, rupture par station
- **Feature** : Carte stations + indicateur de tension + historique prix

#### Médicaments
- **Source** : ANSM (Agence Nationale de Sécurité du Médicament)
  - Liste ruptures : `https://ansm.sante.fr/disponibilites-des-produits-de-sante/medicaments`
  - Pas d'API REST officielle → scraping Strapi cron
- **Feature** : Liste médicaments en tension/rupture, alertes

#### Alimentation (Signaux Indirects)
- **Approche** : Corrélation multi-signaux
  - Grèves transport (Module D) → impact logistique
  - Météo extrême (Module A) → impact récoltes
  - Prix pétrole → impact transport
- **Feature** : Score "Supply Stress Index" par région

### ⚡ Module F – Pannes & Blackouts

#### Approche Sans Downdetector (pas d'API officielle)
1. **Monitoring direct services critiques** :
   - Ping périodique des services majeurs depuis le client
   - `fetch()` avec timeout vers : Google, CloudFlare, AWS status pages
   - APIs status publiques des FAI (Orange, SFR, Free, Bouygues)

2. **Status Pages Officielles** :
   - GitHub Status API : `https://www.githubstatus.com/api/v2/status.json`
   - Cloudflare : `https://www.cloudflarestatus.com/api/v2/status.json`
   - AWS : `https://health.aws.amazon.com/health/status`
   - Pattern commun : beaucoup utilisent Statuspage.io (Atlassian)

3. **Réseau électrique** :
   - RTE Ecowatt (déjà dans Module B)
   - Enedis data (coupures en cours) : `https://data.enedis.fr/`

4. **Feature** :
   - Dashboard vert/orange/rouge par service
   - Historique pannes
   - Corrélation : panne internet + panne électrique = blackout potentiel

### 🦠 Module G – Risques Sanitaires

#### WHO (Organisation Mondiale de la Santé)
- **Source** : Disease Outbreak News
  - RSS : `https://www.who.int/feeds/entity/don/en/rss.xml`
- **Coût** : Gratuit
- **Feature** : Alertes épidémies mondiales, nouvelles maladies

#### Santé Publique France
- **Source** : Bulletins hebdomadaires
  - `https://www.santepubliquefrance.fr/` (RSS)
- **Feature** : Surveillance épidémiologique France (grippe, gastro, COVID variants)

---

## 5. GESTION N8N – ALTERNATIVES

### Stratégie "Zéro N8N" pour le MVP

| Besoin | Solution Sans N8N | Qualité |
|:-------|:-----------------|:--------|
| Fetch périodique APIs | Strapi cron jobs (déjà en place) | ✅ Suffisant |
| Proxy API avec auth | Strapi custom controllers | ✅ Parfait |
| Cache données | Tables Strapi + TTL logique | ✅ Bon |
| Push notifications | Web Push VAPID (déjà configuré) | ✅ Existant |
| Scraping RSS | Strapi cron + node-fetch + xml parser | ✅ Faisable |
| Fetch direct APIs publiques | Client-side React (USGS, Open-Meteo) | ✅ Optimal |

### Ce Qui Attend N8N (V2+)

| Feature | Pourquoi N8N | Priorité |
|:--------|:------------|:---------|
| Scraping X/Twitter | Rate limits, auth OAuth | Moyenne |
| NLP analyse sentiments | Workflow complexe multi-étapes | Basse |
| Corrélation multi-sources auto | Orchestration avancée | Moyenne |
| Alertes conditionnelles complexes | IF séisme > 6 AND près centrale → alerte | Haute |
| Scraping Downdetector | Anti-bot complexe | Basse |

### Crons Strapi à Ajouter (dans Smart-Cellar-API)

```javascript
// config/cron-tasks.js - À AJOUTER aux crons existants
module.exports = {
  // --- CRONS EXISTANTS (SmartCellar) ---
  dailyNotifications: { /* ... */ },
  fourthwallCheck: { /* ... */ },
  
  // --- NOUVEAUX CRONS LYNX ---
  
  // Séismes USGS - toutes les 5 minutes
  lynxEarthquakes: {
    task: async ({ strapi }) => {
      await strapi.service('api::lynx-event.lynx-event').fetchEarthquakes();
    },
    options: { rule: '*/5 * * * *' }
  },
  
  // CERT-FR Cyber alerts - toutes les 30 minutes
  lynxCyberAlerts: {
    task: async ({ strapi }) => {
      await strapi.service('api::lynx-event.lynx-event').fetchCyberAlerts();
    },
    options: { rule: '*/30 * * * *' }
  },
  
  // Carburant France - toutes les heures
  lynxFuelPrices: {
    task: async ({ strapi }) => {
      await strapi.service('api::lynx-event.lynx-event').fetchFuelData();
    },
    options: { rule: '0 * * * *' }
  },
  
  // GDACS catastrophes - toutes les 15 minutes
  lynxDisasters: {
    task: async ({ strapi }) => {
      await strapi.service('api::lynx-event.lynx-event').fetchGDACS();
    },
    options: { rule: '*/15 * * * *' }
  },
  
  // Score de risque global - toutes les 10 minutes
  lynxRiskScore: {
    task: async ({ strapi }) => {
      await strapi.service('api::lynx-risk-score.lynx-risk-score').recalculate();
    },
    options: { rule: '*/10 * * * *' }
  }
};
```

---

## 6. MODÈLE DE DONNÉES STRAPI

### Nouveaux Content Types à Créer

#### `lynx-event` (Événement/Alerte)
```json
{
  "kind": "collectionType",
  "attributes": {
    "title": { "type": "string", "required": true },
    "description": { "type": "text" },
    "category": {
      "type": "enumeration",
      "enum": ["earthquake", "weather", "tsunami", "volcano", "flood",
               "cyber", "nuclear", "energy", "health", "social",
               "fuel", "supply", "blackout", "terrorism", "other"]
    },
    "severity": {
      "type": "enumeration",
      "enum": ["info", "low", "medium", "high", "critical"]
    },
    "latitude": { "type": "float" },
    "longitude": { "type": "float" },
    "region": { "type": "string" },
    "country": { "type": "string", "default": "FR" },
    "sourceUrl": { "type": "string" },
    "sourceName": { "type": "string" },
    "sourceReliability": { "type": "integer", "min": 0, "max": 100 },
    "rawData": { "type": "json" },
    "externalId": { "type": "string" },
    "eventDate": { "type": "datetime" },
    "expiresAt": { "type": "datetime" },
    "isActive": { "type": "boolean", "default": true },
    "impactScore": { "type": "float", "min": 0, "max": 100 }
  }
}
```

#### `lynx-risk-score` (Score de Risque par Zone)
```json
{
  "kind": "collectionType",
  "attributes": {
    "region": { "type": "string", "required": true },
    "country": { "type": "string", "default": "FR" },
    "globalScore": { "type": "float", "min": 0, "max": 100 },
    "earthquakeScore": { "type": "float", "min": 0, "max": 100 },
    "weatherScore": { "type": "float", "min": 0, "max": 100 },
    "cyberScore": { "type": "float", "min": 0, "max": 100 },
    "energyScore": { "type": "float", "min": 0, "max": 100 },
    "socialScore": { "type": "float", "min": 0, "max": 100 },
    "supplyScore": { "type": "float", "min": 0, "max": 100 },
    "healthScore": { "type": "float", "min": 0, "max": 100 },
    "trend": {
      "type": "enumeration",
      "enum": ["stable", "improving", "degrading", "critical"]
    },
    "calculatedAt": { "type": "datetime" }
  }
}
```

#### `lynx-user-zone` (Zone Surveillée par Utilisateur)
```json
{
  "kind": "collectionType",
  "attributes": {
    "user": { "type": "relation", "relation": "manyToOne", "target": "plugin::users-permissions.user" },
    "label": { "type": "string" },
    "latitude": { "type": "float", "required": true },
    "longitude": { "type": "float", "required": true },
    "radiusKm": { "type": "integer", "default": 50 },
    "alertCategories": { "type": "json" },
    "minSeverity": {
      "type": "enumeration",
      "enum": ["info", "low", "medium", "high", "critical"],
      "default": "medium"
    },
    "pushEnabled": { "type": "boolean", "default": true }
  }
}
```

#### `lynx-fuel-station` (Cache Stations Carburant)
```json
{
  "kind": "collectionType",
  "attributes": {
    "stationId": { "type": "string", "unique": true },
    "name": { "type": "string" },
    "address": { "type": "string" },
    "city": { "type": "string" },
    "postalCode": { "type": "string" },
    "latitude": { "type": "float" },
    "longitude": { "type": "float" },
    "prices": { "type": "json" },
    "outOfStock": { "type": "json" },
    "lastUpdate": { "type": "datetime" }
  }
}
```

#### `lynx-service-status` (Status Services Monitorés)
```json
{
  "kind": "collectionType",
  "attributes": {
    "serviceName": { "type": "string", "required": true },
    "serviceCategory": {
      "type": "enumeration",
      "enum": ["internet", "telecom", "electricity", "gas", "water", "transport", "cloud", "social"]
    },
    "status": {
      "type": "enumeration",
      "enum": ["operational", "degraded", "partial_outage", "major_outage"]
    },
    "responseTime": { "type": "integer" },
    "lastChecked": { "type": "datetime" },
    "incidentDescription": { "type": "text" }
  }
}
```

---

## 7. UX/UI MOBILE-FIRST

### Design Principles
1. **Information, pas panique** → Couleurs neutres, langage mesuré
2. **Glanceable** → Score visible en 1 seconde (jauge circulaire)
3. **Mobile-first** → Navigation bottom tab, cards swipeable
4. **Dark mode default** → Thème sombre (cohérent "veille")

### Navigation Mobile (Bottom Tabs)

```
┌──────────────────────────────────┐
│                                  │
│         [CONTENU PAGE]           │
│                                  │
├──────┬──────┬──────┬──────┬──────┤
│  🏠  │  🗺️  │  🔔  │  📊  │  ⚙️  │
│ Home │ Carte│Alert │Stats │ Plus │
└──────┴──────┴──────┴──────┴──────┘
```

### Écrans Principaux

#### 1. Dashboard (Home)
```
┌──────────────────────────┐
│ 🐆 LYNX    [🔔] [🔄]    │
├──────────────────────────┤
│                          │
│   Score Global : 72/100  │
│   ████████░░  STABLE     │
│                          │
├──────────────────────────┤
│ ⚠️ ALERTES ACTIVES (3)   │
│ ┌──────────────────────┐ │
│ │ 🌍 Séisme M5.2 Turquie │
│ │ il y a 12 min       │ │
│ └──────────────────────┘ │
│ ┌──────────────────────┐ │
│ │ ⛽ Tension carburant  │ │
│ │ Île-de-France        │ │
│ └──────────────────────┘ │
│ ┌──────────────────────┐ │
│ │ 💻 CVE critique      │ │
│ │ Microsoft Exchange   │ │
│ └──────────────────────┘ │
├──────────────────────────┤
│ 📈 TENDANCES             │
│ [Séismes] [Cyber] [Éner] │
│ ~~~graph mini~~~         │
├──────────────────────────┤
│ 🌐 ÉCOSYSTÈME            │
│ [SmartCellar] [ProGarden]│
│ Vérifiez vos stocks →   │
└──────────────────────────┘
```

#### 2. Carte Interactive
- Carte Leaflet plein écran
- Filtres par catégorie (toggle chips en haut)
- Clusters de marqueurs
- Tap = détail événement en bottom sheet
- Géolocalisation utilisateur

#### 3. Alertes
- Feed chronologique
- Filtres (catégorie, sévérité, zone)
- Pull-to-refresh
- Badge count sur tab

#### 4. Statistiques
- Graphiques temporels par catégorie
- Score de risque historique
- Heatmap zones à risque

#### 5. Plus (Settings)
- Zones surveillées
- Préférences notifications
- Seuils d'alerte
- Thème
- AppSwitcher écosystème
- Abonnement premium

### Palette de Couleurs

```css
/* LYNX Theme */
--lynx-bg-primary: #0A0E17;      /* Fond sombre profond */
--lynx-bg-secondary: #111827;     /* Cards */
--lynx-bg-tertiary: #1F2937;      /* Éléments surélevés */
--lynx-accent: #3B82F6;           /* Bleu LYNX (actions) */
--lynx-text-primary: #F9FAFB;     /* Texte principal */
--lynx-text-secondary: #9CA3AF;   /* Texte secondaire */
--lynx-success: #10B981;          /* Vert - Stable */
--lynx-warning: #F59E0B;          /* Orange - Attention */
--lynx-danger: #EF4444;           /* Rouge - Critique */
--lynx-critical: #DC2626;         /* Rouge vif - Danger */
--lynx-info: #6366F1;             /* Indigo - Info */
```

### Responsive Breakpoints

```css
/* Mobile first */
@media (min-width: 640px) { /* sm - Tablette portrait */ }
@media (min-width: 768px) { /* md - Tablette paysage */ }
@media (min-width: 1024px) { /* lg - Desktop : layout sidebar */ }
@media (min-width: 1280px) { /* xl - Desktop large : 3 colonnes */ }
```

Sur desktop (lg+) : layout sidebar gauche (navigation) + carte centre + feed alerts droite.

---

## 8. PWA & WIDGET ANDROID

### Configuration PWA (vite-plugin-pwa)

```javascript
// vite.config.js
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: 'LYNX – Voyez ce que les autres ne voient pas',
        short_name: 'LYNX',
        description: 'Plateforme d\'anticipation & d\'alertes en temps réel',
        theme_color: '#0A0E17',
        background_color: '#0A0E17',
        display: 'standalone',
        orientation: 'portrait-primary',
        categories: ['news', 'utilities', 'security'],
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ],
        shortcuts: [
          {
            name: 'Carte des alertes',
            short_name: 'Carte',
            url: '/map',
            icons: [{ src: 'shortcut-map.png', sizes: '96x96' }]
          },
          {
            name: 'Score de risque',
            short_name: 'Score',
            url: '/dashboard',
            icons: [{ src: 'shortcut-score.png', sizes: '96x96' }]
          }
        ],
        // Widget Android (PWA Widgets API - experimental)
        widgets: [
          {
            name: 'LYNX Risk Score',
            short_name: 'LYNX Score',
            description: 'Score de risque en temps réel',
            tag: 'lynx-score-widget',
            ms_ac_template: 'widget-score.json',
            data: '/api/widget/score',
            type: 'application/json',
            screenshots: [
              { src: 'widget-preview.png', sizes: '400x200' }
            ],
            icons: [
              { src: 'widget-icon.png', sizes: '48x48' }
            ],
            backgrounds: [
              { src: 'widget-bg-dark.png', sizes: '400x200' }
            ]
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            // Cache API USGS (séismes) - Network First, fallback cache
            urlPattern: /^https:\/\/earthquake\.usgs\.gov/,
            handler: 'NetworkFirst',
            options: { cacheName: 'lynx-usgs', expiration: { maxEntries: 50, maxAgeSeconds: 300 } }
          },
          {
            // Cache Open-Meteo - Stale While Revalidate
            urlPattern: /^https:\/\/api\.open-meteo\.com/,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'lynx-weather', expiration: { maxEntries: 20, maxAgeSeconds: 600 } }
          },
          {
            // Cache Strapi API
            urlPattern: /^https:\/\/smart-cellar-api\.onrender\.com\/api\/lynx/,
            handler: 'NetworkFirst',
            options: { cacheName: 'lynx-strapi', expiration: { maxEntries: 100, maxAgeSeconds: 180 } }
          },
          {
            // Tiles carte OSM
            urlPattern: /^https:\/\/tile\.openstreetmap\.org/,
            handler: 'CacheFirst',
            options: { cacheName: 'lynx-map-tiles', expiration: { maxEntries: 500, maxAgeSeconds: 86400 * 30 } }
          }
        ]
      }
    })
  ]
});
```

### Widget Android – Stratégie

La **PWA Widgets API** est encore expérimentale (supportée sur Edge/Chrome Android). En attendant une adoption plus large, on implémente :

1. **PWA Shortcuts** (supporté maintenant) → Raccourcis vers dashboard/carte
2. **Notifications Push riches** → Astuce : notification persistante avec score mis à jour
3. **Web App Manifest `display: standalone`** → Expérience native
4. **TWA (Trusted Web Activity)** → Si besoin de publier sur Play Store plus tard

---

## 9. ÉCOSYSTÈME & CROSS-PROMOTION

### Intégration AppSwitcher

Reprendre le pattern existant (ProGarden/SmartCellar/Farmly) :

```javascript
const ECOSYSTEM_APPS = [
  {
    id: 'lynx',
    name: 'LYNX',
    emoji: '🐆',
    description: 'Anticipation & Alertes',
    url: 'https://lynx.lacavernedurefractaire.fr',
    devUrl: 'http://localhost:5176',
    color: '#3B82F6',
    current: true
  },
  {
    id: 'smartcellar',
    name: 'SmartCellar',
    emoji: '🏪',
    description: 'Gestion de stocks',
    url: 'https://smartcellar.lacavernedurefractaire.fr',
    devUrl: 'http://localhost:5173',
    color: '#F59E0B'
  },
  {
    id: 'progarden',
    name: 'ProGarden',
    emoji: '🌱',
    description: 'Autoproduction potager',
    url: 'https://progarden.lacavernedurefractaire.fr',
    devUrl: 'http://localhost:5174',
    color: '#22c55e'
  },
  {
    id: 'farmly',
    name: 'Farmly',
    emoji: '🐔',
    description: 'Gestion élevage',
    url: 'https://farmly.lacavernedurefractaire.fr',
    devUrl: 'http://localhost:5175',
    color: '#8B4513'
  },
  {
    id: 'prete',
    name: 'PRÊT·E',
    emoji: '🎒',
    description: 'Scénarios de préparation',
    url: 'https://pret.lacavernedurefractaire.fr',
    devUrl: 'http://localhost:5177',
    color: '#6B8E7A'
  }
];
```

### Passerelles Contextuelles (Intelligence Croisée)

LYNX est le **hub central** de l'écosystème. Chaque alerte peut déclencher une recommandation vers une autre app :

| Alerte LYNX | Recommandation | App Cible |
|:------------|:---------------|:----------|
| Pénurie carburant probable | "Vérifiez vos stocks alimentaires" | SmartCellar |
| Gel prévu cette semaine | "Protégez vos semis en cours" | ProGarden |
| Grève transport 48h | "Vos animaux sont-ils autonomes 3 jours ?" | Farmly |
| Crise approvisionnement | "Consultez les scénarios de préparation" | PRÊT·E |
| Score critique zone | "Évaluez votre autonomie alimentaire" | SmartCellar + ProGarden |

### CORS à Ajouter (Smart-Cellar-API)

Ajouter `lynx.lacavernedurefractaire.fr` dans les origines CORS autorisées :

```javascript
// config/middlewares.js - ajouter dans origin[]
'https://lynx.lacavernedurefractaire.fr',
'http://localhost:5176', // LYNX dev
```

---

## 10. MONÉTISATION

### Tiers

| Feature | Gratuit | Premium (5€/mois) | Pro (15€/mois) |
|:--------|:--------|:------------------|:---------------|
| Dashboard score global | ✅ | ✅ | ✅ |
| Carte interactive | ✅ | ✅ | ✅ |
| Alertes basiques (3 catégories) | ✅ | ✅ | ✅ |
| Historique 24h | ✅ | ✅ | ✅ |
| **Toutes catégories alertes** | ❌ | ✅ | ✅ |
| **Zones surveillées** | 1 | 5 | Illimité |
| **Push notifications** | ❌ | ✅ | ✅ |
| **Historique complet** | ❌ | 30 jours | Illimité |
| **Score détaillé par module** | ❌ | ✅ | ✅ |
| **Carburant temps réel** | ❌ | ✅ | ✅ |
| **Alertes cyber personnalisées** | ❌ | ❌ | ✅ |
| **Export données** | ❌ | ❌ | ✅ |
| **API accès** | ❌ | ❌ | ✅ |
| **Recommandations écosystème** | ❌ | ✅ | ✅ |
| **Widget Android** | ❌ | ✅ | ✅ |

> Intégration Fourthwall existante (SmartCellar API) pour gérer les tiers premium.

---

## 11. ROADMAP DE DÉVELOPPEMENT

### Phase 1 – MVP (3-4 semaines)

**Objectif** : Application fonctionnelle avec 3 modules de base

- [ ] Setup projet React + Vite + Tailwind + PWA
- [ ] Structure de base mobile-first (routing, layout, thème dark)
- [ ] Module Séismes (USGS API – fetch client direct)
- [ ] Module Météo Extrême (Open-Meteo – fetch client direct)
- [ ] Module GDACS (catastrophes globales – RSS parsé)
- [ ] Carte Leaflet interactive avec marqueurs par catégorie
- [ ] Dashboard avec score de risque global (calcul local)
- [ ] AppSwitcher écosystème
- [ ] Déploiement GH Pages + CNAME lynx.lacavernedurefractaire.fr
- [ ] PWA manifest + service worker

### Phase 2 – Backend Integration (2-3 semaines)

**Objectif** : Strapi backend pour données enrichies + alertes

- [ ] Content types LYNX dans Strapi (lynx-event, lynx-risk-score, lynx-user-zone)
- [ ] CORS configuration pour LYNX
- [ ] Crons Strapi : USGS, GDACS, CERT-FR
- [ ] Module Cybersécurité (CERT-FR RSS via Strapi)
- [ ] Module Énergie (RTE Ecowatt / ODRÉ via Strapi proxy)
- [ ] Push notifications (VAPID existant)
- [ ] Authentification utilisateur (Strapi users)
- [ ] Zones surveillées personnalisées

### Phase 3 – France-Spécifique (2-3 semaines)

**Objectif** : Modules spécifiques France

- [ ] Module Carburant (data.gouv.fr via Strapi)
- [ ] Module Mouvements Sociaux (RSS syndicats + perturbations transport)
- [ ] Module Pannes/Blackouts (status pages + monitoring)
- [ ] Score "Supply Stress Index"
- [ ] Passerelles contextuelles vers écosystème
- [ ] Historique et tendances

### Phase 4 – Premium & Polish (2 semaines)

- [ ] Système de tiers (Fourthwall integration)
- [ ] Alertes personnalisées avancées
- [ ] Widget Android (PWA shortcuts + notifications riches)
- [ ] Mode offline robuste
- [ ] Onboarding utilisateur
- [ ] Landing page marketing

### Phase 5 – V2 avec N8N (quand serveur disponible)

- [ ] Scraping réseaux sociaux (X, Telegram)
- [ ] NLP analyse sentiments français
- [ ] Corrélation automatique multi-sources
- [ ] Prédiction IA (scoring avancé)
- [ ] Alertes conditionnelles complexes

---

## 12. RISQUES & PIÈGES À ÉVITER

### Techniques
| Risque | Impact | Mitigation |
|:-------|:-------|:-----------|
| Cold start Render (30s) | UX dégradée | Fetch client-side direct en fallback |
| Rate limits APIs gratuites | Données manquantes | Cache agressif + polling adaptatif |
| Strapi surchargé (43+ content types) | Performance | Index PostgreSQL + pagination |
| CORS multi-domaines | Bugs auth | Configuration explicite |

### Produit
| Risque | Impact | Mitigation |
|:-------|:-------|:-----------|
| **Anxiogène / paniquant** | Perte users | UX rassurante, langage mesuré |
| **Fausses alertes** | Perte crédibilité | Score fiabilité + sources multiples |
| **Trop complexe** | Abandon | Onboarding progressif, defaults intelligents |
| **Perception "complotiste"** | Image négative | Sources officielles uniquement, neutralité |

### Légaux
| Risque | Impact | Mitigation |
|:-------|:-------|:-----------|
| RGPD (géolocalisation) | Amende | Consentement explicite, pas de tracking |
| Scraping (TOS violation) | Blocage | APIs officielles only, RSS publics |
| Responsabilité (fausse alerte) | Procès | Disclaimer clair "informatif uniquement" |
| Incitation à la panique | Juridique | Ton neutre, pas de sensationnalisme |

---

## 13. AMÉLIORATIONS PROPOSÉES

### Par rapport à la discussion ChatGPT originale

#### ✅ Améliorations Intégrées
1. **Architecture hybride client/serveur** → Pas de dépendance totale au backend (cold start Render)
2. **Scoring de fiabilité des sources** → Chaque événement a un `sourceReliability` score
3. **Corrélation croisée écosystème** → LYNX recommande les autres apps contextuellement
4. **Progressive feature disclosure** → MVP ultra simple, complexité ajoutée progressivement
5. **Disclaimer légal** → Obligatoire pour ce type d'app

#### 💡 Nouvelles Idées
1. **Mode "Briefing Matinal"** → Résumé quotidien des 24h passées, push notification à 7h
2. **Checklist Prepper intégrée** → Lien SmartCellar : "Êtes-vous prêt pour un blackout de 72h ?"
3. **Partage social intelligent** → "Share LYNX score de ma zone" → viralité
4. **Comparaison zones** → Score Paris vs Lyon → gamification légère
5. **Timeline historique** → "Ce jour en crises" → éducatif
6. **Mode Hors-Ligne** → Cache des dernières données + carte offline (tiles pré-cachées zone perso)
7. **Badge de confiance** → Score de fiabilité de chaque alerte visible (vert/orange/rouge)
8. **Module "Préparation"** → Conseils contextuels basés sur les risques actifs

#### ⚠️ Points de Vigilance vs Discussion Originale
1. **N'a PAS proposé de scraper Downdetector** → Pas d'API, anti-bot → monitoring direct des services
2. **N'a PAS proposé Firebase/Supabase** → Strapi existant suffit
3. **Surveillance militaire réduite** → Trop sensible + données non fiables en open source
4. **Pas de module "terrorisme" dédié** → Intégré dans les alertes générales, sans catégorie anxiogène

---

## ANNEXE – APIs GRATUITES RÉCAPITULATIF

| API | URL | Auth | Rate Limit | Données |
|:----|:----|:-----|:-----------|:--------|
| USGS Earthquake | earthquake.usgs.gov/fdsnws/event/1/ | Aucune | Généreux | Séismes mondiaux GeoJSON |
| Open-Meteo | api.open-meteo.com | Aucune | 10k/jour | Météo + alertes |
| GDACS | gdacs.org/gdacsapi/ | Aucune | Généreux | Catastrophes globales |
| CERT-FR | cert.ssi.gouv.fr (RSS) | Aucune | N/A | Cyber alertes FR |
| NVD CVE | services.nvd.nist.gov | Clé gratuite | 50/30s | Vulnérabilités |
| ODRÉ Énergie | odre.opendatasoft.com | Aucune | Généreux | Énergie FR |
| RTE Ecowatt | digital.iservices.rte-france.com | Inscription gratuite | 1k/jour | Tension réseau élec |
| data.gouv.fr Carburant | data.economie.gouv.fr | Aucune | Généreux | Prix + dispo stations |
| WHO DON | who.int (RSS) | Aucune | N/A | Épidémies mondiales |
| Statuspage.io | githubstatus.com/api, etc. | Aucune | Généreux | Status services |

---

*Document créé le 01/04/2026 – LYNX Project Specification v1.0*
