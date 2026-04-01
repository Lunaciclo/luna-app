import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  format,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CycleData } from '../../types/cycle';
import { getDayOfCycle, getPhaseForDay } from '../../lib/cycle';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Spacing } from '../../theme/spacing';

interface CycleCalendarProps {
  month: Date;
  cycleData: CycleData;
  onDayPress?: (date: Date) => void;
  selectedDate?: Date;
}

const WEEKDAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

export function CycleCalendar({
  month,
  cycleData,
  onDayPress,
  selectedDate,
}: CycleCalendarProps) {
  const today = new Date();

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

  return (
    <View style={styles.container}>
      {/* Month header */}
      <Text style={styles.monthTitle}>
        {format(month, 'MMMM yyyy', { locale: ptBR })}
      </Text>

      {/* Weekday headers */}
      <View style={styles.weekRow}>
        {WEEKDAYS.map((day, i) => (
          <View key={i} style={styles.dayCell}>
            <Text style={styles.weekday}>{day}</Text>
          </View>
        ))}
      </View>

      {/* Calendar grid */}
      {weeks.map((week, wi) => (
        <View key={wi} style={styles.weekRow}>
          {week.map((date, di) => {
            const inMonth = isSameMonth(date, month);
            const isToday = isSameDay(date, today);
            const isSelected = selectedDate ? isSameDay(date, selectedDate) : false;

            let dotColor: string | undefined;
            if (inMonth && cycleData) {
              const dayOfCycle = getDayOfCycle(cycleData.lastPeriodStart, date);
              const phase = getPhaseForDay(dayOfCycle, cycleData.flowLength);
              dotColor = Colors.phases[phase];
            }

            return (
              <Pressable
                key={di}
                onPress={() => inMonth && onDayPress?.(date)}
                style={styles.dayCell}
              >
                <View
                  style={[
                    styles.dayCircle,
                    isToday && styles.todayCircle,
                    isSelected && { backgroundColor: Colors.rose },
                  ]}
                >
                  <Text
                    style={[
                      styles.dayText,
                      !inMonth && styles.outOfMonth,
                      isSelected && styles.selectedText,
                    ]}
                  >
                    {format(date, 'd')}
                  </Text>
                </View>
                {inMonth && dotColor && (
                  <View style={[styles.phaseDot, { backgroundColor: dotColor }]} />
                )}
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.base,
  },
  monthTitle: {
    fontFamily: Typography.fonts.displayBold,
    fontSize: Typography.sizes.xl,
    color: Colors.text,
    textTransform: 'capitalize',
    marginBottom: Spacing.base,
  },
  weekRow: {
    flexDirection: 'row',
  },
  dayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  weekday: {
    fontFamily: Typography.fonts.bodyMedium,
    fontSize: Typography.sizes.xs,
    color: Colors.textLight,
    marginBottom: Spacing.xs,
  },
  dayCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayCircle: {
    borderWidth: 1.5,
    borderColor: Colors.rose,
  },
  dayText: {
    fontFamily: Typography.fonts.body,
    fontSize: Typography.sizes.sm,
    color: Colors.text,
  },
  outOfMonth: {
    color: Colors.textLight,
    opacity: 0.4,
  },
  selectedText: {
    color: Colors.white,
    fontFamily: Typography.fonts.bodyBold,
  },
  phaseDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginTop: 2,
  },
});
