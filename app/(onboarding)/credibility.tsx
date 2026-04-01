import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { OnboardingLayout } from '../../components/onboarding/OnboardingLayout';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Spacing } from '../../theme/spacing';

export default function CredibilityScreen() {
  const router = useRouter();

  return (
    <OnboardingLayout
      step={2}
      onNext={() => router.push('/(onboarding)/privacy')}
    >
      <View style={styles.content}>
        <Text style={styles.icon}>👩‍⚕️</Text>
        <Text style={styles.title}>Desenvolvido com{'\n'}ginecologistas brasileiras</Text>
        <Text style={styles.description}>
          Nosso algoritmo e conteúdo foram revisados por profissionais de saúde especializadas em ginecologia e saúde da mulher.
        </Text>
        <View style={styles.badges}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>🔬 Base científica</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>🇧🇷 Feito para brasileiras</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>🔒 Dados protegidos</Text>
          </View>
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
  badges: {
    gap: Spacing.md,
  },
  badge: {
    backgroundColor: Colors.blush,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: 999,
  },
  badgeText: {
    fontFamily: Typography.fonts.bodyMedium,
    fontSize: Typography.sizes.base,
    color: Colors.text,
  },
});
