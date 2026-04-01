import React, { useEffect, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withDelay,
  Easing,
  FadeIn,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { OnboardingLayout } from '../../components/onboarding/OnboardingLayout';
import { OptionButton } from '../../components/onboarding/OptionButton';
import { useOnboardingStore } from '../../store/useOnboardingStore';
import { Goal } from '../../types/cycle';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Spacing } from '../../theme/spacing';

const GOALS: { id: Goal; label: string; emoji: string; description: string }[] = [
  { id: 'track_cycle', label: 'Acompanhar meu ciclo', emoji: '📊', description: 'Entender meu corpo e minhas fases' },
  { id: 'get_pregnant', label: 'Engravidar', emoji: '🤰', description: 'Identificar meus dias ferteis' },
  { id: 'avoid_pregnancy', label: 'Evitar gravidez', emoji: '🛡️', description: 'Saber minha janela fertil' },
  { id: 'health', label: 'Cuidar da saude', emoji: '💚', description: 'Monitorar sintomas e bem-estar' },
  { id: 'menopause', label: 'Menopausa', emoji: '🌸', description: 'Acompanhar a transicao' },
];

const CONFIRMATION_TEXTS: Record<Goal, string> = {
  track_cycle: 'Vamos te ajudar a entender seu corpo!',
  get_pregnant: 'Identificaremos seus melhores dias!',
  avoid_pregnancy: 'Monitoraremos sua janela fertil!',
  health: 'Saude em primeiro lugar!',
  menopause: 'Vamos juntas nessa transicao!',
};

function GoalOption({
  goalItem,
  isSelected,
  onSelect,
}: {
  goalItem: (typeof GOALS)[number];
  isSelected: boolean;
  onSelect: () => void;
}) {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (isSelected) {
      scale.value = withSequence(
        withTiming(1.05, { duration: 150, easing: Easing.out(Easing.quad) }),
        withTiming(1, { duration: 150, easing: Easing.inOut(Easing.quad) })
      );
    }
  }, [isSelected]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View>
      <Animated.View style={animatedStyle}>
        <OptionButton
          label={goalItem.label}
          emoji={goalItem.emoji}
          description={goalItem.description}
          selected={isSelected}
          onPress={onSelect}
        />
      </Animated.View>
      {isSelected && (
        <Animated.View
          entering={FadeIn.duration(300).easing(Easing.out(Easing.quad))}
          style={styles.confirmationContainer}
        >
          <Text style={styles.confirmationText}>
            {CONFIRMATION_TEXTS[goalItem.id]}
          </Text>
        </Animated.View>
      )}
    </View>
  );
}

export default function GoalScreen() {
  const router = useRouter();
  const { goal, setGoal } = useOnboardingStore();

  const handleSelect = useCallback((id: Goal) => {
    setGoal(id);
  }, [setGoal]);

  return (
    <OnboardingLayout
      step={5}
      title="Qual seu principal objetivo?"
      subtitle="Isso nos ajuda a personalizar sua experiencia."
      onNext={() => router.push('/(onboarding)/pregnant')}
      nextDisabled={!goal}
    >
      <View style={styles.options}>
        {GOALS.map((g) => (
          <GoalOption
            key={g.id}
            goalItem={g}
            isSelected={goal === g.id}
            onSelect={() => handleSelect(g.id)}
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
  confirmationContainer: {
    marginTop: -Spacing.sm,
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.base,
  },
  confirmationText: {
    fontFamily: Typography.fonts.bodyMedium,
    fontSize: Typography.sizes.sm,
    color: Colors.rose,
    textAlign: 'center',
  },
});
