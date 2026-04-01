import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { OnboardingLayout } from '../../components/onboarding/OnboardingLayout';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Spacing } from '../../theme/spacing';

export default function PrivacyScreen() {
  const router = useRouter();

  return (
    <OnboardingLayout
      step={3}
      onNext={() => router.push('/(onboarding)/name')}
    >
      <View style={styles.content}>
        <Text style={styles.icon}>🔐</Text>
        <Text style={styles.title}>Seus dados.{'\n'}Suas regras.</Text>
        <Text style={styles.description}>
          A Luna nunca vende seus dados. Você decide o que compartilhar e com quem. Privacidade é um direito, não um recurso premium.
        </Text>
        <View style={styles.features}>
          {[
            { icon: '🔒', text: 'Criptografia ponta a ponta' },
            { icon: '🚫', text: 'Sem venda de dados' },
            { icon: '🗑️', text: 'Delete tudo a qualquer momento' },
            { icon: '📋', text: 'Conforme LGPD' },
          ].map((item, i) => (
            <View key={i} style={styles.featureRow}>
              <Text style={styles.featureIcon}>{item.icon}</Text>
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
    fontSize: 64,
    marginBottom: Spacing['2xl'],
  },
  title: {
    fontFamily: Typography.fonts.displayBold,
    fontSize: Typography.sizes['2xl'],
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  description: {
    fontFamily: Typography.fonts.body,
    fontSize: Typography.sizes.base,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: Typography.sizes.base * Typography.lineHeights.relaxed,
    marginBottom: Spacing['2xl'],
    paddingHorizontal: Spacing.base,
  },
  features: {
    width: '100%',
    gap: Spacing.base,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.xl,
  },
  featureIcon: {
    fontSize: 24,
  },
  featureText: {
    fontFamily: Typography.fonts.bodyMedium,
    fontSize: Typography.sizes.base,
    color: Colors.text,
  },
});
