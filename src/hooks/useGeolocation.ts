'use client';

import { useState, useCallback } from 'react';

interface GeolocationState {
  lat: number | null;
  lng: number | null;
  loading: boolean;
  error: string | null;
}

export function useGeolocation() {
  const [geo, setGeo] = useState<GeolocationState>({
    lat: null,
    lng: null,
    loading: false,
    error: null,
  });

  const getCurrentPosition = useCallback(() => {
    if (!navigator.geolocation) {
      setGeo((prev) => ({ ...prev, error: 'Geolocation is not supported' }));
      return;
    }

    setGeo((prev) => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGeo({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          loading: false,
          error: null,
        });
      },
      (err) => {
        setGeo((prev) => ({
          ...prev,
          loading: false,
          error: err.message,
        }));
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  return { ...geo, getCurrentPosition };
}
