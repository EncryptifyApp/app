import { router } from 'expo-router';
import { Text, View } from 'react-native';

import { useSession } from '../context/useSession';

export default function SignIn() {
    const session = useSession();

    if (!session) {
        return null;
    }

    const { signIn } = session;

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text
                onPress={() => {
                    signIn();
                    router.replace('/');
                }}>
                Sign In
            </Text>
            
        </View>
    );
}
