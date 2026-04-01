import React, { useState, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { OnboardingLayout } from '../../components/onboarding/OnboardingLayout';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Spacing } from '../../theme/spacing';
import { Radius } from '../../theme/radius';

const HEALTH_ITEMS = [
  { id: 'steps', emoji: '👟', label: 'Passos e exercícios' },
  { id: 'sleep', emoji: '😴', label: 'Qualidade do sono' },
  { id: 'heart', emoji: '❤️', label: 'Frequência cardíaca' },
  { id: 'weight', emoji: '⚖️', label: 'Peso corporal' },
];

const TOGGLE_WIDTH = 50;
const TOGGLE_HEIGHT = 28;
const KNOB_SIZE = 22;
const KNOB_MARGIN = (TOGGLE_HEIGHT - KNOB_SIZE) / 2;
const KNOB_TRAVEL = TOGGLE_WIDTH - KNOB_SIZE - KNOB_MARGIN * 2;

interface ToggleSwitchProps {
  value: boolean;
  onToggle: () => void;
}

function ToggleSwitch({ value, onToggle }: ToggleSwitchProps) {
  const progress = useSharedValue(value ? 1 : 0);

  React.useEffect(() => {
    progress.value = withTiming(value ? 1 : 0, { duration: 250 });
  }, [value]);

  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      [Colors.blush, Colors.rose]
    ),
  }));

  const knobStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: progress.value * KNOB_TRAVEL },
    ],
  }));

  return (
    <Pressable onPress={onToggle}>
      <Animated.View style={[styles.toggleTrack, trackStyle]}>
        <Animated.View style={[styles.toggleKnob, knobStyle]} />
      </Animated.View>
    </Pressable>
  );
}

export default function HealthAppScreen() {
  const router = useRouter();
  const [toggles, setToggles] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    HEALTH_ITEMS.forEach((item) => {
      initial[item.id] = true; // all ON by default
    });
    return initial;
  });

  const handleToggle = useCallback((id: string) => {
    setToggles((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  return (
    <OnboardingLayout
      step={25}
      title="Conectar com Apple Health?"
      subtitle="Importar dados de passos, sono e mais para insights completos."
      onNext={() => router.push('/(onboarding)/paywall')}
      nextLabel="Conectar Apple Health"
      showSkip
      onSkip={() => router.push('/(onboarding)/paywall')}
    >
      <View style={styles.content}>
        <Text style={styles.icon}>❤️‍🩹</Text>
        <View style={styles.features}>
          {HEALTH_ITEMS.map((item) => (
            <View key={item.id} style={styles.featureRow}>
              <Text style={styles.featureEmoji}>{item.emoji}</Text>
              <Text style={styles.featureText}>{item.label}</Text>
              <View style={styles.toggleContainer}>
                <ToggleSwitch
                  value={toggles[item.id]}
                  onToggle={() => handleToggle(item.id)}
                />
              </View>
            </View>
          ))}
        </View>
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 80,
    marginBottom: Spacing['2xl'],
  },
  features: {
    width: '100%',
    gap: Spacing.lg,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  featureEmoji: {
    fontSize: 24,
  },
  featureText: {
    flex: 1,
    fontFamily: Typography.fonts.bodyMedium,
    fontSize: Typography.sizes.md,
    color: Colors.text,
  },
  toggleContainer: {
    marginLeft: 'auto',
  },
  // Toggle switch styles
  toggleTrack: {
    width: TOGGLE_WIDTH,
    height: TOGGLE_HEIGHT,
    borderRadius: Radius.full,
    justifyContent: 'center',
    paddingHorizontal: KNOB_MARGIN,
  },
  toggleKnob: {
    width: KNOB_SIZE,
    height: KNOB_SIZE,
    borderRadius: KNOB_SIZE / 2,
    backgroundColor: Colors.white,
    // Subtle shadow on knob
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
});
