'use client';

import { useApp } from '@/contexts/AppContext';

export default function MobileTabBar() {
  const { state, dispatch } = useApp();

  return (
    <div className="md:hidden flex border-b border-gray-200 bg-white">
      <button
        onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', tab: 'list' })}
        className={`flex-1 py-3 text-sm font-semibold text-center transition-colors ${
          state.activeTab === 'list'
            ? 'text-primary border-b-2 border-primary'
            : 'text-gray-500'
        }`}
      >
        スポット一覧
      </button>
      <button
        onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', tab: 'map' })}
        className={`flex-1 py-3 text-sm font-semibold text-center transition-colors ${
          state.activeTab === 'map'
            ? 'text-primary border-b-2 border-primary'
            : 'text-gray-500'
        }`}
      >
        地図を見る
      </button>
    </div>
  );
}
