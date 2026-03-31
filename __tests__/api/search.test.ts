/**
 * @jest-environment node
 */

/**
 * Tests for /api/places/search route
 */

const originalEnv = process.env;
let originalFetch: typeof global.fetch;

beforeEach(() => {
  jest.resetModules();
  originalFetch = global.fetch;
  process.env = { ...originalEnv, GOOGLE_MAPS_SERVER_API_KEY: 'test-api-key' };
});

afterEach(() => {
  global.fetch = originalFetch;
  process.env = originalEnv;
});

function createMockRequest(body: Record<string, unknown>) {
  return new Request('http://localhost/api/places/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('/api/places/search', () => {
  it('returns 500 when API key is not configured', async () => {
    process.env = { ...originalEnv, GOOGLE_MAPS_SERVER_API_KEY: '' };
    jest.resetModules();
    const { POST } = await import('@/app/api/places/search/route');
    const req = createMockRequest({ lat: 35.6762, lng: 139.6503 });
    const res = await POST(req as any);
    expect(res.status).toBe(500);
  });

  it('returns 400 when lat/lng are missing', async () => {
    const { POST } = await import('@/app/api/places/search/route');
    const req = createMockRequest({ radius: 5000 });
    const res = await POST(req as any);
    expect(res.status).toBe(400);
  });

  it('returns spots for valid coordinates', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          status: 'OK',
          results: [
            {
              place_id: 'spot-001',
              name: 'Sensoji Temple',
              geometry: { location: { lat: 35.7148, lng: 139.7967 } },
              rating: 4.5,
              user_ratings_total: 12000,
              types: ['tourist_attraction', 'place_of_worship'],
              vicinity: 'Asakusa, Taito',
              photos: [{ photo_reference: 'ref-001' }],
              opening_hours: { open_now: true },
            },
          ],
          next_page_token: null,
        }),
    }) as any;

    const { POST } = await import('@/app/api/places/search/route');
    const req = createMockRequest({ lat: 35.6762, lng: 139.6503, radius: 5000 });
    const res = await POST(req as any);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.spots).toHaveLength(1);
    expect(data.spots[0].name).toBe('Sensoji Temple');
    expect(data.spots[0].lat).toBe(35.7148);
    expect(data.spots[0].lng).toBe(139.7967);
    expect(data.spots[0].category).toBeDefined();
  });

  it('caps radius at 10000', async () => {
    const mockFn = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ status: 'OK', results: [] }),
    });
    global.fetch = mockFn as any;

    const { POST } = await import('@/app/api/places/search/route');
    const req = createMockRequest({ lat: 35.0, lng: 139.0, radius: 50000 });
    await POST(req as any);

    const calledUrl = mockFn.mock.calls[0][0];
    expect(calledUrl).toContain('radius=10000');
  });

  it('returns 502 when Google API fails', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      status: 500,
    }) as any;

    const { POST } = await import('@/app/api/places/search/route');
    const req = createMockRequest({ lat: 35.0, lng: 139.0 });
    const res = await POST(req as any);
    expect(res.status).toBe(502);
  });
});
