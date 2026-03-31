'use client';

import { useCallback } from 'react';
import {
  AdvancedMarker,
  InfoWindow,
  useAdvancedMarkerRef,
} from '@vis.gl/react-google-maps';
import { Spot } from '@/types';
import { useApp } from '@/contexts/AppContext';
import { CATEGORIES } from '@/lib/categories';

interface SpotMarkerProps {
  spot: Spot;
  isSelected: boolean;
  selectionIndex: number;
}

export default function SpotMarker({
  spot,
  isSelected,
  selectionIndex,
}: SpotMarkerProps) {
  const { state, dispatch } = useApp();
  const [markerRef, marker] = useAdvancedMarkerRef();
  const isInfoOpen = state.highlightedSpotId === spot.placeId;
  const catDef = CATEGORIES[spot.category];

  const handleClick = useCallback(() => {
    dispatch({ type: 'HIGHLIGHT_SPOT', spotId: spot.placeId });
    dispatch({ type: 'SET_ACTIVE_TAB', tab: 'list' });
  }, [dispatch, spot.placeId]);

  const handleClose = useCallback(() => {
    dispatch({ type: 'HIGHLIGHT_SPOT', spotId: null });
  }, [dispatch]);

  return (
    <>
      <AdvancedMarker
        ref={markerRef}
        position={{ lat: spot.lat, lng: spot.lng }}
        onClick={handleClick}
        title={spot.name}
      >
        <div
          className={`flex items-center justify-center w-8 h-8 rounded-full text-white text-xs font-bold shadow-lg transition-transform ${
            isSelected
              ? 'bg-orange-500 scale-110'
              : 'bg-blue-500 hover:scale-105'
          }`}
        >
          {isSelected ? selectionIndex + 1 : catDef.icon}
        </div>
      </AdvancedMarker>
      {isInfoOpen && marker && (
        <InfoWindow anchor={marker} onCloseClick={handleClose}>
          <div className="p-1 max-w-[200px]">
            <h4 className="font-bold text-sm">{spot.name}</h4>
            <p className="text-xs text-gray-600 mt-1">
              {catDef.icon} {catDef.label}
            </p>
            {spot.rating > 0 && (
              <p className="text-xs text-gray-500 mt-0.5">
                ★ {spot.rating.toFixed(1)} ({spot.userRatingsTotal})
              </p>
            )}
            <p className="text-xs text-gray-500 mt-0.5">{spot.vicinity}</p>
          </div>
        </InfoWindow>
      )}
    </>
  );
}
