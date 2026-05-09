# Intégration Laboratoires BSL-4 / P4 — Plan & Liste

> Créé le 09/05/2026 — À intégrer dans LYNX et/ou PRÊTE (décision future)

---

## Options d'intégration

### Option A — Entrées Strapi
Créer des entrées `lynx-memory-events` pour les labos les plus notables :
- `type: "program"`, `category: "HEALTH"` ou `"TECH"`
- Focus sur les labos à historique d'incidents ou de controverse
- Avantage : intégré dans le flux timeline existant, relations possibles avec events
- Candidats prioritaires : WIV Wuhan, VECTOR Koltsovo, Porton Down, CDC Atlanta, USAMRIID Fort Detrick, Jean Mérieux Lyon

### Option B — GeoJSON statique (couche carte dédiée)
Fichier `biolabs-p4.geojson` dans `LYNX/src/data/` ou `PRETE/src/data/`
- Contient tous les labos avec coordonnées GPS
- Affichage en couche séparée sur Leaflet / Mapbox
- Avantage : liste complète, pas de pollution de la timeline
- Idéal pour une carte mondiale "zones sensibles"

### Option C — Hybride (recommandée)
- Strapi : labos liés à des incidents connus (ex. Sverdlovsk 1979, SARS Taiwan 2003, COVID/WIV controverse)
- GeoJSON statique : couche cartographique avec tous les labos
- Meilleure séparation des préoccupations

---

## Liste des laboratoires P4 / BSL-4 opérationnels dans le monde
> Source : Wikipedia (maj mai 2026) — Liste incomplète, 42 labos en activité au monde en 2021 + 17 en construction

### 🌎 Amériques

| Pays | Ville | Laboratoire | Depuis | Coordonnées approx. | Notes |
|------|-------|-------------|--------|---------------------|-------|
| Argentine | Buenos Aires | SENASA | — | -34.6, -58.4 | Fièvre aphteuse |
| Brésil | Pedro Leopoldo, MG | Lanagro/MG | 2014 | -19.6, -44.0 | Agrovétérinaire |
| Brésil | Campinas, SP | LNMCB (en construction) | 2026 (prévu) | -22.9, -47.1 | |
| Canada | Winnipeg, MB | Labo National de Microbiologie | 1999 | 49.9, -97.1 | Prototype référence mondiale BSL-4 |
| Canada | Saskatoon, SK | VIDO – Univ. Saskatchewan | 2025 | 52.1, -106.6 | |
| USA | Atlanta, GA | CDC | — | 33.8, -84.3 | ⚠️ 1 des 2 seuls dépôts officiels variole |
| USA | Atlanta, GA | Georgia State University | 1997 | 33.7, -84.4 | Virus B |
| USA | Manhattan, KS | NBAF – DHS | 2023 | 39.2, -96.6 | Remplace Plum Island |
| USA | Bethesda, MD | NIH (BSL-3 actif) | — | 38.9, -77.1 | BSL-4 non opérationnel |
| USA | Fort Detrick, MD | USAMRIID | 1969 | 39.4, -77.4 | ⚠️ Armée US, bioterrorisme |
| USA | Fort Detrick, MD | NIAID Integrated Research Facility | — | 39.4, -77.4 | |
| USA | Fort Detrick, MD | NBACC – DHS | — | 39.4, -77.4 | Menaces bioterrorisme |
| USA | Boston, MA | NEIDL – Boston University | 2017 | 42.3, -71.1 | |
| USA | Hamilton, MT | Rocky Mountain Labs – NIAID | 2008 | 46.2, -114.2 | Maladies à vecteurs |
| USA | Galveston, TX | Galveston National Lab – UTMB | 2008 | 29.3, -94.8 | |
| USA | Galveston, TX | Shope Laboratory – UTMB | 2004 | 29.3, -94.8 | |
| USA | San Antonio, TX | Texas Biomedical Research Institute | 1999 | 29.5, -98.6 | Seul BSL-4 privé aux USA |
| USA | Richmond, VA | Virginia Division of Consolidated Labs | 2003 | 37.5, -77.4 | |

### 🌍 Europe

| Pays | Ville | Laboratoire | Depuis | Coordonnées approx. | Notes |
|------|-------|-------------|--------|---------------------|-------|
| France | Lyon | Labo Jean Mérieux – INSERM | 1999 | 45.7, 4.8 | 1er P4 civil en France |
| France | Brétigny-sur-Orge | IRBA – Armée française | 2015 | 48.6, 2.3 | Militaire |
| France | Vert-le-Petit | DGA – Défense | 2013 | 48.5, 2.4 | Militaire |
| Allemagne | Berlin | Robert Koch Institut | 2015 | 52.5, 13.4 | Diagnostic + recherche |
| Allemagne | Hamburg | Bernhard Nocht Institut | 2014 | 53.5, 10.0 | Viroses tropicales, ref. nationale |
| Allemagne | Greifswald | Friedrich Loeffler Institut | 2010 | 54.1, 13.4 | Maladies animales |
| Allemagne | Marburg | Université Philipps | 2008 | 50.8, 8.8 | ⚠️ Fièvres hémorragiques (ville éponyme virus Marburg) |
| Royaume-Uni | Porton Down, Wiltshire | UKHSA + DSTL | — | 51.1, -1.7 | ⚠️ Civil + militaire (défense bio) |
| Royaume-Uni | Londres (Camden) | Francis Crick Institute | 2015 | 51.5, -0.1 | Pas d'agents humains |
| Royaume-Uni | Colindale, Londres | PHE Centre for Infections | — | 51.6, -0.2 | Réseau européen BSL-4 |
| Royaume-Uni | Addlestone, Surrey | Animal and Plant Health Agency | — | 51.4, -0.5 | Maladies animales |
| Royaume-Uni | Pirbright, Surrey | Institute for Animal Health | — | 51.3, -0.6 | Maladies animales pathogènes |
| Suède | Solna | Public Health Agency of Sweden | 2001 | 59.4, 18.0 | Seul P4 en Scandinavie |
| Italie | Rome | IRCCS Lazzaro Spallanzani | 1997 | 41.8, 12.5 | Hôpital + recherche |
| Italie | Milan | Ospedale Luigi Sacco | 2006 | 45.5, 9.1 | |
| Hongrie | Budapest | National Center for Epidemiology | 1998 | 47.5, 19.1 | 3 labos réf. OMS |
| Hongrie | Pécs | Université de Pécs | 2016 | 46.1, 18.2 | |
| République Tchèque | Těchonín | Biological Defense Center – Armée | 1971/2007 | 50.1, 16.8 | Militaire |
| Biélorussie | Minsk | RPPCM | — | 53.9, 27.6 | Ex-SRIEM |
| Suisse | Genève | HUG – Hôpital Universitaire | — | 46.2, 6.1 | Type "gant box" |
| Suisse | Spiez | Spiez Laboratory | 2013 | 46.7, 7.6 | OFPP / Défense |
| Suisse | Mittelhäusern | Institute of Virology and Immunology (IVI) | — | 46.9, 7.4 | Diagnostics vétérinaires |
| Espagne | Tres Cantos, Madrid | GlaxoSmithKline | 2026 | 40.6, -3.7 | 1er BSL-4 en Espagne, 1er pharmaceutique mondial |

### 🌏 Asie-Pacifique

| Pays | Ville | Laboratoire | Depuis | Coordonnées approx. | Notes |
|------|-------|-------------|--------|---------------------|-------|
| Chine | **Wuhan**, Hubei | **WIV – Institut de Virologie de Wuhan** | 2015 | 30.6, 114.3 | ⚠️ Controverse COVID-19, 1er BSL-4 en Chine |
| Chine | Harbin | Harbin Veterinary Research Institute | 2018 | 45.8, 126.5 | Grands animaux, 2e BSL-4 en Chine |
| Russie | **Koltsovo**, Novosibirsk | **VECTOR** | — | 54.9, 83.2 | ⚠️ 2e dépôt officiel variole au monde, ex-armes bio soviétiques |
| Russie | Sergiyev Posad, Moscou | 48e CNRI | — | 56.3, 38.1 | Militaire |
| Japon | Musashimurayama, Tokyo | NIID – Dept. Virology I | 2015 | 35.7, 139.4 | Opposition locale, BSL-3 jusqu'en 2015 |
| Japon | Nagasaki | Université de Nagasaki | 2021 | 32.7, 129.9 | |
| Japon | Tsukuba | RIKEN | 1984 | 36.1, 140.1 | Construit 1984, non opéré en BSL-4 (opposition) |
| Corée du Sud | Cheongju | Korea CDC | 2017 | 36.6, 127.5 | 1er BSL-4 en Corée |
| Inde | Bhopal, MP | NIHSAD | 1998 | 23.3, 77.4 | BSL-3+ / zoonoses |
| Inde | Pune, Maharashtra | National Institute of Virology | 2012 | 18.5, 73.8 | BSL-4 le plus avancé en Inde |
| Australie | Geelong, Victoria | ACDP – CSIRO | 1985 | -38.1, 144.4 | Prototype historique mondial BSL-4 |
| Australie | Melbourne, Victoria | VIDRL – Peter Doherty Institute | — | -37.8, 145.0 | Labo national quarantaine humaine |
| Taïwan | Taipei | Institute of Preventive Medicine | 1983 | 25.0, 121.5 | Militaire |
| Philippines | New Clark City, Tarlac | Virology Institute Philippines | 2025 | 15.4, 120.5 | 1er BSL-4 aux Philippines |
| Singapour | — | DSO National Laboratories | Fin 2025 | 1.3, 103.8 | 1er BSL-4 à Singapour |

### 🌍 Afrique

| Pays | Ville | Laboratoire | Depuis | Coordonnées approx. | Notes |
|------|-------|-------------|--------|---------------------|-------|
| Gabon | Franceville | CIRMF | — | -1.6, 13.6 | Seul P4 en Afrique centrale/occidentale |
| Afrique du Sud | Johannesburg | NICD | 2002 | -26.1, 28.1 | |

---

## Labos prioritaires pour intégration (Strapi events + timeline)

Sélection sur critères : **incident connu**, **controverse publique**, **haute médiatisation**

| Slug proposé | Labo | Raison |
|---|---|---|
| `biolab-p4-wiv-wuhan-chine` | WIV Wuhan | Controverse COVID-19 |
| `biolab-p4-vector-koltsovo-russie` | VECTOR | Dépôt variole, héritage soviétique |
| `biolab-p4-usamriid-fort-detrick` | USAMRIID | Anthrax 2001, biodefense US |
| `biolab-p4-porton-down-uk` | Porton Down | Tests historiques sur population civile |
| `biolab-p4-cdc-atlanta` | CDC Atlanta | Dépôt variole, incidents BSL-4 |
| `biolab-p4-jean-merieux-lyon` | Jean Mérieux | 1er P4 civil France, ref. européenne |

---

## Incidents BSL-4 / accidents notables à documenter en parallèle

- **1979 — Sverdlovsk (URSS)** : fuite d'anthrax au complexe Biopreparat (55+ morts, dissimulé 13 ans)
- **1990s — Programme Biopreparat (Russie)** : programme militaire secret de guerre biologique
- **2003 — SARS Taiwan** : fuite de laboratoire (1 cas, chercheur)
- **2004 — SARS Beijing** : 2 fuites successives du NAIRI (9 cas dont 1 mort)
- **2014 — CDC Atlanta** : exposition accidentelle à anthrax vivant (84 employés)
- **2019-? — WIV Wuhan** : hypothèse fuite de laboratoire (enquête OMS non concluante)

---

## TODO

- [ ] Décider : LYNX map / PRÊTE map / les deux
- [ ] Choisir Option A, B ou C
- [ ] Créer le fichier GeoJSON si Option B/C retenue
- [ ] Créer les entrées Strapi si Option A/C retenue
- [ ] Lier les labos aux events existants (ex. COVID-19 → WIV, Anthrax 2001 → USAMRIID)
