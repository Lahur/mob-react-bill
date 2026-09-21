import { router, useNavigation } from 'expo-router';
import type { DrawerNavigationProp } from 'expo-router/drawer';
import { SymbolView } from 'expo-symbols';
import { useEffect } from 'react';
import { FlatList, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { fetchAccountsStatements } from '@/features/accounts-statements/accounts-statement-slice';
import { useTheme } from '@/hooks/use-theme';
import type { AccountsStatementResponse } from '@/models/dto/accounts-statement-response';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

const currencyFormatter = new Intl.NumberFormat('hr-HR', { style: 'currency', currency: 'EUR' });
const dateFormatter = new Intl.DateTimeFormat('hr-HR', { day: '2-digit', month: '2-digit', year: 'numeric' });

export default function AccountsStatements() {

  const dispatch = useAppDispatch();
  const statements = useAppSelector((state) => state.accountsStatement.statements);

  useEffect(() => {
    dispatch(fetchAccountsStatements());
  }, [dispatch]);

  const safeAreaInsets = useSafeAreaInsets();
  const insets = {
    ...safeAreaInsets,
    bottom: safeAreaInsets.bottom + Spacing.three,
  };
  const theme = useTheme();
  const navigation = useNavigation<DrawerNavigationProp<Record<string, object | undefined>>>();

  const contentPlatformStyle = Platform.select({
    android: {
      paddingTop: insets.top,
      paddingLeft: insets.left,
      paddingRight: insets.right,
      paddingBottom: insets.bottom,
    },
    web: {
      paddingTop: Spacing.six,
      paddingBottom: Spacing.four,
    },
  });

  return (
    <FlatList
      style={[styles.list, { backgroundColor: theme.background }]}
      contentInset={insets}
      contentContainerStyle={[styles.contentContainer, contentPlatformStyle]}
      data={statements}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={
        <ThemedView style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.toggleDrawer()} hitSlop={Spacing.two}>
            <SymbolView name={{ ios: 'line.3.horizontal', android: 'menu', web: 'menu' }} tintColor={theme.text} size={24} />
          </TouchableOpacity>
          <ThemedText type="subtitle" style={styles.headerTitle}>
            Blagajnički izvještaji
          </ThemedText>
          <TouchableOpacity
            onPress={() => router.push({ pathname: '/accounts-statement-new', params: { refresh: 'true' } })}
            hitSlop={Spacing.two}>
            <SymbolView name={{ ios: 'plus.circle', android: 'add_circle', web: 'add_circle' }} tintColor={theme.text} size={24} />
          </TouchableOpacity>
        </ThemedView>
      }
      ListEmptyComponent={
        <ThemedView type="backgroundElement" style={styles.placeholder}>
          <ThemedText type="small" themeColor="textSecondary">
            Nema podataka.
          </ThemedText>
        </ThemedView>
      }
      renderItem={({ item }) => (
        <StatementRow
          statement={item}
          textColor={theme.text}
          onPress={() => router.push({ pathname: '/accounts-statement-scan', params: { id: item.id } })}
        />
      )}
    />
  );
}

function StatementRow({
  statement,
  textColor,
  onPress,
}: {
  statement: AccountsStatementResponse;
  textColor: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity onPress={onPress} disabled={statement.hasBill}>
      <ThemedView type="backgroundElement" style={styles.row}>
        <View style={styles.rowLeft}>
          <ThemedText type="smallBold" numberOfLines={1}>
            {statement.description}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {dateFormatter.format(new Date(statement.date))}
          </ThemedText>
        </View>
        <View style={styles.rowRight}>
          <ThemedView type="backgroundSelected" style={styles.badge}>
            <SymbolView
              name={
                statement.hasBill
                  ? { ios: 'checkmark.circle', android: 'check_circle', web: 'check_circle' }
                  : { ios: 'exclamationmark.circle', android: 'error', web: 'error' }
              }
              tintColor={textColor}
              size={14}
            />
            <ThemedText type="small">{statement.hasBill ? 'Učitan' : 'Nedostaje račun'}</ThemedText>
          </ThemedView>
          <ThemedText type="smallBold">{currencyFormatter.format(statement.amount)}</ThemedText>
        </View>
      </ThemedView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  contentContainer: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    gap: Spacing.four,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  headerTitle: {
    flex: 1,
  },
  placeholder: {
    borderRadius: Spacing.three,
    padding: Spacing.four,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
    borderRadius: Spacing.three,
    padding: Spacing.four,
  },
  rowLeft: {
    flex: 1,
    gap: Spacing.half,
  },
  rowRight: {
    alignItems: 'flex-end',
    gap: Spacing.two,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.half,
    borderRadius: Spacing.four,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
  },
});
