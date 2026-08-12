import { useEffect, useRef, type ReactNode } from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useKeycloakAuth } from '@/contexts/auth-context';

export function AuthGate({ children }: { children: ReactNode }) {
  const { user, isLoading, error, canLogin, login } = useKeycloakAuth();
  const attempted = useRef(false);

  useEffect(() => {
    if (user || isLoading || !canLogin || attempted.current) return;
    attempted.current = true;
    login();
  }, [user, isLoading, canLogin, login]);

  if (user) return <>{children}</>;

  if (error) {
    return (
      <ThemedView style={styles.center}>
        <ThemedText type="small" themeColor="textSecondary">
          {error}
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.center}>
      <ActivityIndicator />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
  },
});
