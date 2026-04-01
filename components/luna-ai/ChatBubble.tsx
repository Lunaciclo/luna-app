import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Spacing } from '../../theme/spacing';
import { Radius } from '../../theme/radius';

interface ChatBubbleProps {
  message: string;
  isUser: boolean;
  timestamp?: string;
}

export function ChatBubble({ message, isUser, timestamp }: ChatBubbleProps) {
  return (
    <View style={[styles.container, isUser ? styles.userContainer : styles.lunaContainer]}>
      {!isUser && <Text style={styles.lunaAvatar}>🌙</Text>}
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.lunaBubble]}>
        <Text style={[styles.message, isUser && styles.userMessage]}>
          {message}
        </Text>
        {timestamp && (
          <Text style={[styles.time, isUser && styles.userTime]}>{timestamp}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginVertical: Spacing.xs,
    paddingHorizontal: Spacing.base,
    gap: Spacing.sm,
  },
  userContainer: {
    justifyContent: 'flex-end',
  },
  lunaContainer: {
    justifyContent: 'flex-start',
  },
  lunaAvatar: {
    fontSize: 24,
    marginTop: Spacing.xs,
  },
  bubble: {
    maxWidth: '75%',
    padding: Spacing.md,
    borderRadius: Radius.lg,
  },
  lunaBubble: {
    backgroundColor: Colors.blush,
    borderTopLeftRadius: Radius.sm,
  },
  userBubble: {
    backgroundColor: Colors.rose,
    borderTopRightRadius: Radius.sm,
  },
  message: {
    fontFamily: Typography.fonts.body,
    fontSize: Typography.sizes.base,
    color: Colors.text,
    lineHeight: Typography.sizes.base * Typography.lineHeights.normal,
  },
  userMessage: {
    color: Colors.white,
  },
  time: {
    fontFamily: Typography.fonts.body,
    fontSize: Typography.sizes.xs,
    color: Colors.textLight,
    marginTop: Spacing.xs,
    textAlign: 'right',
  },
  userTime: {
    color: 'rgba(255,255,255,0.7)',
  },
});
