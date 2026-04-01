import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { OnboardingLayout } from '../../components/onboarding/OnboardingLayout';
import { OptionButton } from '../../components/onboarding/OptionButton';
import { useOnboardingStore } from '../../store/useOnboardingStore';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Spacing } from '../../theme/spacing';

const CYCLE_LENGTHS = [
  { label: '21-25 dias', value: 23 },
  { label: '26-28 dias', value: 28 },
  { label: '29-32 dias', value: 30 },
  { label: '33-35 dias', value: 34 },
  { label: 'Irregular', value: 28 },
  { label: 'Não sei', value: 28 },
];

export default function CycleHistoryScreen() {
  const router = useRouter();
  const { cycleLength, setCycleLength } = useOnboardingStore();

  return (
    <OnboardingLayout
      step={11}
      title="Quanto dura seu ciclo?"
      subtitle="Do primeiro dia de uma menstruação até o primeiro dia da próxima."
      onNext={() => router.push('/(onboarding)/symptoms')}
    >
      <View style={styles.options}>
        {CYCLE_LENGTHS.map((opt) => (
          <OptionButton
            key={opt.label}
            label={opt.label}
            selected={cycleLength === opt.value}
            onPress={() => setCycleLength(opt.value)}
          />
        ))}
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  options: {
    marginTop: Spacing.md,
  },
});
