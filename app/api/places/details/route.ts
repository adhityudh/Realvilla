import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/places/details?placeId=<placeId>
 *
 * Server-side proxy to the Google Places API (New) v1.
 * - Retrieves precise location (latitude, longitude) for a specific Google Place ID.
 * - Keeps the API key secure (not exposed in direct client network requests).
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const placeId = searchParams.get('placeId')?.trim();

  if (!placeId) {
    return NextResponse.json({ error: 'placeId parameter is required' }, { status: 400 });
  }

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Google Maps API key not configured' }, { status: 500 });
  }

  const url = `https://places.googleapis.com/v1/places/${placeId}`;

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'location,displayName',
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('[places/details] Google API error:', res.status, errText);
      return NextResponse.json({ error: 'Failed to retrieve place details from Google API' }, { status: 502 });
    }

    const data = await res.json();

    if (data.error) {
      console.error('[places/details] Google API returned inner error:', data.error?.message);
      return NextResponse.json({ error: data.error?.message || 'Inner API error' }, { status: 500 });
    }

    return NextResponse.json(
      {
        location: data.location || null,
        displayName: data.displayName?.text || '',
      },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (err) {
    console.error('[places/details] Fetch error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
