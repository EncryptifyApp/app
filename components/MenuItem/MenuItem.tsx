import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';

interface Props {
    title: string;
    description: string;
    icon: React.ReactNode;
}

export default function MenuItem({ title, description, icon }: Props) {
    return (
        <TouchableOpacity className='flex flex-row space-x-6 items-center py-3 px-5'>
            {icon}
            <View className='flex'>
                <Text className='font-primary-semibold text-white text-lg'>{title}</Text>
                <Text className='font-primary-semibold text-gray-400 text-sm max-w-xs'>{description}</Text>
            </View>
        </TouchableOpacity>
    );
}
