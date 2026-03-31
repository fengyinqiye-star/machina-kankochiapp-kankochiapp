import React from 'react';
import '@testing-library/jest-dom';
import { renderHook, act } from '@testing-library/react';
import { AppProvider, useApp } from '@/contexts/AppContext';
import type { Spot, PlaceResult } from '@/types';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AppProvider>{children}</AppProvider>
);

const mockPlace: PlaceResult = {
  placeId: 'place-001',
  name: 'Tokyo Station',
  lat: 35.6812,
  lng: 139.7671,
  formattedAddress: 'Tokyo, Japan',
};

const mockSpot: Spot = {
  placeId: 'spot-001',
  name: 'Sensoji Temple',
  lat: 35.7148,
  lng: 139.7967,
  rating: 4.5,
  userRatingsTotal: 12000,
  types: ['tourist_attraction', 'place_of_worship'],
  category: 'shrine_temple',
  vicinity: 'Asakusa, Taito',
  photoReference: 'photo-ref-001',
};

const mockSpot2: Spot = {
  placeId: 'spot-002',
  name: 'Tokyo Tower',
  lat: 35.6586,
  lng: 139.7454,
  rating: 4.3,
  userRatingsTotal: 8000,
  types: ['tourist_attraction'],
  category: 'scenery',
  vicinity: 'Minato, Tokyo',
  photoReference: 'photo-ref-002',
};

describe('AppContext reducer', () => {
  it('provides initial state', () => {
    const { result } = renderHook(() => useApp(), { wrapper });
    expect(result.current.state.searchQuery).toBe('');
    expect(result.current.state.selectedPlace).toBeNull();
    expect(result.current.state.spots).toEqual([]);
    expect(result.current.state.spotsLoading).toBe(false);
    expect(result.current.state.categoryFilter).toBeNull();
    expect(result.current.state.selectedSpots).toEqual([]);
    expect(result.current.state.routeResult).toBeNull();
    expect(result.current.state.activeTab).toBe('list');
    expect(result.current.state.highlightedSpotId).toBeNull();
  });

  it('SET_SEARCH_QUERY updates search query', () => {
    const { result } = renderHook(() => useApp(), { wrapper });
    act(() => {
      result.current.dispatch({ type: 'SET_SEARCH_QUERY', query: 'Tokyo' });
    });
    expect(result.current.state.searchQuery).toBe('Tokyo');
  });

  it('SELECT_PLACE sets place and resets spots/route', () => {
    const { result } = renderHook(() => useApp(), { wrapper });

    // First add some spots
    act(() => {
      result.current.dispatch({ type: 'SET_SPOTS', spots: [mockSpot] });
    });
    expect(result.current.state.spots).toHaveLength(1);

    // Then select a place - should reset spots
    act(() => {
      result.current.dispatch({ type: 'SELECT_PLACE', place: mockPlace });
    });
    expect(result.current.state.selectedPlace).toEqual(mockPlace);
    expect(result.current.state.spots).toEqual([]);
    expect(result.current.state.selectedSpots).toEqual([]);
    expect(result.current.state.routeResult).toBeNull();
    expect(result.current.state.categoryFilter).toBeNull();
  });

  it('SET_SPOTS updates spots and clears loading', () => {
    const { result } = renderHook(() => useApp(), { wrapper });
    act(() => {
      result.current.dispatch({ type: 'SET_SPOTS_LOADING', loading: true });
    });
    expect(result.current.state.spotsLoading).toBe(true);

    act(() => {
      result.current.dispatch({ type: 'SET_SPOTS', spots: [mockSpot, mockSpot2] });
    });
    expect(result.current.state.spots).toHaveLength(2);
    expect(result.current.state.spotsLoading).toBe(false);
  });

  it('SET_CATEGORY_FILTER updates filter', () => {
    const { result } = renderHook(() => useApp(), { wrapper });
    act(() => {
      result.current.dispatch({ type: 'SET_CATEGORY_FILTER', category: 'nature' });
    });
    expect(result.current.state.categoryFilter).toBe('nature');

    act(() => {
      result.current.dispatch({ type: 'SET_CATEGORY_FILTER', category: null });
    });
    expect(result.current.state.categoryFilter).toBeNull();
  });

  it('TOGGLE_SPOT_SELECTION adds and removes spots', () => {
    const { result } = renderHook(() => useApp(), { wrapper });

    // Add spot
    act(() => {
      result.current.dispatch({ type: 'TOGGLE_SPOT_SELECTION', spot: mockSpot });
    });
    expect(result.current.state.selectedSpots).toHaveLength(1);
    expect(result.current.state.selectedSpots[0].placeId).toBe('spot-001');

    // Remove same spot
    act(() => {
      result.current.dispatch({ type: 'TOGGLE_SPOT_SELECTION', spot: mockSpot });
    });
    expect(result.current.state.selectedSpots).toHaveLength(0);
  });

  it('TOGGLE_SPOT_SELECTION respects MAX_ROUTE_SPOTS limit', () => {
    const { result } = renderHook(() => useApp(), { wrapper });

    // Add MAX_ROUTE_SPOTS (default 5) spots
    for (let i = 0; i < 5; i++) {
      act(() => {
        result.current.dispatch({
          type: 'TOGGLE_SPOT_SELECTION',
          spot: { ...mockSpot, placeId: `spot-${i}` },
        });
      });
    }
    expect(result.current.state.selectedSpots).toHaveLength(5);

    // Attempt to add a 6th - should be ignored
    act(() => {
      result.current.dispatch({
        type: 'TOGGLE_SPOT_SELECTION',
        spot: { ...mockSpot, placeId: 'spot-extra' },
      });
    });
    expect(result.current.state.selectedSpots).toHaveLength(5);
  });

  it('REORDER_SPOTS reorders selected spots', () => {
    const { result } = renderHook(() => useApp(), { wrapper });

    act(() => {
      result.current.dispatch({ type: 'TOGGLE_SPOT_SELECTION', spot: mockSpot });
    });
    act(() => {
      result.current.dispatch({ type: 'TOGGLE_SPOT_SELECTION', spot: mockSpot2 });
    });
    expect(result.current.state.selectedSpots[0].placeId).toBe('spot-001');

    act(() => {
      result.current.dispatch({ type: 'REORDER_SPOTS', from: 0, to: 1 });
    });
    expect(result.current.state.selectedSpots[0].placeId).toBe('spot-002');
    expect(result.current.state.selectedSpots[1].placeId).toBe('spot-001');
  });

  it('CLEAR_ROUTE clears selected spots and route result', () => {
    const { result } = renderHook(() => useApp(), { wrapper });

    act(() => {
      result.current.dispatch({ type: 'TOGGLE_SPOT_SELECTION', spot: mockSpot });
    });
    act(() => {
      result.current.dispatch({ type: 'CLEAR_ROUTE' });
    });
    expect(result.current.state.selectedSpots).toEqual([]);
    expect(result.current.state.routeResult).toBeNull();
  });

  it('SET_ACTIVE_TAB switches tab', () => {
    const { result } = renderHook(() => useApp(), { wrapper });
    act(() => {
      result.current.dispatch({ type: 'SET_ACTIVE_TAB', tab: 'map' });
    });
    expect(result.current.state.activeTab).toBe('map');
  });

  it('HIGHLIGHT_SPOT sets highlighted spot ID', () => {
    const { result } = renderHook(() => useApp(), { wrapper });
    act(() => {
      result.current.dispatch({ type: 'HIGHLIGHT_SPOT', spotId: 'spot-001' });
    });
    expect(result.current.state.highlightedSpotId).toBe('spot-001');

    act(() => {
      result.current.dispatch({ type: 'HIGHLIGHT_SPOT', spotId: null });
    });
    expect(result.current.state.highlightedSpotId).toBeNull();
  });

  it('RESET restores initial state', () => {
    const { result } = renderHook(() => useApp(), { wrapper });

    act(() => {
      result.current.dispatch({ type: 'SET_SEARCH_QUERY', query: 'test' });
      result.current.dispatch({ type: 'SELECT_PLACE', place: mockPlace });
    });

    act(() => {
      result.current.dispatch({ type: 'RESET' });
    });

    expect(result.current.state.searchQuery).toBe('');
    expect(result.current.state.selectedPlace).toBeNull();
  });

  it('throws error when useApp is used outside AppProvider', () => {
    // Suppress console.error for expected error
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => {
      renderHook(() => useApp());
    }).toThrow('useApp must be used within AppProvider');
    consoleSpy.mockRestore();
  });
});
