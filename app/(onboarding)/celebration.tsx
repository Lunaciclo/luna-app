import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  withSpring,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../../components/ui/Button';
import { useOnboardingStore } from '../../store/useOnboardingStore';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Spacing } from '../../theme/spacing';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const CONFETTI_COLORS = [Colors.rose, Colors.coral, Colors.peach, Colors.white];

interface ConfettiPiece {
  id: number;
  x: number;
  size: number;
  color: string;
  delay: number;
  duration: number;
  isCircle: boolean;
  rotation: number;
}

function generateConfetti(count: number): ConfettiPiece[] {
  const pieces: ConfettiPiece[] = [];
  for (let i = 0; i < count; i++) {
    pieces.push({
      id: i,
      x: Math.random() * (SCREEN_WIDTH - 12),
      size: 6 + Math.random() * 6,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      delay: Math.random() * 2000,
      duration: 2000 + Math.random() * 2000,
      isCircle: Math.random() > 0.5,
      rotation: Math.random() * 360,
    });
  }
  return pieces;
}

function ConfettiParticle({ piece }: { piece: ConfettiPiece }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      piece.delay,
      withRepeat(
        withTiming(1, { duration: piece.duration, easing: Easing.linear }),
        -1,
        false
      )
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      progress.value,
      [0, 1],
      [-50, SCREEN_HEIGHT + 50]
    );

    const rotate = interpolate(
      progress.value,
      [0, 1],
      [0, 360]
    );

    const opacity = interpolate(
      progress.value,
      [0, 0.1, 0.8, 1],
      [0, 1, 1, 0]
    );

    return {
      transform: [
        { translateY },
        { rotate: `${rotate}deg` },
      ],
      opacity,
    };
  });

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: piece.x,
          top: 0,
          width: piece.size,
          height: piece.size,
          backgroundColor: piece.color,
          borderRadius: piece.isCircle ? piece.size / 2 : 2,
        },
        animatedStyle,
      ]}
    />
  );
}

export default function CelebrationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { name } = useOnboardingStore();

  const titleScale = useSharedValue(0);
  const subtitleOpacity = useSharedValue(0);
  const buttonOpacity = useSharedValue(0);

  const confettiPieces = useMemo(() => generateConfetti(18), []);

  useEffect(() => {
    titleScale.value = withSpring(1, { damping: 8, stiffness: 100 });
    subtitleOpacity.value = withDelay(400, withSpring(1));
    buttonOpacity.value = withDelay(800, withTiming(1, { duration: 400 }));
  }, []);

  const titleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: titleScale.value }],
    opacity: titleScale.value,
  }));

  const subtitleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
  }));

  return (
    <LinearGradient
      colors={Colors.gradients.celebration}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      {/* Confetti layer */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {confettiPieces.map((piece) => (
          <ConfettiParticle key={piece.id} piece={piece} />
        ))}
      </View>

      {/* Content */}
      <View style={[styles.content, { paddingTop: insets.top + Spacing['3xl'] }]}>
        <Animated.View style={[styles.titleContainer, titleAnimatedStyle]}>
          <Text style={styles.emoji}>🎉</Text>
          <Text style={styles.title}>
            Parabens, voce e Luna Plus!
          </Text>
        </Animated.View>

        <Animated.View style={subtitleAnimatedStyle}>
          {name ? (
            <Text style={styles.subtitle}>
              {name}, sua jornada premium comeca agora.
            </Text>
          ) : (
            <Text style={styles.subtitle}>
              Sua jornada premium comeca agora.
            </Text>
          )}
        </Animated.View>
      </View>

      {/* Footer button */}
      <Animated.View
        style={[
          styles.footer,
          { paddingBottom: insets.bottom + Spacing.xl },
          buttonAnimatedStyle,
        ]}
      >
        <Button
          title="Criar minha conta"
          onPress={() => router.push('/(onboarding)/create-account')}
          variant="pill"
          fullWidth
          style={styles.button}
          textStyle={styles.buttonText}
        />
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  emoji: {
    fontSize: 80,
    marginBottom: Spacing['2xl'],
  },
  title: {
    fontFamily: Typography.fonts.displayBold,
    fontSize: Typography.sizes['3xl'],
    color: Colors.white,
    textAlign: 'center',
    lineHeight: Typography.sizes['3xl'] * Typography.lineHeights.tight,
  },
  subtitle: {
    fontFamily: Typography.fonts.body,
    fontSize: Typography.sizes.lg,
    color: Colors.white,
    textAlign: 'center',
    opacity: 0.9,
    lineHeight: Typography.sizes.lg * Typography.lineHeights.relaxed,
  },
  footer: {
    paddingHorizontal: Spacing.xl,
  },
  button: {
    backgroundColor: Colors.white,
  },
  buttonText: {
    color: Colors.plum,
  },
});
