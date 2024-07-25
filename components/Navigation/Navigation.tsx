

import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import React from 'react'
import { View, TouchableOpacity, Text } from 'react-native'
import { usePathname } from 'expo-router'
const isDisabled = (route: string) => {
    const pathname = usePathname();
    return pathname === route
}


export default function Navigation() {
    return (
        <View className="flex-row justify-around items-center bg-midnight-black border-t-2 border-steel-gray py-1.5 absolute bottom-0 w-full">
            <TouchableOpacity
                disabled={isDisabled('/')}
                className='space-y-1' onPress={() => router.push({ pathname: "/" })}>
                <Ionicons name="chatbubbles-outline" size={30} color="#fff" />
                <Text className="text-white font-primary-semibold text-sm">Chats</Text>
            </TouchableOpacity>
            {/* calls */}
            {/* <TouchableOpacity className='space-y-1'
                disabled={isDisabled('/calls')}
                onPress={() =>
                // router.push({ pathname: "/calls" })
                { }
                }>
                <Ionicons name="call-outline" size={30} color="#fff" />
                <Text className="text-white font-primary-semibold text-sm">Calls</Text>
            </TouchableOpacity> */}
        </View>
    )
}
