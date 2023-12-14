import { Text, View } from 'react-native';
import { useSession } from '../../context/useSession'

export default function Index() {
    const session = useSession();
    const { signOut } = session || {};

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text
                onPress={() => {
                   
                    signOut && signOut();
                }}>
                Sign Out
            </Text>

        </View>
    );
}
