'use client';

import { useEffect, useMemo } from 'react';
import { Map, useMap } from '@vis.gl/react-google-maps';
import { useApp } from '@/contexts/AppContext';
import { DEFAULT_CENTER, DEFAULT_ZOOM } from '@/lib/constants';
import SpotMarker from './SpotMarker';
import RoutePolyline from './RoutePolyline';

function MapBoundsUpdater() {
  const map = useMap();
  const { state } = useApp();

  useEffect(() => {
    if (!map) return;

    const spotsToFit = state.spots.length > 0 ? state.spots : [];
    if (spotsToFit.length === 0) {
      if (state.selectedPlace && state.selectedPlace.lat !== 0) {
        map.panTo({ lat: state.selectedPlace.lat, lng: state.selectedPlace.lng });
        map.setZoom(13);
      }
      return;
    }

    const bounds = new google.maps.LatLngBounds();
    spotsToFit.forEach((s) => bounds.extend({ lat: s.lat, lng: s.lng }));
    map.fitBounds(bounds, { top: 50, right: 50, bottom: 50, left: 50 });
  }, [map, state.spots, state.selectedPlace]);

  return null;
}

export default function MapView() {
  const { state } = useApp();

  const selectedIds = useMemo(
    () => new Set(state.selectedSpots.map((s) => s.placeId)),
    [state.selectedSpots]
  );

  return (
    <div className="h-[50vh] md:h-full w-full relative">
      <Map
        defaultCenter={DEFAULT_CENTER}
        defaultZoom={DEFAULT_ZOOM}
        gestureHandling="cooperative"
        disableDefaultUI={false}
        mapId="kankochiapp-map"
        className="w-full h-full"
      >
        <MapBoundsUpdater />

        {state.spots.map((spot) => {
          const isSelected = selectedIds.has(spot.placeId);
          const selectionIndex = state.selectedSpots.findIndex(
            (s) => s.placeId === spot.placeId
          );
          return (
            <SpotMarker
              key={spot.placeId}
              spot={spot}
              isSelected={isSelected}
              selectionIndex={selectionIndex}
            />
          );
        })}

        {state.routeResult && state.routeResult.overviewPolyline && (
          <RoutePolyline encodedPolyline={state.routeResult.overviewPolyline} />
        )}
      </Map>
    </div>
  );
}
