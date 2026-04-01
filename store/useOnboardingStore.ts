import { create } from 'zustand';
import { Goal } from '../types/cycle';
import { HealthCondition } from '../types/user';

interface OnboardingState {
  step: number;
  name: string;
  goal: Goal | null;
  isPregnant: boolean | null;
  objectives: string[];
  lastPeriodDate: Date | null;
  cycleLength: number;
  flowLength: number;
  commonSymptoms: string[];
  moods: string[];
  healthConditions: HealthCondition[];
  ageRange: string;
  heightCm: number | null;
  weightKg: number | null;
  setStep: (step: number) => void;
  setName: (name: string) => void;
  setGoal: (goal: Goal) => void;
  setIsPregnant: (value: boolean) => void;
  setObjectives: (objectives: string[]) => void;
  setLastPeriodDate: (date: Date) => void;
  setCycleLength: (length: number) => void;
  setFlowLength: (length: number) => void;
  setCommonSymptoms: (symptoms: string[]) => void;
  setMoods: (moods: string[]) => void;
  setHealthConditions: (conditions: HealthCondition[]) => void;
  setAgeRange: (range: string) => void;
  setHeightCm: (height: number) => void;
  setWeightKg: (weight: number) => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  step: 0,
  name: '',
  goal: null,
  isPregnant: null,
  objectives: [],
  lastPeriodDate: null,
  cycleLength: 28,
  flowLength: 5,
  commonSymptoms: [],
  moods: [],
  healthConditions: [],
  ageRange: '',
  heightCm: null,
  weightKg: null,
  setStep: (step) => set({ step }),
  setName: (name) => set({ name }),
  setGoal: (goal) => set({ goal }),
  setIsPregnant: (value) => set({ isPregnant: value }),
  setObjectives: (objectives) => set({ objectives }),
  setLastPeriodDate: (date) => set({ lastPeriodDate: date }),
  setCycleLength: (length) => set({ cycleLength: length }),
  setFlowLength: (length) => set({ flowLength: length }),
  setCommonSymptoms: (symptoms) => set({ commonSymptoms: symptoms }),
  setMoods: (moods) => set({ moods }),
  setHealthConditions: (conditions) => set({ healthConditions: conditions }),
  setAgeRange: (range) => set({ ageRange: range }),
  setHeightCm: (height) => set({ heightCm: height }),
  setWeightKg: (weight) => set({ weightKg: weight }),
  reset: () =>
    set({
      step: 0,
      name: '',
      goal: null,
      isPregnant: null,
      objectives: [],
      lastPeriodDate: null,
      cycleLength: 28,
      flowLength: 5,
      commonSymptoms: [],
      moods: [],
      healthConditions: [],
      ageRange: '',
      heightCm: null,
      weightKg: null,
    }),
}));
