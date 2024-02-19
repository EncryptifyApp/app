import { Redirect, SplashScreen, Stack, Tabs, router, usePathname } from 'expo-router';
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
import { Feather, Ionicons, MaterialIcons, SimpleLineIcons } from '@expo/vector-icons';

SplashScreen.preventAutoHideAsync();

export default function AppLayout() {
    const pathname = usePathname();

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

    return <Tabs
  >
    <Tabs.Screen
      name="index"
      options={{
        tabBarStyle:{
            backgroundColor: 'black',
            borderTopColor: 'rgba(0,0,0,0.1)',
            borderTopWidth: 1
        },
        headerShown: false,
        title: 'Chats',
        tabBarActiveTintColor:"#00e701",
        tabBarLabelStyle: {
            fontFamily: 'Rajdhani_600SemiBold',
            fontWeight: 'bold',
            fontSize: 12,
        },
        tabBarIcon(props) {
          return <Ionicons name="chatbubbles-outline" size={24} color={props.focused ? "#00e701" : "#fff"} />;
        },
      }}
    >
      
    </Tabs.Screen>

    <Tabs.Screen
      name="contacts"
      options={{
        tabBarStyle:{
            backgroundColor: 'black',
            borderTopColor: 'rgba(0,0,0,0.1)',
            borderTopWidth: 1
        },
        
        headerShown: false,
        title: 'Contacts',
        tabBarActiveTintColor:"#00e701",
        tabBarLabelStyle: {
            fontFamily: 'Rajdhani_600SemiBold',
            fontWeight: 'bold',
            fontSize: 12,
        },
        tabBarIcon(props) {
          return <SimpleLineIcons name="people" size={20} color={props.focused ? "#00e701" : "#fff"}/>;
        },

      }}
    >
      
    </Tabs.Screen>

    <Tabs.Screen
      name="chat"  
      options={{
        href: null,
        tabBarStyle:{
            display:'none'
        },
        headerShown: false,
      }}
    >
      
    </Tabs.Screen>
  </Tabs>

}