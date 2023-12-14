import { Redirect, Stack } from 'expo-router';
import { useSession } from '../../context/useSession';
import { Text } from 'react-native';
import { useStorageState } from '../../utils/useStorageState';

export default function AppLayout() {
    const { session, isLoading } = useSession() || { session: null, isLoading: true };

    const [[isLoad, firstTime], setFirstTime] = useStorageState('firstTime');

    if (isLoading) {
        return <Text>Loading...</Text>;
    }

    if (!session) {
        if (firstTime === null) {
            return <Redirect href="/boarding" />;
        }
        else {
            return <Redirect href="/sign-in" />;
        }
    }

    return <Stack />;
}
