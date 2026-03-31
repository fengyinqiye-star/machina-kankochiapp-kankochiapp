import { NextRequest, NextResponse } from 'next/server';

const SERVER_KEY = process.env.GOOGLE_MAPS_SERVER_API_KEY;

export async function GET(request: NextRequest) {
  if (!SERVER_KEY) {
    return NextResponse.json(
      { error: 'Server configuration error', message: 'API key not configured' },
      { status: 500 }
    );
  }

  const ref = request.nextUrl.searchParams.get('ref');
  const rawMaxWidth = request.nextUrl.searchParams.get('maxWidth') || '400';
  const maxWidth = Math.min(Math.max(parseInt(rawMaxWidth, 10) || 400, 100), 1600).toString();

  if (!ref || !/^[a-zA-Z0-9_-]+$/.test(ref)) {
    return NextResponse.json(
      { error: 'Invalid request', message: 'Valid photo reference is required' },
      { status: 400 }
    );
  }

  try {
    const params = new URLSearchParams({
      photo_reference: ref,
      maxwidth: maxWidth,
      key: SERVER_KEY,
    });

    const url = `https://maps.googleapis.com/maps/api/place/photo?${params}`;
    const res = await fetch(url, { redirect: 'follow' });

    if (!res.ok) {
      return NextResponse.json(
        { error: 'Google API error', message: `Status: ${res.status}` },
        { status: 502 }
      );
    }

    const contentType = res.headers.get('content-type') || 'image/jpeg';
    const buffer = await res.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch {
    return NextResponse.json(
      { error: 'Server error', message: 'Failed to fetch photo' },
      { status: 500 }
    );
  }
}
