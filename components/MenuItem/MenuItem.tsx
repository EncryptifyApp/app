import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import { TouchableOpacity, View, Text} from 'react-native'

interface Props {
    title: string,
    description: string
}

export default function MenuItem({title, description}:Props) {
    return (
        <TouchableOpacity className='flex flex-row space-x-6 items-center py-3 px-5'>
            <Ionicons size={40} name='settings-outline' color={"#474f54"} />
            <View className='flex'>
                <Text className='font-primary-semibold text-white text-lg'>{title}</Text>
                <Text className='font-primary-semibold text-gray-400 text-sm max-w-xs'>{description}</Text>
            </View>
        </TouchableOpacity>
    )
}
