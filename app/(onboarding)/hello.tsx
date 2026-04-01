import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { OnboardingLayout } from '../../components/onboarding/OnboardingLayout';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Spacing } from '../../theme/spacing';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface FlowerCircle {
  size: number;
  color: string;
  opacity: number;
  x: number;
  y: number;
  delay: number;
  duration: number;
  amplitude: number;
}

const FLOWER_CIRCLES: FlowerCircle[] = [
  { size: 48, color: Colors.rose, opacity: 0.2, x: SCREEN_WIDTH * 0.1, y: SCREEN_HEIGHT * 0.12, delay: 0, duration: 3000, amplitude: 18 },
  { size: 32, color: Colors.coral, opacity: 0.18, x: SCREEN_WIDTH * 0.78, y: SCREEN_HEIGHT * 0.08, delay: 400, duration: 3500, amplitude: 14 },
  { size: 56, color: Colors.peach, opacity: 0.15, x: SCREEN_WIDTH * 0.6, y: SCREEN_HEIGHT * 0.22, delay: 200, duration: 4000, amplitude: 20 },
  { size: 24, color: Colors.plum, opacity: 0.2, x: SCREEN_WIDTH * 0.25, y: SCREEN_HEIGHT * 0.3, delay: 600, duration: 2800, amplitude: 12 },
  { size: 40, color: Colors.rose, opacity: 0.15, x: SCREEN_WIDTH * 0.85, y: SCREEN_HEIGHT * 0.55, delay: 300, duration: 3200, amplitude: 16 },
  { size: 28, color: Colors.coral, opacity: 0.25, x: SCREEN_WIDTH * 0.05, y: SCREEN_HEIGHT * 0.65, delay: 500, duration: 3800, amplitude: 15 },
  { size: 60, color: Colors.peach, opacity: 0.12, x: SCREEN_WIDTH * 0.5, y: SCREEN_HEIGHT * 0.78, delay: 100, duration: 4200, amplitude: 22 },
  { size: 20, color: Colors.plum, opacity: 0.3, x: SCREEN_WIDTH * 0.7, y: SCREEN_HEIGHT * 0.7, delay: 700, duration: 2600, amplitude: 10 },
];

function FloatingCircle({ circle }: { circle: FlowerCircle }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      circle.delay,
      withRepeat(
        withTiming(1, { duration: circle.duration, easing: Easing.inOut(Easing.sin) }),
        -1,
        true
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(progress.value, [0, 1], [-circle.amplitude, circle.amplitude]);

    return {
      transform: [{ translateY }],
    };
  });

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: circle.x,
          top: circle.y,
          width: circle.size,
          height: circle.size,
          borderRadius: circle.size / 2,
          backgroundColor: circle.color,
          opacity: circle.opacity,
        },
        animatedStyle,
      ]}
    />
  );
}

export default function HelloScreen() {
  const router = useRouter();

  return (
    <OnboardingLayout
      step={1}
      showBack={false}
      onNext={() => router.push('/(onboarding)/credibility')}
    >
      <View style={styles.wrapper}>
        {/* Floating flower circles background */}
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          {FLOWER_CIRCLES.map((circle, index) => (
            <FloatingCircle key={index} circle={circle} />
          ))}
        </View>

        {/* Main content */}
        <View style={styles.content}>
          <Text style={styles.moon}>🌙</Text>
          <Text style={styles.title}>Ola, eu sou a Luna</Text>
          <Text style={styles.description}>
            Vou te ajudar a entender seu ciclo menstrual, seus sintomas e seu corpo de um jeito simples e acolhedor.
          </Text>
          <Text style={styles.description}>
            Juntas, vamos transformar o conhecimento do seu ciclo em superpoder.
          </Text>
        </View>
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  moon: {
    fontSize: 64,
    marginBottom: Spacing['2xl'],
  },
  title: {
    fontFamily: Typography.fonts.displayBold,
    fontSize: Typography.sizes['3xl'],
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  description: {
    fontFamily: Typography.fonts.body,
    fontSize: Typography.sizes.md,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: Typography.sizes.md * Typography.lineHeights.relaxed,
    marginBottom: Spacing.md,
  },
});
