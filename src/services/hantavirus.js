// ─── Hantavirus 2026 — Source : WHO DON599 (4 mai) & DON600 (8 mai) / MV Hondius cluster ──
// Dernière mise à jour : 11 mai 2026 — 7 cas confirmés, 2 suspects, 3 décès
// Données statiques curées — aucun appel réseau.
// Sources : WHO DON599, WHO DON600, CDC, ECDC, UKHSA, ArcGIS Dashboard, hantamap.online

// ─── CLUSTER MV HONDIUS 2026 ─────────────────────────────────────────────────
// status : 'deceased' | 'confirmed' | 'suspected' | 'monitoring' | 'exposure_site'
// origin : 'local' | 'imported' | 'response'

export const MV_HONDIUS_CASES = [
  // Deces
  {
    id: 'hv-1', caseNum: 1, status: 'deceased', origin: 'local',
    label: 'Cas #1 — Leo Schilperoord',
    detail: 'Passager neerlandais (80 ans), premier deces a bord. Decede le 11 avril 2026. Hantavirus Andes confirme post-mortem.',
    lat: -15.9, lng: -5.7, date: '2026-04-11',
    source: 'WHO DON#99', url: 'https://www.who.int/emergencies/disease-outbreak-news/item/2026-DON599',
  },
  {
    id: 'hv-2', caseNum: 2, status: 'deceased', origin: 'local',
    label: 'Cas #2 — Epouse (Pays-Bas)',
    detail: 'Epouse du cas #1, ressortissante neerlandaise. Evacuee medicalement, decedee a Johannesburg le 25 avril 2026. PCR Hantavirus Andes positif confirme.',
    lat: -26.2, lng: 28.0, date: '2026-04-25',
    source: 'WHO DON#99', url: 'https://www.who.int/emergencies/disease-outbreak-news/item/2026-DON599',
  },
  {
    id: 'hv-4', caseNum: 4, status: 'deceased', origin: 'local',
    label: 'Cas #4 — Passagere allemande',
    detail: 'Ressortissante allemande, troisieme deces lie au cluster, decedee a bord le 2 mai 2026. Hantavirus Andes confirme.',
    lat: -14.0, lng: -15.0, date: '2026-05-02',
    source: 'WHO DON#99 - Wikipedia', url: 'https://www.who.int/emergencies/disease-outbreak-news/item/2026-DON599',
  },
  // Cas confirmes
  {
    id: 'hv-3', caseNum: 3, status: 'confirmed', origin: 'imported',
    label: 'Cas #3 — Ressortissant britannique',
    detail: 'Ressortissant britannique, evacue medicalement vers Johannesburg. PCR positif Hantavirus Andes. Soins intensifs.',
    lat: -26.2, lng: 28.0, date: '2026-04-30',
    source: 'WHO DON#99 - UKHSA', url: 'https://www.who.int/emergencies/disease-outbreak-news/item/2026-DON599',
  },
  {
    id: 'hv-5', caseNum: 5, status: 'confirmed', origin: 'imported',
    label: 'Cas #5 — Medecin de bord (Pays-Bas)',
    detail: 'Medecin de bord, ressortissant neerlandais. Evacue du navire, hospitalise aux Pays-Bas. Hantavirus Andes confirme.',
    lat: 52.3, lng: 4.9, date: '2026-05-06',
    source: 'WHO DON#99 - RIVM', url: 'https://www.who.int/emergencies/disease-outbreak-news/item/2026-DON599',
  },
  {
    id: 'hv-6', caseNum: 6, status: 'confirmed', origin: 'imported',
    label: 'Cas #6 — Membre equipage (Pays-Bas)',
    detail: 'Membre equipage neerlandais. Positif Hantavirus Andes confirme.',
    lat: 52.1, lng: 5.3, date: '2026-05-07',
    source: 'WHO DON#99', url: 'https://www.who.int/emergencies/disease-outbreak-news/item/2026-DON599',
  },
  {
    id: 'hv-7', caseNum: 7, status: 'confirmed', origin: 'imported',
    label: 'Cas #7 — Ressortissant suisse',
    detail: 'Passager suisse rentre a Zurich. Confirme positif Hantavirus Andes.',
    lat: 47.4, lng: 8.5, date: '2026-05-07',
    source: 'ArcGIS Dashboard hantavirus 2026', url: 'https://www.arcgis.com/apps/dashboards/5c68442d2afc42d7ba2696e4cd393729',
  },
  {
    id: 'hv-36', caseNum: 36, status: 'confirmed', origin: 'imported',
    label: 'Cas #36 — Ressortissante francaise',
    detail: 'Passagere francaise rapatriee par vol charter le 10 mai 2026. Symptomes apparus pendant le vol retour. Hantavirus Andes confirme.',
    lat: 48.9, lng: 2.4, date: '2026-05-10',
    source: 'ArcGIS Dashboard - Sante Publique France', url: 'https://www.arcgis.com/apps/dashboards/5c68442d2afc42d7ba2696e4cd393729',
  },
  // Cas suspects
  {
    id: 'hv-s-uk1', caseNum: null, status: 'suspected', origin: 'imported',
    label: 'Suspect — 2eme ressortissant britannique',
    detail: 'Deuxieme ressortissant britannique signale avec symptomes suspects par UKHSA (8 mai 2026). Sous investigation.',
    lat: 51.5, lng: -0.1, date: '2026-05-08',
    source: 'UKHSA', url: 'https://www.gov.uk/government/organisations/uk-health-security-agency',
  },
  {
    id: 'hv-s-uk2', caseNum: null, status: 'suspected', origin: 'imported',
    label: 'Suspect — 3eme ressortissant britannique',
    detail: 'Troisieme ressortissant britannique avec symptomes suspects notifie par UKHSA.',
    lat: 51.5, lng: -1.5, date: '2026-05-09',
    source: 'UKHSA', url: 'https://www.gov.uk/government/organisations/uk-health-security-agency',
  },
  {
    id: 'hv-s-es', caseNum: null, status: 'suspected', origin: 'response',
    label: 'Suspects — Passagers debarques a Tenerife',
    detail: 'MV Hondius accoste a Tenerife le 10 mai. Plusieurs passagers sous surveillance medicale par autorites sanitaires espagnoles.',
    lat: 28.4, lng: -16.5, date: '2026-05-10',
    source: 'Ministerio de Sanidad Espana - WHO', url: 'https://www.who.int/emergencies/disease-outbreak-news/item/2026-DON599',
  },
  {
    id: 'hv-s-tn', caseNum: null, status: 'suspected', origin: 'imported',
    label: 'Suspect — Tunisie',
    detail: 'Signal de cas suspect Hantavirus rapporte en Tunisie. Sous investigation.',
    lat: 36.8, lng: 10.2, date: '2026-05-09',
    source: 'hantamap.online', url: 'https://hantamap.online',
  },
  {
    id: 'hv-s-et', caseNum: null, status: 'suspected', origin: 'imported',
    label: 'Suspect — Ethiopie',
    detail: 'Signal de cas suspect Hantavirus rapporte en Ethiopie. Sous investigation.',
    lat: 9.0, lng: 38.7, date: '2026-05-09',
    source: 'hantamap.online', url: 'https://hantamap.online',
  },
  // Cas confirmes 11 mai 2026
  {
    id: 'hv-37', caseNum: 37, status: 'confirmed', origin: 'imported',
    label: 'Cas #37 — Ressortissant americain (USA)',
    detail: 'Passager americain asymptomatique confirme positif Hantavirus Andes le 11 mai 2026. Rapatrie aux Etats-Unis.',
    lat: 41.3, lng: -96.0, date: '2026-05-11',
    source: 'AP News / CDC', url: 'https://apnews.com/article/hantavirus-outbreak-hondius-cruise-ship-df0e7e1fb9c7fd3e4092be06e684f644',
  },
  // Sous surveillance
  {
    id: 'hv-m-za', caseNum: null, status: 'monitoring', origin: 'response',
    label: 'Surveillance — Afrique du Sud',
    detail: 'Contacts des cas #2 et #3 a Johannesburg. Protocole de surveillance 45 jours en cours.',
    lat: -26.3, lng: 28.1, date: '2026-04-25',
    source: 'NICD Afrique du Sud', url: 'https://www.nicd.ac.za',
  },
  {
    id: 'hv-m-us-va', caseNum: 34, status: 'monitoring', origin: 'imported',
    label: 'Cas #34 — Virginie, USA',
    detail: 'Passager americain, debarque le 24 avril sans symptomes. Sous surveillance 45 jours.',
    lat: 37.5, lng: -79.0, date: '2026-04-24',
    source: 'CDC', url: 'https://wwwnc.cdc.gov/travel/notices/level3/hantavirus',
  },
  {
    id: 'hv-m-us-tx', caseNum: 22, status: 'monitoring', origin: 'imported',
    label: 'Cas #22 — Texas, USA',
    detail: 'Passager americain, debarque le 24 avril. Aucun symptome. Surveillance active.',
    lat: 31.0, lng: -100.0, date: '2026-04-24',
    source: 'CDC', url: 'https://wwwnc.cdc.gov/travel/notices/level3/hantavirus',
  },
  {
    id: 'hv-m-us-ca', caseNum: 23, status: 'monitoring', origin: 'imported',
    label: 'Cas #23 — Californie, USA',
    detail: 'Groupe, debarque le 24 avril. Sous surveillance.',
    lat: 36.8, lng: -119.4, date: '2026-04-24',
    source: 'CDC', url: 'https://wwwnc.cdc.gov/travel/notices/level3/hantavirus',
  },
  {
    id: 'hv-m-us-az', caseNum: 17, status: 'monitoring', origin: 'imported',
    label: 'Cas #17 — Arizona, USA',
    detail: 'Passager americain, debarque le 24 avril. Aucun symptome. Protocole CDC actif.',
    lat: 34.0, lng: -111.1, date: '2026-04-24',
    source: 'CDC', url: 'https://wwwnc.cdc.gov/travel/notices/level3/hantavirus',
  },
  {
    id: 'hv-m-ca', caseNum: 19, status: 'monitoring', origin: 'imported',
    label: 'Cas #18-20 — Canada',
    detail: 'Passagers canadiens debarques le 24 avril. Sous surveillance ASPC.',
    lat: 55.0, lng: -100.0, date: '2026-04-24',
    source: 'PHAC Canada', url: 'https://www.canada.ca/en/public-health.html',
  },
  {
    id: 'hv-m-tr', caseNum: 33, status: 'monitoring', origin: 'imported',
    label: 'Cas #33 — Turquie',
    detail: 'Cameraman turc, debarque le 24 avril. Aucun symptome. Sous surveillance.',
    lat: 39.9, lng: 32.9, date: '2026-04-24',
    source: 'ArcGIS Dashboard', url: 'https://www.arcgis.com/apps/dashboards/5c68442d2afc42d7ba2696e4cd393729',
  },
  {
    id: 'hv-m-sh', caseNum: 28, status: 'monitoring', origin: 'response',
    label: 'Cas #27-30 — Sainte-Helene (debarquements)',
    detail: 'Passagers debarques a Sainte-Helene le 24 avril. Aucun symptome. Surveillance locale.',
    lat: -15.96, lng: -5.72, date: '2026-04-24',
    source: 'ArcGIS Dashboard - WHO', url: 'https://www.arcgis.com/apps/dashboards/5c68442d2afc42d7ba2696e4cd393729',
  },
  {
    id: 'hv-m-us-nj', caseNum: 25, status: 'monitoring', origin: 'imported',
    label: 'Cas #25 — New Jersey, USA (contact)',
    detail: 'Personne non passagere, presente sur le vol du 24 avril. Sous surveillance CDC.',
    lat: 40.0, lng: -74.5, date: '2026-04-24',
    source: 'CDC', url: 'https://wwwnc.cdc.gov/travel/notices/level3/hantavirus',
  },
  // Cas #8 — Tristan da Cunha (probable, DON600)
  {
    id: 'hv-8', caseNum: 8, status: 'suspected', origin: 'imported',
    label: 'Cas #8 — Tristan da Cunha (probable)',
    detail: 'Passager debarque a Tristan da Cunha le 14 avril. Symptomes apparus le 28 avril (diarrhee, fievre). Cas probable en attente confirmation. Stable, en isolement.',
    lat: -37.07, lng: -12.28, date: '2026-04-28',
    source: 'WHO DON600', url: 'https://www.who.int/emergencies/disease-outbreak-news/item/2026-DON600',
  },
  // Site exposition
  {
    id: 'hv-exposure', caseNum: null, status: 'exposure_site', origin: 'local',
    label: 'Site exposition — Sainte-Helene (24 avr.)',
    detail: 'Le 24 avril 2026, excursion ornithologique. Contact avec environnements infestes de rongeurs identifie comme cause probable selon WHO DON#99. Virus : Hantavirus Andes.',
    lat: -15.96, lng: -5.72, date: '2026-04-24',
    source: 'WHO DON#99 — exposition probable', url: 'https://www.who.int/emergencies/disease-outbreak-news/item/2026-DON599',
  },
];

// ─── ZONES ENDEMIQUES ─────────────────────────────────────────────────────────

export const ENDEMIC_ZONES = [
  { id: 'end-arg-pat', label: 'Patagonie (Andes)', country: 'Argentine', virus: 'Andes', lat: -42.0, lng: -71.0, url: 'https://www.paho.org/en/topics/hantavirus' },
  { id: 'end-cl-lag',  label: 'Los Lagos (Andes)', country: 'Chili', virus: 'Andes', lat: -41.5, lng: -72.9, url: 'https://www.ispch.gob.cl' },
  { id: 'end-cl-ara',  label: 'Araucania (Andes)', country: 'Chili', virus: 'Andes', lat: -38.9, lng: -72.6, url: 'https://www.ispch.gob.cl' },
  { id: 'end-us-fc',   label: 'Four Corners (Sin Nombre)', country: 'USA', virus: 'Sin Nombre', lat: 36.9, lng: -108.7, url: 'https://www.cdc.gov/hantavirus/' },
  { id: 'end-br-sul',  label: 'Bresil Sud (HPS)', country: 'Bresil', virus: 'Araraquara', lat: -23.5, lng: -48.5, url: 'https://www.paho.org/en/topics/hantavirus' },
  { id: 'end-de-bw',   label: 'Bade-Wurtemberg (Puumala)', country: 'Allemagne', virus: 'Puumala', lat: 48.4, lng: 9.0, url: 'https://www.rki.de' },
  { id: 'end-de-by',   label: 'Baviere (Puumala)', country: 'Allemagne', virus: 'Puumala', lat: 48.1, lng: 11.6, url: 'https://www.rki.de' },
  { id: 'end-fr-ge',   label: 'Grand Est / Ardennes (Puumala)', country: 'France', virus: 'Puumala', lat: 49.7, lng: 4.7, url: 'https://www.santepubliquefrance.fr' },
  { id: 'end-fr-fc',   label: 'Franche-Comte (Puumala)', country: 'France', virus: 'Puumala', lat: 47.3, lng: 6.0, url: 'https://www.santepubliquefrance.fr' },
  { id: 'end-be',      label: 'Ardennes belges (Puumala)', country: 'Belgique', virus: 'Puumala', lat: 50.2, lng: 5.6, url: 'https://www.sciensano.be' },
  { id: 'end-se-fi',   label: 'Scandinavie (Puumala)', country: 'Suede/Finlande', virus: 'Puumala', lat: 63.0, lng: 21.0, url: 'https://www.ecdc.europa.eu' },
  { id: 'end-balkans', label: 'Balkans (Dobrava)', country: 'Slovenie/Croatie/Bosnie', virus: 'Dobrava', lat: 45.5, lng: 16.5, url: 'https://www.ecdc.europa.eu' },
  { id: 'end-cn',      label: 'Chine FHSR (Hantaan/Seoul)', country: 'Chine', virus: 'Hantaan', lat: 35.0, lng: 110.0, url: 'https://www.chinacdc.cn/en/' },
  { id: 'end-kr',      label: 'Coree du Sud (FHSR)', country: 'Coree du Sud', virus: 'Hantaan', lat: 37.5, lng: 127.5, url: 'https://www.kdca.go.kr' },
  { id: 'end-ru',      label: 'Russie — Siberie / Oural', country: 'Russie', virus: 'Hantaan/Puumala', lat: 56.0, lng: 60.5, url: 'https://www.ecdc.europa.eu' },
];

// ─── Resume epidemique (WHO au 11 mai 2026) ───────────────────────────────────

export const OUTBREAK_SUMMARY = {
  totalConfirmed: 7,   // 11 mai : +1 americain confirme (total 7 selon Wikipedia/BBC)
  totalDeceased: 3,
  totalSuspected: 2,
  totalMonitoring: 30,
  affectedCountries: 11,
  virus: 'Hantavirus Andes (ANDV)',
  vehicle: 'MV Hondius',
  exposureDate: '2026-04-24',
  exposureSite: 'Sainte-Helene',
  whoRisk: 'FAIBLE (population generale) — MODERATE (passagers navire)',
  lastUpdate: '2026-05-11',
  whoUrl: 'https://www.who.int/emergencies/disease-outbreak-news/item/2026-DON600',
  whoUrlPrev: 'https://www.who.int/emergencies/disease-outbreak-news/item/2026-DON599',
};

// ─── Point entree (aucun appel reseau) ────────────────────────────────────────

export function fetchHantavirusCases() {
  return Promise.resolve(MV_HONDIUS_CASES.map((c) => ({
    id: c.id,
    type: 'health',
    title: c.label,
    description: c.detail,
    severity: c.status === 'deceased' ? 'critical'
      : c.status === 'confirmed' ? 'high'
      : c.status === 'suspected' ? 'medium'
      : 'low',
    latitude: c.lat,
    longitude: c.lng,
    eventDate: new Date(c.date).toISOString(),
    sourceName: c.source,
    sourceUrl: c.url,
    isHantavirus: true,
    hvStatus: c.status,
    hvOrigin: c.origin,
    caseNum: c.caseNum,
  })));
}
