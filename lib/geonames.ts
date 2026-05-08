/**
 * GeoNames API Client for Tenerife Municipality Data
 *
 * Uses the GeoNames free API to fetch:
 *   - Municipalities (ADM3 level) for Tenerife province (Santa Cruz de Tenerife)
 *
 * Includes an in-memory cache to minimize API calls.
 * Requires GEONAMES_USERNAME env var (register free at geonames.org).
 *
 * @see https://www.geonames.org/export/web-services.html
 */

// ── Santa Cruz de Tenerife Province GeoNames ID ──
const TENERIFE_GEONAME_ID = 2511173;

// The official list of 31 municipalities on the island of Tenerife to filter out other islands in the province
const TENERIFE_MUNICIPALITY_NAMES = new Set([
  'Adeje', 'Arafo', 'Arico', 'Arona', 'Buenavista del Norte',
  'Candelaria', 'El Rosario', 'El Sauzal', 'El Tanque', 'Fasnia',
  'Garachico', 'Granadilla de Abona', 'Guía de Isora', 'Güímar',
  'Icod de los Vinos', 'La Guancha', 'La Matanza de Acentejo',
  'La Orotava', 'La Victoria de Acentejo', 'Los Realejos',
  'Los Silos', 'Puerto de la Cruz', 'San Cristóbal de La Laguna',
  'San Juan de la Rambla', 'San Miguel de Abona',
  'Santa Cruz de Tenerife', 'Santa Úrsula', 'Santiago del Teide',
  'Tacoronte', 'Tegueste', 'Vilaflor'
]);

// ── GeoNames API Base ──
const GEONAMES_BASE = 'https://secure.geonames.org';

// ── In-memory cache ──
let cachedMunicipalities: string[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

function getUsername(): string {
  return process.env.GEONAMES_USERNAME || 'demo';
}

// ── Types ──
interface GeoNameEntry {
  geonameId: number;
  name: string;
  toponymName: string;
  population: number;
  fcode: string;
  lat: string;
  lng: string;
  adminName1?: string;
  adminName2?: string;
  adminName3?: string;
}

interface GeoNamesResponse {
  totalResultsCount?: number;
  geonames: GeoNameEntry[];
  status?: { message: string; value: number };
}

/**
 * Fetches all municipalities (ADM3) of Tenerife from GeoNames.
 * Uses the `children` endpoint of the Tenerife geonameId.
 */
export async function fetchMunicipalities(): Promise<string[]> {
  // Check cache
  if (cachedMunicipalities && Date.now() - cacheTimestamp < CACHE_TTL) {
    return cachedMunicipalities;
  }

  const username = getUsername();
  const url = `${GEONAMES_BASE}/childrenJSON?geonameId=${TENERIFE_GEONAME_ID}&username=${username}&maxRows=100`;

  try {
    const res = await fetch(url, { cache: 'force-cache' });
    const data: GeoNamesResponse = await res.json();

    if (data.status) {
      console.warn(`[GeoNames] API error: ${data.status.message}`);
      return [];
    }

    const municipalities = data.geonames
      .map((g) => g.toponymName || g.name)
      .filter(Boolean)
      .filter((name) => TENERIFE_MUNICIPALITY_NAMES.has(name))
      .sort((a, b) => a.localeCompare(b, 'es'));

    if (municipalities.length > 0) {
      cachedMunicipalities = municipalities;
      cacheTimestamp = Date.now();
      return municipalities;
    }

    return [];
  } catch (err) {
    console.warn('[GeoNames] Network error fetching municipalities:', err);
    return [];
  }
}
