import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Spacing } from '../../theme/spacing';
import { Radius } from '../../theme/radius';

interface DailyInsightCardProps {
  tag: string;
  title: string;
  icon: string;
  onPress?: () => void;
}

export function DailyInsightCard({ tag, title, icon, onPress }: DailyInsightCardProps) {
  return (
    <Pressable onPress={onPress} style={styles.card}>
      <View style={styles.tagContainer}>
        <Text style={styles.tag}>{tag}</Text>
      </View>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title} numberOfLines={2}>
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 160,
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.blush,
    borderStyle: 'dashed',
    gap: Spacing.sm,
  },
  tagContainer: {
    backgroundColor: Colors.blush,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.sm,
    alignSelf: 'flex-start',
  },
  tag: {
    fontFamily: Typography.fonts.bodyBold,
    fontSize: Typography.sizes.xs,
    color: Colors.rose,
    textTransform: 'uppercase',
  },
  icon: {
    fontSize: 28,
  },
  title: {
    fontFamily: Typography.fonts.bodyMedium,
    fontSize: Typography.sizes.sm,
    color: Colors.text,
    lineHeight: Typography.sizes.sm * Typography.lineHeights.normal,
  },
});
