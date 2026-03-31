'use client';

import { useApp } from '@/contexts/AppContext';
import { useDirections } from '@/hooks/useDirections';

export default function RouteActions() {
  const { state, dispatch } = useApp();
  const { fetchRoute } = useDirections();

  if (state.selectedSpots.length === 0) return null;

  return (
    <div className="flex gap-2 mt-3">
      {state.selectedSpots.length >= 2 && (
        <button
          onClick={fetchRoute}
          disabled={state.routeLoading}
          className="flex-1 px-4 py-2.5 bg-accent text-white rounded-lg text-sm font-semibold hover:bg-orange-500 transition-colors disabled:opacity-50"
        >
          {state.routeLoading ? '計算中...' : 'ルートを表示'}
        </button>
      )}
      <button
        onClick={() => dispatch({ type: 'CLEAR_ROUTE' })}
        className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
      >
        クリア
      </button>
    </div>
  );
}
