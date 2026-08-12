import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

import {
  clearTokens,
  fetchUser,
  getDiscovery,
  getEndSessionUrl,
  keycloakClientId,
  keycloakRedirectUri,
  keycloakScopes,
  persistTokens,
  restoreSession,
} from '@/services/keycloak-client';

export type KeycloakUser = {
  name?: string;
  email?: string;
  preferredUsername?: string;
};

type AuthContextValue = {
  user: KeycloakUser | null;
  isLoading: boolean;
  error: string | null;
  canLogin: boolean;
  login: () => void;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function useKeycloakAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useKeycloakAuth must be used within a KeycloakAuthProvider');
  return context;
}

function toUser(info: Record<string, unknown>): KeycloakUser {
  return {
    name: typeof info.name === 'string' ? info.name : undefined,
    email: typeof info.email === 'string' ? info.email : undefined,
    preferredUsername: typeof info.preferred_username === 'string' ? info.preferred_username : undefined,
  };
}

export function KeycloakAuthProvider({ children }: { children: ReactNode }) {
  const [discovery, setDiscovery] = useState<AuthSession.DiscoveryDocument | null>(null);
  const [user, setUser] = useState<KeycloakUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const idTokenRef = useRef<string | undefined>(undefined);
  const restoreAttempted = useRef(false);

  useEffect(() => {
    getDiscovery().then(setDiscovery);
  }, []);

  const [request, , promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: keycloakClientId,
      redirectUri: keycloakRedirectUri,
      scopes: keycloakScopes,
      usePKCE: true,
    },
    discovery,
  );

  useEffect(() => {
    if (!discovery || restoreAttempted.current) return;
    restoreAttempted.current = true;
    restoreSession().then(async (tokens) => {
      if (!tokens) {
        setIsLoading(false);
        return;
      }
      idTokenRef.current = tokens.idToken;
      const info = await fetchUser(tokens.accessToken);
      setUser(toUser(info));
      setIsLoading(false);
    });
  }, [discovery]);

  const login = useCallback(async () => {
    if (!request || !discovery) return;
    setIsLoading(true);
    try {
      const result = await promptAsync();
      if (result.type === 'success') {
        const tokens = await AuthSession.exchangeCodeAsync(
          {
            clientId: keycloakClientId,
            code: result.params.code,
            redirectUri: keycloakRedirectUri,
            extraParams: { code_verifier: request.codeVerifier ?? '' },
          },
          discovery,
        );
        await persistTokens(tokens);
        idTokenRef.current = tokens.idToken;
        const info = await fetchUser(tokens.accessToken);
        setUser(toUser(info));
        setError(null);
      } else if (result.type === 'error') {
        setError((result.error as Error | null | undefined)?.message ?? 'Autentifikacija nije uspjela');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  }, [request, discovery, promptAsync]);

  const logout = useCallback(async () => {
    const endSessionUrl = await getEndSessionUrl(idTokenRef.current);
    if (endSessionUrl) {
      await WebBrowser.openAuthSessionAsync(endSessionUrl, keycloakRedirectUri);
    }
    await clearTokens();
    idTokenRef.current = undefined;
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, error, canLogin: !!request, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
