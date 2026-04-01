import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { OnboardingLayout } from '../../components/onboarding/OnboardingLayout';
import { Card } from '../../components/ui/Card';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Spacing } from '../../theme/spacing';

export default function AppPreviewScreen() {
  const router = useRouter();

  return (
    <OnboardingLayout
      step={8}
      title="Seu app personalizado"
      subtitle="Veja o que a Luna pode fazer por você."
      onNext={() => router.push('/(onboarding)/four-phases')}
    >
      <View style={styles.cards}>
        <Card>
          <Text style={styles.cardEmoji}>📊</Text>
          <Text style={styles.cardTitle}>Previsões inteligentes</Text>
          <Text style={styles.cardDesc}>
            Saiba quando seu período vai chegar e como você vai se sentir
          </Text>
        </Card>
        <Card>
          <Text style={styles.cardEmoji}>🌙</Text>
          <Text style={styles.cardTitle}>Luna IA</Text>
          <Text style={styles.cardDesc}>
            Sua assistente pessoal que entende seu ciclo
          </Text>
        </Card>
        <Card>
          <Text style={styles.cardEmoji}>👭</Text>
          <Text style={styles.cardTitle}>Círculo de Amigas</Text>
          <Text style={styles.cardDesc}>
            Compartilhe sua fase com pessoas de confiança
          </Text>
        </Card>
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  cards: {
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  cardEmoji: {
    fontSize: 32,
    marginBottom: Spacing.sm,
  },
  cardTitle: {
    fontFamily: Typography.fonts.bodyBold,
    fontSize: Typography.sizes.md,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  cardDesc: {
    fontFamily: Typography.fonts.body,
    fontSize: Typography.sizes.sm,
    color: Colors.textLight,
    lineHeight: Typography.sizes.sm * Typography.lineHeights.normal,
  },
});
