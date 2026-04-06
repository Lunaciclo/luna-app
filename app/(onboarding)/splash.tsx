import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { Redirect } from 'expo-router';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';

export default function SplashScreen() {
  const [ready, setReady] = useState(false);
  const scale = useSharedValue(0.5);
  const opacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withSequence(
      withTiming(1.1, { duration: 600, easing: Easing.out(Easing.ease) }),
      withTiming(1, { duration: 200 })
    );
    opacity.value = withTiming(1, { duration: 600 });
    textOpacity.value = withDelay(400, withTiming(1, { duration: 500 }));

    const timer = setTimeout(() => {
      setReady(true);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  if (ready) {
    return <Redirect href="/(onboarding)/hello" />;
  }

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.logoContainer, logoStyle]}>
        <Text style={styles.moon}>🌙</Text>
      </Animated.View>
      <Animated.View style={textStyle}>
        <Text style={styles.title}>Luna</Text>
        <Text style={styles.subtitle}>Seu ciclo, sua força</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cream,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    marginBottom: 24,
  },
  moon: {
    fontSize: 80,
  },
  title: {
    fontFamily: Typography.fonts.displayBold,
    fontSize: Typography.sizes['4xl'],
    color: Colors.text,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: Typography.fonts.displayItalic,
    fontSize: Typography.sizes.lg,
    color: Colors.textLight,
    textAlign: 'center',
    marginTop: 8,
  },
});
