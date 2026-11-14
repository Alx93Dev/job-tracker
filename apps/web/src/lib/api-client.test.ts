import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { apiRequest } from './api-client';
import { ApiError } from './api-error';
import { redirectToLogin } from './session-expiry';

vi.mock('./session-expiry', () => ({ redirectToLogin: vi.fn() }));

const fetchMock = vi.fn<typeof fetch>();

function jsonResponse(status: number, body?: unknown): Response {
  return new Response(body === undefined ? null : JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function requestedPaths(): string[] {
  return fetchMock.mock.calls.map(([url]) => String(url));
}

describe('apiRequest', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.mocked(redirectToLogin).mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => vi.unstubAllGlobals());

  it('refreshes the session once and retries the request after a 401', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse(401, { message: 'expired' }))
      .mockResolvedValueOnce(jsonResponse(200, { id: 'user-1' }))
      .mockResolvedValueOnce(jsonResponse(200, [{ id: 'application-1' }]));

    await expect(apiRequest('/job-applications')).resolves.toEqual([{ id: 'application-1' }]);
    expect(requestedPaths()).toEqual([
      '/api/job-applications',
      '/api/auth/refresh',
      '/api/job-applications',
    ]);
  });

  it('shares a single refresh between concurrent requests that get a 401', async () => {
    fetchMock.mockImplementation((input) => {
      const url = String(input);
      if (url.endsWith('/auth/refresh')) return Promise.resolve(jsonResponse(200, {}));
      const isRetry = fetchMock.mock.calls.filter(([calledUrl]) => calledUrl === input).length > 1;
      return Promise.resolve(isRetry ? jsonResponse(200, []) : jsonResponse(401));
    });

    await Promise.all([apiRequest('/job-applications'), apiRequest('/job-applications/1')]);

    expect(requestedPaths().filter((path) => path.endsWith('/auth/refresh'))).toHaveLength(1);
  });

  it('sends the user to the login page when the refresh fails', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse(401, { message: 'expired' }))
      .mockResolvedValueOnce(jsonResponse(401, { message: 'expired' }));

    await expect(apiRequest('/job-applications')).rejects.toBeInstanceOf(ApiError);
    expect(redirectToLogin).toHaveBeenCalledOnce();
  });

  it('does not try to refresh when an auth endpoint answers 401', async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(401, { message: 'Invalid email or password' }));

    await expect(apiRequest('/auth/login', { method: 'POST' })).rejects.toThrow(
      'Invalid email or password',
    );
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(redirectToLogin).not.toHaveBeenCalled();
  });

  it('joins validation messages returned as an array', async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(400, { message: ['email must be an email', 'password is too short'] }),
    );

    await expect(apiRequest('/auth/register', { method: 'POST' })).rejects.toThrow(
      'email must be an email. password is too short',
    );
  });
});
