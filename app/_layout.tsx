import 'react-native-gesture-handler';
import { Slot } from 'expo-router';
import { SessionProvider } from '../context/useSession';
import { Client, Provider } from 'urql';
import { Toasts } from '@backpackapp-io/react-native-toast';
import { useStorageState } from '../utils/useStorageState';


export default function Root() {


    const [[, session], setSession] = useStorageState('session');
    const client = new Client({
        url: "http://192.168.11.105:4000/graphql",
        fetchOptions: () => {
            return session ? { headers: { Authorization: `${session}` } } : {};
        },
    });

    return (
        <Provider value={client}>
            <SessionProvider>
                <Slot />
            </SessionProvider>
            <Toasts />
        </Provider>
    );
}
