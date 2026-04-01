import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Phase } from '../../types/cycle';
import { PHASE_META } from '../../constants/phases';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Spacing } from '../../theme/spacing';
import { Radius } from '../../theme/radius';

interface PhaseIndicatorProps {
  phase: Phase;
  size?: 'small' | 'medium';
}

export function PhaseIndicator({ phase, size = 'small' }: PhaseIndicatorProps) {
  const meta = PHASE_META[phase];

  return (
    <View style={[styles.badge, { backgroundColor: meta.color + '20' }]}>
      <Text style={styles.emoji}>{meta.emoji}</Text>
      <Text style={[styles.label, { color: meta.color }, size === 'medium' && styles.labelMedium]}>
        {meta.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    gap: Spacing.xs,
    alignSelf: 'flex-start',
  },
  emoji: {
    fontSize: 14,
  },
  label: {
    fontFamily: Typography.fonts.bodyMedium,
    fontSize: Typography.sizes.xs,
  },
  labelMedium: {
    fontSize: Typography.sizes.sm,
  },
});
