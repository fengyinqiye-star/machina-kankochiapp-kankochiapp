'use client';

import { useCallback } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Spot } from '@/types';

export function usePlacesSearch() {
  const { dispatch } = useApp();

  const searchSpots = useCallback(
    async (lat: number, lng: number, type?: string, keyword?: string) => {
      dispatch({ type: 'SET_SPOTS_LOADING', loading: true });
      try {
        const res = await fetch('/api/places/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lat, lng, radius: 5000, type: type || 'tourist_attraction', keyword: keyword || '' }),
        });
        if (!res.ok) throw new Error('Search failed');
        const data = await res.json();
        dispatch({ type: 'SET_SPOTS', spots: data.spots as Spot[] });
      } catch {
        dispatch({ type: 'SET_SPOTS', spots: [] });
      }
    },
    [dispatch]
  );

  return { searchSpots };
}
