'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Spot } from '@/types';
import { CATEGORIES } from '@/lib/categories';

interface RouteSortableItemProps {
  spot: Spot;
  index: number;
}

export default function RouteSortableItem({ spot, index }: RouteSortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: spot.placeId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const catDef = CATEGORIES[spot.category];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200"
    >
      <button
        {...attributes}
        {...listeners}
        className="flex-shrink-0 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
        aria-label="ドラッグして並び替え"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="9" cy="5" r="1" />
          <circle cx="9" cy="12" r="1" />
          <circle cx="9" cy="19" r="1" />
          <circle cx="15" cy="5" r="1" />
          <circle cx="15" cy="12" r="1" />
          <circle cx="15" cy="19" r="1" />
        </svg>
      </button>

      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent text-white text-xs font-bold flex items-center justify-center">
        {index + 1}
      </span>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{spot.name}</p>
        <p className="text-xs text-gray-500">
          {catDef.icon} {catDef.label}
        </p>
      </div>
    </div>
  );
}
