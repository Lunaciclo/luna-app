import React from 'react';
import { Pressable, Text, StyleSheet, View } from 'react-native';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Radius } from '../../theme/radius';
import { Spacing } from '../../theme/spacing';

interface OptionButtonProps {
  label: string;
  emoji?: string;
  description?: string;
  selected: boolean;
  onPress: () => void;
}

export function OptionButton({
  label,
  emoji,
  description,
  selected,
  onPress,
}: OptionButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.container, selected && styles.selected]}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      <View style={styles.row}>
        {emoji && <Text style={styles.emoji}>{emoji}</Text>}
        <View style={styles.textContainer}>
          <Text style={[styles.label, selected && styles.selectedLabel]}>
            {label}
          </Text>
          {description && (
            <Text style={[styles.description, selected && styles.selectedDesc]}>
              {description}
            </Text>
          )}
        </View>
      </View>
      <View style={[styles.radio, selected && styles.radioSelected]}>
        {selected && <View style={styles.radioInner} />}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.blush,
  },
  selected: {
    borderColor: Colors.rose,
    backgroundColor: Colors.blush,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: Spacing.md,
  },
  emoji: {
    fontSize: 28,
  },
  textContainer: {
    flex: 1,
  },
  label: {
    fontFamily: Typography.fonts.bodyMedium,
    fontSize: Typography.sizes.md,
    color: Colors.text,
  },
  selectedLabel: {
    fontFamily: Typography.fonts.bodyBold,
    color: Colors.text,
  },
  description: {
    fontFamily: Typography.fonts.body,
    fontSize: Typography.sizes.sm,
    color: Colors.textLight,
    marginTop: 2,
  },
  selectedDesc: {
    color: Colors.text,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.blush,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: Colors.rose,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.rose,
  },
});
