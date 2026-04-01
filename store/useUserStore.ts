import { create } from 'zustand';
import { UserProfile, CycleSettings } from '../types/user';
import { Goal } from '../types/cycle';

interface UserState {
  profile: UserProfile | null;
  settings: CycleSettings | null;
  isAuthenticated: boolean;
  isOnboardingComplete: boolean;
  setProfile: (profile: UserProfile) => void;
  setSettings: (settings: CycleSettings) => void;
  setAuthenticated: (value: boolean) => void;
  setOnboardingComplete: (value: boolean) => void;
  reset: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  profile: null,
  settings: null,
  isAuthenticated: false,
  isOnboardingComplete: false,
  setProfile: (profile) => set({ profile }),
  setSettings: (settings) => set({ settings }),
  setAuthenticated: (value) => set({ isAuthenticated: value }),
  setOnboardingComplete: (value) => set({ isOnboardingComplete: value }),
  reset: () =>
    set({
      profile: null,
      settings: null,
      isAuthenticated: false,
      isOnboardingComplete: false,
    }),
}));
