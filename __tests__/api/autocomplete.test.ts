/**
 * @jest-environment node
 */

/**
 * Tests for /api/places/autocomplete route
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
  return new Request('http://localhost/api/places/autocomplete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('/api/places/autocomplete', () => {
  it('returns 500 when API key is not configured', async () => {
    process.env = { ...originalEnv, GOOGLE_MAPS_SERVER_API_KEY: '' };
    jest.resetModules();
    const { POST } = await import('@/app/api/places/autocomplete/route');
    const req = createMockRequest({ input: 'Tokyo' });
    const res = await POST(req as any);
    expect(res.status).toBe(500);
  });

  it('returns 400 when input is missing', async () => {
    const { POST } = await import('@/app/api/places/autocomplete/route');
    const req = createMockRequest({});
    const res = await POST(req as any);
    expect(res.status).toBe(400);
  });

  it('returns 400 when input is empty', async () => {
    const { POST } = await import('@/app/api/places/autocomplete/route');
    const req = createMockRequest({ input: '  ' });
    const res = await POST(req as any);
    expect(res.status).toBe(400);
  });

  it('returns predictions for valid input', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          status: 'OK',
          predictions: [
            {
              place_id: 'ChIJ51cu8IcbXWARiRtXIothAS4',
              description: 'Tokyo, Japan',
              structured_formatting: {
                main_text: 'Tokyo',
                secondary_text: 'Japan',
              },
            },
          ],
        }),
    }) as any;

    const { POST } = await import('@/app/api/places/autocomplete/route');
    const req = createMockRequest({ input: 'Tokyo', language: 'ja', components: 'country:jp' });
    const res = await POST(req as any);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.predictions).toHaveLength(1);
    expect(data.predictions[0].placeId).toBe('ChIJ51cu8IcbXWARiRtXIothAS4');
    expect(data.predictions[0].mainText).toBe('Tokyo');
    expect(data.predictions[0].secondaryText).toBe('Japan');
  });

  it('returns empty predictions for ZERO_RESULTS', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          status: 'ZERO_RESULTS',
          predictions: [],
        }),
    }) as any;

    const { POST } = await import('@/app/api/places/autocomplete/route');
    const req = createMockRequest({ input: 'xyznonexistent' });
    const res = await POST(req as any);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.predictions).toHaveLength(0);
  });

  it('returns 502 when Google API returns non-OK status', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          status: 'REQUEST_DENIED',
          error_message: 'API key invalid',
        }),
    }) as any;

    const { POST } = await import('@/app/api/places/autocomplete/route');
    const req = createMockRequest({ input: 'Tokyo' });
    const res = await POST(req as any);
    expect(res.status).toBe(502);
  });
});
