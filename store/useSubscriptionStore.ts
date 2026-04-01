import { create } from 'zustand';
import { PlanId } from '../types/subscription';

interface SubscriptionState {
  isActive: boolean;
  planId: PlanId;
  expiresAt: string | null;
  setSubscription: (planId: PlanId, expiresAt: string | null) => void;
  setActive: (value: boolean) => void;
  reset: () => void;
}

export const useSubscriptionStore = create<SubscriptionState>((set) => ({
  isActive: false,
  planId: 'free',
  expiresAt: null,
  setSubscription: (planId, expiresAt) =>
    set({ planId, expiresAt, isActive: planId !== 'free' }),
  setActive: (value) => set({ isActive: value }),
  reset: () => set({ isActive: false, planId: 'free', expiresAt: null }),
}));
