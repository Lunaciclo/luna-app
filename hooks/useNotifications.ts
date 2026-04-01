import { useEffect, useState } from 'react';
import {
  requestNotificationPermissions,
  scheduleDailyLogReminder,
  schedulePeriodReminder,
  scheduleOvulationReminder,
} from '../lib/notifications';
import { useUserStore } from '../store/useUserStore';
import { useCycleStore } from '../store/useCycleStore';

export function useNotifications() {
  const [hasPermission, setHasPermission] = useState(false);
  const { profile } = useUserStore();
  const { daysUntilPeriod } = useCycleStore();

  async function requestPermission(): Promise<boolean> {
    const granted = await requestNotificationPermissions();
    setHasPermission(granted);
    return granted;
  }

  async function scheduleAllNotifications(
    userName: string,
    daysUntil: number
  ): Promise<void> {
    await scheduleDailyLogReminder(userName);

    if (daysUntil > 3) {
      await schedulePeriodReminder(daysUntil, userName);
    }

    await scheduleOvulationReminder();
  }

  async function scheduleReminders(): Promise<void> {
    if (!hasPermission || !profile?.name) return;

    await scheduleAllNotifications(profile.name, daysUntilPeriod);
  }

  useEffect(() => {
    if (hasPermission && profile?.name) {
      scheduleReminders();
    }
  }, [hasPermission, profile?.name, daysUntilPeriod]);

  return {
    hasPermission,
    requestPermission,
    scheduleReminders,
    scheduleAllNotifications,
  };
}
