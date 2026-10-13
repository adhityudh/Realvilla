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

// The official list of municipalities to allow: the 31 on the island of Tenerife
// plus San Sebastián de La Gomera (La Gomera capital, same province of
// Santa Cruz de Tenerife — added per client request). Filters out the other
// islands in the province returned by the GeoNames children endpoint.
const TENERIFE_MUNICIPALITY_NAMES = new Set([
  'Adeje', 'Arafo', 'Arico', 'Arona', 'Buenavista del Norte',
  'Candelaria', 'El Rosario', 'El Sauzal', 'El Tanque', 'Fasnia',
  'Garachico', 'Granadilla de Abona', 'Guía de Isora', 'Güímar',
  'Icod de los Vinos', 'La Guancha', 'La Matanza de Acentejo',
  'La Orotava', 'La Victoria de Acentejo', 'Los Realejos',
  'Los Silos', 'Puerto de la Cruz', 'San Cristóbal de La Laguna',
  'San Juan de la Rambla', 'San Miguel de Abona',
  'San Sebastián de La Gomera',
  'Santa Cruz de Tenerife', 'Santa Úrsula', 'Santiago del Teide',
  'Tacoronte', 'Tegueste', 'Vilaflor'
]);

// ── Name normalization ──
// GeoNames returns province children with varying conventions:
// unaccented or inverted article suffixes ("Rosario, El", "Orotava, La",
// "San Sebastián de la Gomera"). Normalize both sides (case, diacritics,
// article position) and map back to our canonical display names so no
// municipality is silently dropped from the filter options.
function normalizeMunicipalityName(name: string): string {
  let n = (name || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
  const inverted = n.match(/^(.*),\s*(el|la|los|las)$/);
  if (inverted) n = `${inverted[2]} ${inverted[1]}`.trim();
  return n.replace(/\s+/g, ' ');
}

const CANONICAL_BY_NORMALIZED = new Map(
  [...TENERIFE_MUNICIPALITY_NAMES].map((n) => [normalizeMunicipalityName(n), n])
);

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

    const municipalities: string[] = [];
    for (const g of data.geonames || []) {
      const canonical = CANONICAL_BY_NORMALIZED.get(
        normalizeMunicipalityName(g.toponymName || g.name)
      );
      if (canonical && !municipalities.includes(canonical)) {
        municipalities.push(canonical);
      }
    }
    municipalities.sort((a, b) => a.localeCompare(b, 'es'));

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
