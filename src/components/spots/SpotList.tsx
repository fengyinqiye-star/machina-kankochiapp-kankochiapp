'use client';

import { useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import SpotCard from './SpotCard';

export default function SpotList() {
  const { state } = useApp();

  const filteredSpots = useMemo(() => {
    if (!state.categoryFilter) return state.spots;
    return state.spots.filter((s) => s.category === state.categoryFilter);
  }, [state.spots, state.categoryFilter]);

  if (state.spotsLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">スポットを検索中...</p>
        </div>
      </div>
    );
  }

  if (state.spots.length === 0) {
    return (
      <div className="flex items-center justify-center py-16 text-gray-500">
        <p>スポットが見つかりませんでした</p>
      </div>
    );
  }

  if (filteredSpots.length === 0) {
    return (
      <div className="flex items-center justify-center py-16 text-gray-500">
        <p>このカテゴリのスポットはありません</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-4 md:p-0">
      <p className="text-sm text-gray-500">
        {filteredSpots.length}件のスポット
      </p>
      {filteredSpots.map((spot, i) => (
        <SpotCard key={spot.placeId} spot={spot} index={i} />
      ))}
    </div>
  );
}
