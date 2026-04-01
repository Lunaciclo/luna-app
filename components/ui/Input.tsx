import React, { useState } from 'react';
import { TextInput, View, Text, StyleSheet, TextInputProps } from 'react-native';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Spacing } from '../../theme/spacing';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export function Input({ label, error, style, ...props }: InputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          isFocused && styles.focused,
          error && styles.error,
          style,
        ]}
        placeholderTextColor={Colors.textLight}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        {...props}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    fontFamily: Typography.fonts.bodyMedium,
    fontSize: Typography.sizes.sm,
    color: Colors.textLight,
    marginBottom: Spacing.xs,
  },
  input: {
    fontFamily: Typography.fonts.body,
    fontSize: Typography.sizes.md,
    color: Colors.text,
    backgroundColor: Colors.white,
    borderBottomWidth: 2,
    borderBottomColor: Colors.blush,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
  },
  focused: {
    borderBottomColor: Colors.rose,
  },
  error: {
    borderBottomColor: '#E74C3C',
  },
  errorText: {
    fontFamily: Typography.fonts.body,
    fontSize: Typography.sizes.xs,
    color: '#E74C3C',
    marginTop: Spacing.xs,
  },
});
