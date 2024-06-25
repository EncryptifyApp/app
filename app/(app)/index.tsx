import { SafeAreaView, ScrollView, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { useSession } from '../../context/useSession'
import { Message, User, useNewMessageSubscription } from '../../generated/graphql';
import React, { useEffect, useState } from 'react';
import Chat from '../../components/Chat';
import { MaterialIcons } from '@expo/vector-icons';
import { useChat } from '../../context/useChat';
import { useRouter } from 'expo-router';
import Header from "../../components/Header"
import { Image } from 'expo-image';
export default function Index() {
    const router = useRouter();
    const { user } = useSession() as { signOut: () => void, user: User | null };
    const { syncing, chats, updateChats } = useChat() as { syncing: boolean, chats: any[], updateChats: (message: Message) => void };
    const [res] = useNewMessageSubscription();

    const [chatIdToUpdated, setChatIdToUpdated] = useState<string | null>(null);

    //TODO: remove this from here
    const [processedMessages, setProcessedMessages] = useState(new Set());
    useEffect(() => {
        if (!res.data?.newMessage || processedMessages.has(res.data.newMessage.id)) return;

        // Add the new message id to the set of processed messages
        setProcessedMessages(prevMessages => new Set(prevMessages).add(res.data!.newMessage.id));

        // Execute updateChats only for new messages
        setChatIdToUpdated(res.data.newMessage.chat?.id!);
        updateChats(res.data.newMessage);
    }, [res, processedMessages]);


    if (!user) return;

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
                <Header syncing={syncing} title="Chats" />

                {/* Chats */}
                <View className='bg-midnight-black rounded-t-2xl'>
                    {/* dash */}
                    <View className='bg-steel-gray w-14 h-2 rounded-full mx-auto mt-4'></View>
                    {/* Header */}
                    <View className="flex-row  justify-between py-3 space-x-2 items-center px-4">
                        <View>
                            <Text className="font-primary-semibold text-white text-xl">
                                Recent chats
                            </Text>
                        </View>
                        <View className="flex-row space-x-4">

                            <TouchableOpacity
                                onPress={() => router.push({ pathname: "/addContact" })}
                                className="bg-steel-gray rounded-md p-2">
                                <MaterialIcons name="person-add" size={20} color="#00e701" />
                            </TouchableOpacity>
                        </View>
                    </View>
                    {/* Chats */}
                    {
                        chats.length === 0 ? (
                            <View className='flex items-center pt-32 bg-midnight-black space-y-4'>
                                <Text className='text-2xl font-primary-semibold text-white text-center'>No chats</Text>
                                <Image source={require('../../assets/icons/no-data-icon-2.png')} className='h-40 w-40' />
                                <Text className='text-base font-primary-semibold text-white text-center'>Start a new chat by scanning a QR code {"\n"} or entering a user id</Text>
                            </View>
                        ) :
                            <ScrollView
                                className='mt-5 bg-midnight-black h-screen'>
                                {
                                    chats.map((chat) => (
                                        <Chat key={chat.id} chat={chat} chatIdToUpdated={chatIdToUpdated} />
                                    ))
                                }
                            </ScrollView>
                    }
                </View>
            </SafeAreaView>
        </View>
    );
}