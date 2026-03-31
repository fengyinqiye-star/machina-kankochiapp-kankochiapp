'use client';

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useApp } from '@/contexts/AppContext';
import RouteSortableItem from './RouteSortableItem';
import RouteActions from './RouteActions';

export default function RoutePanel() {
  const { state, dispatch } = useApp();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  if (state.selectedSpots.length === 0) return null;

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = state.selectedSpots.findIndex(
      (s) => s.placeId === active.id
    );
    const newIndex = state.selectedSpots.findIndex(
      (s) => s.placeId === over.id
    );

    if (oldIndex !== -1 && newIndex !== -1) {
      dispatch({ type: 'REORDER_SPOTS', from: oldIndex, to: newIndex });
    }
  };

  return (
    <div className="bg-ivory rounded-lg p-4 border border-gray-200">
      <h3 className="text-sm font-bold text-primary mb-3">
        周遊ルート ({state.selectedSpots.length}件)
      </h3>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={state.selectedSpots.map((s) => s.placeId)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {state.selectedSpots.map((spot, i) => (
              <RouteSortableItem key={spot.placeId} spot={spot} index={i} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {state.routeResult && (
        <div className="mt-3 p-3 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary"
              >
                <path d="M18 6 6 18" />
                <path d="M8 6h10v10" />
              </svg>
              <span className="font-medium">
                {state.routeResult.totalDistance.text}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span className="font-medium">
                {state.routeResult.totalDuration.text}
              </span>
            </div>
          </div>
        </div>
      )}

      <RouteActions />
    </div>
  );
}
