import { Image } from "expo-image";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";
import { uploadPosTransactionBill } from "@/features/pos-transactions/pos-transaction-slice";
import { useTheme } from "@/hooks/use-theme";
import { imageToPdf, scanDocument } from "@/services/document-scan";
import { useAppDispatch } from "@/store/hooks";

export default function PosTransactionScan() {

    const { id } = useLocalSearchParams<{ id?: string }>();
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
        router.replace('/pos-transactions');
    };

    const handleUpload = async () => {
        if (!scannedImage || !id) return;

        setError(undefined);
        setUploading(true);
        try {
            const pdfFile = await imageToPdf(scannedImage, `pos-transaction-${id}-${Date.now()}.pdf`);

            await dispatch(
                uploadPosTransactionBill({
                    id,
                    file: { uri: pdfFile.uri, name: 'receipt.pdf', type: 'application/pdf' },
                }),
            ).unwrap();
            router.replace('/pos-transactions');
        } catch (err) {
            console.error('Failed to upload POS transaction bill', err);
            setError('Otpremanje nije uspjelo. Pokušajte ponovno.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Image
                contentFit="contain"
                style={styles.image}
                source={{ uri: scannedImage }}
            />

            {!id && (
                <ThemedText type="small" themeColor="textSecondary" style={styles.hint}>
                    Nedostaje ID transakcije, otpremanje nije moguće.
                </ThemedText>
            )}
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
                    style={[styles.button, styles.uploadButton, { backgroundColor: theme.text }]}
                    onPress={handleUpload}
                    disabled={uploading || !scannedImage || !id}>
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
    uploadButton: {
        opacity: 1,
    },
});
