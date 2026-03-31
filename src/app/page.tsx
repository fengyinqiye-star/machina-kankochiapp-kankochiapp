'use client';

import { APIProvider } from '@vis.gl/react-google-maps';
import { AppProvider, useApp } from '@/contexts/AppContext';
import { usePlacesSearch } from '@/hooks/usePlacesSearch';
import SearchHero from '@/components/search/SearchHero';
import Header from '@/components/layout/Header';
import MobileTabBar from '@/components/layout/MobileTabBar';
import CategoryFilter from '@/components/spots/CategoryFilter';
import SpotList from '@/components/spots/SpotList';
import MapView from '@/components/map/MapView';
import RoutePanel from '@/components/route/RoutePanel';
import { useEffect } from 'react';

function AppContent() {
  const { state } = useApp();
  const { searchSpots } = usePlacesSearch();

  // When a place is selected via autocomplete, fetch spots
  useEffect(() => {
    if (
      state.selectedPlace &&
      state.selectedPlace.lat !== 0 &&
      state.selectedPlace.lng !== 0 &&
      state.spots.length === 0 &&
      !state.spotsLoading
    ) {
      searchSpots(state.selectedPlace.lat, state.selectedPlace.lng);
    }
  }, [state.selectedPlace, state.spots.length, state.spotsLoading, searchSpots]);

  // Hero / search screen
  if (!state.selectedPlace) {
    return <SearchHero />;
  }

  // Spot list + map screen
  return (
    <div className="min-h-screen bg-ivory">
      <Header />
      <div className="py-3">
        <CategoryFilter />
      </div>
      <MobileTabBar />

      {/* Desktop: 2-column layout */}
      <div className="md:flex md:h-[calc(100vh-120px)]">
        {/* Left panel: spot list + route panel */}
        <div
          className={`md:w-[420px] md:overflow-y-auto md:border-r md:border-gray-200 ${
            state.activeTab === 'list' ? 'block' : 'hidden md:block'
          }`}
        >
          <SpotList />
          <div className="p-4">
            <RoutePanel />
          </div>
        </div>

        {/* Right panel: map */}
        <div
          className={`md:flex-1 ${
            state.activeTab === 'map' ? 'block' : 'hidden md:block'
          }`}
        >
          <MapView />
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

  return (
    <AppProvider>
      <APIProvider apiKey={apiKey}>
        <AppContent />
      </APIProvider>
    </AppProvider>
  );
}
