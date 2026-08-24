import { fetch } from 'expo/fetch';

import { getValidAccessToken } from './keycloak-client';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

async function request<T>(url: string, init: RequestInit = {}): Promise<T> {
  const accessToken = await getValidAccessToken();
  const response = await fetch(url, {
    ...init,
    headers: { ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}), ...init.headers },
  });
  if (!response.ok) throw new Error(`Request to ${url} failed with status ${response.status}`);
  return response.status === 204 ? (undefined as T) : ((await response.json()) as T);
}

export function createApiClient(basePath: string) {
  return {
    get<T>(path: string): Promise<{ data: T }> {
      return request<T>(`${API_BASE_URL}${basePath}${path}`).then((data) => ({ data }));
    },
    post<T>(path: string, body: FormData): Promise<{ data: T }> {
      return request<T>(`${API_BASE_URL}${basePath}${path}`, { method: 'POST', body }).then((data) => ({ data }));
    },
  };
}
