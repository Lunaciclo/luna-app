import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { Button } from '../../components/ui/Button';
import { useOnboardingStore } from '../../store/useOnboardingStore';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Spacing } from '../../theme/spacing';

export default function WelcomeScreen() {
  const router = useRouter();
  const { name } = useOnboardingStore();
  const scale = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const confettiOpacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(1, { damping: 8 });
    titleOpacity.value = withDelay(300, withTiming(1, { duration: 500 }));
    confettiOpacity.value = withDelay(500, withTiming(1, { duration: 400 }));
  }, []);

  const moonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
  }));

  const confettiStyle = useAnimatedStyle(() => ({
    opacity: confettiOpacity.value,
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={confettiStyle}>
        <Text style={styles.confetti}>🎊 ✨ 🎉</Text>
      </Animated.View>

      <Animated.View style={moonStyle}>
        <Text style={styles.moon}>🌙</Text>
      </Animated.View>

      <Animated.View style={titleStyle}>
        <Text style={styles.title}>
          Bem-vinda{name ? `, ${name}` : ''}!
        </Text>
        <Text style={styles.subtitle}>
          Sua Luna está pronta. Vamos juntas nessa jornada de autoconhecimento.
        </Text>
      </Animated.View>

      <View style={styles.footer}>
        <Button
          title="Começar a usar a Luna"
          onPress={() => router.replace('/(app)/today')}
          variant="pill"
          fullWidth
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cream,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  confetti: {
    fontSize: 32,
    marginBottom: Spacing.lg,
    letterSpacing: 8,
  },
  moon: {
    fontSize: 96,
    marginBottom: Spacing['2xl'],
  },
  title: {
    fontFamily: Typography.fonts.displayBold,
    fontSize: Typography.sizes['3xl'],
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  subtitle: {
    fontFamily: Typography.fonts.body,
    fontSize: Typography.sizes.md,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: Typography.sizes.md * Typography.lineHeights.relaxed,
  },
  footer: {
    position: 'absolute',
    bottom: Spacing['4xl'],
    left: Spacing.xl,
    right: Spacing.xl,
  },
});
