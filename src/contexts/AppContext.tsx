'use client';

import React, {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  Dispatch,
} from 'react';
import { Spot, PlaceResult, RouteResult, Category } from '@/types';
import { MAX_ROUTE_SPOTS } from '@/lib/constants';

export interface AppState {
  searchQuery: string;
  selectedPlace: PlaceResult | null;
  spots: Spot[];
  spotsLoading: boolean;
  categoryFilter: Category | null;
  selectedSpots: Spot[];
  routeResult: RouteResult | null;
  routeLoading: boolean;
  activeTab: 'list' | 'map';
  highlightedSpotId: string | null;
}

export type AppAction =
  | { type: 'SET_SEARCH_QUERY'; query: string }
  | { type: 'SELECT_PLACE'; place: PlaceResult }
  | { type: 'SET_SPOTS'; spots: Spot[] }
  | { type: 'SET_SPOTS_LOADING'; loading: boolean }
  | { type: 'SET_CATEGORY_FILTER'; category: Category | null }
  | { type: 'TOGGLE_SPOT_SELECTION'; spot: Spot }
  | { type: 'REORDER_SPOTS'; from: number; to: number }
  | { type: 'CLEAR_ROUTE' }
  | { type: 'SET_ROUTE_RESULT'; result: RouteResult }
  | { type: 'SET_ROUTE_LOADING'; loading: boolean }
  | { type: 'SET_ACTIVE_TAB'; tab: 'list' | 'map' }
  | { type: 'HIGHLIGHT_SPOT'; spotId: string | null }
  | { type: 'RESET' };

const initialState: AppState = {
  searchQuery: '',
  selectedPlace: null,
  spots: [],
  spotsLoading: false,
  categoryFilter: null,
  selectedSpots: [],
  routeResult: null,
  routeLoading: false,
  activeTab: 'list',
  highlightedSpotId: null,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.query };

    case 'SELECT_PLACE':
      return {
        ...state,
        selectedPlace: action.place,
        spots: [],
        selectedSpots: [],
        routeResult: null,
        categoryFilter: null,
      };

    case 'SET_SPOTS':
      return { ...state, spots: action.spots, spotsLoading: false };

    case 'SET_SPOTS_LOADING':
      return { ...state, spotsLoading: action.loading };

    case 'SET_CATEGORY_FILTER':
      return { ...state, categoryFilter: action.category };

    case 'TOGGLE_SPOT_SELECTION': {
      const exists = state.selectedSpots.find(
        (s) => s.placeId === action.spot.placeId
      );
      if (exists) {
        return {
          ...state,
          selectedSpots: state.selectedSpots.filter(
            (s) => s.placeId !== action.spot.placeId
          ),
          routeResult: null,
        };
      }
      if (state.selectedSpots.length >= MAX_ROUTE_SPOTS) {
        return state;
      }
      return {
        ...state,
        selectedSpots: [...state.selectedSpots, action.spot],
        routeResult: null,
      };
    }

    case 'REORDER_SPOTS': {
      const items = [...state.selectedSpots];
      const [moved] = items.splice(action.from, 1);
      items.splice(action.to, 0, moved);
      return { ...state, selectedSpots: items, routeResult: null };
    }

    case 'CLEAR_ROUTE':
      return { ...state, selectedSpots: [], routeResult: null };

    case 'SET_ROUTE_RESULT':
      return { ...state, routeResult: action.result, routeLoading: false };

    case 'SET_ROUTE_LOADING':
      return { ...state, routeLoading: action.loading };

    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.tab };

    case 'HIGHLIGHT_SPOT':
      return { ...state, highlightedSpotId: action.spotId };

    case 'RESET':
      return initialState;

    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: Dispatch<AppAction>;
} | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
