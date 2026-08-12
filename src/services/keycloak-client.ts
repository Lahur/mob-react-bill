import * as AuthSession from 'expo-auth-session';
import * as SecureStore from 'expo-secure-store';

const KEYCLOAK_URL = process.env.EXPO_PUBLIC_KEYCLOAK_URL;
const KEYCLOAK_REALM = process.env.EXPO_PUBLIC_KEYCLOAK_REALM;
const KEYCLOAK_CLIENT_ID = process.env.EXPO_PUBLIC_KEYCLOAK_CLIENT_ID;
if (!KEYCLOAK_URL) throw new Error('EXPO_PUBLIC_KEYCLOAK_URL is not set');
if (!KEYCLOAK_REALM) throw new Error('EXPO_PUBLIC_KEYCLOAK_REALM is not set');
if (!KEYCLOAK_CLIENT_ID) throw new Error('EXPO_PUBLIC_KEYCLOAK_CLIENT_ID is not set');

export const keycloakIssuer = `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}`;
export const keycloakClientId = KEYCLOAK_CLIENT_ID;
export const keycloakScopes = ['openid', 'profile', 'email', 'offline_access'];
export const keycloakRedirectUri = AuthSession.makeRedirectUri({ scheme: 'mobreactbill', path: 'callback' });

const REFRESH_TOKEN_KEY = 'keycloak_refresh_token';

let discoveryPromise: Promise<AuthSession.DiscoveryDocument> | null = null;

export function getDiscovery() {
  if (!discoveryPromise) discoveryPromise = AuthSession.fetchDiscoveryAsync(keycloakIssuer);
  return discoveryPromise;
}

let currentTokens: AuthSession.TokenResponse | null = null;

export async function persistTokens(tokens: AuthSession.TokenResponse) {
  currentTokens = tokens;
  if (tokens.refreshToken) {
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, tokens.refreshToken);
  }
}

export async function clearTokens() {
  currentTokens = null;
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
}

export async function restoreSession(): Promise<AuthSession.TokenResponse | null> {
  const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  if (!refreshToken) return null;

  try {
    const discovery = await getDiscovery();
    const tokens = await AuthSession.refreshAsync({ clientId: keycloakClientId, refreshToken }, discovery);
    await persistTokens(tokens);
    return tokens;
  } catch {
    await clearTokens();
    return null;
  }
}

export async function getValidAccessToken(): Promise<string | null> {
  if (!currentTokens) return null;
  if (AuthSession.TokenResponse.isTokenFresh(currentTokens)) {
    return currentTokens.accessToken;
  }
  if (!currentTokens.refreshToken) return currentTokens.accessToken;

  try {
    const discovery = await getDiscovery();
    const tokens = await AuthSession.refreshAsync(
      { clientId: keycloakClientId, refreshToken: currentTokens.refreshToken },
      discovery,
    );
    await persistTokens(tokens);
    return tokens.accessToken;
  } catch {
    await clearTokens();
    return null;
  }
}

export async function fetchUser(accessToken: string) {
  const discovery = await getDiscovery();
  return AuthSession.fetchUserInfoAsync({ accessToken }, discovery);
}

export async function getEndSessionUrl(idTokenHint?: string): Promise<string | null> {
  const discovery = await getDiscovery();
  if (!discovery.endSessionEndpoint) return null;

  const params = new URLSearchParams({ post_logout_redirect_uri: keycloakRedirectUri });
  if (idTokenHint) params.set('id_token_hint', idTokenHint);
  return `${discovery.endSessionEndpoint}?${params.toString()}`;
}
