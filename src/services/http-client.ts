import axios from 'axios';

import { getValidAccessToken } from './keycloak-client';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

export function createApiClient(basePath: string) {
  const client = axios.create({
    baseURL: `${API_BASE_URL}${basePath}`,
  });

  client.interceptors.request.use(async (config) => {
    const accessToken = await getValidAccessToken();
    if (accessToken) {
      config.headers.set('Authorization', `Bearer ${accessToken}`);
    }
    return config;
  });

  return client;
}
