import React from 'react'
import { SafeAreaView, StatusBar, View, Text, TouchableOpacity } from 'react-native'
import Header from '../../components/Header'
import { Image } from 'expo-image'
import { useSession } from '../../context/useSession';
import { User } from '../../generated/graphql';
import { Ionicons } from '@expo/vector-icons';
import { ScrollView } from 'react-native-gesture-handler';
import MenuItem from '../../components/MenuItem';

export default function settings() {
    const { user } = useSession() as { user: User | null };
    return (
        <View className="flex-1 bg-midnight-black">
            <SafeAreaView className="flex flex-col bg-steel-gray  justify-start pt-10">
                <StatusBar
                    animated={true}
                    backgroundColor="#191b1f"
                    barStyle={"light-content"}
                    showHideTransition={'fade'}
                />
                {/* Header */}
                <Header title="Settings"/>

                {/* Meny */}
                <ScrollView showsHorizontalScrollIndicator={false} className='bg-midnight-black rounded-t-2xl'>
                    {/* Menu profile */}
                    <View className='flex flex-row justify-between items-center py-5 px-5 border-b border-steel-gray'>
                        <View className='flex flex-row items-center space-x-4'>
                            <Image source={user?.profileUrl || require('../../assets/images/logo.png')}
                                className="w-16 h-16 rounded-full" />
                            <Text className='font-primary-semibold text-white text-lg'>{user?.username}</Text>
                        </View>

                        <View className='flex flex-row space-x-5'>
                            <TouchableOpacity>
                                <Ionicons size={22} name='qr-code' color={"#00e701"} />
                            </TouchableOpacity>
                            <TouchableOpacity className='rounded-full border-primary border-2'>
                                <Ionicons size={18} name='arrow-down' color={"#00e701"} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Menu items */}
                    <MenuItem title={'Title'} description={'Account settings, prefrences'} />
                    <MenuItem title={'Title'} description={'Account settings, prefrences'} />
                    <MenuItem title={'Title'} description={'Account settings, prefrences'} />
                    <MenuItem title={'Title'} description={'Account settings, prefrences'} />
                    <MenuItem title={'Title'} description={'Account settings, prefrences'} />
                    <MenuItem title={'Title'} description={'Account settings, prefrences'} />
                    <MenuItem title={'Title'} description={'Account settings, prefrences'} />
                    <MenuItem title={'Title'} description={'Account settings, prefrences'} />
                    <MenuItem title={'Title'} description={'Account settings, prefrences'} />
                </ScrollView>
            </SafeAreaView >
        </View >
    )
}
