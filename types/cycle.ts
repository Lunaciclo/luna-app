export type Phase = 'menstrual' | 'follicular' | 'ovulatory' | 'luteal';

export type FlowIntensity = 'light' | 'medium' | 'heavy' | 'clots';

export type Goal =
  | 'track_cycle'
  | 'get_pregnant'
  | 'avoid_pregnancy'
  | 'health'
  | 'menopause';

export interface CycleData {
  lastPeriodStart: Date;
  cycleLength: number;
  flowLength: number;
}

export interface DailyLog {
  id: string;
  userId: string;
  logDate: string;
  phase: Phase | null;
  symptoms: string[];
  moods: string[];
  flowIntensity: FlowIntensity | null;
  waterMl: number | null;
  weightKg: number | null;
  sleepHours: number | null;
  steps: number | null;
  basalTemp: number | null;
  notes: string | null;
  sexualActivity: boolean;
  createdAt: string;
}

export interface Cycle {
  id: string;
  userId: string;
  startDate: string;
  endDate: string | null;
  cycleLength: number;
  flowLength: number;
  isCurrent: boolean;
  createdAt: string;
}

export interface PhaseMeta {
  color: string;
  emoji: string;
  label: string;
  energy: string;
  mood: string;
  days: string;
}
