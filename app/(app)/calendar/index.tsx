import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { SlideInDown, SlideOutDown } from 'react-native-reanimated';
import {
  addMonths,
  subMonths,
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  differenceInDays,
  eachMonthOfInterval,
  startOfYear,
  endOfYear,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CycleCalendar } from '../../../components/cycle/CycleCalendar';
import { PhaseIndicator } from '../../../components/cycle/PhaseIndicator';
import { useCycleStore } from '../../../store/useCycleStore';
import { Colors } from '../../../theme/colors';
import { Typography } from '../../../theme/typography';
import { Spacing } from '../../../theme/spacing';
import { Radius } from '../../../theme/radius';
import { PHASE_META } from '../../../constants/phases';
import { Phase } from '../../../types/cycle';
import { getDayOfCycle, getPhaseForDay } from '../../../lib/cycle';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type ViewMode = 'monthly' | 'annual';

const phases: Phase[] = ['menstrual', 'follicular', 'ovulatory', 'luteal'];
const MINI_WEEKDAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

export default function CalendarScreen() {
  const router = useRouter();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('monthly');
  const { cycleData, todayLog } = useCycleStore();

  const displayCycleData = cycleData ?? {
    lastPeriodStart: new Date(),
    cycleLength: 28,
    flowLength: 5,
  };

  // Check if user hasn't logged in 3+ days
  const showUpdateBanner = useMemo(() => {
    if (!todayLog) {
      // If no log today, check the createdAt of todayLog being null
      // We consider showing banner if todayLog is null (hasn't logged today)
      // For a more accurate check, we'd need last log date from store
      // For now, show if there's no today log
      return true;
    }
    return false;
  }, [todayLog]);

  // Compute days since last log for banner messaging
  const daysSinceLastLog = useMemo(() => {
    if (todayLog?.createdAt) {
      const lastDate = new Date(todayLog.createdAt);
      return differenceInDays(new Date(), lastDate);
    }
    return 3; // Default to 3 if no data
  }, [todayLog]);

  const handleDayPress = useCallback((date: Date) => {
    setSelectedDate((prev) =>
      prev && isSameDay(prev, date) ? null : date
    );
  }, []);

  const handleClosePanel = useCallback(() => {
    setSelectedDate(null);
  }, []);

  // Selected day details
  const selectedDayInfo = useMemo(() => {
    if (!selectedDate) return null;

    const dayOfCycle = getDayOfCycle(displayCycleData.lastPeriodStart, selectedDate);
    const phase = getPhaseForDay(dayOfCycle, displayCycleData.flowLength);
    const meta = PHASE_META[phase];

    // Check if selected date is today and has a log
    const isToday = isSameDay(selectedDate, new Date());
    const log = isToday ? todayLog : null;

    return {
      dayOfCycle,
      phase,
      meta,
      log,
      formattedDate: format(selectedDate, "d 'de' MMMM", { locale: ptBR }),
    };
  }, [selectedDate, displayCycleData, todayLog]);

  // Annual view months
  const annualMonths = useMemo(() => {
    const yearStart = startOfYear(currentMonth);
    const yearEnd = endOfYear(currentMonth);
    return eachMonthOfInterval({ start: yearStart, end: yearEnd });
  }, [currentMonth]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.container}>
        <Text style={styles.title}>Calendario</Text>

        {/* View toggle */}
        <View style={styles.toggleRow}>
          <View style={styles.toggleContainer}>
            <Pressable
              onPress={() => {
                setViewMode('monthly');
                setSelectedDate(null);
              }}
              style={[
                styles.togglePill,
                viewMode === 'monthly' && styles.togglePillActive,
              ]}
            >
              <Text
                style={[
                  styles.toggleText,
                  viewMode === 'monthly' && styles.toggleTextActive,
                ]}
              >
                Mensal
              </Text>
            </Pressable>
            <Pressable
              onPress={() => {
                setViewMode('annual');
                setSelectedDate(null);
              }}
              style={[
                styles.togglePill,
                viewMode === 'annual' && styles.togglePillActive,
              ]}
            >
              <Text
                style={[
                  styles.toggleText,
                  viewMode === 'annual' && styles.toggleTextActive,
                ]}
              >
                Anual
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Update banner */}
        {showUpdateBanner && daysSinceLastLog >= 3 && (
          <Pressable
            style={styles.banner}
            onPress={() => router.push('/(app)/today/log')}
          >
            <Text style={styles.bannerEmoji}>💜</Text>
            <View style={styles.bannerContent}>
              <Text style={styles.bannerTitle}>
                Faz um tempinho que voce nao registra
              </Text>
              <Text style={styles.bannerSubtitle}>
                Toque aqui para atualizar seu diario
              </Text>
            </View>
          </Pressable>
        )}

        <ScrollView
          style={styles.scrollContent}
          contentContainerStyle={styles.scrollContentContainer}
          showsVerticalScrollIndicator={false}
        >
          {viewMode === 'monthly' ? (
            <>
              {/* Month navigation */}
              <View style={styles.monthNav}>
                <Pressable
                  onPress={() => setCurrentMonth(subMonths(currentMonth, 1))}
                  style={styles.navButton}
                >
                  <Text style={styles.navArrow}>&#8592;</Text>
                </Pressable>
                <Pressable
                  onPress={() => setCurrentMonth(addMonths(currentMonth, 1))}
                  style={styles.navButton}
                >
                  <Text style={styles.navArrow}>&#8594;</Text>
                </Pressable>
              </View>

              {/* Calendar */}
              <CycleCalendar
                month={currentMonth}
                cycleData={displayCycleData}
                onDayPress={handleDayPress}
                selectedDate={selectedDate ?? undefined}
              />

              {/* Legend */}
              <View style={styles.legend}>
                {phases.map((phase) => {
                  const meta = PHASE_META[phase];
                  return (
                    <View key={phase} style={styles.legendItem}>
                      <View
                        style={[styles.legendDot, { backgroundColor: meta.color }]}
                      />
                      <Text style={styles.legendLabel}>{meta.label}</Text>
                    </View>
                  );
                })}
              </View>

              {/* Edit period dates */}
              <Pressable style={styles.editDatesButton}>
                <Text style={styles.editDatesText}>
                  Editar datas da menstruacao
                </Text>
              </Pressable>
            </>
          ) : (
            /* Annual view */
            <>
              <Text style={styles.annualYear}>
                {format(currentMonth, 'yyyy')}
              </Text>

              {/* Year navigation */}
              <View style={styles.monthNav}>
                <Pressable
                  onPress={() => setCurrentMonth(subMonths(currentMonth, 12))}
                  style={styles.navButton}
                >
                  <Text style={styles.navArrow}>&#8592;</Text>
                </Pressable>
                <Pressable
                  onPress={() => setCurrentMonth(addMonths(currentMonth, 12))}
                  style={styles.navButton}
                >
                  <Text style={styles.navArrow}>&#8594;</Text>
                </Pressable>
              </View>

              <View style={styles.annualGrid}>
                {annualMonths.map((monthDate) => (
                  <MiniMonth
                    key={monthDate.toISOString()}
                    month={monthDate}
                    cycleData={displayCycleData}
                  />
                ))}
              </View>

              {/* Legend */}
              <View style={styles.legend}>
                {phases.map((phase) => {
                  const meta = PHASE_META[phase];
                  return (
                    <View key={phase} style={styles.legendItem}>
                      <View
                        style={[styles.legendDot, { backgroundColor: meta.color }]}
                      />
                      <Text style={styles.legendLabel}>{meta.label}</Text>
                    </View>
                  );
                })}
              </View>
            </>
          )}
        </ScrollView>

        {/* Day detail panel */}
        {selectedDate && selectedDayInfo && (
          <Animated.View
            entering={SlideInDown.springify().damping(18).stiffness(140)}
            exiting={SlideOutDown.duration(250)}
            style={styles.dayPanel}
          >
            <View style={styles.dayPanelHandle}>
              <View style={styles.handleBar} />
            </View>

            <Pressable onPress={handleClosePanel} style={styles.closePanelButton}>
              <Text style={styles.closePanelText}>&#10005;</Text>
            </Pressable>

            <Text style={styles.dayPanelDate}>{selectedDayInfo.formattedDate}</Text>

            <View style={styles.dayPanelPhaseRow}>
              <PhaseIndicator phase={selectedDayInfo.phase} size="medium" />
              <Text style={styles.dayPanelCycleDay}>
                Dia {selectedDayInfo.dayOfCycle} do ciclo
              </Text>
            </View>

            <View style={styles.dayPanelDetails}>
              <View style={styles.dayPanelInfoRow}>
                <Text style={styles.dayPanelInfoLabel}>Energia</Text>
                <Text style={styles.dayPanelInfoValue}>
                  {selectedDayInfo.meta.energy}
                </Text>
              </View>
              <View style={styles.dayPanelInfoRow}>
                <Text style={styles.dayPanelInfoLabel}>Humor</Text>
                <Text style={styles.dayPanelInfoValue}>
                  {selectedDayInfo.meta.mood}
                </Text>
              </View>
            </View>

            {/* Symptoms & moods from DailyLog */}
            {selectedDayInfo.log && (
              <View style={styles.dayPanelChips}>
                {selectedDayInfo.log.symptoms.length > 0 && (
                  <View style={styles.chipSection}>
                    <Text style={styles.chipSectionTitle}>Sintomas</Text>
                    <View style={styles.chipRow}>
                      {selectedDayInfo.log.symptoms.map((symptom) => (
                        <View key={symptom} style={styles.chip}>
                          <Text style={styles.chipText}>{symptom}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
                {selectedDayInfo.log.moods.length > 0 && (
                  <View style={styles.chipSection}>
                    <Text style={styles.chipSectionTitle}>Humor</Text>
                    <View style={styles.chipRow}>
                      {selectedDayInfo.log.moods.map((mood) => (
                        <View key={mood} style={styles.chip}>
                          <Text style={styles.chipText}>{mood}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            )}

            <Pressable
              style={styles.registerButton}
              onPress={() => {
                const dateStr = format(selectedDate, 'yyyy-MM-dd');
                router.push(`/(app)/today/log?date=${dateStr}`);
              }}
            >
              <Text style={styles.registerButtonText}>Registrar</Text>
            </Pressable>
          </Animated.View>
        )}
      </View>
    </SafeAreaView>
  );
}

/* ─── Mini Month for Annual View ─── */

interface MiniMonthProps {
  month: Date;
  cycleData: {
    lastPeriodStart: Date;
    cycleLength: number;
    flowLength: number;
  };
}

function MiniMonth({ month, cycleData }: MiniMonthProps) {
  const weeks = useMemo(() => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    const calStart = startOfWeek(monthStart, { locale: ptBR });

    const allDays: Date[] = [];
    let current = calStart;
    while (current <= monthEnd || allDays.length % 7 !== 0) {
      allDays.push(current);
      current = addDays(current, 1);
    }

    const result: Date[][] = [];
    for (let i = 0; i < allDays.length; i += 7) {
      result.push(allDays.slice(i, i + 7));
    }
    return result;
  }, [month]);

  const today = new Date();

  return (
    <View style={styles.miniMonthContainer}>
      <Text style={styles.miniMonthTitle}>
        {format(month, 'MMM', { locale: ptBR })}
      </Text>
      <View style={styles.miniWeekdayRow}>
        {MINI_WEEKDAYS.map((d, i) => (
          <Text key={i} style={styles.miniWeekdayText}>
            {d}
          </Text>
        ))}
      </View>
      {weeks.map((week, wi) => (
        <View key={wi} style={styles.miniWeekRow}>
          {week.map((date, di) => {
            const inMonth = isSameMonth(date, month);
            const isToday = isSameDay(date, today);

            let bgColor = 'transparent';
            if (inMonth) {
              const dayOfCycle = getDayOfCycle(cycleData.lastPeriodStart, date);
              const phase = getPhaseForDay(dayOfCycle, cycleData.flowLength);
              bgColor = Colors.phases[phase] + '40';
            }

            return (
              <View
                key={di}
                style={[
                  styles.miniDayCell,
                  { backgroundColor: inMonth ? bgColor : 'transparent' },
                  isToday && inMonth && styles.miniDayToday,
                ]}
              >
                {inMonth && (
                  <Text style={styles.miniDayText}>{format(date, 'd')}</Text>
                )}
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}

/* ─── Styles ─── */

const MINI_MONTH_WIDTH = (SCREEN_WIDTH - Spacing.base * 2 - Spacing.md * 2) / 3;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  container: {
    flex: 1,
    paddingHorizontal: Spacing.base,
  },
  title: {
    fontFamily: Typography.fonts.displayBold,
    fontSize: Typography.sizes['2xl'],
    color: Colors.text,
    paddingTop: Spacing.base,
    paddingBottom: Spacing.sm,
  },

  /* Toggle */
  toggleRow: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.blush,
    borderRadius: Radius.full,
    padding: Spacing.xs,
  },
  togglePill: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
  },
  togglePillActive: {
    backgroundColor: Colors.rose,
  },
  toggleText: {
    fontFamily: Typography.fonts.bodyMedium,
    fontSize: Typography.sizes.sm,
    color: Colors.textLight,
  },
  toggleTextActive: {
    color: Colors.white,
    fontFamily: Typography.fonts.bodyBold,
  },

  /* Banner */
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.blush,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  bannerEmoji: {
    fontSize: 28,
  },
  bannerContent: {
    flex: 1,
  },
  bannerTitle: {
    fontFamily: Typography.fonts.bodyBold,
    fontSize: Typography.sizes.sm,
    color: Colors.text,
    marginBottom: 2,
  },
  bannerSubtitle: {
    fontFamily: Typography.fonts.body,
    fontSize: Typography.sizes.xs,
    color: Colors.textLight,
  },

  /* Scroll */
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingBottom: Spacing['3xl'],
  },

  /* Month nav */
  monthNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
  },
  navButton: {
    padding: Spacing.sm,
  },
  navArrow: {
    fontSize: 24,
    color: Colors.rose,
  },

  /* Legend */
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.base,
    paddingVertical: Spacing.lg,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendLabel: {
    fontFamily: Typography.fonts.body,
    fontSize: Typography.sizes.xs,
    color: Colors.textLight,
  },

  /* Edit dates */
  editDatesButton: {
    alignSelf: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.rose,
    borderRadius: Radius.full,
    marginTop: Spacing.sm,
  },
  editDatesText: {
    fontFamily: Typography.fonts.bodyMedium,
    fontSize: Typography.sizes.sm,
    color: Colors.rose,
  },

  /* Day detail panel */
  dayPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing['2xl'],
    paddingTop: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  dayPanelHandle: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  handleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.textLight + '40',
  },
  closePanelButton: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.lg,
    padding: Spacing.sm,
    zIndex: 1,
  },
  closePanelText: {
    fontSize: Typography.sizes.md,
    color: Colors.textLight,
  },
  dayPanelDate: {
    fontFamily: Typography.fonts.displayBold,
    fontSize: Typography.sizes.xl,
    color: Colors.text,
    textTransform: 'capitalize',
    marginBottom: Spacing.md,
  },
  dayPanelPhaseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.base,
  },
  dayPanelCycleDay: {
    fontFamily: Typography.fonts.bodyMedium,
    fontSize: Typography.sizes.sm,
    color: Colors.textLight,
  },
  dayPanelDetails: {
    flexDirection: 'row',
    gap: Spacing.xl,
    marginBottom: Spacing.base,
  },
  dayPanelInfoRow: {
    gap: 2,
  },
  dayPanelInfoLabel: {
    fontFamily: Typography.fonts.body,
    fontSize: Typography.sizes.xs,
    color: Colors.textLight,
  },
  dayPanelInfoValue: {
    fontFamily: Typography.fonts.bodyBold,
    fontSize: Typography.sizes.sm,
    color: Colors.text,
  },

  /* Chips */
  dayPanelChips: {
    marginBottom: Spacing.base,
    gap: Spacing.md,
  },
  chipSection: {
    gap: Spacing.sm,
  },
  chipSectionTitle: {
    fontFamily: Typography.fonts.bodyMedium,
    fontSize: Typography.sizes.xs,
    color: Colors.textLight,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  chip: {
    backgroundColor: Colors.blush,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
  },
  chipText: {
    fontFamily: Typography.fonts.body,
    fontSize: Typography.sizes.xs,
    color: Colors.text,
  },

  /* Register button */
  registerButton: {
    backgroundColor: Colors.rose,
    borderRadius: Radius.full,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  registerButtonText: {
    fontFamily: Typography.fonts.bodyBold,
    fontSize: Typography.sizes.base,
    color: Colors.white,
  },

  /* Annual view */
  annualYear: {
    fontFamily: Typography.fonts.displayBold,
    fontSize: Typography.sizes.xl,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  annualGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },

  /* Mini month */
  miniMonthContainer: {
    width: MINI_MONTH_WIDTH,
    marginBottom: Spacing.base,
  },
  miniMonthTitle: {
    fontFamily: Typography.fonts.bodyBold,
    fontSize: Typography.sizes.xs,
    color: Colors.text,
    textTransform: 'capitalize',
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  miniWeekdayRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 2,
  },
  miniWeekdayText: {
    fontFamily: Typography.fonts.body,
    fontSize: 7,
    color: Colors.textLight,
    width: MINI_MONTH_WIDTH / 7,
    textAlign: 'center',
  },
  miniWeekRow: {
    flexDirection: 'row',
  },
  miniDayCell: {
    width: MINI_MONTH_WIDTH / 7,
    height: MINI_MONTH_WIDTH / 7,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: MINI_MONTH_WIDTH / 14,
  },
  miniDayToday: {
    borderWidth: 1,
    borderColor: Colors.rose,
  },
  miniDayText: {
    fontFamily: Typography.fonts.body,
    fontSize: 7,
    color: Colors.text,
  },
});
