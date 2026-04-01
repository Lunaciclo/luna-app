import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { addDays, format, isSameDay, startOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CycleData, Phase } from '../../types/cycle';
import { getPhaseForDay, getDayOfCycle } from '../../lib/cycle';
import { Colors } from '../../theme/colors';
import { Typography } from '../../theme/typography';
import { Spacing } from '../../theme/spacing';

interface WeekStripProps {
  cycleData: CycleData;
  selectedDay?: Date;
  onDayPress?: (date: Date) => void;
}

const DAY_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export function WeekStrip({ cycleData, selectedDay, onDayPress }: WeekStripProps) {
  const today = new Date();

  const days = useMemo(() => {
    const weekStart = startOfWeek(today, { locale: ptBR });
    return Array.from({ length: 7 }).map((_, i) => {
      const date = addDays(weekStart, i);
      const dayOfCycle = getDayOfCycle(cycleData.lastPeriodStart, date);
      const phase = getPhaseForDay(dayOfCycle, cycleData.flowLength);
      const isToday = isSameDay(date, today);
      const isSelected = selectedDay ? isSameDay(date, selectedDay) : false;

      return { date, dayOfCycle, phase, isToday, isSelected };
    });
  }, [cycleData, selectedDay]);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {days.map((day, i) => {
        const phaseColor = Colors.phases[day.phase];

        return (
          <Pressable
            key={i}
            onPress={() => onDayPress?.(day.date)}
            style={styles.dayContainer}
          >
            <Text style={styles.dayName}>{DAY_NAMES[i]}</Text>
            <View
              style={[
                styles.dayCircle,
                day.isToday && { backgroundColor: phaseColor },
                day.isSelected && !day.isToday && styles.selectedCircle,
              ]}
            >
              <Text
                style={[
                  styles.dayNumber,
                  day.isToday && styles.todayText,
                  !day.isToday && { color: phaseColor },
                ]}
              >
                {format(day.date, 'd')}
              </Text>
            </View>
            {day.isToday && (
              <View style={[styles.todayDot, { backgroundColor: phaseColor }]} />
            )}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  dayContainer: {
    alignItems: 'center',
    width: 44,
    gap: Spacing.xs,
  },
  dayName: {
    fontFamily: Typography.fonts.body,
    fontSize: Typography.sizes.xs,
    color: Colors.textLight,
  },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedCircle: {
    borderWidth: 2,
    borderColor: Colors.rose,
    borderStyle: 'dashed',
  },
  dayNumber: {
    fontFamily: Typography.fonts.bodyMedium,
    fontSize: Typography.sizes.base,
  },
  todayText: {
    color: Colors.white,
    fontFamily: Typography.fonts.bodyBold,
  },
  todayDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
});
