export interface PlaceResult {
  placeId: string;
  name: string;
  lat: number;
  lng: number;
  formattedAddress?: string;
}

export type Category =
  | 'shrine_temple'
  | 'nature'
  | 'gourmet'
  | 'experience'
  | 'shopping'
  | 'history'
  | 'scenery';

export interface Spot {
  placeId: string;
  name: string;
  lat: number;
  lng: number;
  rating: number;
  userRatingsTotal: number;
  types: string[];
  category: Category;
  vicinity: string;
  photoReference: string | null;
  openNow?: boolean;
}

export interface RouteLeg {
  distance: { text: string; value: number };
  duration: { text: string; value: number };
  startAddress: string;
  endAddress: string;
}

export interface RouteResult {
  legs: RouteLeg[];
  overviewPolyline: string;
  totalDistance: { text: string; value: number };
  totalDuration: { text: string; value: number };
}

export interface AutocompletePrediction {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
}
