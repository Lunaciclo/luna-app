import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { OnboardingLayout } from '../../components/onboarding/OnboardingLayout';
import { Chip } from '../../components/ui/Chip';
import { MOODS } from '../../constants/moods';
import { useOnboardingStore } from '../../store/useOnboardingStore';
import { Spacing } from '../../theme/spacing';

export default function MoodScreen() {
  const router = useRouter();
  const { moods, setMoods } = useOnboardingStore();

  function toggleMood(id: string) {
    if (moods.includes(id)) {
      setMoods(moods.filter((m) => m !== id));
    } else {
      setMoods([...moods, id]);
    }
  }

  return (
    <OnboardingLayout
      step={13}
      title="Como costuma ser seu humor?"
      subtitle="Selecione os humores mais frequentes durante seu ciclo."
      onNext={() => router.push('/(onboarding)/health-conditions')}
      showSkip
      onSkip={() => router.push('/(onboarding)/health-conditions')}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.grid}>
          {MOODS.map((mood) => (
            <Chip
              key={mood.id}
              label={mood.label}
              emoji={mood.emoji}
              selected={moods.includes(mood.id)}
              onPress={() => toggleMood(mood.id)}
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
