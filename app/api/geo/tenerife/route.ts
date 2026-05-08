import { NextResponse } from 'next/server';
import { fetchMunicipalities } from '../../../../lib/geonames';

/**
 * GET /api/geo/tenerife
 *
 * Returns Tenerife municipalities from GeoNames API.
 * Response is cached for 1 hour via Cache-Control headers.
 */
export async function GET() {
  try {
    const municipalities = await fetchMunicipalities();
    return NextResponse.json(
      { municipalities },
      { headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200' } }
    );
  } catch (error) {
    console.error('[API /geo/tenerife] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch geographic data' },
      { status: 500 }
    );
  }
}
