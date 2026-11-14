import { environment } from './environment';
import { ApiError } from './api-error';

const NO_CONTENT_STATUS = 204;

export async function apiRequest<ResponseBody>(
  path: string,
  init?: RequestInit,
): Promise<ResponseBody> {
  const response = await fetch(`${environment.apiBaseUrl}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as {
      message?: string | string[];
    } | null;
    throw new ApiError(response.status, errorBody?.message ?? response.statusText);
  }

  if (response.status === NO_CONTENT_STATUS) {
    return undefined as ResponseBody;
  }

  return (await response.json()) as ResponseBody;
}
