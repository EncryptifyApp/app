import { Redirect, SplashScreen, Stack } from 'expo-router';
import { useSession } from '../../context/useSession';
import { Text } from 'react-native';
import {
    useFonts,
    Rajdhani_400Regular,
    Rajdhani_500Medium,
    Rajdhani_600SemiBold,
    Rajdhani_700Bold,
} from '@expo-google-fonts/rajdhani';
import { PRIVATE_KEY } from '../../constants';
import { useStorageState } from '../../utils/useStorageState';
import { useEffect } from 'react';
SplashScreen.preventAutoHideAsync();
export default function AppLayout() {
    const { session, isLoading } = useSession() || { session: null, isLoading: true };
    const [[, privateKey]] = useStorageState(PRIVATE_KEY);

    let [fontsLoaded, fontError] = useFonts({
        Rajdhani_400Regular,
        Rajdhani_500Medium,
        Rajdhani_600SemiBold,
        Rajdhani_700Bold,
    });


    useEffect(() => {
        if (fontsLoaded || fontError || isLoading) {
            SplashScreen.hideAsync();
        }
    }, [fontsLoaded, fontError, isLoading]);

    // Prevent rendering until the font has loaded or an error was returned
    if (!fontsLoaded && !fontError) {
        return null;
    }

    if (!session || !privateKey) {
        return <Redirect href="/auth" />;
    }

    return <Stack screenOptions={{ headerShown: false }} />

}