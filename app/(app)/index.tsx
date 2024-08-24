import React, { useEffect, useState } from 'react';
import { FlatList, SafeAreaView, StatusBar, Text, TouchableOpacity, View, Image, PanResponder } from 'react-native';
import { AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';
import { User, useNewMessageSubscription, Chat as ChatType } from '../../__generated__/graphql';
import { useRouter } from 'expo-router';
import Header from '../../components/Header';
import { useSession } from '../../context/useSession';
import Navigation from '../../components/Navigation';
import useChatStore from '../../context/useChatStore';
import PinnedChat from '../../components/PinnedChat';
import Chat from '../../components/Chat';

export default function Index() {
    const router = useRouter();
    const { user, session } = useSession() as { user: User | null, session: string | null };
    const { syncing, chats, updateChats, setChatIdToUpdated, pinnedChatsIds } = useChatStore();

    const [res] = useNewMessageSubscription();
    const [extended, setExtended] = useState(false);

    useEffect(() => {
        if (res.data && res.data.newMessage) {
            const { newMessage } = res.data;
            setChatIdToUpdated(newMessage.chat?.id!);
            updateChats(session!, newMessage, user!);

            //extend the chat list if the chat is pinned
            if (pinnedChatsIds.includes(newMessage.chat?.id!)) {
                setExtended(false);
            }
        }
    }, [res.data]);


    const renderChatItem = ({ item }: { item: ChatType }) => (
        <Chat key={item.id} chat={item} />
    );

    const panResponder = PanResponder.create({
        onMoveShouldSetPanResponder: () => true,
        onPanResponderMove: (evt, gestureState) => {
            if (gestureState.dy > 10) {
                setExtended(false);
            } else if (gestureState.dy < -10) {
                setExtended(true);
            }
        },
    });

    return (
        <View className="flex-1 bg-midnight-black">
            <SafeAreaView className="flex flex-col bg-steel-gray justify-start pt-8 flex-1">
                <StatusBar
                    animated={true}
                    backgroundColor="#191b1f"
                    barStyle={"light-content"}
                    showHideTransition={'fade'}
                />
                <Header title="Chats" syncing={syncing} />

                {/* Pinned Chats */}
                {pinnedChatsIds.length > 0 && (
                    <>
                        <View className="flex flex-row pl-6 space-x-4 items-center pb-3">
                            <AntDesign name="pushpin" size={20} color="#00e701" />
                            <Text className="font-primary-semibold text-white text-lg">
                                Pinned
                            </Text>
                        </View>
                        {!extended && (
                            <View className='bg-steel-gray pb-2'>
                                <View className="flex flex-row flex-wrap mx-2">
                                    {chats?.filter((chat) => pinnedChatsIds.includes(chat.id)).map((chat) => (
                                        <View key={chat.id} className='w-1/2 p-1'>
                                            <PinnedChat chat={chat} />
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}
                    </>
                )}


                {/* Main Chats Section */}
                <View className='bg-midnight-black rounded-t-2xl flex-1'>
                    <View
                        className='bg-steel-gray w-10 h-2 rounded-full mx-auto mt-3'
                    ></View>

                    {/* Header */}
                    <View className="flex-row justify-start py-1 space-x-2 items-center px-4"  {...panResponder.panHandlers}>
                        <Image source={require('../../assets/icons/message-icon.png')} className='w-10 h-10' />
                        <Text className="font-primary-semibold text-white text-lg">
                            Recent chats
                        </Text>
                    </View>

                    {/* Chats */}
                    {chats.filter((chat) => !pinnedChatsIds.includes(chat.id)).length === 0 ? (
                        <View className='flex items-center pt-32 bg-midnight-black space-y-4'>
                            <Text className='text-2xl font-primary-semibold text-white text-center'>No chats</Text>
                            <Text className='text-base font-primary-semibold text-white text-center'>
                                Start a new chat by scanning a QR code {"\n"} or entering a user id
                            </Text>
                            <Image source={require('../../assets/icons/messages-icon.png')} className='w-40 h-40' />
                        </View>
                    ) : (
                        <FlatList
                            data={chats.filter((chat) => !pinnedChatsIds.includes(chat.id))}
                            renderItem={renderChatItem}
                            keyExtractor={(chat) => chat.id}
                            contentContainerStyle={{ paddingBottom: 80 }}
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
