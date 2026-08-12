import { type DrawerContentComponentProps, DrawerContentScrollView, DrawerItem } from 'expo-router/drawer';
import { SymbolView } from 'expo-symbols';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useKeycloakAuth } from '@/contexts/auth-context';
import { useTheme } from '@/hooks/use-theme';

const DRAWER_GROUPS: { label?: string; routeNames: string[] }[] = [
  { routeNames: ['index'] },
  { label: 'Bankovne transakcije', routeNames: ['pos-transactions'] },
  { label: 'Blagajna', routeNames: ['accounts-statements'] },
];

export function AppDrawerContent(props: DrawerContentComponentProps) {
  const { state, navigation, descriptors } = props;
  const { user, logout } = useKeycloakAuth();
  const theme = useTheme();
  const displayName = user?.name ?? user?.email ?? 'Korisnik';

  const renderItem = (routeName: string) => {
    const route = state.routes.find((r) => r.name === routeName);
    if (!route) return null;

    const focused = state.routes[state.index].key === route.key;
    const { title, drawerLabel, drawerIcon } = descriptors[route.key].options;

    return (
      <DrawerItem
        key={route.key}
        label={drawerLabel ?? title ?? route.name}
        icon={drawerIcon}
        focused={focused}
        activeTintColor={theme.text}
        inactiveTintColor={theme.textSecondary}
        activeBackgroundColor={theme.backgroundSelected}
        onPress={() => (focused ? navigation.closeDrawer() : navigation.navigate(route.name))}
      />
    );
  };

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <ThemedView type="backgroundSelected" style={styles.avatar}>
          <ThemedText type="smallBold">{displayName.charAt(0).toUpperCase()}</ThemedText>
        </ThemedView>
        <View style={styles.headerText}>
          <ThemedText type="smallBold" numberOfLines={1}>
            {displayName}
          </ThemedText>
          {user?.email && user?.name && (
            <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
              {user.email}
            </ThemedText>
          )}
        </View>
      </View>

      {DRAWER_GROUPS.map((group, index) => (
        <View key={group.label ?? `group-${index}`}>
          {group.label && (
            <ThemedText type="small" themeColor="textSecondary" style={styles.groupLabel}>
              {group.label}
            </ThemedText>
          )}
          {group.routeNames.map(renderItem)}
        </View>
      ))}

      <View style={styles.footer}>
        <DrawerItem
          label="Odjava"
          inactiveTintColor={theme.text}
          icon={({ color, size }) => (
            <SymbolView
              name={{ ios: 'rectangle.portrait.and.arrow.right', android: 'logout', web: 'logout' }}
              tintColor={color}
              size={size}
            />
          )}
          onPress={() => logout()}
        />
      </View>
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.four,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: Spacing.four,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
    gap: Spacing.half,
  },
  groupLabel: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.two,
    textTransform: 'uppercase',
  },
  footer: {
    marginTop: 'auto',
    paddingTop: Spacing.three,
  },
});