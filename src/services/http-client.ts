import axios from 'axios';

import { getValidAccessToken } from './keycloak-client';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

// Keycloak user-attribute mapper puts the tenant into the access token under
// this claim; the backend expects it echoed back as X-Tenant-Id.
const TENANT_CLAIM = 'tenant-id';

function getTenantId(token: string): string | undefined {
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    // Percent-encode each byte so decodeURIComponent restores UTF-8 without
    // relying on TextDecoder being available in the JS engine.
    const json = decodeURIComponent(
      Array.from(atob(payload), (c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0')).join(''),
    );
    const tenantId = JSON.parse(json)[TENANT_CLAIM];
    return tenantId != null ? String(tenantId) : undefined;
  } catch {
    return undefined;
  }
}

export function createApiClient(basePath: string) {
  const client = axios.create({
    baseURL: `${API_BASE_URL}${basePath}`,
  });

  client.interceptors.request.use(async (config) => {
    const accessToken = await getValidAccessToken();
    if (accessToken) {
      config.headers.set('Authorization', `Bearer ${accessToken}`);
      const tenantId = getTenantId(accessToken);
      if (tenantId) {
        config.headers.set('X-Tenant-Id', tenantId);
      }
    }
    return config;
  });

  return client;
}
