/**
 * hantaLive.js — Données live hantavirus sans backend ni GitHub Actions
 *
 * Sources :
 *   • GDELT Project   — actualités mondiales, lag ~15 min, CORS ouvert, gratuit
 *     https://blog.gdeltproject.org/gdelt-doc-2-0-api-debuts/
 *   • Wikipedia API   — stats infobox (confirmed/suspected/deaths), CORS via origin=*
 *     https://en.wikipedia.org/wiki/MV_Hondius_hantavirus_outbreak
 */

// ─── GDELT — Actualités hantavirus MV Hondius ─────────────────────────────────
export async function fetchGDELTNews(maxRecords = 8) {
  const query = encodeURIComponent('"hantavirus" "Hondius"');
  const url =
    `https://api.gdeltproject.org/api/v2/doc/doc` +
    `?query=${query}&mode=ArtList&maxrecords=${maxRecords}&format=json&timespan=7d`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GDELT ${res.status}`);
  const data = await res.json();
  return (data.articles ?? []).map((a) => ({
    title: a.title,
    url: a.url,
    domain: a.domain,
    seendate: a.seendate, // "20260511T120000Z"
    lang: a.language,
  }));
}

// ─── Wikipedia — Stats live depuis l'infobox ──────────────────────────────────
export async function fetchWikiStats() {
  const url =
    'https://en.wikipedia.org/w/api.php' +
    '?action=query&titles=MV_Hondius_hantavirus_outbreak' +
    '&prop=revisions&rvprop=content|timestamp&rvslots=*&format=json&origin=*';
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Wikipedia ${res.status}`);
  const data = await res.json();
  const page = Object.values(data?.query?.pages ?? {})[0];
  const rev = page?.revisions?.[0];
  const wikitext = rev?.slots?.main?.['*'] ?? '';
  const timestamp = rev?.timestamp ?? null;

  const num = (rx) => {
    const m = wikitext.match(rx);
    return m ? parseInt(m[1], 10) : null;
  };

  return {
    confirmed: num(/confirmed[_\s]*cases\s*=\s*(\d+)/i),
    suspected: num(/suspected[_\s]*cases\s*=\s*(\d+)/i),
    deaths: num(/\|\s*deaths\s*=\s*(\d+)/i),
    timestamp, // ISO string — horodatage dernière révision Wikipedia
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
// Convertit le format GDELT "20260511T120000Z" → Date JS
export function parseGDELTDate(s) {
  if (!s || s.length < 15) return null;
  return new Date(
    `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}` +
    `T${s.slice(9, 11)}:${s.slice(11, 13)}:${s.slice(13, 15)}Z`
  );
}
