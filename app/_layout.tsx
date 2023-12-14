import { Slot } from 'expo-router';
import { SessionProvider } from '../context/useSession';

export default function Root() {
    return (
        <SessionProvider>
            <Slot />
        </SessionProvider>
    );
}