import * as Sentry from '@sentry/react-native';
import { Image } from 'expo-image';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { uploadAccountsStatementBill } from '@/features/accounts-statements/accounts-statement-slice';
import { useTheme } from '@/hooks/use-theme';
import { imageToPdf, scanDocument } from '@/services/document-scan';
import { useAppDispatch } from '@/store/hooks';

type SearchParams = {
  id?: string;
};

export default function AccountsStatementScan() {
  const { id } = useLocalSearchParams<SearchParams>();
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const [scannedImage, setScannedImage] = useState<string>();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string>();

  const handleCancel = () => {
    if (id) {
      router.replace('/accounts-statements');
    } else {
      // Navigate (not replace) to the existing accounts-statement-new screen instance instead of
      // router.back(), which isn't reliable in this Drawer (no push-style history stack) and can
      // land on the initial route instead. navigate() reuses the already-mounted screen, so its
      // in-progress form state is preserved as-is.
      router.navigate('/accounts-statement-new');
    }
  };

  useFocusEffect(
    useCallback(() => {
      setScannedImage(undefined);
      setError(undefined);
      scanDocument().then((image) => {
        if (!image) {
          handleCancel();
          return;
        }
        setScannedImage(image);
      });
    }, []),
  );

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
        // Pop back to the existing accounts-statement-new screen (rather than replacing it) and
        // merge in the scanned file, so its already-live form state isn't lost or duplicated.
        router.navigate({
          pathname: '/accounts-statement-new',
          params: { billUri: pdfFile.uri, billName: 'racun.pdf' },
        });
      }
    } catch (err) {
      console.error('Failed to process accounts statement bill scan', err);
      Sentry.captureException(err);
      setError('Obrada skeniranog računa nije uspjela. Pokušajte ponovno.');
    } finally {
      setUploading(false);
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
    <View style={[styles.container, containerPlatformStyle]}>
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
