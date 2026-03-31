import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, act } from '@testing-library/react';
import { AppProvider, useApp } from '@/contexts/AppContext';
import SpotList from '@/components/spots/SpotList';
import type { Spot } from '@/types';

const mockSpots: Spot[] = [
  {
    placeId: 'spot-001',
    name: 'Sensoji Temple',
    lat: 35.7148,
    lng: 139.7967,
    rating: 4.5,
    userRatingsTotal: 12000,
    types: ['tourist_attraction', 'place_of_worship'],
    category: 'shrine_temple',
    vicinity: 'Asakusa, Taito',
    photoReference: null,
  },
  {
    placeId: 'spot-002',
    name: 'Tokyo Tower',
    lat: 35.6586,
    lng: 139.7454,
    rating: 4.3,
    userRatingsTotal: 8000,
    types: ['tourist_attraction'],
    category: 'scenery',
    vicinity: 'Minato, Tokyo',
    photoReference: null,
  },
];

// Helper to set spots into state
function SpotListWithState({ spots, loading, filter }: { spots: Spot[]; loading?: boolean; filter?: string | null }) {
  return (
    <AppProvider>
      <StateInjector spots={spots} loading={loading} filter={filter} />
      <SpotList />
    </AppProvider>
  );
}

function StateInjector({ spots, loading, filter }: { spots: Spot[]; loading?: boolean; filter?: string | null }) {
  const { dispatch } = useApp();
  React.useEffect(() => {
    if (loading) {
      dispatch({ type: 'SET_SPOTS_LOADING', loading: true });
    } else {
      dispatch({ type: 'SET_SPOTS', spots });
    }
    if (filter) {
      dispatch({ type: 'SET_CATEGORY_FILTER', category: filter as Spot['category'] });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

describe('SpotList', () => {
  it('shows loading state', () => {
    render(<SpotListWithState spots={[]} loading={true} />);
    expect(screen.getByText('スポットを検索中...')).toBeInTheDocument();
  });

  it('shows empty state when no spots', () => {
    render(<SpotListWithState spots={[]} />);
    expect(screen.getByText('スポットが見つかりませんでした')).toBeInTheDocument();
  });

  it('renders spot count and cards', () => {
    render(<SpotListWithState spots={mockSpots} />);
    expect(screen.getByText('2件のスポット')).toBeInTheDocument();
    expect(screen.getByText('Sensoji Temple')).toBeInTheDocument();
    expect(screen.getByText('Tokyo Tower')).toBeInTheDocument();
  });

  it('filters spots by category', () => {
    render(<SpotListWithState spots={mockSpots} filter="shrine_temple" />);
    expect(screen.getByText('1件のスポット')).toBeInTheDocument();
    expect(screen.getByText('Sensoji Temple')).toBeInTheDocument();
    expect(screen.queryByText('Tokyo Tower')).not.toBeInTheDocument();
  });

  it('shows empty filter message when no matches', () => {
    render(<SpotListWithState spots={mockSpots} filter="shopping" />);
    expect(screen.getByText('このカテゴリのスポットはありません')).toBeInTheDocument();
  });
});
