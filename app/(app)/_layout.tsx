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
import { View} from 'react-native';

SplashScreen.preventAutoHideAsync();

export default function AppLayout() {
    const { session, isLoading, isLocked} = useSession() as any;
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
        return <View className="flex-1 bg-midnight-black"></View>;
    }

    if(isLoading) {
        return <View className="flex-1 bg-midnight-black"></View> 
    }
    
    if (!session) {
        return <Redirect href="/auth" />;
    }

    if (isLocked) {
        SplashScreen.hideAsync();
        return  <Redirect href="/pin" /> ;
    }

    return <Stack screenOptions={{ headerShown: false, animation:"fade_from_bottom"}} />
}