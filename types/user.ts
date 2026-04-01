import { Goal } from './cycle';

export type HealthCondition = 'pcos' | 'endometriosis' | 'pmdd' | 'thyroid' | 'other';

export interface UserProfile {
  id: string;
  name: string;
  email: string | null;
  goal: Goal | null;
  ageRange: string | null;
  heightCm: number | null;
  weightKg: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface CycleSettings {
  userId: string;
  cycleLength: number;
  flowLength: number;
  lutealPhaseLength: number;
  showFertileWindow: boolean;
  reminderPeriod: boolean;
  reminderOvulation: boolean;
  reminderLog: boolean;
  updatedAt: string;
}
