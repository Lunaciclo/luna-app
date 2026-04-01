import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  Easing,
  interpolate,
  FadeInDown,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { OnboardingLayout } from '../../components/onboarding/OnboardingLayout';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Spacing } from '../../theme/spacing';
import { Radius } from '../../theme/radius';

const REVIEWS = [
  { name: 'Ana, 24', text: 'Finalmente entendo o que acontece com meu corpo durante o mes!', stars: 5 },
  { name: 'Mariana, 28', text: 'A Luna IA me ajuda a entender meus sintomas. Amei!', stars: 5 },
  { name: 'Camila, 31', text: 'O Circulo de Amigas e incrivel. Compartilho tudo com minhas amigas.', stars: 5 },
];

function getInitial(name: string): string {
  return name.charAt(0).toUpperCase();
}

const AVATAR_COLORS = [Colors.rose, Colors.coral, Colors.plum];

function ReviewBubble({
  review,
  index,
}: {
  review: (typeof REVIEWS)[number];
  index: number;
}) {
  const floatProgress = useSharedValue(0);

  useEffect(() => {
    const delay = index * 200;
    const duration = 3000 + index * 400;

    floatProgress.value = withDelay(
      delay,
      withRepeat(
        withTiming(1, { duration, easing: Easing.inOut(Easing.sin) }),
        -1,
        true
      )
    );
  }, []);

  const floatStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      floatProgress.value,
      [0, 1],
      [-4, 4]
    );

    return {
      transform: [{ translateY }],
    };
  });

  const entranceDelay = index * 300;

  return (
    <Animated.View
      entering={FadeInDown.delay(entranceDelay).duration(500).easing(Easing.out(Easing.quad))}
      style={styles.bubbleWrapper}
    >
      <Animated.View style={[styles.bubbleRow, floatStyle]}>
        {/* Avatar */}
        <View style={[styles.avatar, { backgroundColor: AVATAR_COLORS[index % AVATAR_COLORS.length] }]}>
          <Text style={styles.avatarText}>{getInitial(review.name)}</Text>
        </View>

        {/* Speech bubble */}
        <View style={styles.bubble}>
          {/* Bubble tail */}
          <View style={styles.bubbleTail} />

          <Text style={styles.stars}>{'⭐'.repeat(review.stars)}</Text>
          <Text style={styles.reviewText}>"{review.text}"</Text>
          <Text style={styles.reviewName}>-- {review.name}</Text>
        </View>
      </Animated.View>
    </Animated.View>
  );
}

export default function SocialProofScreen() {
  const router = useRouter();

  return (
    <OnboardingLayout
      step={20}
      title="O que dizem sobre a Luna"
      onNext={() => router.push('/(onboarding)/without-with')}
    >
      <View style={styles.reviews}>
        {REVIEWS.map((review, i) => (
          <ReviewBubble key={i} review={review} index={i} />
        ))}
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  reviews: {
    gap: Spacing.base,
    paddingTop: Spacing.sm,
  },
  bubbleWrapper: {
    marginBottom: Spacing.xs,
  },
  bubbleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.xs,
  },
  avatarText: {
    fontFamily: Typography.fonts.bodyBold,
    fontSize: Typography.sizes.md,
    color: Colors.white,
  },
  bubble: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    // Position relative for the tail
    position: 'relative',
  },
  bubbleTail: {
    position: 'absolute',
    left: -8,
    top: 16,
    width: 0,
    height: 0,
    borderTopWidth: 8,
    borderTopColor: 'transparent',
    borderBottomWidth: 8,
    borderBottomColor: 'transparent',
    borderRightWidth: 8,
    borderRightColor: Colors.white,
  },
  stars: {
    fontSize: 14,
    marginBottom: Spacing.sm,
  },
  reviewText: {
    fontFamily: Typography.fonts.displayItalic,
    fontSize: Typography.sizes.base,
    color: Colors.text,
    lineHeight: Typography.sizes.base * Typography.lineHeights.relaxed,
    marginBottom: Spacing.sm,
  },
  reviewName: {
    fontFamily: Typography.fonts.bodyMedium,
    fontSize: Typography.sizes.sm,
    color: Colors.textLight,
  },
});
