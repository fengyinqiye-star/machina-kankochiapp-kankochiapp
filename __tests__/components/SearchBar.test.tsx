import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppProvider } from '@/contexts/AppContext';
import SearchBar from '@/components/search/SearchBar';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

function renderSearchBar() {
  return render(
    <AppProvider>
      <SearchBar />
    </AppProvider>
  );
}

beforeEach(() => {
  mockFetch.mockReset();
});

describe('SearchBar', () => {
  it('renders the search input', () => {
    renderSearchBar();
    expect(screen.getByPlaceholderText(/エリア名を入力/)).toBeInTheDocument();
  });

  it('renders with aria-label for accessibility', () => {
    renderSearchBar();
    expect(screen.getByLabelText('エリア検索')).toBeInTheDocument();
  });

  it('shows clear button when input has text', async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ predictions: [] }),
    });

    renderSearchBar();
    const input = screen.getByPlaceholderText(/エリア名を入力/);
    await user.type(input, 'Tokyo');

    expect(screen.getByLabelText('検索をクリア')).toBeInTheDocument();
  });

  it('calls autocomplete API after typing', async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          predictions: [
            {
              placeId: 'ChIJ51cu8IcbXWARiRtXIothAS4',
              description: 'Tokyo, Japan',
              mainText: 'Tokyo',
              secondaryText: 'Japan',
            },
          ],
        }),
    });

    renderSearchBar();
    const input = screen.getByPlaceholderText(/エリア名を入力/);
    await user.type(input, 'Tokyo');

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/places/autocomplete', expect.objectContaining({
        method: 'POST',
      }));
    }, { timeout: 2000 });
  });

  it('shows suggestions dropdown when predictions are returned', async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          predictions: [
            {
              placeId: 'ChIJ51cu8IcbXWARiRtXIothAS4',
              description: 'Tokyo, Japan',
              mainText: 'Tokyo',
              secondaryText: 'Japan',
            },
          ],
        }),
    });

    renderSearchBar();
    const input = screen.getByPlaceholderText(/エリア名を入力/);
    await user.type(input, 'Tokyo');

    await waitFor(() => {
      // The suggestion list should appear with a button containing the main text
      const suggestionButton = screen.getByRole('button', { name: /Tokyo/ });
      expect(suggestionButton).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('calls geocode API when prediction is selected', async () => {
    const user = userEvent.setup();

    mockFetch.mockImplementation((url: string) => {
      if (url === '/api/places/autocomplete') {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              predictions: [
                {
                  placeId: 'ChIJ51cu8IcbXWARiRtXIothAS4',
                  description: 'Tokyo, Japan',
                  mainText: 'Tokyo',
                  secondaryText: 'Japan',
                },
              ],
            }),
        });
      }
      if (url === '/api/places/geocode') {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              lat: 35.6762,
              lng: 139.6503,
              formattedAddress: 'Tokyo, Japan',
            }),
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    renderSearchBar();
    const input = screen.getByPlaceholderText(/エリア名を入力/);
    await user.type(input, 'Tokyo');

    let suggestionButton: HTMLElement;
    await waitFor(() => {
      suggestionButton = screen.getByRole('button', { name: /Tokyo/ });
      expect(suggestionButton).toBeInTheDocument();
    }, { timeout: 2000 });

    // Click on the suggestion
    await user.click(suggestionButton!);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/places/geocode', expect.objectContaining({
        method: 'POST',
      }));
    });
  });

  it('clears input when clear button is clicked', async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ predictions: [] }),
    });

    renderSearchBar();
    const input = screen.getByPlaceholderText(/エリア名を入力/) as HTMLInputElement;
    await user.type(input, 'Tokyo');

    const clearButton = screen.getByLabelText('検索をクリア');
    await user.click(clearButton);

    expect(input.value).toBe('');
  });
});
