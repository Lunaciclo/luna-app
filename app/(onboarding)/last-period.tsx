import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { OnboardingLayout } from '../../components/onboarding/OnboardingLayout';
import { CycleCalendar } from '../../components/cycle/CycleCalendar';
import { useOnboardingStore } from '../../store/useOnboardingStore';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Spacing } from '../../theme/spacing';

export default function LastPeriodScreen() {
  const router = useRouter();
  const { lastPeriodDate, setLastPeriodDate, cycleLength, flowLength } =
    useOnboardingStore();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    lastPeriodDate ?? undefined
  );

  const dummyCycleData = {
    lastPeriodStart: selectedDate ?? new Date(),
    cycleLength,
    flowLength,
  };

  function handleDontRemember() {
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
    setLastPeriodDate(fourteenDaysAgo);
    router.push('/(onboarding)/cycle-history');
  }

  return (
    <OnboardingLayout
      step={10}
      title="Quando começou sua última menstruação?"
      subtitle="Toque no dia que ela começou. Se não lembrar exatamente, dê seu melhor palpite."
      onNext={() => {
        if (selectedDate) {
          setLastPeriodDate(selectedDate);
        }
        router.push('/(onboarding)/cycle-history');
      }}
      nextDisabled={!selectedDate}
    >
      <CycleCalendar
        month={new Date()}
        cycleData={dummyCycleData}
        selectedDate={selectedDate}
        onDayPress={(date) => setSelectedDate(date)}
      />

      <View style={styles.footer}>
        <Pressable onPress={handleDontRemember} style={styles.dontRememberBtn}>
          <Text style={styles.dontRememberText}>Não lembro</Text>
        </Pressable>
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  footer: {
    marginTop: Spacing.lg,
    alignItems: 'center',
  },
  dontRememberBtn: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.base,
  },
  dontRememberText: {
    fontFamily: Typography.fonts.bodyMedium,
    fontSize: Typography.sizes.base,
    color: Colors.textLight,
    textAlign: 'center',
  },
});
