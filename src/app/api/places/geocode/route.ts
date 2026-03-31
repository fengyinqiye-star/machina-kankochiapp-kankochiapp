import { NextRequest, NextResponse } from 'next/server';

const SERVER_KEY = process.env.GOOGLE_MAPS_SERVER_API_KEY;

export async function POST(request: NextRequest) {
  if (!SERVER_KEY) {
    return NextResponse.json(
      { error: 'Server configuration error', message: 'API key not configured' },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { placeId } = body;

    if (!placeId || typeof placeId !== 'string' || placeId.trim().length === 0) {
      return NextResponse.json(
        { error: 'Invalid request', message: 'placeId is required' },
        { status: 400 }
      );
    }

    const params = new URLSearchParams({
      place_id: placeId.trim(),
      language: 'ja',
      key: SERVER_KEY,
    });

    const url = `https://maps.googleapis.com/maps/api/geocode/json?${params}`;
    const res = await fetch(url);

    if (!res.ok) {
      return NextResponse.json(
        { error: 'Google API error', message: `Status: ${res.status}` },
        { status: 502 }
      );
    }

    const data = await res.json();

    if (data.status !== 'OK' || !data.results || data.results.length === 0) {
      return NextResponse.json(
        { error: 'Geocode failed', message: data.error_message || data.status },
        { status: 404 }
      );
    }

    const result = data.results[0];
    const location = result.geometry?.location;

    if (!location || typeof location.lat !== 'number' || typeof location.lng !== 'number') {
      return NextResponse.json(
        { error: 'Geocode failed', message: 'No location found for this place' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      lat: location.lat,
      lng: location.lng,
      formattedAddress: result.formatted_address || '',
    });
  } catch {
    return NextResponse.json(
      { error: 'Server error', message: 'Failed to process request' },
      { status: 500 }
    );
  }
}
