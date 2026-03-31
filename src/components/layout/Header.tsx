'use client';

import { useApp } from '@/contexts/AppContext';

export default function Header() {
  const { state, dispatch } = useApp();

  return (
    <header className="sticky top-0 z-50 bg-primary text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-3">
        {state.selectedPlace && (
          <button
            onClick={() => dispatch({ type: 'RESET' })}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="検索画面に戻る"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5" />
              <path d="m12 19-7-7 7-7" />
            </svg>
          </button>
        )}
        <h1 className="text-lg font-bold tracking-wide">
          {state.selectedPlace
            ? state.selectedPlace.name
            : 'おすすめ観光スポット'}
        </h1>
      </div>
    </header>
  );
}
