import { TextInput, View, Text } from 'react-native';
import Button from '../components/Button/Button';

export default function Screen() {
    return <View className='flex flex-1 items-center justify-center space-y-10'>
        <View className='flex-row items-center'>
            <Text className='mr-2'>+1</Text>
            <TextInput
                className='border-b border-gray-500 p-2 w-3/4'
                placeholder="Enter your phone number"
                keyboardType="phone-pad"

            />
        </View>

        <View className='w-full px-5'>
            <Button text={'Continue'} />
        </View>


    </View >;
}