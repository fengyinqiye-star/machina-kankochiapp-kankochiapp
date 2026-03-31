import { NextRequest, NextResponse } from 'next/server';
import { mapToCategory } from '@/lib/categories';

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
    const { lat, lng, radius, type, keyword } = body;

    if (typeof lat !== 'number' || typeof lng !== 'number') {
      return NextResponse.json(
        { error: 'Invalid request', message: 'lat and lng are required' },
        { status: 400 }
      );
    }

    const searchRadius = Math.min(Number(radius) || 5000, 10000);
    const searchType = type || 'tourist_attraction';

    const params = new URLSearchParams({
      location: `${lat},${lng}`,
      radius: String(searchRadius),
      type: searchType,
      language: 'ja',
      key: SERVER_KEY,
    });

    if (keyword) {
      params.set('keyword', String(keyword));
    }

    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?${params}`;
    const res = await fetch(url);

    if (!res.ok) {
      return NextResponse.json(
        { error: 'Google API error', message: `Status: ${res.status}` },
        { status: 502 }
      );
    }

    const data = await res.json();

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      return NextResponse.json(
        { error: 'Google API error', message: data.error_message || data.status },
        { status: 502 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const spots = (data.results || []).map((place: any) => ({
      placeId: place.place_id,
      name: place.name,
      lat: place.geometry?.location?.lat,
      lng: place.geometry?.location?.lng,
      rating: place.rating || 0,
      userRatingsTotal: place.user_ratings_total || 0,
      types: place.types || [],
      category: mapToCategory(place.types || []),
      vicinity: place.vicinity || '',
      photoReference: place.photos?.[0]?.photo_reference || null,
      openNow: place.opening_hours?.open_now ?? undefined,
    }));

    return NextResponse.json({
      spots,
      nextPageToken: data.next_page_token || null,
    });
  } catch {
    return NextResponse.json(
      { error: 'Server error', message: 'Failed to process request' },
      { status: 500 }
    );
  }
}
