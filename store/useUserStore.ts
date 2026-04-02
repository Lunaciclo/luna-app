import * as SecureStore from "expo-secure-store";
import { create } from "zustand";
import { CycleSettings, UserProfile } from "../types/user";

const ONBOARDING_KEY = "luna_onboarding_complete";

interface UserState {
  profile: UserProfile | null;
  settings: CycleSettings | null;
  isAuthenticated: boolean;
  isOnboardingComplete: boolean;
  isReady: boolean;
  setProfile: (profile: UserProfile) => void;
  setSettings: (settings: CycleSettings) => void;
  setAuthenticated: (value: boolean) => void;
  setOnboardingComplete: (value: boolean) => void;
  loadOnboardingStatus: () => Promise<void>;
  reset: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  profile: null,
  settings: null,
  isAuthenticated: false,
  isOnboardingComplete: false,
  isReady: false,
  setProfile: (profile) => set({ profile }),
  setSettings: (settings) => set({ settings }),
  setAuthenticated: (value) => set({ isAuthenticated: value }),
  setOnboardingComplete: (value) => {
    // Persist to secure storage
    if (value) {
      SecureStore.setItemAsync(ONBOARDING_KEY, "true").catch(() => {});
    } else {
      SecureStore.deleteItemAsync(ONBOARDING_KEY).catch(() => {});
    }
    set({ isOnboardingComplete: value });
  },
  loadOnboardingStatus: async () => {
    try {
      const stored = await SecureStore.getItemAsync(ONBOARDING_KEY);
      set({ isOnboardingComplete: stored === "true", isReady: true });
    } catch {
      set({ isReady: true });
    }
  },
  reset: () => {
    SecureStore.deleteItemAsync(ONBOARDING_KEY).catch(() => {});
    set({
      profile: null,
      settings: null,
      isAuthenticated: false,
      isOnboardingComplete: false,
    });
  },
}));
