import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import { SymbolView } from 'expo-symbols';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider } from 'react-redux';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { AppDrawerContent } from '@/components/app-drawer-content';
import { AuthGate } from '@/components/auth-gate';
import { KeycloakAuthProvider } from '@/contexts/auth-context';
import { store } from '@/store';
import { useTheme } from '@/hooks/use-theme';

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const theme = useTheme();
  return (
    <KeycloakAuthProvider>
      <Provider store={store}>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <AnimatedSplashOverlay />
          <AuthGate>
            <GestureHandlerRootView style={{ flex: 1 }}>
              <Drawer
                drawerContent={(props) => <AppDrawerContent {...props} />}
                screenOptions={{
                  headerShown: false,
                  drawerStyle: { backgroundColor: theme.background },
                  drawerActiveBackgroundColor: theme.backgroundSelected,
                  drawerActiveTintColor: theme.text,
                  drawerInactiveTintColor: theme.textSecondary,
                }}>
                <Drawer.Screen
                  name="index"
                  options={{
                    title: 'Nadzorna ploča',
                    drawerLabel: 'Nadzorna ploča',
                    drawerIcon: ({ color, size }) => (
                      <SymbolView
                        name={{ ios: 'square.grid.2x2', android: 'dashboard', web: 'dashboard' }}
                        tintColor={color}
                        size={size}
                      />
                    ),
                  }}
                />
                <Drawer.Screen
                  name="pos-transactions"
                  options={{
                    title: 'POS transakcije',
                    drawerLabel: 'POS transakcije',
                    drawerIcon: ({ color, size }) => (
                      <SymbolView
                        name={{ ios: 'creditcard', android: 'point_of_sale', web: 'point_of_sale' }}
                        tintColor={color}
                        size={size}
                      />
                    ),
                  }}
                />
                <Drawer.Screen
                  name="accounts-statements"
                  options={{
                    title: 'Blagajnički izvještaji',
                    drawerLabel: 'Blagajnički izvještaji',
                    drawerIcon: ({ color, size }) => (
                      <SymbolView
                        name={{ ios: 'doc.text', android: 'description', web: 'description' }}
                        tintColor={color}
                        size={size}
                      />
                    ),
                  }}
                />
              </Drawer>
            </GestureHandlerRootView>
          </AuthGate>
        </ThemeProvider>
      </Provider>
    </KeycloakAuthProvider>
  );
}
