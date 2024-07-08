import { FlatList, SafeAreaView, ScrollView, StatusBar, Text, TouchableOpacity, View } from 'react-native';

import { User, useNewMessageSubscription } from '../../generated/graphql';
import React, { useState } from 'react';
import Chat from '../../components/Chat';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { Chat as ChatType } from '../../generated/graphql';
import { useRouter } from 'expo-router';
import Header from "../../components/Header"
import { useSession } from '../../context/useSession';
import Navigation from '../../components/Navigation';




export default function Index() {
    const router = useRouter();
    const { user } = useSession() as { user: User | null };
    const [chats] = useState<ChatType[]>([
        {
            id: "1",
            messages: [
                {
                    id: "1",
                    content: "Hello from the other side i was outside todya and something ahappend and i couldntksjnadskjndas",
                    createdAt: new Date(),
                    sender: {
                        id: "1",
                        username: "user1",
                        profileUrl: "",
                    }
                }
            ],
            members: [
                {
                    id: "1",
                    username: "user1",
                    profileUrl: "",
                },
                {
                    ...user as User
                }
            ]
        },
        {
            id: "2",
            messages: [
                {
                    id: "2",
                    content: "Hello",
                    createdAt: new Date(),
                    sender: {
                        id: "1",
                        username: "user1",
                        profileUrl: "",
                    }
                }
            ],
            members: [
                {
                    id: "1",
                    username: "user1",
                    profileUrl: "",
                },
                {
                    ...user as User
                }
            ]
        },
        {
            id: "3",
            messages: [
                {
                    id: "3",
                    content: "Hello",
                    createdAt: new Date(),
                    sender: {
                        id: "1",
                        username: "user1",
                        profileUrl: "",
                    }
                }
            ],
            members: [
                {
                    id: "1",
                    username: "user1",
                    profileUrl: "",
                },
                {
                    ...user as User
                }
            ]
        },
        //make 10 more
        {
            id: "4",
            messages: [
                {
                    id: "4",
                    content: "Hello",
                    createdAt: new Date(),
                    sender: {
                        id: "1",
                        username: "user1",
                        profileUrl: "",
                    }
                }
            ],
            members: [
                {
                    id: "1",
                    username: "user1",
                    profileUrl: "",
                },
                {
                    ...user as User
                }
            ]
        },
        {
            id: "5",
            messages: [
                {
                    id: "5",
                    content: "Hello",
                    createdAt: new Date(),
                    sender: {
                        id: "1",
                        username: "user1",
                        profileUrl: "",
                    }
                }
            ],
            members: [
                {
                    id: "1",
                    username: "user1",
                    profileUrl: "",
                },
                {
                    ...user as User
                }
            ]
        },
        {
            id: "6",
            messages: [
                {
                    id: "6",
                    content: "Hello",
                    createdAt: new Date(),
                    sender: {
                        id: "1",
                        username: "user1",
                        profileUrl: "",
                    }
                }
            ],
            members: [
                {
                    id: "1",
                    username: "user1",
                    profileUrl: "",
                },
                {
                    ...user as User
                }
            ]
        },
        {
            id: "7",
            messages: [
                {
                    id: "7",
                    content: "Hello",
                    createdAt: new Date(),
                    sender: {
                        id: "1",
                        username: "user1",
                        profileUrl: "",
                    }
                }
            ],
            members: [
                {
                    id: "1",
                    username: "user1",
                    profileUrl: "",
                },
                {
                    ...user as User
                }
            ]
        },
        {
            id: "8",
            messages: [
                {
                    id: "8",
                    content: "Hello",
                    createdAt: new Date(),
                    sender: {
                        id: "1",
                        username: "user1",
                        profileUrl: "",
                    }
                }
            ],
            members: [
                {
                    id: "1",
                    username: "user1",
                    profileUrl: "",
                },
                {
                    ...user as User
                }
            ]
        },
        //10 more
        {
            id: "9",
            messages: [
                {
                    id: "9",
                    content: "Hello",
                    createdAt: new Date(),
                    sender: {
                        id: "1",
                        username: "user1",
                        profileUrl: "",
                    }
                }
            ],
            members: [
                {
                    id: "1",
                    username: "user1",
                    profileUrl: "",
                },
                {
                    ...user as User
                }
            ]
        },
        {
            id: "10",
            messages: [
                {
                    id: "10",
                    content: "Hello",
                    createdAt: new Date(),
                    sender: {
                        id: "1",
                        username: "user1",
                        profileUrl: "",
                    }
                }
            ],
            members: [
                {
                    id: "1",
                    username: "user1",
                    profileUrl: "",
                },
                {
                    ...user as User
                }
            ]
        },

    ]);
    const [res] = useNewMessageSubscription();

    const [chatIdToUpdated, setChatIdToUpdated] = useState<string | null>(null);

    //TODO: remove this from here
    // const [processedMessages, setProcessedMessages] = useState(new Set());
    // useEffect(() => {
    //     if (!res.data?.newMessage || processedMessages.has(res.data.newMessage.id)) return;

    //     // Add the new message id to the set of processed messages
    //     setProcessedMessages(prevMessages => new Set(prevMessages).add(res.data!.newMessage.id));

    //     // Execute updateChats only for new messages
    //     setChatIdToUpdated(res.data.newMessage.chat?.id!);
    //     updateChats(res.data.newMessage);
    // }, [res, processedMessages]);

    const renderChatItem = ({ item }:{item:ChatType}) => (
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
                <Header syncing={false} title="Chats" />

                {/* Chats */}
                <View className='bg-midnight-black rounded-t-2xl flex-1'>
                    {/* dash */}
                    <View className='bg-steel-gray w-14 h-2 rounded-full mx-auto mt-4'></View>
                    {/* Header */}
                    <View className="flex-row justify-between py-3 space-x-2 items-center px-4">
                        <View>
                            <Text className="font-primary-semibold text-white text-xl">
                                Recent chats
                            </Text>
                        </View>
                        <View className="flex-row space-x-4">
                            <TouchableOpacity
                                onPress={() => router.push({ pathname: "/addContact" })}
                                className="bg-steel-gray rounded-md p-2">
                                <AntDesign name="adduser" size={20} color="#00e701" />
                            </TouchableOpacity>
                        </View>
                    </View>
                    {/* Chats */}
                    {
                        chats!.length === 0 ? (
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
                        )
                    }
                </View>
            <Navigation/>
            </SafeAreaView>
        </View>
    );
}