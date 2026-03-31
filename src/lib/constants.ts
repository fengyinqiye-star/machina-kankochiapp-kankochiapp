export const DEFAULT_CENTER = {
  lat: Number(process.env.NEXT_PUBLIC_DEFAULT_LAT) || 36.2048,
  lng: Number(process.env.NEXT_PUBLIC_DEFAULT_LNG) || 138.2529,
};

export const DEFAULT_ZOOM = Number(process.env.NEXT_PUBLIC_DEFAULT_ZOOM) || 5;

export const MAX_ROUTE_SPOTS = Number(process.env.NEXT_PUBLIC_MAX_ROUTE_SPOTS) || 5;

export const PLACES_SEARCH_RADIUS = 5000;

export const MAP_ID = 'kankochiapp-map';
