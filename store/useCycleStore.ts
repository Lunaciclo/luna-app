import { create } from 'zustand';
import { Phase, CycleData, DailyLog, Cycle } from '../types/cycle';
import { getCurrentPhase, getDayOfCycle, getDaysUntilNextPeriod } from '../lib/cycle';

interface CycleState {
  cycleData: CycleData | null;
  currentPhase: Phase;
  dayOfCycle: number;
  daysUntilPeriod: number;
  currentCycle: Cycle | null;
  todayLog: DailyLog | null;
  setCycleData: (data: CycleData) => void;
  setCurrentCycle: (cycle: Cycle) => void;
  setTodayLog: (log: DailyLog | null) => void;
  updateCalculations: () => void;
}

export const useCycleStore = create<CycleState>((set, get) => ({
  cycleData: null,
  currentPhase: 'follicular',
  dayOfCycle: 1,
  daysUntilPeriod: 28,
  currentCycle: null,
  todayLog: null,
  setCycleData: (data) => {
    set({ cycleData: data });
    const phase = getCurrentPhase(data);
    const day = getDayOfCycle(data.lastPeriodStart);
    const until = getDaysUntilNextPeriod(data);
    set({ currentPhase: phase, dayOfCycle: day, daysUntilPeriod: until });
  },
  setCurrentCycle: (cycle) => set({ currentCycle: cycle }),
  setTodayLog: (log) => set({ todayLog: log }),
  updateCalculations: () => {
    const { cycleData } = get();
    if (!cycleData) return;
    const phase = getCurrentPhase(cycleData);
    const day = getDayOfCycle(cycleData.lastPeriodStart);
    const until = getDaysUntilNextPeriod(cycleData);
    set({ currentPhase: phase, dayOfCycle: day, daysUntilPeriod: until });
  },
}));
