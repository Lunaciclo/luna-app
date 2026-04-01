import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { OnboardingLayout } from '../../components/onboarding/OnboardingLayout';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Spacing } from '../../theme/spacing';

export default function PartnerScreen() {
  const router = useRouter();

  return (
    <OnboardingLayout
      step={23}
      title="Modo Parceiro"
      subtitle="Inclusivo e sem precisar baixar outro app."
      onNext={() => router.push('/(onboarding)/notifications')}
    >
      <View style={styles.content}>
        <Text style={styles.icon}>💑</Text>
        <View style={styles.features}>
          {[
            { emoji: '🔗', text: 'Compartilhe via link' },
            { emoji: '📱', text: 'Parceiro acessa pelo navegador' },
            { emoji: '💡', text: '"Como apoiar hoje" personalizado' },
            { emoji: '🌈', text: 'Linguagem inclusiva' },
          ].map((item, i) => (
            <View key={i} style={styles.featureRow}>
              <Text style={styles.featureEmoji}>{item.emoji}</Text>
              <Text style={styles.featureText}>{item.text}</Text>
            </View>
          ))}
        </View>
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 80,
    marginBottom: Spacing['2xl'],
  },
  features: {
    width: '100%',
    gap: Spacing.lg,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  featureEmoji: {
    fontSize: 24,
  },
  featureText: {
    fontFamily: Typography.fonts.bodyMedium,
    fontSize: Typography.sizes.md,
    color: Colors.text,
  },
});
