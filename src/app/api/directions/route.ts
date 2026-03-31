import { NextRequest, NextResponse } from 'next/server';

const SERVER_KEY = process.env.GOOGLE_MAPS_SERVER_API_KEY;

interface LatLng {
  lat: number;
  lng: number;
}

export async function POST(request: NextRequest) {
  if (!SERVER_KEY) {
    return NextResponse.json(
      { error: 'Server configuration error', message: 'API key not configured' },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { origin, destination, waypoints } = body as {
      origin: LatLng;
      destination: LatLng;
      waypoints?: LatLng[];
    };

    if (!origin?.lat || !origin?.lng || !destination?.lat || !destination?.lng) {
      return NextResponse.json(
        { error: 'Invalid request', message: 'origin and destination are required' },
        { status: 400 }
      );
    }

    if (waypoints && waypoints.length > 3) {
      return NextResponse.json(
        { error: 'Invalid request', message: 'Maximum 3 waypoints allowed' },
        { status: 400 }
      );
    }

    const params = new URLSearchParams({
      origin: `${origin.lat},${origin.lng}`,
      destination: `${destination.lat},${destination.lng}`,
      mode: 'driving',
      language: 'ja',
      key: SERVER_KEY,
    });

    if (waypoints && waypoints.length > 0) {
      const wp = waypoints.map((w) => `${w.lat},${w.lng}`).join('|');
      params.set('waypoints', wp);
    }

    const url = `https://maps.googleapis.com/maps/api/directions/json?${params}`;
    const res = await fetch(url);

    if (!res.ok) {
      return NextResponse.json(
        { error: 'Google API error', message: `Status: ${res.status}` },
        { status: 502 }
      );
    }

    const data = await res.json();

    if (data.status !== 'OK') {
      return NextResponse.json(
        { error: 'Google API error', message: data.error_message || data.status },
        { status: 502 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const routes = (data.routes || []).map((route: any) => {
      const legs = route.legs.map(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (leg: any) => ({
          distance: leg.distance,
          duration: leg.duration,
          startAddress: leg.start_address,
          endAddress: leg.end_address,
        })
      );

      let totalDistanceValue = 0;
      let totalDurationValue = 0;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      route.legs.forEach((leg: any) => {
        totalDistanceValue += leg.distance.value;
        totalDurationValue += leg.duration.value;
      });

      return {
        legs,
        overviewPolyline: route.overview_polyline?.points || '',
        totalDistance: {
          text: `${(totalDistanceValue / 1000).toFixed(1)} km`,
          value: totalDistanceValue,
        },
        totalDuration: {
          text: `${Math.round(totalDurationValue / 60)}分`,
          value: totalDurationValue,
        },
      };
    });

    return NextResponse.json({ routes });
  } catch {
    return NextResponse.json(
      { error: 'Server error', message: 'Failed to process request' },
      { status: 500 }
    );
  }
}
