'use client';

import { useRef, useEffect } from 'react';
import { Spot } from '@/types';
import { useApp } from '@/contexts/AppContext';
import { CATEGORIES } from '@/lib/categories';
import { MAX_ROUTE_SPOTS } from '@/lib/constants';

interface SpotCardProps {
  spot: Spot;
  index: number;
}

export default function SpotCard({ spot, index }: SpotCardProps) {
  const { state, dispatch } = useApp();
  const cardRef = useRef<HTMLDivElement>(null);

  const isSelected = state.selectedSpots.some((s) => s.placeId === spot.placeId);
  const isHighlighted = state.highlightedSpotId === spot.placeId;
  const selectionIndex = state.selectedSpots.findIndex(
    (s) => s.placeId === spot.placeId
  );
  const canSelect = isSelected || state.selectedSpots.length < MAX_ROUTE_SPOTS;
  const catDef = CATEGORIES[spot.category];

  useEffect(() => {
    if (isHighlighted && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const timer = setTimeout(() => {
        dispatch({ type: 'HIGHLIGHT_SPOT', spotId: null });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isHighlighted, dispatch]);

  const handleClick = () => {
    if (!canSelect && !isSelected) return;
    dispatch({ type: 'TOGGLE_SPOT_SELECTION', spot });
  };

  const handleCardClick = () => {
    dispatch({ type: 'HIGHLIGHT_SPOT', spotId: spot.placeId });
  };

  const photoUrl = spot.photoReference
    ? `/api/places/photo?ref=${spot.photoReference}&maxWidth=400`
    : null;

  return (
    <div
      ref={cardRef}
      className={`bg-white rounded-lg border transition-all duration-200 cursor-pointer ${
        isSelected
          ? 'border-orange-400 bg-selected shadow-md'
          : 'border-gray-200 shadow-sm hover:shadow-md'
      } ${isHighlighted ? 'animate-highlight ring-2 ring-accent' : ''}`}
      style={{ animationDelay: `${index * 0.05}s` }}
      onClick={handleCardClick}
    >
      <div className="flex gap-3 p-4">
        {/* Photo */}
        <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-gray-100">
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photoUrl}
              alt={spot.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl bg-ivory">
              {catDef.icon}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-gray-900 truncate">{spot.name}</h3>
            {isSelected && selectionIndex >= 0 && (
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent text-white text-xs font-bold flex items-center justify-center">
                {selectionIndex + 1}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">
              {catDef.icon} {catDef.label}
            </span>
            {spot.rating > 0 && (
              <span className="text-xs text-gray-600 flex items-center gap-0.5">
                <svg
                  className="text-yellow-400"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                {spot.rating.toFixed(1)}
                <span className="text-gray-400">
                  ({spot.userRatingsTotal.toLocaleString()})
                </span>
              </span>
            )}
          </div>

          <p className="text-xs text-gray-500 mt-1 truncate">{spot.vicinity}</p>

          <div className="mt-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleClick();
              }}
              disabled={!canSelect && !isSelected}
              className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
                isSelected
                  ? 'bg-accent text-white hover:bg-orange-500'
                  : canSelect
                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  : 'bg-gray-50 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isSelected
                ? 'ルートから外す'
                : canSelect
                ? 'ルートに追加'
                : `最大${MAX_ROUTE_SPOTS}件`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
