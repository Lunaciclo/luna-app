import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Redirect } from 'expo-router';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Spacing } from '../../theme/spacing';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const RING_SIZE = 180;
const STROKE_WIDTH = 8;
const RADIUS = (RING_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const MESSAGES = [
  { threshold: 0, text: 'Analisando seu ciclo...' },
  { threshold: 30, text: 'Calculando suas fases...' },
  { threshold: 60, text: 'Personalizando para você...' },
  { threshold: 90, text: 'Quase lá...' },
];

export default function LoadingScreen() {
  const [progress, setProgress] = useState(0);
  const [showBadge, setShowBadge] = useState(false);
  const [navigateToResult, setNavigateToResult] = useState(false);
  const animatedProgress = useSharedValue(0);
  const badgeOpacity = useSharedValue(0);

  // ALL hooks before any conditional return
  useEffect(() => {
    animatedProgress.value = withTiming(progress, {
      duration: 100,
      easing: Easing.linear,
    });
  }, [progress]);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 2;
        if (next >= 100) {
          clearInterval(interval);
          setShowBadge(true);
          badgeOpacity.value = withTiming(1, { duration: 400 });
          setTimeout(() => {
            setNavigateToResult(true);
          }, 800);
          return 100;
        }
        return next;
      });
    }, 60);

    return () => clearInterval(interval);
  }, []);

  const animatedProps = useAnimatedProps(() => {
    const offset = CIRCUMFERENCE * (1 - animatedProgress.value / 100);
    return {
      strokeDashoffset: offset,
    };
  });

  const badgeStyle = useAnimatedStyle(() => ({
    opacity: badgeOpacity.value,
  }));

  const currentMessage =
    [...MESSAGES].reverse().find((m) => progress >= m.threshold)?.text ?? '';

  if (navigateToResult) {
    return <Redirect href="/(onboarding)/result" />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.ringContainer}>
          <Svg width={RING_SIZE} height={RING_SIZE}>
            <Circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RADIUS}
              stroke={Colors.blush}
              strokeWidth={STROKE_WIDTH}
              fill="none"
            />
            <AnimatedCircle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RADIUS}
              stroke={Colors.rose}
              strokeWidth={STROKE_WIDTH}
              fill="none"
              strokeDasharray={CIRCUMFERENCE}
              strokeLinecap="round"
              rotation={-90}
              origin={`${RING_SIZE / 2}, ${RING_SIZE / 2}`}
              animatedProps={animatedProps}
            />
          </Svg>
          <View style={styles.percentageContainer}>
            <Text style={styles.percentage}>{progress}%</Text>
          </View>
        </View>
        <Text style={styles.message}>{currentMessage}</Text>
      </View>
      {showBadge && (
        <Animated.View style={[styles.badge, badgeStyle]}>
          <Text style={styles.badgeText}>LGPD • ISO 27001</Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cream,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing['2xl'],
  },
  content: {
    alignItems: 'center',
  },
  ringContainer: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing['2xl'],
  },
  percentageContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentage: {
    fontFamily: Typography.fonts.displayBold,
    fontSize: Typography.sizes['4xl'],
    color: Colors.rose,
  },
  message: {
    fontFamily: Typography.fonts.bodyMedium,
    fontSize: Typography.sizes.md,
    color: Colors.textLight,
  },
  badge: {
    position: 'absolute',
    bottom: 80,
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: Colors.blush,
  },
  badgeText: {
    fontFamily: Typography.fonts.bodyMedium,
    fontSize: Typography.sizes.sm,
    color: Colors.textLight,
  },
});
