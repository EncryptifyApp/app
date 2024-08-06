
import { ActivityIndicator, View, Text} from 'react-native';

const Loading = () => {
    return <View className='flex flex-row bg-primary mx-auto rounded-lg items-center space-x-2 px-2 py-1'>
        <ActivityIndicator size={16} color="black" />
        <Text className='font-primary-semibold text-midnight-black'>Connecting...</Text>
    </View>;
};

export default Loading;
