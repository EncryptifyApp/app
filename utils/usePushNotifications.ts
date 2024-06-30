import { useEffect, useState } from 'react';
import * as Notifications from 'expo-notifications';
import * as Permissions from 'expo-permissions';
import { Platform } from 'react-native';

export const usePushNotifications = (userId: string, updatePushToken: (tokenData: { userId: string, expoPushToken: string }) => void) => {
  const [expoPushToken, setExpoPushToken] = useState<string>('');

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => {
      setExpoPushToken(token);
      if (userId && token) {
        updatePushToken({ userId, expoPushToken: token });
      }
    });

    // Handle notifications received while the app is in foreground
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log(notification);
    });

    // Handle notifications received when the user interacts with the notification
    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log(response);
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  }, [userId]);

  return expoPushToken;
};

const registerForPushNotificationsAsync = async (): Promise<string> => {
  let token: string = '';
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  const { status: existingStatus } = await Permissions.getAsync(Permissions.NOTIFICATIONS);
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
    finalStatus = status;
  }
  if (finalStatus !== 'granted') {
    alert('Failed to get push token for push notification!');
    return '';
  }
  token = (await Notifications.getExpoPushTokenAsync()).data;
  console.log(token);

  return token;
};
