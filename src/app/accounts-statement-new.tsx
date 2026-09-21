import * as Sentry from '@sentry/react-native';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DateField } from '@/components/date-field';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { createAccountsStatement } from '@/features/accounts-statements/accounts-statement-slice';
import { useTheme } from '@/hooks/use-theme';
import { useAppDispatch } from '@/store/hooks';

type SearchParams = {
  billUri?: string;
  billName?: string;
  refresh?: string;
};

export default function AccountsStatementNew() {
  const params = useLocalSearchParams<SearchParams>();
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [errors, setErrors] = useState<{ amount?: boolean; description?: boolean; date?: boolean }>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>();

  const billUri = params.billUri;
  const billName = params.billName;

  useFocusEffect(
    useCallback(() => {
      if (params.refresh !== 'true') return;

      setAmount('');
      setDescription('');
      setDate('');
      setErrors({});
      setSubmitError(undefined);
      // Consume the flag (and drop any leftover scanned bill from a previous visit) so navigating
      // back here later (e.g. after a scan) doesn't wipe the form again.
      router.setParams({ refresh: undefined, billUri: undefined, billName: undefined });
    }, [params.refresh]),
  );

  const handleScan = () => {
    router.push('/accounts-statement-scan');
  };

  const handleCancel = () => {
    router.replace('/accounts-statements');
  };

  const handleSubmit = async () => {
    const newErrors: typeof errors = {};
    const amountValue = Number(amount);
    if (amount === '' || Number.isNaN(amountValue) || amountValue < 0) newErrors.amount = true;
    if (!description) newErrors.description = true;
    if (!date) newErrors.date = true;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setSubmitError(undefined);
    setSubmitting(true);
    try {
      await dispatch(
        createAccountsStatement({
          request: { amount: amountValue, description, date },
          file: billUri ? { uri: billUri, name: billName ?? 'racun.pdf', type: 'application/pdf' } : null,
        }),
      ).unwrap();
      router.replace('/accounts-statements');
    } catch (err) {
      Sentry.captureException(err);
      setSubmitError('Izrada izvještaja nije uspjela. Pokušajte ponovno.');
    } finally {
      setSubmitting(false);
    }
  };

  const containerPlatformStyle = Platform.select({
    web: {
      paddingTop: Spacing.six,
      paddingBottom: Spacing.four,
    },
    default: {
      paddingTop: insets.top + Spacing.four,
      paddingLeft: insets.left + Spacing.four,
      paddingRight: insets.right + Spacing.four,
      paddingBottom: insets.bottom + Spacing.four,
    },
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.background }, containerPlatformStyle]}>
      <ThemedText type="subtitle">Novi blagajnički izvještaj</ThemedText>

      <View style={styles.field}>
        <ThemedText type="smallBold">Iznos</ThemedText>
        <TextInput
          style={[styles.input, { borderColor: errors.amount ? '#d92d20' : theme.backgroundSelected, color: theme.text }]}
          keyboardType="decimal-pad"
          value={amount}
          onChangeText={setAmount}
          placeholder="0.00"
          placeholderTextColor={theme.textSecondary}
        />
        {errors.amount && (
          <ThemedText type="small" themeColor="textSecondary">
            Iznos mora biti 0 ili veći.
          </ThemedText>
        )}
      </View>

      <View style={styles.field}>
        <ThemedText type="smallBold">Opis</ThemedText>
        <TextInput
          style={[styles.input, { borderColor: errors.description ? '#d92d20' : theme.backgroundSelected, color: theme.text }]}
          value={description}
          onChangeText={setDescription}
          placeholderTextColor={theme.textSecondary}
        />
        {errors.description && (
          <ThemedText type="small" themeColor="textSecondary">
            Opis je obavezan.
          </ThemedText>
        )}
      </View>

      <View style={styles.field}>
        <ThemedText type="smallBold">Datum</ThemedText>
        <DateField value={date} onChange={setDate} error={errors.date} />
        {errors.date && (
          <ThemedText type="small" themeColor="textSecondary">
            Datum je obavezan.
          </ThemedText>
        )}
      </View>

      <View style={styles.field}>
        <ThemedText type="smallBold">Račun</ThemedText>
        <TouchableOpacity style={[styles.scanButton, { borderColor: theme.backgroundSelected }]} onPress={handleScan}>
          <ThemedText type="smallBold">{billUri ? billName : 'Skeniraj račun'}</ThemedText>
        </TouchableOpacity>
      </View>

      {submitError && (
        <ThemedText type="small" themeColor="textSecondary">
          {submitError}
        </ThemedText>
      )}

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton, { borderColor: theme.backgroundSelected }]}
          onPress={handleCancel}
          disabled={submitting}>
          <ThemedText type="smallBold">Odustani</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.submitButton, { backgroundColor: theme.text }]}
          onPress={handleSubmit}
          disabled={submitting}>
          {submitting ? (
            <ActivityIndicator color={theme.background} />
          ) : (
            <ThemedText type="smallBold" style={{ color: theme.background }}>
              Spremi
            </ThemedText>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: Spacing.four,
  },
  field: {
    gap: Spacing.two,
  },
  input: {
    borderWidth: 1,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  scanButton: {
    borderWidth: 1,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.three,
    marginTop: 'auto',
  },
  button: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Spacing.three,
    paddingVertical: Spacing.three,
  },
  cancelButton: {
    borderWidth: 1,
  },
  submitButton: {
    opacity: 1,
  },
});
