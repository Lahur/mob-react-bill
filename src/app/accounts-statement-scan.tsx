import { Image } from 'expo-image';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { uploadAccountsStatementBill } from '@/features/accounts-statements/accounts-statement-slice';
import { useTheme } from '@/hooks/use-theme';
import { imageToPdf, scanDocument } from '@/services/document-scan';
import { useAppDispatch } from '@/store/hooks';

type SearchParams = {
  id?: string;
  amount?: string;
  description?: string;
  date?: string;
};

export default function AccountsStatementScan() {
  const { id, amount, description, date } = useLocalSearchParams<SearchParams>();
  const dispatch = useAppDispatch();
  const theme = useTheme();

  const [scannedImage, setScannedImage] = useState<string>();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string>();

  useFocusEffect(
    useCallback(() => {
      setScannedImage(undefined);
      setError(undefined);
      scanDocument().then(setScannedImage);
    }, []),
  );

  const handleCancel = () => {
    router.replace(id ? '/accounts-statements' : { pathname: '/accounts-statement-new', params: { amount, description, date } });
  };

  const handleConfirm = async () => {
    if (!scannedImage) return;

    setError(undefined);
    setUploading(true);
    try {
      const pdfFile = await imageToPdf(scannedImage, `accounts-statement-${id ?? 'new'}-${Date.now()}.pdf`);

      if (id) {
        await dispatch(
          uploadAccountsStatementBill({
            id,
            file: { uri: pdfFile.uri, name: 'racun.pdf', type: 'application/pdf' },
          }),
        ).unwrap();
        router.replace('/accounts-statements');
      } else {
        router.replace({
          pathname: '/accounts-statement-new',
          params: { amount, description, date, billUri: pdfFile.uri, billName: 'racun.pdf' },
        });
      }
    } catch (err) {
      console.error('Failed to process accounts statement bill scan', err);
      setError('Obrada skeniranog računa nije uspjela. Pokušajte ponovno.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image contentFit="contain" style={styles.image} source={{ uri: scannedImage }} />

      {error && (
        <ThemedText type="small" themeColor="textSecondary" style={styles.hint}>
          {error}
        </ThemedText>
      )}

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton, { borderColor: theme.backgroundSelected }]}
          onPress={handleCancel}
          disabled={uploading}>
          <ThemedText type="smallBold">Odustani</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.confirmButton, { backgroundColor: theme.text }]}
          onPress={handleConfirm}
          disabled={uploading || !scannedImage}>
          {uploading ? (
            <ActivityIndicator color={theme.background} />
          ) : (
            <ThemedText type="smallBold" style={{ color: theme.background }}>
              Otpremi
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
    gap: Spacing.three,
    padding: Spacing.four,
  },
  image: {
    flex: 1,
  },
  hint: {
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.three,
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
  confirmButton: {
    opacity: 1,
  },
});
