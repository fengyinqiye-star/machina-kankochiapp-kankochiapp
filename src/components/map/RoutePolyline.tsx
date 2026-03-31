'use client';

import { useEffect, useRef } from 'react';
import { useMap } from '@vis.gl/react-google-maps';
import { decodePolyline } from '@/lib/google-maps';

interface RoutePolylineProps {
  encodedPolyline: string;
}

export default function RoutePolyline({ encodedPolyline }: RoutePolylineProps) {
  const map = useMap();
  const polylineRef = useRef<google.maps.Polyline | null>(null);

  useEffect(() => {
    if (!map || !encodedPolyline) return;

    const path = decodePolyline(encodedPolyline).map(
      (p) => new google.maps.LatLng(p.lat, p.lng)
    );

    if (polylineRef.current) {
      polylineRef.current.setMap(null);
    }

    polylineRef.current = new google.maps.Polyline({
      path,
      strokeColor: '#3B82F6',
      strokeOpacity: 0.7,
      strokeWeight: 4,
      map,
    });

    return () => {
      if (polylineRef.current) {
        polylineRef.current.setMap(null);
        polylineRef.current = null;
      }
    };
  }, [map, encodedPolyline]);

  return null;
}
