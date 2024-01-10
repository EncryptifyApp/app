import { SafeAreaView, ScrollView, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { useSession } from '../../context/useSession'
import { User, useChatsQuery, useUserQuery, useUsersQuery } from '../../generated/graphql';
import React, { useEffect } from 'react';
import Button from '../../components/Button';
import Widget from '../../components/Widget';
import Chat from '../../components/Chat';
import { Redirect, router } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
export default function Index() {
    const { user} = useSession() as { signOut: () => void, user: User | null };
    const [result] = useChatsQuery();

    const { data } = result;
    
    return (
        <View className="flex-1 bg-steel-gray">
            <SafeAreaView className="flex flex-col  justify-start bg-steel-gray pt-10">
                <StatusBar
                    animated={true}
                    backgroundColor="#191b1f"
                    barStyle={"light-content"}
                    showHideTransition={'fade'}

                />
                {/* Header */}

                <View className="flex-row  justify-between py-3 space-x-2 items-center px-4">
                    <View className="flex">
                        <Text className="font-primary-bold text-primary text-xs">{user?.username}</Text>
                        <TouchableOpacity>
                            <Text className="font-primary-bold text-white text-xl">
                                Recents chats
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <Button
                        textColor={'black'}
                        bgColor={'primary'}
                        size={'small'}
                        width={'xmin'}
                        weight={'bold'}
                        onPress={() => router.push("/contacts")}
                        icon={<FontAwesome name="pencil-square-o" size={18} />}
                    />

                </View>
                <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} className='flex-row space-x-2 mx-4'>
                    <View>
                        <Widget text='All chats' active />
                    </View>
                    <View>
                        <Widget text='Pinned chats' />
                    </View>
                    <View>
                        <Widget text='Notes' />
                    </View>
                </ScrollView>
                {/* Chats */}
                <ScrollView className='mt-5 '>
                    {
                        data?.chats && data?.chats.map((chat) => (
                            <Chat key={chat.id} chat={chat} />
                        ))
                    }
                </ScrollView>
            </SafeAreaView>

        </View>

    );
}
