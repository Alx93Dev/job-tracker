import { ApiError } from './api-error';
import { API_BASE_PATH } from './routes';
import { redirectToLogin } from './session-expiry';

const NO_CONTENT_STATUS = 204;
const UNAUTHORIZED_STATUS = 401;
const AUTH_PATH_PREFIX = '/auth/';
const REFRESH_PATH = '/auth/refresh';

let pendingRefresh: Promise<boolean> | null = null;

/**
 * Several requests can fail with 401 at the same time when the access token expires.
 * They all wait for one shared refresh call instead of each rotating the refresh token,
 * which the API would treat as token reuse.
 */
function refreshSessionOnce(): Promise<boolean> {
  pendingRefresh ??= fetch(`${API_BASE_PATH}${REFRESH_PATH}`, { method: 'POST' })
    .then((response) => response.ok)
    .finally(() => {
      pendingRefresh = null;
    });
  return pendingRefresh;
}

function sendRequest(path: string, init?: RequestInit): Promise<Response> {
  return fetch(`${API_BASE_PATH}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
}

async function toApiError(response: Response): Promise<ApiError> {
  const errorBody = (await response.json().catch(() => null)) as {
    message?: string | string[];
  } | null;
  return new ApiError(response.status, errorBody?.message ?? response.statusText);
}

export async function apiRequest<ResponseBody>(
  path: string,
  init?: RequestInit,
): Promise<ResponseBody> {
  let response = await sendRequest(path, init);

  const canRefreshSession = !path.startsWith(AUTH_PATH_PREFIX);
  if (response.status === UNAUTHORIZED_STATUS && canRefreshSession) {
    const isSessionRefreshed = await refreshSessionOnce();
    if (!isSessionRefreshed) {
      redirectToLogin();
      throw await toApiError(response);
    }
    response = await sendRequest(path, init);
  }

  if (!response.ok) {
    throw await toApiError(response);
  }

  if (response.status === NO_CONTENT_STATUS) {
    return undefined as ResponseBody;
  }

  return (await response.json()) as ResponseBody;
}
