'use client';

import { useApp } from '@/contexts/AppContext';
import { CATEGORY_LIST } from '@/lib/categories';
import { Category } from '@/types';

export default function CategoryFilter() {
  const { state, dispatch } = useApp();

  const handleSelect = (cat: Category | null) => {
    dispatch({ type: 'SET_CATEGORY_FILTER', category: cat });
  };

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 px-4 md:px-0 scrollbar-hide">
      <button
        onClick={() => handleSelect(null)}
        className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
          state.categoryFilter === null
            ? 'bg-primary text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        すべて
      </button>
      {CATEGORY_LIST.map(({ key, label, icon }) => (
        <button
          key={key}
          onClick={() => handleSelect(key)}
          className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
            state.categoryFilter === key
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {icon} {label}
        </button>
      ))}
    </div>
  );
}
