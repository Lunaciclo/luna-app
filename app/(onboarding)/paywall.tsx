import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Modal,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  FadeIn,
  FadeOut,
  SlideInDown,
} from 'react-native-reanimated';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Spacing } from '../../theme/spacing';
import { Radius } from '../../theme/radius';
import { Button } from '../../components/ui/Button';
import { useSubscription } from '../../hooks/useSubscription';
import { getOfferings, purchasePackage } from '../../lib/revenuecat';
import { useSubscriptionStore } from '../../store/useSubscriptionStore';

type BillingPeriod = 'monthly' | 'annual';

const MONTHLY_PRICE = 19.9;
const ANNUAL_PRICE = 149.9;
const ANNUAL_MONTHLY_EQUIVALENT = ANNUAL_PRICE / 12;
const FAMILIA_PRICE = 9.9;
const DISCOUNT_PERCENT = 30;

interface FeatureRow {
  label: string;
  free: boolean;
  plus: boolean;
  familia: boolean;
}

const FEATURE_COMPARISON: FeatureRow[] = [
  { label: 'Registro diario', free: true, plus: true, familia: true },
  { label: 'Calendario', free: true, plus: true, familia: true },
  { label: 'Luna IA', free: false, plus: true, familia: true },
  { label: 'Circulo ilimitado', free: false, plus: true, familia: true },
  { label: 'Modo Parceiro', free: false, plus: true, familia: true },
  { label: 'Insights premium', free: false, plus: true, familia: true },
];

function formatTime(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export default function PaywallScreen() {
  const router = useRouter();
  const { isPremium } = useSubscription();
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('monthly');
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [showWinback, setShowWinback] = useState(false);
  const [winbackCountdown, setWinbackCountdown] = useState(24 * 60 * 60); // 24h in seconds
  const hasShownWinback = useRef(false);
  const countdownInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // Animated values for toggle
  const togglePosition = useSharedValue(billingPeriod === 'monthly' ? 0 : 1);
  const toggleContainerWidth = SCREEN_WIDTH - Spacing.xl * 2 - Spacing.xs * 2;
  const togglePillWidth = toggleContainerWidth / 2;

  useEffect(() => {
    togglePosition.value = withSpring(billingPeriod === 'monthly' ? 0 : 1);
  }, [billingPeriod]);

  // Winback countdown timer
  useEffect(() => {
    if (showWinback) {
      countdownInterval.current = setInterval(() => {
        setWinbackCountdown((prev) => {
          if (prev <= 1) {
            if (countdownInterval.current) clearInterval(countdownInterval.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (countdownInterval.current) clearInterval(countdownInterval.current);
    };
  }, [showWinback]);

  const toggleAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: withTiming(togglePosition.value * togglePillWidth, { duration: 250 }) },
      ],
      width: togglePillWidth,
    };
  });

  async function handlePurchase() {
    if (isPurchasing) return;
    setIsPurchasing(true);
    try {
      const offerings = await getOfferings();
      if (offerings) {
        const pkg =
          billingPeriod === 'monthly'
            ? offerings.monthly
            : offerings.annual;
        if (pkg) {
          const result = await purchasePackage(pkg);
          if (result) {
            useSubscriptionStore.getState().setSubscription(
              billingPeriod === 'monthly'
                ? 'luna_plus_monthly'
                : 'luna_plus_monthly',
              null,
            );
            router.push('/(onboarding)/celebration');
            return;
          }
        }
      }
      // Fallback: if RevenueCat not configured, still navigate (for dev)
      router.push('/(onboarding)/celebration');
    } catch (error) {
      Alert.alert(
        'Erro na compra',
        'Nao foi possivel processar a compra. Tente novamente.',
      );
    } finally {
      setIsPurchasing(false);
    }
  }

  const handleSkip = useCallback(() => {
    if (!hasShownWinback.current) {
      hasShownWinback.current = true;
      setShowWinback(true);
      return;
    }
    router.push('/(onboarding)/create-account');
  }, [router]);

  async function handleWinbackAccept() {
    setShowWinback(false);
    if (isPurchasing) return;
    setIsPurchasing(true);
    try {
      const offerings = await getOfferings();
      if (offerings) {
        // Try to use a promo package if available, otherwise fall back to standard
        const pkg =
          billingPeriod === 'monthly'
            ? offerings.monthly
            : offerings.annual;
        if (pkg) {
          const result = await purchasePackage(pkg);
          if (result) {
            useSubscriptionStore.getState().setSubscription(
              billingPeriod === 'monthly'
                ? 'luna_plus_monthly'
                : 'luna_plus_monthly',
              null,
            );
            router.push('/(onboarding)/celebration');
            return;
          }
        }
      }
      // Fallback: if RevenueCat not configured, still navigate (for dev)
      router.push('/(onboarding)/celebration');
    } catch (error) {
      Alert.alert(
        'Erro na compra',
        'Nao foi possivel processar a compra. Tente novamente.',
      );
    } finally {
      setIsPurchasing(false);
    }
  }

  function handleWinbackDismiss() {
    setShowWinback(false);
    router.push('/(onboarding)/create-account');
  }

  const currentPrice =
    billingPeriod === 'monthly' ? MONTHLY_PRICE : ANNUAL_PRICE;
  const currentPriceLabel =
    billingPeriod === 'monthly'
      ? `R$ ${MONTHLY_PRICE.toFixed(2).replace('.', ',')}/mes`
      : `R$ ${ANNUAL_PRICE.toFixed(2).replace('.', ',')}/ano`;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} bounces={false}>
        {/* Hero */}
        <LinearGradient
          colors={[...Colors.gradients.paywall]}
          style={styles.hero}
        >
          <Text style={styles.heroEmoji}>🌙</Text>
          <Text style={styles.heroTitle}>Luna Plus</Text>
          <Text style={styles.heroSubtitle}>
            Desbloqueie todo o potencial da sua saude
          </Text>
        </LinearGradient>

        <View style={styles.content}>
          {/* Social proof */}
          <View style={styles.socialProof}>
            <Text style={styles.stars}>⭐⭐⭐⭐⭐</Text>
            <Text style={styles.socialProofText}>
              Mais de 50.000 mulheres ja usam Luna Plus
            </Text>
            <Text style={styles.review}>
              "A melhor coisa que fiz pela minha saude feminina" — Julia, 26
            </Text>
          </View>

          {/* Feature comparison table */}
          <View style={styles.comparisonTable}>
            <Text style={styles.sectionTitle}>Compare os planos</Text>

            {/* Table header */}
            <View style={styles.tableHeader}>
              <View style={styles.tableFeatureCol} />
              <Text style={styles.tableHeaderText}>Free</Text>
              <Text style={[styles.tableHeaderText, styles.tableHeaderHighlight]}>
                Plus
              </Text>
              <Text style={styles.tableHeaderText}>Familia</Text>
            </View>

            {/* Table rows */}
            {FEATURE_COMPARISON.map((feature, i) => (
              <View
                key={i}
                style={[
                  styles.tableRow,
                  i % 2 === 0 && styles.tableRowAlt,
                ]}
              >
                <Text style={styles.tableFeatureLabel}>{feature.label}</Text>
                <Text style={[styles.tableCheck, !feature.free && styles.tableCross]}>
                  {feature.free ? '✓' : '✕'}
                </Text>
                <Text style={[styles.tableCheck, styles.tableCheckHighlight]}>
                  {feature.plus ? '✓' : '✕'}
                </Text>
                <Text style={[styles.tableCheck, !feature.familia && styles.tableCross]}>
                  {feature.familia ? '✓' : '✕'}
                </Text>
              </View>
            ))}
          </View>

          {/* Billing period toggle */}
          <Text style={styles.sectionTitle}>Escolha seu plano</Text>
          <View style={styles.toggleContainer}>
            <Animated.View style={[styles.togglePill, toggleAnimatedStyle]} />
            <Pressable
              style={styles.toggleOption}
              onPress={() => setBillingPeriod('monthly')}
            >
              <Text
                style={[
                  styles.toggleText,
                  billingPeriod === 'monthly' && styles.toggleTextActive,
                ]}
              >
                Mensal
              </Text>
            </Pressable>
            <Pressable
              style={styles.toggleOption}
              onPress={() => setBillingPeriod('annual')}
            >
              <Text
                style={[
                  styles.toggleText,
                  billingPeriod === 'annual' && styles.toggleTextActive,
                ]}
              >
                Anual
              </Text>
              {billingPeriod === 'annual' && (
                <View style={styles.saveBadge}>
                  <Text style={styles.saveBadgeText}>Economize 37%</Text>
                </View>
              )}
            </Pressable>
          </View>

          {/* Plan cards */}
          <View style={styles.planCard}>
            <View style={styles.planCardHeader}>
              <Text style={styles.planName}>Luna Plus</Text>
              {billingPeriod === 'annual' && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularBadgeText}>MAIS POPULAR</Text>
                </View>
              )}
            </View>
            <Text style={styles.planPrice}>{currentPriceLabel}</Text>
            {billingPeriod === 'annual' && (
              <Text style={styles.planPriceDetail}>
                Equivale a R$ {ANNUAL_MONTHLY_EQUIVALENT.toFixed(2).replace('.', ',')}/mes
              </Text>
            )}
          </View>

          <View style={[styles.planCard, styles.planCardSecondary]}>
            <Text style={styles.planName}>Luna Familia</Text>
            <Text style={styles.planPrice}>
              R$ {FAMILIA_PRICE.toFixed(2).replace('.', ',')}/pessoa/ano
            </Text>
            <Text style={styles.planPriceDetail}>Ate 6 membros</Text>
          </View>

          {/* Money-back guarantee */}
          <View style={styles.guaranteeRow}>
            <Text style={styles.guaranteeText}>
              7 dias gratis · Cancele quando quiser
            </Text>
          </View>

          {/* CTA */}
          <Button
            title={isPurchasing ? 'Processando...' : 'Comecar agora'}
            onPress={handlePurchase}
            variant="pill"
            fullWidth
            disabled={isPurchasing}
          />
          {isPurchasing && (
            <ActivityIndicator
              size="small"
              color={Colors.rose}
              style={{ marginTop: Spacing.sm }}
            />
          )}

          {/* Skip */}
          <Pressable onPress={handleSkip} style={styles.skipButton}>
            <Text style={styles.skipText}>Continuar gratis</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Winback Modal */}
      <Modal
        visible={showWinback}
        transparent
        animationType="none"
        onRequestClose={handleWinbackDismiss}
      >
        <View style={styles.modalOverlay}>
          <Animated.View
            entering={SlideInDown.springify().damping(15)}
            style={styles.modalContent}
          >
            <LinearGradient
              colors={[...Colors.gradients.paywall]}
              style={styles.modalGradient}
            >
              <Text style={styles.modalEmoji}>🎁</Text>
              <Text style={styles.modalTitle}>Espera!</Text>
              <Text style={styles.modalSubtitle}>
                Temos uma oferta especial para voce
              </Text>
            </LinearGradient>

            <View style={styles.modalBody}>
              <View style={styles.discountBadge}>
                <Text style={styles.discountBadgeText}>
                  {DISCOUNT_PERCENT}% OFF
                </Text>
              </View>

              <Text style={styles.modalPriceOriginal}>
                De R$ {currentPrice.toFixed(2).replace('.', ',')}
              </Text>
              <Text style={styles.modalPriceDiscount}>
                Por R${' '}
                {(currentPrice * (1 - DISCOUNT_PERCENT / 100))
                  .toFixed(2)
                  .replace('.', ',')}
                {billingPeriod === 'monthly' ? '/mes' : '/ano'}
              </Text>

              <View style={styles.timerContainer}>
                <Text style={styles.timerLabel}>Oferta expira em</Text>
                <Text style={styles.timerValue}>
                  {formatTime(winbackCountdown)}
                </Text>
              </View>

              <Button
                title={isPurchasing ? 'Processando...' : 'Aproveitar desconto'}
                onPress={handleWinbackAccept}
                variant="pill"
                fullWidth
                disabled={isPurchasing}
              />
              {isPurchasing && (
                <ActivityIndicator
                  size="small"
                  color={Colors.rose}
                  style={{ marginTop: Spacing.sm }}
                />
              )}

              <Pressable
                onPress={handleWinbackDismiss}
                style={styles.winbackDismiss}
              >
                <Text style={styles.winbackDismissText}>Nao, obrigada</Text>
              </Pressable>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  scroll: {
    flexGrow: 1,
  },

  // Hero
  hero: {
    alignItems: 'center',
    paddingVertical: Spacing['3xl'],
    paddingTop: Spacing['4xl'],
  },
  heroEmoji: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  heroTitle: {
    fontFamily: Typography.fonts.displayBold,
    fontSize: Typography.sizes['3xl'],
    color: Colors.white,
  },
  heroSubtitle: {
    fontFamily: Typography.fonts.body,
    fontSize: Typography.sizes.base,
    color: Colors.white,
    opacity: 0.9,
    marginTop: Spacing.sm,
  },

  // Content
  content: {
    padding: Spacing.xl,
  },

  // Social proof
  socialProof: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  stars: {
    textAlign: 'center',
    fontSize: 18,
    marginBottom: Spacing.sm,
  },
  socialProofText: {
    fontFamily: Typography.fonts.bodyBold,
    fontSize: Typography.sizes.sm,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  review: {
    fontFamily: Typography.fonts.displayItalic,
    fontSize: Typography.sizes.sm,
    color: Colors.textLight,
    textAlign: 'center',
  },

  // Section title
  sectionTitle: {
    fontFamily: Typography.fonts.displayBold,
    fontSize: Typography.sizes.lg,
    color: Colors.text,
    marginBottom: Spacing.base,
  },

  // Comparison table
  comparisonTable: {
    marginBottom: Spacing['2xl'],
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.blush,
  },
  tableFeatureCol: {
    flex: 1,
  },
  tableHeaderText: {
    fontFamily: Typography.fonts.bodyBold,
    fontSize: Typography.sizes.xs,
    color: Colors.textLight,
    width: 56,
    textAlign: 'center',
  },
  tableHeaderHighlight: {
    color: Colors.rose,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
  },
  tableRowAlt: {
    backgroundColor: Colors.blush,
    borderRadius: Radius.sm,
  },
  tableFeatureLabel: {
    fontFamily: Typography.fonts.body,
    fontSize: Typography.sizes.sm,
    color: Colors.text,
    flex: 1,
  },
  tableCheck: {
    fontFamily: Typography.fonts.bodyBold,
    fontSize: Typography.sizes.base,
    color: Colors.green,
    width: 56,
    textAlign: 'center',
  },
  tableCheckHighlight: {
    color: Colors.rose,
  },
  tableCross: {
    color: Colors.textLight,
    opacity: 0.4,
  },

  // Toggle
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.blush,
    borderRadius: Radius.full,
    padding: Spacing.xs,
    marginBottom: Spacing.lg,
    position: 'relative',
  },
  togglePill: {
    position: 'absolute',
    top: Spacing.xs,
    left: Spacing.xs,
    bottom: Spacing.xs,
    backgroundColor: Colors.white,
    borderRadius: Radius.full,
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  toggleOption: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    zIndex: 1,
  },
  toggleText: {
    fontFamily: Typography.fonts.bodyMedium,
    fontSize: Typography.sizes.sm,
    color: Colors.textLight,
  },
  toggleTextActive: {
    fontFamily: Typography.fonts.bodyBold,
    color: Colors.text,
  },
  saveBadge: {
    backgroundColor: Colors.green,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.full,
    marginTop: Spacing.xs,
  },
  saveBadgeText: {
    fontFamily: Typography.fonts.bodyBold,
    fontSize: 10,
    color: Colors.white,
  },

  // Plan cards
  planCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.rose,
  },
  planCardSecondary: {
    borderColor: Colors.blush,
  },
  planCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  planName: {
    fontFamily: Typography.fonts.bodyBold,
    fontSize: Typography.sizes.md,
    color: Colors.text,
  },
  planPrice: {
    fontFamily: Typography.fonts.displayBold,
    fontSize: Typography.sizes.lg,
    color: Colors.rose,
    marginTop: Spacing.xs,
  },
  planPriceDetail: {
    fontFamily: Typography.fonts.body,
    fontSize: Typography.sizes.xs,
    color: Colors.textLight,
    marginTop: 2,
  },
  popularBadge: {
    backgroundColor: Colors.rose,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
  },
  popularBadgeText: {
    fontFamily: Typography.fonts.bodyBold,
    fontSize: Typography.sizes.xs,
    color: Colors.white,
  },

  // Guarantee
  guaranteeRow: {
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  guaranteeText: {
    fontFamily: Typography.fonts.bodyMedium,
    fontSize: Typography.sizes.sm,
    color: Colors.green,
  },

  // Skip
  skipButton: {
    alignItems: 'center',
    marginTop: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  skipText: {
    fontFamily: Typography.fonts.body,
    fontSize: Typography.sizes.sm,
    color: Colors.textLight,
  },

  // Winback Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(45, 27, 46, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.cream,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    overflow: 'hidden',
  },
  modalGradient: {
    alignItems: 'center',
    paddingVertical: Spacing['2xl'],
    paddingHorizontal: Spacing.xl,
  },
  modalEmoji: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  modalTitle: {
    fontFamily: Typography.fonts.displayBold,
    fontSize: Typography.sizes['2xl'],
    color: Colors.white,
  },
  modalSubtitle: {
    fontFamily: Typography.fonts.body,
    fontSize: Typography.sizes.base,
    color: Colors.white,
    opacity: 0.9,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  modalBody: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  discountBadge: {
    backgroundColor: Colors.coral,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    marginBottom: Spacing.base,
  },
  discountBadgeText: {
    fontFamily: Typography.fonts.bodyBold,
    fontSize: Typography.sizes.lg,
    color: Colors.white,
  },
  modalPriceOriginal: {
    fontFamily: Typography.fonts.body,
    fontSize: Typography.sizes.base,
    color: Colors.textLight,
    textDecorationLine: 'line-through',
    marginBottom: Spacing.xs,
  },
  modalPriceDiscount: {
    fontFamily: Typography.fonts.displayBold,
    fontSize: Typography.sizes.xl,
    color: Colors.rose,
    marginBottom: Spacing.lg,
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
    backgroundColor: Colors.blush,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.base,
    borderRadius: Radius.lg,
    width: '100%',
  },
  timerLabel: {
    fontFamily: Typography.fonts.body,
    fontSize: Typography.sizes.sm,
    color: Colors.textLight,
    marginBottom: Spacing.xs,
  },
  timerValue: {
    fontFamily: Typography.fonts.bodyBold,
    fontSize: Typography.sizes['2xl'],
    color: Colors.rose,
  },
  winbackDismiss: {
    marginTop: Spacing.base,
    paddingVertical: Spacing.md,
  },
  winbackDismissText: {
    fontFamily: Typography.fonts.body,
    fontSize: Typography.sizes.sm,
    color: Colors.textLight,
  },
});
