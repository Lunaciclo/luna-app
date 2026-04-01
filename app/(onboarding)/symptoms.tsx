import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { OnboardingLayout } from '../../components/onboarding/OnboardingLayout';
import { Chip } from '../../components/ui/Chip';
import { SYMPTOMS } from '../../constants/symptoms';
import { useOnboardingStore } from '../../store/useOnboardingStore';
import { Spacing } from '../../theme/spacing';

export default function SymptomsScreen() {
  const router = useRouter();
  const { commonSymptoms, setCommonSymptoms } = useOnboardingStore();

  function toggleSymptom(id: string) {
    if (commonSymptoms.includes(id)) {
      setCommonSymptoms(commonSymptoms.filter((s) => s !== id));
    } else {
      setCommonSymptoms([...commonSymptoms, id]);
    }
  }

  return (
    <OnboardingLayout
      step={12}
      title="Quais sintomas você costuma sentir?"
      subtitle="Selecione todos que se aplicam. Vamos rastreá-los para você."
      onNext={() => router.push('/(onboarding)/mood')}
      showSkip
      onSkip={() => router.push('/(onboarding)/mood')}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.grid}>
          {SYMPTOMS.always.map((symptom) => (
            <Chip
              key={symptom.id}
              label={symptom.label}
              emoji={symptom.emoji}
              selected={commonSymptoms.includes(symptom.id)}
              onPress={() => toggleSymptom(symptom.id)}
            />
          ))}
        </View>
      </ScrollView>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
});
