import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { OnboardingLayout } from '../../components/onboarding/OnboardingLayout';
import { PHASE_META } from '../../constants/phases';
import { Phase } from '../../types/cycle';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Spacing } from '../../theme/spacing';
import { Radius } from '../../theme/radius';

const phases: Phase[] = ['menstrual', 'follicular', 'ovulatory', 'luteal'];

export default function FourPhasesScreen() {
  const router = useRouter();

  return (
    <OnboardingLayout
      step={9}
      title="As 4 fases do seu ciclo"
      subtitle="Cada fase traz mudanças únicas no seu corpo e humor."
      onNext={() => router.push('/(onboarding)/last-period')}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.phases}>
          {phases.map((phase) => {
            const meta = PHASE_META[phase];
            return (
              <View key={phase} style={[styles.phaseCard, { borderLeftColor: meta.color }]}>
                <View style={styles.phaseHeader}>
                  <Text style={styles.phaseEmoji}>{meta.emoji}</Text>
                  <View>
                    <Text style={[styles.phaseName, { color: meta.color }]}>{meta.label}</Text>
                    <Text style={styles.phaseDays}>Dias {meta.days}</Text>
                  </View>
                </View>
                <View style={styles.phaseInfo}>
                  <Text style={styles.phaseDetail}>Energia: {meta.energy}</Text>
                  <Text style={styles.phaseDetail}>Humor: {meta.mood}</Text>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  phases: {
    gap: Spacing.md,
  },
  phaseCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderLeftWidth: 4,
  },
  phaseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  phaseEmoji: {
    fontSize: 32,
  },
  phaseName: {
    fontFamily: Typography.fonts.bodyBold,
    fontSize: Typography.sizes.md,
  },
  phaseDays: {
    fontFamily: Typography.fonts.body,
    fontSize: Typography.sizes.sm,
    color: Colors.textLight,
  },
  phaseInfo: {
    flexDirection: 'row',
    gap: Spacing.lg,
  },
  phaseDetail: {
    fontFamily: Typography.fonts.body,
    fontSize: Typography.sizes.sm,
    color: Colors.textLight,
  },
});
