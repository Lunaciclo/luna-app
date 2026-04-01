import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return false;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Luna',
      importance: Notifications.AndroidImportance.MAX,
    });
  }

  return true;
}

export async function schedulePeriodReminder(
  daysUntil: number,
  userName: string
): Promise<string | null> {
  if (daysUntil <= 0) return null;

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: '🩸 Seu periodo se aproxima',
      body: `Luna preve sua menstruacao em ${daysUntil} dias. Prepare-se! 🌙`,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: Math.max(daysUntil - 3, 1) * 86400,
    },
  });

  return id;
}

export async function scheduleDailyLogReminder(
  userName: string
): Promise<string> {
  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: `🌙 Como foi seu dia, ${userName}?`,
      body: 'Registre seus sintomas para previsoes mais precisas',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 20,
      minute: 0,
    },
  });

  return id;
}

export async function scheduleOvulationReminder(): Promise<string> {
  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Janela fertil se aproxima',
      body: 'Seus dias mais ferteis estao chegando',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 9,
      minute: 0,
    },
  });

  return id;
}

export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
