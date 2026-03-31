/**
 * @jest-environment node
 */

/**
 * Tests for /api/places/geocode route
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
  return new Request('http://localhost/api/places/geocode', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('/api/places/geocode', () => {
  it('returns 500 when API key is not configured', async () => {
    process.env = { ...originalEnv, GOOGLE_MAPS_SERVER_API_KEY: '' };
    jest.resetModules();
    const { POST } = await import('@/app/api/places/geocode/route');
    const req = createMockRequest({ placeId: 'test-place-id' });
    const res = await POST(req as any);
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toBe('Server configuration error');
  });

  it('returns 400 when placeId is missing', async () => {
    const { POST } = await import('@/app/api/places/geocode/route');
    const req = createMockRequest({});
    const res = await POST(req as any);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.message).toBe('placeId is required');
  });

  it('returns 400 when placeId is empty string', async () => {
    const { POST } = await import('@/app/api/places/geocode/route');
    const req = createMockRequest({ placeId: '   ' });
    const res = await POST(req as any);
    expect(res.status).toBe(400);
  });

  it('returns lat/lng for valid placeId', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          status: 'OK',
          results: [
            {
              geometry: { location: { lat: 35.6762, lng: 139.6503 } },
              formatted_address: 'Tokyo, Japan',
            },
          ],
        }),
    }) as any;

    const { POST } = await import('@/app/api/places/geocode/route');
    const req = createMockRequest({ placeId: 'ChIJ51cu8IcbXWARiRtXIothAS4' });
    const res = await POST(req as any);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.lat).toBe(35.6762);
    expect(data.lng).toBe(139.6503);
    expect(data.formattedAddress).toBe('Tokyo, Japan');
  });

  it('returns 404 when geocode returns no results', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          status: 'ZERO_RESULTS',
          results: [],
        }),
    }) as any;

    const { POST } = await import('@/app/api/places/geocode/route');
    const req = createMockRequest({ placeId: 'invalid-place-id' });
    const res = await POST(req as any);
    expect(res.status).toBe(404);
  });

  it('returns 502 when Google API returns error HTTP status', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      status: 503,
    }) as any;

    const { POST } = await import('@/app/api/places/geocode/route');
    const req = createMockRequest({ placeId: 'some-place-id' });
    const res = await POST(req as any);
    expect(res.status).toBe(502);
  });

  it('returns 500 on unexpected errors', async () => {
    global.fetch = jest.fn().mockRejectedValueOnce(new Error('Network error')) as any;

    const { POST } = await import('@/app/api/places/geocode/route');
    const req = createMockRequest({ placeId: 'some-place-id' });
    const res = await POST(req as any);
    expect(res.status).toBe(500);
  });
});
