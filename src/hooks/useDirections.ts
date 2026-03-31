'use client';

import { useCallback } from 'react';
import { useApp } from '@/contexts/AppContext';

export function useDirections() {
  const { state, dispatch } = useApp();

  const fetchRoute = useCallback(async () => {
    const spots = state.selectedSpots;
    if (spots.length < 2) return;

    dispatch({ type: 'SET_ROUTE_LOADING', loading: true });

    const origin = { lat: spots[0].lat, lng: spots[0].lng };
    const destination = {
      lat: spots[spots.length - 1].lat,
      lng: spots[spots.length - 1].lng,
    };
    const waypoints = spots.slice(1, -1).map((s) => ({ lat: s.lat, lng: s.lng }));

    try {
      const res = await fetch('/api/directions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ origin, destination, waypoints, travelMode: 'driving' }),
      });
      if (!res.ok) throw new Error('Directions failed');
      const data = await res.json();
      if (data.routes && data.routes.length > 0) {
        dispatch({ type: 'SET_ROUTE_RESULT', result: data.routes[0] });
      } else {
        dispatch({ type: 'SET_ROUTE_LOADING', loading: false });
      }
    } catch {
      dispatch({ type: 'SET_ROUTE_LOADING', loading: false });
    }
  }, [state.selectedSpots, dispatch]);

  return { fetchRoute };
}
