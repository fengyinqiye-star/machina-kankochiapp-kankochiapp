import React from 'react';
import '@testing-library/jest-dom';
import { render } from '@testing-library/react';

// Mock @vis.gl/react-google-maps
jest.mock('@vis.gl/react-google-maps', () => ({
  Map: ({ children, className }: { children: React.ReactNode; className: string }) => (
    <div data-testid="google-map" className={className}>
      {children}
    </div>
  ),
  useMap: () => null,
  AdvancedMarker: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="marker">{children}</div>
  ),
  InfoWindow: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="info-window">{children}</div>
  ),
}));

import { AppProvider } from '@/contexts/AppContext';
import MapView from '@/components/map/MapView';

describe('MapView', () => {
  it('renders the map container', () => {
    const { getByTestId } = render(
      <AppProvider>
        <MapView />
      </AppProvider>
    );
    expect(getByTestId('google-map')).toBeInTheDocument();
  });

  it('renders with correct dimensions class', () => {
    const { container } = render(
      <AppProvider>
        <MapView />
      </AppProvider>
    );
    const mapWrapper = container.firstChild as HTMLElement;
    expect(mapWrapper.className).toContain('h-[50vh]');
    expect(mapWrapper.className).toContain('w-full');
  });
});
