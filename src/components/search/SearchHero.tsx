'use client';

import SearchBar from './SearchBar';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useApp } from '@/contexts/AppContext';
import { usePlacesSearch } from '@/hooks/usePlacesSearch';
import { useEffect, useRef } from 'react';

export default function SearchHero() {
  const { dispatch } = useApp();
  const { lat, lng, loading: geoLoading, getCurrentPosition } = useGeolocation();
  const { searchSpots } = usePlacesSearch();
  const geoTriggered = useRef(false);

  useEffect(() => {
    if (lat && lng && !geoTriggered.current) {
      geoTriggered.current = true;
      dispatch({
        type: 'SELECT_PLACE',
        place: {
          placeId: 'current-location',
          name: '現在地周辺',
          lat,
          lng,
        },
      });
      searchSpots(lat, lng);
    }
  }, [lat, lng, dispatch, searchSpots]);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary via-emerald-800 to-emerald-900 px-4">
      {/* Background overlay pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="w-full h-full"
          style={{
            backgroundImage:
              'radial-gradient(circle at 25% 25%, white 1px, transparent 1px), radial-gradient(circle at 75% 75%, white 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      <div className="relative z-10 text-center max-w-2xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 leading-tight">
          旅をもっと
          <br />
          <span className="text-accent">自由</span>に。
        </h1>
        <p className="text-lg md:text-xl text-white/80 mb-10 leading-relaxed">
          行きたいエリアを入力するだけで、
          <br className="md:hidden" />
          おすすめの観光スポットと周遊ルートが見つかります。
        </p>

        <SearchBar />

        <div className="mt-6">
          <button
            onClick={getCurrentPosition}
            disabled={geoLoading}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-lg hover:bg-white/20 transition-colors disabled:opacity-50"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="3" />
              <path d="M12 2v2" />
              <path d="M12 20v2" />
              <path d="M2 12h2" />
              <path d="M20 12h2" />
            </svg>
            {geoLoading ? '位置情報を取得中...' : '現在地から探す'}
          </button>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="opacity-50"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>
    </div>
  );
}
