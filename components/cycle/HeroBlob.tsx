import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Phase } from '../../types/cycle';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Spacing } from '../../theme/spacing';

interface HeroBlobProps {
  phase: Phase;
  dayOfCycle: number;
  daysUntilPeriod: number;
  isLoading?: boolean;
  isSuccess?: boolean;
  onLogPeriod?: () => void;
}

export function HeroBlob({
  phase,
  dayOfCycle,
  daysUntilPeriod,
  isLoading = false,
  isSuccess = false,
  onLogPeriod,
}: HeroBlobProps) {
  const scale = useSharedValue(1);
  const rotate = useSharedValue(0);

  React.useEffect(() => {
    scale.value = withRepeat(
      withTiming(1.03, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    rotate.value = withRepeat(
      withTiming(360, { duration: 20000, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const blobStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const orbitStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotate.value}deg` }],
  }));

  const gradientColors = Colors.gradients.hero[phase];
  const phaseLabels: Record<Phase, string> = {
    menstrual: 'Menstruação',
    follicular: 'Fase Folicular',
    ovulatory: 'Fase Ovulatória',
    luteal: 'Fase Lútea',
  };

  return (
    <View style={styles.container}>
      {/* Orbiting sub-blobs */}
      <Animated.View style={[styles.orbitContainer, orbitStyle]}>
        <View
          style={[
            styles.subBlob,
            { backgroundColor: gradientColors[1], top: -10, left: '50%' },
          ]}
        />
        <View
          style={[
            styles.subBlob,
            { backgroundColor: gradientColors[0], bottom: 10, right: -5, opacity: 0.5 },
          ]}
        />
      </Animated.View>

      {/* Main blob */}
      <Animated.View style={[styles.blobWrapper, blobStyle]}>
        <LinearGradient
          colors={[...gradientColors]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.blob}
        >
          {isLoading ? (
            <>
              <Text style={styles.loadingText}>Atualizando</Text>
              <Text style={styles.loadingText}>previsões...</Text>
            </>
          ) : isSuccess ? (
            <>
              <Text style={styles.successIcon}>✓</Text>
              <Text style={styles.successText}>Previsões atualizadas!</Text>
            </>
          ) : (
            <>
              <Text style={styles.phaseLabel}>
                {phaseLabels[phase]} · Dia {dayOfCycle}
              </Text>
              {phase !== 'menstrual' && (
                <Text style={styles.periodCountdown}>
                  Período em {daysUntilPeriod} dias
                </Text>
              )}
              {phase === 'ovulatory' && (
                <Text style={styles.fertileBadge}>
                  Alta chance de gravidez
                </Text>
              )}
            </>
          )}
        </LinearGradient>
      </Animated.View>

      {/* Log period pill */}
      {onLogPeriod && !isLoading && !isSuccess && (
        <Pressable onPress={onLogPeriod} style={styles.logPill}>
          <Text style={styles.logPillText}>
            {phase === 'menstrual' ? 'Editar datas' : 'Registrar período'}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const BLOB_SIZE = 220;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    height: BLOB_SIZE + 60,
    marginVertical: Spacing.xl,
  },
  orbitContainer: {
    position: 'absolute',
    width: BLOB_SIZE + 40,
    height: BLOB_SIZE + 40,
  },
  subBlob: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  blobWrapper: {
    width: BLOB_SIZE,
    height: BLOB_SIZE,
  },
  blob: {
    width: BLOB_SIZE,
    height: BLOB_SIZE,
    borderRadius: BLOB_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing['2xl'],
  },
  phaseLabel: {
    fontFamily: Typography.fonts.displayBold,
    fontSize: Typography.sizes.lg,
    color: Colors.white,
    textAlign: 'center',
  },
  periodCountdown: {
    fontFamily: Typography.fonts.body,
    fontSize: Typography.sizes.sm,
    color: 'rgba(255,255,255,0.9)',
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  fertileBadge: {
    fontFamily: Typography.fonts.bodyMedium,
    fontSize: Typography.sizes.xs,
    color: Colors.white,
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 999,
    marginTop: Spacing.sm,
    overflow: 'hidden',
  },
  loadingText: {
    fontFamily: Typography.fonts.body,
    fontSize: Typography.sizes.base,
    color: Colors.white,
    textAlign: 'center',
  },
  successIcon: {
    fontSize: 48,
    color: Colors.white,
  },
  successText: {
    fontFamily: Typography.fonts.bodyMedium,
    fontSize: Typography.sizes.base,
    color: Colors.white,
    marginTop: Spacing.sm,
  },
  logPill: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: 999,
    marginTop: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  logPillText: {
    fontFamily: Typography.fonts.bodyMedium,
    fontSize: Typography.sizes.sm,
    color: Colors.white,
  },
});
