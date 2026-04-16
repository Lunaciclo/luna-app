import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { OnboardingLayout } from '../../components/onboarding/OnboardingLayout';
import { useNotifications } from '../../hooks/useNotifications';
import { useOnboardingStore } from '../../store/useOnboardingStore';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Spacing } from '../../theme/spacing';
import { Radius } from '../../theme/radius';

const DEFAULT_DAYS_UNTIL_PERIOD = 14;

export default function NotificationsScreen() {
  const router = useRouter();
  const { requestPermission, scheduleAllNotifications } = useNotifications();
  const { name } = useOnboardingStore();

  // Animation values for the notification mockup
  const translateY = useSharedValue(-60);
  const opacity = useSharedValue(0);

  useEffect(() => {
    translateY.value = withDelay(
      500,
      withTiming(0, { duration: 500, easing: Easing.out(Easing.back(1.2)) })
    );
    opacity.value = withDelay(
      500,
      withTiming(1, { duration: 400, easing: Easing.out(Easing.ease) })
    );
  }, []);

  const mockupAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  async function handleEnable() {
    try {
      const granted = await requestPermission();
      if (granted) {
        const userName = name || 'Luna';
        await scheduleAllNotifications(userName, DEFAULT_DAYS_UNTIL_PERIOD);
      }
    } catch (e) {
      console.warn('Notification error:', e);
    }
    router.push('/(onboarding)/health-app');
  }

  return (
    <OnboardingLayout
      step={24}
      title="Ativar notificacoes?"
      subtitle="Receba lembretes sobre seu ciclo e quando registrar sintomas."
      onNext={handleEnable}
      nextLabel="Ativar notificacoes"
      showSkip
      onSkip={() => router.push('/(onboarding)/health-app')}
    >
      <View style={styles.content}>
        {/* Fake iPhone notification banner */}
        <Animated.View style={[styles.notificationBanner, mockupAnimatedStyle]}>
          <View style={styles.bannerRow}>
            <View style={styles.appIcon}>
              <Text style={styles.appIconText}>L</Text>
            </View>
            <View style={styles.bannerTextContainer}>
              <View style={styles.bannerHeader}>
                <Text style={styles.appName}>Luna</Text>
                <Text style={styles.timestamp}>agora</Text>
              </View>
              <Text style={styles.bannerMessage}>
                Seu periodo se aproxima em 3 dias
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Existing notification examples */}
        <View style={styles.examples}>
          {[
            { emoji: '🩸', text: 'Seu periodo se aproxima' },
            { emoji: '⚡', text: 'Janela fertil comeca hoje' },
            { emoji: '🌙', text: 'Lembrete para registrar o dia' },
          ].map((item, i) => (
            <View key={i} style={styles.exampleRow}>
              <Text style={styles.exampleEmoji}>{item.emoji}</Text>
              <Text style={styles.exampleText}>{item.text}</Text>
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
    paddingTop: Spacing.lg,
  },
  // Notification banner mockup
  notificationBanner: {
    width: '100%',
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing['2xl'],
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    // Shadow for Android
    elevation: 6,
  },
  bannerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  appIcon: {
    width: 38,
    height: 38,
    borderRadius: Radius.sm,
    backgroundColor: Colors.rose,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appIconText: {
    fontFamily: Typography.fonts.displayBold,
    fontSize: Typography.sizes.md,
    color: Colors.white,
  },
  bannerTextContainer: {
    flex: 1,
  },
  bannerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  appName: {
    fontFamily: Typography.fonts.bodyBold,
    fontSize: Typography.sizes.sm,
    color: Colors.text,
  },
  timestamp: {
    fontFamily: Typography.fonts.body,
    fontSize: Typography.sizes.xs,
    color: Colors.textLight,
  },
  bannerMessage: {
    fontFamily: Typography.fonts.body,
    fontSize: Typography.sizes.sm,
    color: Colors.text,
    lineHeight: Typography.sizes.sm * Typography.lineHeights.normal,
  },
  // Existing examples
  examples: {
    width: '100%',
    gap: Spacing.lg,
  },
  exampleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.blush,
    padding: Spacing.base,
    borderRadius: Radius.md,
  },
  exampleEmoji: {
    fontSize: 24,
  },
  exampleText: {
    fontFamily: Typography.fonts.bodyMedium,
    fontSize: Typography.sizes.base,
    color: Colors.text,
  },
});
