import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { useCallback } from 'react';
import { Platform, StyleSheet, TouchableOpacity } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { toDisplayDate, toIsoDate } from '@/utils/date';

export type DateFieldProps = {
  value: string;
  onChange: (isoDate: string) => void;
  error?: boolean;
};

export function DateField({ value, onChange, error }: DateFieldProps) {
  const theme = useTheme();
  const dateValue = value ? new Date(value) : new Date();

  const openAndroidPicker = useCallback(() => {
    DateTimePickerAndroid.open({
      value: value ? new Date(value) : new Date(),
      mode: 'date',
      onValueChange: (_event, selectedDate) => onChange(toIsoDate(selectedDate)),
    });
  }, [value, onChange]);

  if (Platform.OS === 'android') {
    return (
      <TouchableOpacity
        style={[styles.button, { borderColor: error ? '#d92d20' : theme.backgroundSelected }]}
        onPress={openAndroidPicker}>
        <ThemedText type="smallBold">{toDisplayDate(value) || 'Odaberite datum'}</ThemedText>
      </TouchableOpacity>
    );
  }

  return (
    <DateTimePicker
      value={dateValue}
      mode="date"
      display="compact"
      locale="hr-HR"
      onValueChange={(_event, selectedDate) => onChange(toIsoDate(selectedDate))}
    />
  );
}

const styles = StyleSheet.create({
  button: {
    borderWidth: 1,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
});
