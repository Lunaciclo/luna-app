import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  interpolateColor,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { HeroBlob } from '../../../components/cycle/HeroBlob';
import { WeekStrip } from '../../../components/cycle/WeekStrip';
import { DailyInsightCard } from '../../../components/cycle/DailyInsightCard';
import { Avatar } from '../../../components/ui/Avatar';
import { Card } from '../../../components/ui/Card';
import { useCurrentPhase } from '../../../hooks/useCurrentPhase';
import { useCycleStore } from '../../../store/useCycleStore';
import { useUserStore } from '../../../store/useUserStore';
import { Colors } from '../../../theme/colors';
import { Typography } from '../../../theme/typography';
import { Spacing } from '../../../theme/spacing';
import { Radius } from '../../../theme/radius';
import { PHASE_META } from '../../../constants/phases';
import { Phase } from '../../../types/cycle';

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

// Mock circle friends for preview
const CIRCLE_PREVIEW = [
  { id: '1', name: 'Ana', phase: 'ovulatory' as Phase },
  { id: '2', name: 'Maria', phase: 'menstrual' as Phase },
  { id: '3', name: 'Juliana', phase: 'luteal' as Phase },
];

export default function TodayScreen() {
  const router = useRouter();
  const { profile } = useUserStore();
  const { cycleData, todayLog, daysUntilPeriod } = useCycleStore();
  const { phase, dayOfCycle, meta, content, phaseColor } = useCurrentPhase();

  const currentMonth = format(new Date(), 'MMMM', { locale: ptBR });

  const displayCycleData = cycleData ?? {
    lastPeriodStart: new Date(),
    cycleLength: 28,
    flowLength: 5,
  };

  // Animated header: cream → phase color on scroll
  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const headerStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      scrollY.value,
      [0, 200],
      [Colors.cream, phaseColor + '15']
    );
    return { backgroundColor };
  });

  const headerTextOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, 150], [1, 0.8], Extrapolation.CLAMP),
  }));

  // Cycle status calculation
  const cycleStatus = useMemo(() => {
    const len = displayCycleData.cycleLength;
    if (len >= 21 && len <= 35) return { label: 'NORMAL', color: Colors.green };
    return { label: 'IRREGULAR', color: Colors.coral };
  }, [displayCycleData.cycleLength]);

  const flowStatus = useMemo(() => {
    const len = displayCycleData.flowLength;
    if (len >= 3 && len <= 7) return { label: 'NORMAL', color: Colors.green };
    return { label: 'ATENÇÃO', color: Colors.coral };
  }, [displayCycleData.flowLength]);

  const navigateToLog = useCallback(() => {
    router.push('/(app)/today/log');
  }, [router]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Sticky animated header */}
      <Animated.View style={[styles.header, headerStyle]}>
        <Pressable
          onPress={() => router.push('/(app)/profile')}
          accessibilityLabel="Abrir perfil"
        >
          <Avatar name={profile?.name} size={40} phaseColor={phaseColor} />
        </Pressable>
        <Animated.Text style={[styles.monthTitle, headerTextOpacity]}>
          {currentMonth}
        </Animated.Text>
        <View style={styles.headerRight}>
          <Pressable
            onPress={() => router.push('/(app)/calendar')}
            accessibilityLabel="Abrir calendário"
          >
            <Text style={styles.headerIcon}>📅</Text>
          </Pressable>
          <Pressable accessibilityLabel="Notificações">
            <View>
              <Text style={styles.headerIcon}>🔔</Text>
              <View style={styles.notifBadge} />
            </View>
          </Pressable>
        </View>
      </Animated.View>

      <AnimatedScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      >
        {/* 1. Week Strip */}
        <WeekStrip cycleData={displayCycleData} />

        {/* 2. Hero Blob */}
        <HeroBlob
          phase={phase}
          dayOfCycle={dayOfCycle}
          daysUntilPeriod={daysUntilPeriod}
          onLogPeriod={navigateToLog}
        />

        {/* 3. Metrics (only if data available) */}
        {todayLog && (todayLog.weightKg || todayLog.steps || todayLog.waterMl) && (
          <View style={styles.metrics}>
            {todayLog.weightKg != null && (
              <View style={styles.metricItem}>
                <Text style={styles.metricIcon}>⚖️</Text>
                <Text style={styles.metricValue}>{todayLog.weightKg} kg</Text>
              </View>
            )}
            {todayLog.steps != null && (
              <View style={styles.metricItem}>
                <Text style={styles.metricIcon}>👟</Text>
                <Text style={styles.metricValue}>
                  {todayLog.steps.toLocaleString('pt-BR')}
                </Text>
              </View>
            )}
            {todayLog.waterMl != null && (
              <View style={styles.metricItem}>
                <Text style={styles.metricIcon}>💧</Text>
                <Text style={styles.metricValue}>
                  {(todayLog.waterMl / 1000).toFixed(1)} L
                </Text>
              </View>
            )}
          </View>
        )}

        {/* 4. Insights section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Meus insights de hoje</Text>
            <View style={styles.todayBadge}>
              <Text style={styles.todayBadgeText}>HOJE</Text>
            </View>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.insightsRow}>
              {/* Log CTA Card */}
              <Pressable
                style={styles.logCtaCard}
                onPress={navigateToLog}
                accessibilityLabel="Registrar sintomas"
              >
                <View style={styles.logCtaAvatars}>
                  <Text style={styles.logCtaEmoji}>{meta.emoji}</Text>
                </View>
                <View style={styles.logCtaPlusCircle}>
                  <Text style={styles.logCtaPlus}>+</Text>
                </View>
                <Text style={styles.logCtaText}>Registrar</Text>
              </Pressable>

              {/* Phase insights */}
              {content.insights.map((insight, i) => (
                <DailyInsightCard
                  key={i}
                  tag={insight.tag}
                  title={insight.title}
                  icon={insight.icon}
                />
              ))}
            </View>
          </ScrollView>
        </View>

        {/* 5. Editorial section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{content.editorialTitle}</Text>
          <Pressable
            onPress={() => router.push('/(app)/insights')}
            accessibilityLabel={`Ler sobre ${content.editorialTitle}`}
          >
            <Card>
              <View style={styles.articleBanner}>
                <Text style={styles.articleBannerEmoji}>{meta.emoji}</Text>
                <View style={styles.articleBannerContent}>
                  <Text style={styles.articleBannerTitle}>
                    Como aproveitar a fase {meta.label.toLowerCase()}
                  </Text>
                  <Text style={styles.articleBannerMeta}>5 min de leitura</Text>
                </View>
              </View>
            </Card>
          </Pressable>
          {/* Secondary articles */}
          <View style={styles.articleGrid}>
            {content.insights.slice(0, 2).map((insight, i) => (
              <Pressable
                key={i}
                style={styles.articleSmallCard}
                onPress={() => router.push('/(app)/insights')}
              >
                <Text style={styles.articleSmallEmoji}>{insight.icon}</Text>
                <Text style={styles.articleSmallTitle}>{insight.title}</Text>
                <Text style={styles.articleSmallMeta}>3 min</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* 6. Círculo de Amigas (exclusivo Luna) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Seu círculo hoje</Text>
          <Card>
            <View style={styles.circleAvatars}>
              {CIRCLE_PREVIEW.map((friend) => {
                const friendMeta = PHASE_META[friend.phase];
                return (
                  <View key={friend.id} style={styles.circleAvatarWrap}>
                    <Avatar
                      name={friend.name}
                      size={44}
                      phaseColor={friendMeta.color}
                    />
                    <Text style={styles.circleAvatarName}>{friend.name}</Text>
                    <Text style={styles.circleAvatarEmoji}>{friendMeta.emoji}</Text>
                  </View>
                );
              })}
              <Pressable
                style={styles.circleAddButton}
                onPress={() => router.push('/(app)/circle')}
                accessibilityLabel="Ver círculo de amigas"
              >
                <Text style={styles.circleAddPlus}>+</Text>
              </Pressable>
            </View>
            {CIRCLE_PREVIEW.length > 0 && (
              <View style={styles.circleHighlight}>
                <Text style={styles.circleHighlightText}>
                  {CIRCLE_PREVIEW[0].name} está na fase{' '}
                  {PHASE_META[CIRCLE_PREVIEW[0].phase].label.toLowerCase()}{' '}
                  {PHASE_META[CIRCLE_PREVIEW[0].phase].emoji}
                </Text>
              </View>
            )}
          </Card>
        </View>

        {/* 7. Meu Ciclo */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Meu ciclo</Text>
          <Card>
            <View style={styles.cycleStatRow}>
              <Text style={styles.cycleStatLabel}>Comprimento anterior</Text>
              <View style={styles.cycleStatValue}>
                <Text style={styles.cycleStatNumber}>
                  {displayCycleData.cycleLength} dias
                </Text>
                <Text style={[styles.statusBadge, { color: cycleStatus.color }]}>
                  ✅ {cycleStatus.label}
                </Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.cycleStatRow}>
              <Text style={styles.cycleStatLabel}>Duração do período</Text>
              <View style={styles.cycleStatValue}>
                <Text style={styles.cycleStatNumber}>
                  {displayCycleData.flowLength} dias
                </Text>
                <Text style={[styles.statusBadge, { color: flowStatus.color }]}>
                  ✅ {flowStatus.label}
                </Text>
              </View>
            </View>
            <View style={styles.divider} />
            {/* Luna IA CTA */}
            <Pressable
              style={styles.lunaIaCta}
              onPress={() => router.push('/(app)/profile/luna-ai')}
              accessibilityLabel="Abrir Luna IA"
            >
              <Text style={styles.lunaIaEmoji}>🌙</Text>
              <View style={styles.lunaIaContent}>
                <Text style={styles.lunaIaText}>
                  Olá {profile?.name ?? 'querida'}, seu relatório está pronto!
                </Text>
                <Text style={styles.lunaIaLink}>Ver em detalhes →</Text>
              </View>
            </Pressable>
          </Card>
        </View>

        {/* 8. Histórico do Ciclo */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Histórico do ciclo</Text>
          <Card>
            <View style={styles.historyDots}>
              {Array.from({ length: displayCycleData.cycleLength }).map((_, i) => {
                let color: string = Colors.phases.follicular;
                if (i < displayCycleData.flowLength) color = Colors.phases.menstrual;
                else if (i >= 13 && i <= 15) color = Colors.phases.ovulatory;
                else if (i >= 16) color = Colors.phases.luteal;
                const isCurrentDay = i === dayOfCycle - 1;
                return (
                  <View
                    key={i}
                    style={[
                      styles.historyDot,
                      { backgroundColor: color },
                      isCurrentDay && styles.historyDotCurrent,
                    ]}
                  />
                );
              })}
            </View>
            <Text style={styles.historyText}>
              Ciclo atual: {dayOfCycle} dias · Iniciou em{' '}
              {format(displayCycleData.lastPeriodStart, "d 'de' MMMM", {
                locale: ptBR,
              })}
            </Text>
            <Pressable style={styles.historyLink}>
              <Text style={styles.historyLinkText}>
                + Registrar ciclos anteriores
              </Text>
            </Pressable>
          </Card>
        </View>

        <View style={{ height: Spacing['4xl'] }} />
      </AnimatedScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  scroll: {
    flex: 1,
  },

  // Header (sticky)
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    zIndex: 10,
  },
  monthTitle: {
    fontFamily: Typography.fonts.displayBold,
    fontSize: Typography.sizes.lg,
    color: Colors.text,
    textTransform: 'capitalize',
  },
  headerRight: {
    flexDirection: 'row',
    gap: Spacing.md,
    alignItems: 'center',
  },
  headerIcon: {
    fontSize: 22,
  },
  notifBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.rose,
  },

  // Metrics
  metrics: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.xl,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.base,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  metricIcon: {
    fontSize: 14,
  },
  metricValue: {
    fontFamily: Typography.fonts.bodyMedium,
    fontSize: Typography.sizes.sm,
    color: Colors.textLight,
  },

  // Section
  section: {
    paddingHorizontal: Spacing.base,
    marginTop: Spacing['2xl'],
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontFamily: Typography.fonts.bodyBold,
    fontSize: Typography.sizes.md,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  todayBadge: {
    backgroundColor: Colors.blush,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: Spacing.md,
  },
  todayBadgeText: {
    fontFamily: Typography.fonts.bodyBold,
    fontSize: Typography.sizes.xs,
    color: Colors.rose,
  },

  // Insights
  insightsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingRight: Spacing.base,
  },
  logCtaCard: {
    width: 110,
    backgroundColor: Colors.green,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.base,
    gap: Spacing.sm,
  },
  logCtaAvatars: {
    alignItems: 'center',
  },
  logCtaEmoji: {
    fontSize: 24,
  },
  logCtaPlusCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logCtaPlus: {
    fontSize: 20,
    color: Colors.white,
    fontWeight: 'bold',
  },
  logCtaText: {
    fontFamily: Typography.fonts.bodyBold,
    fontSize: Typography.sizes.sm,
    color: Colors.white,
  },

  // Editorial
  articleBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  articleBannerEmoji: {
    fontSize: 40,
  },
  articleBannerContent: {
    flex: 1,
  },
  articleBannerTitle: {
    fontFamily: Typography.fonts.bodyBold,
    fontSize: Typography.sizes.md,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  articleBannerMeta: {
    fontFamily: Typography.fonts.body,
    fontSize: Typography.sizes.xs,
    color: Colors.textLight,
  },
  articleGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  articleSmallCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  articleSmallEmoji: {
    fontSize: 24,
  },
  articleSmallTitle: {
    fontFamily: Typography.fonts.bodyMedium,
    fontSize: Typography.sizes.sm,
    color: Colors.text,
  },
  articleSmallMeta: {
    fontFamily: Typography.fonts.body,
    fontSize: Typography.sizes.xs,
    color: Colors.textLight,
  },

  // Circle preview
  circleAvatars: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.base,
    marginBottom: Spacing.md,
  },
  circleAvatarWrap: {
    alignItems: 'center',
    gap: 2,
  },
  circleAvatarName: {
    fontFamily: Typography.fonts.body,
    fontSize: Typography.sizes.xs,
    color: Colors.textLight,
  },
  circleAvatarEmoji: {
    fontSize: 12,
  },
  circleAddButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.rose,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleAddPlus: {
    fontSize: 20,
    color: Colors.rose,
    fontWeight: 'bold',
  },
  circleHighlight: {
    backgroundColor: Colors.cream,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
  },
  circleHighlightText: {
    fontFamily: Typography.fonts.bodyMedium,
    fontSize: Typography.sizes.sm,
    color: Colors.text,
  },

  // Cycle stats
  cycleStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  cycleStatLabel: {
    fontFamily: Typography.fonts.body,
    fontSize: Typography.sizes.base,
    color: Colors.textLight,
  },
  cycleStatValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  cycleStatNumber: {
    fontFamily: Typography.fonts.bodyBold,
    fontSize: Typography.sizes.base,
    color: Colors.text,
  },
  statusBadge: {
    fontFamily: Typography.fonts.bodyMedium,
    fontSize: Typography.sizes.xs,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.cream,
    marginVertical: Spacing.xs,
  },
  lunaIaCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginTop: Spacing.md,
    backgroundColor: Colors.cream,
    padding: Spacing.md,
    borderRadius: Radius.md,
  },
  lunaIaEmoji: {
    fontSize: 28,
  },
  lunaIaContent: {
    flex: 1,
  },
  lunaIaText: {
    fontFamily: Typography.fonts.bodyMedium,
    fontSize: Typography.sizes.sm,
    color: Colors.text,
  },
  lunaIaLink: {
    fontFamily: Typography.fonts.bodyBold,
    fontSize: Typography.sizes.sm,
    color: Colors.rose,
    marginTop: 2,
  },

  // History
  historyDots: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: Spacing.md,
  },
  historyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  historyDotCurrent: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: Colors.white,
  },
  historyText: {
    fontFamily: Typography.fonts.body,
    fontSize: Typography.sizes.sm,
    color: Colors.textLight,
  },
  historyLink: {
    marginTop: Spacing.md,
  },
  historyLinkText: {
    fontFamily: Typography.fonts.bodyMedium,
    fontSize: Typography.sizes.sm,
    color: Colors.rose,
  },
});
