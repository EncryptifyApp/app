import { Redirect, SplashScreen, Stack } from 'expo-router';
import { useSession } from '../../context/useSession';
import {
    useFonts,
    Rajdhani_400Regular,
    Rajdhani_500Medium,
    Rajdhani_600SemiBold,
    Rajdhani_700Bold,
} from '@expo-google-fonts/rajdhani';
import useChatStore from '../../context/useChatStore';

SplashScreen.preventAutoHideAsync();

export default function AppLayout() {
    const { session, isLoading } = useSession() as { session: null, isLoading: true };
    const {syncing} = useChatStore();

    let [fontsLoaded, fontError] = useFonts({
        Rajdhani_400Regular,
        Rajdhani_500Medium,
        Rajdhani_600SemiBold,
        Rajdhani_700Bold,
    });


    if (!syncing && !isLoading) {
        SplashScreen.hideAsync();
    }

    // Prevent rendering until the font has loaded or an error was returned
    if (!fontsLoaded && !fontError) {
        return null;
    }


    if (!session) {
        return <Redirect href="/auth" />;
    }


    return <Stack screenOptions={{ headerShown: false, animation: "fade_from_bottom" }} />
}