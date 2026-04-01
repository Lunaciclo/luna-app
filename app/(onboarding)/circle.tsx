import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { OnboardingLayout } from '../../components/onboarding/OnboardingLayout';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Spacing } from '../../theme/spacing';

export default function CircleScreen() {
  const router = useRouter();

  return (
    <OnboardingLayout
      step={22}
      title="Círculo de Amigas"
      subtitle="Compartilhe sua fase com pessoas de confiança."
      onNext={() => router.push('/(onboarding)/partner')}
    >
      <View style={styles.content}>
        <Text style={styles.icon}>👭</Text>
        <View style={styles.features}>
          {[
            { emoji: '🔄', text: 'Veja a fase de cada amiga' },
            { emoji: '🤗', text: 'Envie suporte por fase' },
            { emoji: '🔔', text: 'Avisos quando ciclos se alinham' },
            { emoji: '🔒', text: 'Só compartilha o que você permite' },
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
