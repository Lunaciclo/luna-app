import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { OnboardingLayout } from '../../components/onboarding/OnboardingLayout';
import { Chip } from '../../components/ui/Chip';
import { useOnboardingStore } from '../../store/useOnboardingStore';
import { HealthCondition } from '../../types/user';
import { Spacing } from '../../theme/spacing';

const CONDITIONS: { id: HealthCondition; label: string; emoji: string }[] = [
  { id: 'pcos', label: 'SOP (Ovário Policístico)', emoji: '🔬' },
  { id: 'endometriosis', label: 'Endometriose', emoji: '💜' },
  { id: 'pmdd', label: 'TDPM', emoji: '🌧️' },
  { id: 'thyroid', label: 'Tireoide', emoji: '🦋' },
  { id: 'other', label: 'Outra condição', emoji: '📋' },
];

export default function HealthConditionsScreen() {
  const router = useRouter();
  const { healthConditions, setHealthConditions } = useOnboardingStore();

  function toggleCondition(id: HealthCondition) {
    if (healthConditions.includes(id)) {
      setHealthConditions(healthConditions.filter((c) => c !== id));
    } else {
      setHealthConditions([...healthConditions, id]);
    }
  }

  return (
    <OnboardingLayout
      step={14}
      title="Alguma condição de saúde?"
      subtitle="Isso nos ajuda a personalizar suas previsões e conteúdo."
      onNext={() => router.push('/(onboarding)/age')}
      showSkip
      onSkip={() => router.push('/(onboarding)/age')}
    >
      <View style={styles.grid}>
        {CONDITIONS.map((condition) => (
          <Chip
            key={condition.id}
            label={condition.label}
            emoji={condition.emoji}
            selected={healthConditions.includes(condition.id)}
            onPress={() => toggleCondition(condition.id)}
          />
        ))}
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
});
