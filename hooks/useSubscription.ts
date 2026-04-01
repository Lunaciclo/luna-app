import { useEffect, useCallback } from 'react';
import { useSubscriptionStore } from '../store/useSubscriptionStore';
import {
  checkSubscriptionStatus,
  restorePurchases as restorePurchasesRC,
} from '../lib/revenuecat';

export function useSubscription() {
  const { isActive, planId, expiresAt, setActive, setSubscription } =
    useSubscriptionStore();

  useEffect(() => {
    checkStatus();
  }, []);

  async function checkStatus() {
    const active = await checkSubscriptionStatus();
    setActive(active);
    return active;
  }

  const restorePurchases = useCallback(async (): Promise<boolean> => {
    try {
      const customerInfo = await restorePurchasesRC();
      if (customerInfo) {
        const hasActive =
          Object.keys(customerInfo.entitlements.active).length > 0;
        setActive(hasActive);
        return hasActive;
      }
      return false;
    } catch {
      return false;
    }
  }, [setActive]);

  return {
    isActive,
    planId,
    expiresAt,
    isPremium: isActive && planId !== 'free',
    checkStatus,
    restorePurchases,
  };
}
