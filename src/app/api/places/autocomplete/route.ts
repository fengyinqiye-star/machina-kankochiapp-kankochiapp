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
    const { input, language, components } = body;

    if (!input || typeof input !== 'string' || input.trim().length === 0) {
      return NextResponse.json(
        { error: 'Invalid request', message: 'input is required' },
        { status: 400 }
      );
    }

    const params = new URLSearchParams({
      input: input.trim(),
      language: language || 'ja',
      components: components || 'country:jp',
      key: SERVER_KEY,
    });

    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?${params}`;
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
    const predictions = (data.predictions || []).map((p: any) => ({
      placeId: p.place_id,
      description: p.description,
      mainText: p.structured_formatting?.main_text || p.description,
      secondaryText: p.structured_formatting?.secondary_text || '',
    }));

    return NextResponse.json({ predictions });
  } catch {
    return NextResponse.json(
      { error: 'Server error', message: 'Failed to process request' },
      { status: 500 }
    );
  }
}
