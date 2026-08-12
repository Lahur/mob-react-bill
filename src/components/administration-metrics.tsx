import { SymbolView } from 'expo-symbols';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { fetchDashboardSummary } from '@/features/dashboard/dashboard-slice';
import { useTheme } from '@/hooks/use-theme';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

const currencyFormatter = new Intl.NumberFormat('hr-HR', { style: 'currency', currency: 'EUR' });

const CARDS = [
  {
    key: 'salesPaidTotal',
    label: 'Prodaja plaćeno',
    icon: { ios: 'checkmark.circle', android: 'check_circle', web: 'check_circle' },
  },
  {
    key: 'salesUnpaidTotal',
    label: 'Prodaja neplaćeno',
    icon: { ios: 'clock', android: 'schedule', web: 'schedule' },
  },
  {
    key: 'purchasesPaidTotal',
    label: 'Nabava plaćeno',
    icon: { ios: 'checkmark.circle', android: 'check_circle', web: 'check_circle' },
  },
  {
    key: 'purchasesUnpaidTotal',
    label: 'Nabava neplaćeno',
    icon: { ios: 'clock', android: 'schedule', web: 'schedule' },
  },
] as const;

export function AdministrationMetrics() {
  const dispatch = useAppDispatch();
  const summary = useAppSelector((state) => state.dashboard.summary);
  const theme = useTheme();

  useEffect(() => {
    dispatch(fetchDashboardSummary());
  }, [dispatch]);

  return (
    <View style={styles.stack}>
      {CARDS.map(({ key, label, icon }) => (
        <ThemedView key={key} type="backgroundElement" style={styles.card}>
          <ThemedView type="backgroundSelected" style={styles.iconCircle}>
            <SymbolView name={icon} tintColor={theme.text} size={20} />
          </ThemedView>
          <View style={styles.textColumn}>
            <ThemedText type="small" themeColor="textSecondary">
              {label}
            </ThemedText>
            <ThemedText type="subtitle" style={styles.value}>
              {currencyFormatter.format(summary[key])}
            </ThemedText>
          </View>
        </ThemedView>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: Spacing.three,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    borderRadius: Spacing.three,
    padding: Spacing.four,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textColumn: {
    flex: 1,
    gap: Spacing.half,
  },
  value: {
    fontSize: 22,
    lineHeight: 26,
  },
});
