import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { OnboardingLayout } from '../../components/onboarding/OnboardingLayout';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Spacing } from '../../theme/spacing';
import { Radius } from '../../theme/radius';

export default function WithoutWithScreen() {
  const router = useRouter();

  return (
    <OnboardingLayout
      step={21}
      onNext={() => router.push('/(onboarding)/circle')}
    >
      <View style={styles.container}>
        <View style={styles.column}>
          <Text style={styles.columnTitle}>Sem Luna 😔</Text>
          {['Surpresa com a menstruação', 'Sem entender os sintomas', 'Ciclo imprevisível', 'Sem suporte'].map((item, i) => (
            <Text key={i} style={styles.itemBad}>❌ {item}</Text>
          ))}
        </View>
        <View style={[styles.column, styles.columnGood]}>
          <Text style={styles.columnTitle}>Com Luna 🌙</Text>
          {['Previsões precisas', 'Insights personalizados', 'Ciclo sob controle', 'Círculo de apoio'].map((item, i) => (
            <Text key={i} style={styles.itemGood}>✅ {item}</Text>
          ))}
        </View>
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    gap: Spacing.lg,
  },
  column: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  columnGood: {
    backgroundColor: Colors.blush,
    borderWidth: 2,
    borderColor: Colors.rose,
  },
  columnTitle: {
    fontFamily: Typography.fonts.displayBold,
    fontSize: Typography.sizes.lg,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  itemBad: {
    fontFamily: Typography.fonts.body,
    fontSize: Typography.sizes.base,
    color: Colors.textLight,
  },
  itemGood: {
    fontFamily: Typography.fonts.bodyMedium,
    fontSize: Typography.sizes.base,
    color: Colors.text,
  },
});
