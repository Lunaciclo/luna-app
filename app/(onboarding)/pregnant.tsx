import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { OnboardingLayout } from '../../components/onboarding/OnboardingLayout';
import { useOnboardingStore } from '../../store/useOnboardingStore';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Spacing } from '../../theme/spacing';
import { Radius } from '../../theme/radius';

type PregnantValue = boolean | null;

const OPTIONS: { label: string; value: PregnantValue }[] = [
  { label: 'Não', value: false },
  { label: 'Sim', value: true },
  { label: 'Não tenho certeza', value: null },
];

export default function PregnantScreen() {
  const router = useRouter();
  const { isPregnant, setIsPregnant } = useOnboardingStore();
  const [selected, setSelected] = useState<PregnantValue | undefined>(
    isPregnant
  );

  function handleSelect(value: PregnantValue) {
    setSelected(value);
    if (value !== null) {
      setIsPregnant(value);
    } else {
      // "Não tenho certeza" -> treat as not pregnant for store
      setIsPregnant(false);
    }
  }

  return (
    <OnboardingLayout
      step={6}
      title="Você está grávida?"
      subtitle="Precisamos saber para ajustar suas previsões."
      onNext={() => router.push('/(onboarding)/objectives-grid')}
      nextDisabled={selected === undefined}
    >
      <View style={styles.options}>
        {OPTIONS.map((option) => {
          const isSelected = selected === option.value;
          return (
            <Pressable
              key={option.label}
              style={[
                styles.pill,
                isSelected ? styles.pillSelected : styles.pillUnselected,
              ]}
              onPress={() => handleSelect(option.value)}
            >
              <Text
                style={[
                  styles.pillText,
                  isSelected ? styles.pillTextSelected : styles.pillTextUnselected,
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  options: {
    marginTop: Spacing.xl,
    gap: Spacing.md,
  },
  pill: {
    width: '100%',
    height: 52,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  pillUnselected: {
    backgroundColor: Colors.white,
    borderColor: Colors.rose,
  },
  pillSelected: {
    backgroundColor: Colors.rose,
    borderColor: Colors.rose,
  },
  pillText: {
    fontFamily: Typography.fonts.bodyMedium,
    fontSize: Typography.sizes.base,
  },
  pillTextUnselected: {
    color: Colors.rose,
  },
  pillTextSelected: {
    color: Colors.white,
  },
});
