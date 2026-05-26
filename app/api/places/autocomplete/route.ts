import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/places/autocomplete?q=<query>
 *
 * Server-side proxy to the Google Places API (New) v1.
 * - Scoped to all of Spain via regionCode (no longer restricted to Tenerife)
 * - Enforces street-level minimum via includedPrimaryTypes
 * - Keeps the API key secure (not exposed to client bundle)
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const input = searchParams.get('q')?.trim();

  if (!input || input.length < 3) {
    return NextResponse.json({ predictions: [] });
  }

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Google Maps API key not configured' }, { status: 500 });
  }

  const url = 'https://places.googleapis.com/v1/places:autocomplete';

  const body = {
    input,
    languageCode: 'es',
    regionCode: 'ES',
    // Strictly restrict results to Spain only (regionCode is just a bias, includedRegionCodes is strict)
    includedRegionCodes: ['ES'],
    // Street-level minimum: routes (streets), street_address, premise (buildings)
    includedPrimaryTypes: ['route', 'street_address', 'premise'],
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('[places/autocomplete] Google API error:', res.status, errText);
      return NextResponse.json({ predictions: [] }, { status: 502 });
    }

    const data = await res.json();

    if (data.error) {
      console.error('[places/autocomplete] Google API error:', data.error?.message);
      return NextResponse.json({ predictions: [] });
    }

    // Places API (New) returns suggestions[].placePrediction
    const predictions = (data.suggestions || [])
      .slice(0, 10)
      .map((s: any) => {
        const raw: string = s.placePrediction?.text?.text || '';
        // Strip country suffix — always ", España" for ES results
        const display_name = raw.replace(/,\s*España\s*$/i, '').trim();
        return {
          place_id: s.placePrediction?.placeId,
          display_name,
        };
      })
      .filter((p: any) => p.display_name);

    return NextResponse.json(
      { predictions },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (err) {
    console.error('[places/autocomplete] Fetch error:', err);
    return NextResponse.json({ predictions: [] }, { status: 500 });
  }
}

