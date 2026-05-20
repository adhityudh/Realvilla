import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/places/reverse-geocode?lat=<latitude>&lng=<longitude>
 *
 * Server-side proxy to the Google Geocoding API.
 * - Resolves precise latitude and longitude into a readable physical address.
 * - Prevents client-side HTTP Referrer or API restrictions from breaking geocoding.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get('lat')?.trim();
  const lng = searchParams.get('lng')?.trim();

  if (!lat || !lng) {
    return NextResponse.json({ error: 'lat and lng parameters are required' }, { status: 400 });
  }

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Google Maps API key not configured' }, { status: 500 });
  }

  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${encodeURIComponent(lat)},${encodeURIComponent(lng)}&key=${apiKey}&language=es`;

  try {
    const res = await fetch(url, {
      method: 'GET',
      cache: 'no-store',
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('[places/reverse-geocode] Google Geocoding API error:', res.status, errText);
      return NextResponse.json({ error: 'Failed to reverse geocode from Google API' }, { status: 502 });
    }

    const data = await res.json();

    if (data.status !== 'OK') {
      console.error('[places/reverse-geocode] Google API returned non-OK status:', data.status, data.error_message);
      return NextResponse.json({ 
        error: data.error_message || `API returned status: ${data.status}`,
        status: data.status 
      }, { status: data.status === 'ZERO_RESULTS' ? 404 : 500 });
    }

    if (!data.results || data.results.length === 0) {
      return NextResponse.json({ error: 'No address found for these coordinates' }, { status: 404 });
    }

    const rawAddress = data.results[0].formatted_address || '';
    // Strip country suffix — always ", España" for ES results
    const cleanAddress = rawAddress.replace(/,\s*España\s*$/i, '').trim();

    return NextResponse.json(
      {
        address: cleanAddress,
        rawAddress: rawAddress,
      },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (err) {
    console.error('[places/reverse-geocode] Fetch error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
