import { Redirect, SplashScreen, Stack} from 'expo-router';
import { useSession } from '../../context/useSession';
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
import { useChat } from '../../context/useChat';

SplashScreen.preventAutoHideAsync();

export default function AppLayout() {
    const { session, isLoading } = useSession() || { session: null, isLoading: true };
    const {syncing} = useChat() as {syncing:boolean};
    const [[, privateKey]] = useStorageState(PRIVATE_KEY);
    let [fontsLoaded, fontError] = useFonts({
        Rajdhani_400Regular,
        Rajdhani_500Medium,
        Rajdhani_600SemiBold,
        Rajdhani_700Bold,
    });


    useEffect(() => {
        if (!isLoading && !syncing) {
            SplashScreen.hideAsync();
        }
    }, [isLoading,syncing]);

    // Prevent rendering until the font has loaded or an error was returned
    if (!fontsLoaded && !fontError) {
        return null;
    }

    if (!session || !privateKey) {
        return <Redirect href="/auth" />;
    }

    return <Stack screenOptions={{ headerShown: false, animation:"fade_from_bottom"}} />

}