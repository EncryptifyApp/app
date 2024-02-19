import { SafeAreaView, ScrollView, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { useSession } from '../../context/useSession'
import { User, useChatsQuery, useUserQuery, useUsersQuery } from '../../generated/graphql';
import React, { useEffect } from 'react';
import Chat from '../../components/Chat';
import { AntDesign } from '@expo/vector-icons';
import PinnedChat from '../../components/PinnedChat';
import Widget from '../../components/Widget';
import Button from '../../components/Button';

export default function Index() {
    const { user,signOut } = useSession() as { signOut: () => void, user: User | null };
    const [result] = useChatsQuery();

    const { data } = result;
    if(!user) return;
    return (
        <View className="flex-1">
            <SafeAreaView className="flex flex-col bg-steel-gray  justify-start pt-10">
                <StatusBar
                    animated={true}
                    backgroundColor="#191b1f"
                    barStyle={"light-content"}
                    showHideTransition={'fade'}
                />
                {/* Header */}
                <View className='bg-steel-gray py-2'>
                    <View className="flex-row  justify-between py-3 space-x-2 items-center px-4">
                        <View className="flex">
                            <Text className="font-primary-bold text-white text-xl">
                                Pinned Chats
                            </Text>
                        </View>
                        
                        
                        <Image source={user?.profileUrl ? user.profileUrl : require("../../assets/logo.png")} className='w-8 h-8 rounded-2xl' />
                    </View>
                    {/* Pinned Chats */}
                    <View className='flex flex-row flex-wrap'>
                        <View className='w-1/2 p-2'>
                            <PinnedChat />
                        </View>
                        <View className='w-1/2 p-2'>
                            <PinnedChat />
                        </View>
                        <View className='w-1/2 p-2'>
                            <PinnedChat />
                        </View>
                        <View className='w-1/2 p-2'>
                            <PinnedChat />
                        </View>
                    </View>
                </View>


                {/* Chats */}
                <View className='bg-midnight-black'>
                    <View className="flex-row  justify-between py-3 space-x-2 items-center px-4">
                        <View className="flex">
                            <Text className="font-primary-bold text-white text-xl">
                                Recent Chats
                            </Text>
                        </View>
                        <AntDesign name="search1" size={24} color="gray" />
                    </View>
                    <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} className='flex-row space-x-2 mx-4'>
                        <View>
                            <Widget text='Chats' active />
                        </View>
                        <View>
                            <Widget text='Notes' />
                        </View>
                        <View>
                            <Widget text='Work' />
                        </View>
                    </ScrollView>
                    
                    <ScrollView className='mt-5 bg-midnight-black h-screen'>

                        {
                            data?.chats && data?.chats.map((chat) => (
                                <Chat key={chat.id} chat={chat} />
                            ))
                        }
                    </ScrollView>
                   
                </View>
                
            </SafeAreaView>

        </View>

    );
}
