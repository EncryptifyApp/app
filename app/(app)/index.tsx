import { FlatList, SafeAreaView, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { User, useNewMessageSubscription } from '../../__generated__/graphql';
import React, { useEffect, useState } from 'react';
import Chat from '../../components/Chat';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Chat as ChatType } from '../../__generated__/graphql';
import { useRouter } from 'expo-router';
import Header from "../../components/Header"
import { useSession } from '../../context/useSession';
import Navigation from '../../components/Navigation';
import useChatStore from '../../context/useChatStore';


export default function Index() {
    const router = useRouter();
    const { user, session } = useSession() as { user: User | null, session: string | null };
    const { syncing, chats, updateChats } = useChatStore();
    const [res] = useNewMessageSubscription();

    const [chatIdToUpdated, setChatIdToUpdated] = useState<string | null>(null);

    //TODO: remove this from here
    const [processedMessages, setProcessedMessages] = useState(new Set());
    useEffect(() => {
        if (!res.data?.newMessage || processedMessages.has(res.data.newMessage.id)) return;

        if (res.data.newMessage.sender.id != user!.id) {
            // Add the new message id to the set of processed messages
            setProcessedMessages(prevMessages => new Set(prevMessages).add(res.data!.newMessage.id));
            // Execute updateChats only for new messages
            setChatIdToUpdated(res.data.newMessage.chat?.id!);
            updateChats(session!, res.data.newMessage, user!);
        }
    }, [res, processedMessages]);



    const renderChatItem = ({ item }: { item: ChatType }) => (
        <Chat key={item.id} chat={item} chatIdToUpdated={chatIdToUpdated} />
    );

    if (!user) {
        return null;
    }

    return (
        <View className="flex-1 bg-midnight-black">
            <SafeAreaView className="flex flex-col bg-steel-gray justify-start pt-8 flex-1">
                <StatusBar
                    animated={true}
                    backgroundColor="#191b1f"
                    barStyle={"light-content"}
                    showHideTransition={'fade'}
                />
                {/* Header */}
                <Header syncing={syncing} title="Chats" />

                {/* Chats */}
                <View className='bg-midnight-black rounded-t-2xl flex-1'>
                    {/* dash */}
                    <View className='bg-steel-gray w-14 h-2 rounded-full mx-auto mt-4'></View>
                    {/* Header */}
                    <View className="flex-row justify-between py-3 space-x-2 items-center px-4">
                        <Text className="font-primary-semibold text-white text-xl">
                            Recent chats
                        </Text>
                    </View>
                    {/* Chats */}
                    {chats?.length === 0 ? (
                        <View className='flex items-center pt-32 bg-midnight-black space-y-4'>
                            <Text className='text-2xl font-primary-semibold text-white text-center'>No chats</Text>
                            <Text className='text-base font-primary-semibold text-white text-center'>Start a new chat by scanning a QR code {"\n"} or entering a user id</Text>
                        </View>
                    ) : (
                        <FlatList
                            data={chats}
                            renderItem={renderChatItem}
                            keyExtractor={(item) => item.id}
                            contentContainerStyle={{ paddingBottom: 80 }} // Add padding at the bottom to prevent overlapping with the bottom navigation
                        />
                    )}
                </View>
                <Navigation />
                {/* Floating Add Contact Button */}
                <TouchableOpacity
                    onPress={() => router.push({ pathname: "/addContact" })}
                    className="absolute bottom-24 right-6 bg-steel-gray rounded-xl p-4 shadow-lg"
                >
                    <MaterialCommunityIcons name="plus-circle-outline" size={28} color="#00e701" />
                </TouchableOpacity>
            </SafeAreaView>
        </View>
    );
}