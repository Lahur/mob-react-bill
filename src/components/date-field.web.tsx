import { useState } from 'react';
import { StyleSheet, TextInput } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { fromDisplayDate, toDisplayDate } from '@/utils/date';

export type DateFieldProps = {
  value: string;
  onChange: (isoDate: string) => void;
  error?: boolean;
};

export function DateField({ value, onChange, error }: DateFieldProps) {
  const theme = useTheme();
  const [text, setText] = useState(toDisplayDate(value));
  const [prevValue, setPrevValue] = useState(value);

  if (value !== prevValue) {
    setPrevValue(value);
    setText(toDisplayDate(value));
  }

  const handleChangeText = (input: string) => {
    setText(input);
    const isoDate = fromDisplayDate(input);
    if (isoDate) onChange(isoDate);
  };

  return (
    <TextInput
      style={[styles.input, { borderColor: error ? '#d92d20' : theme.backgroundSelected, color: theme.text }]}
      value={text}
      onChangeText={handleChangeText}
      placeholder="DD.MM.GGGG"
      placeholderTextColor={theme.textSecondary}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
});
