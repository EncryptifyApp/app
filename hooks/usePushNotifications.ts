import { useEffect, useRef } from "react";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import NetInfo from "@react-native-community/netinfo";
import { router } from "expo-router";

export const usePushNotifications = (): void => {
    Notifications.setNotificationHandler({
        handleNotification: async () => ({
            shouldPlaySound: true,
            shouldShowAlert: true,
            shouldSetBadge: true,
        }),
    });

    const notificationListener = useRef<Notifications.Subscription>();
    const responseListener = useRef<Notifications.Subscription>();

    async function registerForPushNotificationsAsync() {
        if (Device.isDevice) {
            const { status: existingStatus } =
                await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;

            if (existingStatus !== "granted") {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }
            if (finalStatus !== "granted") {
                 console.error("Failed to get push token for push notification");
                return;
            }
        } else {
            console.log("WARNING: Must be using a physical device for Push notifications");
        }

        if (Platform.OS === "android") {
            Notifications.setNotificationChannelAsync("default", {
                name: "default",
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: "#00e701",
            });
        }
    }

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            if (state.isConnected) {
                registerForPushNotificationsAsync();
            }
        });

        notificationListener.current =
            Notifications.addNotificationReceivedListener((notification) => {

            });

        responseListener.current =
            Notifications.addNotificationResponseReceivedListener((response) => {
                const chatId = response.notification.request.content.data.chatId;
                if (chatId) {
                    router.push({ pathname: "/chat", params: { chatId: chatId } });
                }
            });

        return () => {
            Notifications.removeNotificationSubscription(
                notificationListener.current!
            );

            Notifications.removeNotificationSubscription(responseListener.current!);

            unsubscribe();
        };
    }, []);
};
