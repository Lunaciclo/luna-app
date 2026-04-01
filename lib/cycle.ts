import { Phase, CycleData } from '../types/cycle';

export function getDayOfCycle(lastPeriod: Date, today: Date = new Date()): number {
  const diff = Math.floor(
    (today.getTime() - lastPeriod.getTime()) / (1000 * 60 * 60 * 24)
  );
  return (diff % 28) + 1;
}

export function getCurrentPhase(data: CycleData, today: Date = new Date()): Phase {
  const day = getDayOfCycle(data.lastPeriodStart, today);
  if (day <= data.flowLength) return 'menstrual';
  if (day <= 13) return 'follicular';
  if (day <= 16) return 'ovulatory';
  return 'luteal';
}

export function getDaysUntilNextPeriod(
  data: CycleData,
  today: Date = new Date()
): number {
  const day = getDayOfCycle(data.lastPeriodStart, today);
  return data.cycleLength - day + 1;
}

export function getFertileWindow(data: CycleData): {
  start: number;
  end: number;
} {
  const ovulationDay = data.cycleLength - 14;
  return { start: ovulationDay - 5, end: ovulationDay + 1 };
}

export function isInFertileWindow(
  data: CycleData,
  today: Date = new Date()
): boolean {
  const day = getDayOfCycle(data.lastPeriodStart, today);
  const fertile = getFertileWindow(data);
  return day >= fertile.start && day <= fertile.end;
}

export function getPhaseForDay(day: number, flowLength: number): Phase {
  if (day <= flowLength) return 'menstrual';
  if (day <= 13) return 'follicular';
  if (day <= 16) return 'ovulatory';
  return 'luteal';
}
