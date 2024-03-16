import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import Button from '../../components/Button';
import { AntDesign, Feather, FontAwesome } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import { ScrollView } from 'react-native-gesture-handler';
import { useSendMessageMutation, User, Message, Chat } from '../../generated/graphql';
import { useSession } from '../../context/useSession';
import moment from 'moment';
import { decryptMessage } from '../../utils/decryptMessage';
import DateSplitter from '../../components/DateSplitter';
import { encryptMessage } from '../../utils/encryptMessage';
import { useChat } from '../../context/useChat';


export default function ChatScreen() {
    const scrollViewRef = useRef(null);
    const { user } = useSession() as { signOut: () => void; user: User | null };
    const [chat, setChat] = useState<Chat>();
    const data = useLocalSearchParams();
    const chatId = data["chatId"] as string

    const { getChat, chats } = useChat() as { getChat: (chatId: string) => Chat | undefined; chats: Chat[]};
    const [, sendMessage] = useSendMessageMutation();
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [toUser, setToUser] = useState<User | undefined>();


     useEffect(() => {
        scrollToBottom();
    }, [])

    useEffect(() => {
        updateChat();
    }, [chatId, chats]);

    const handleSendMessage = async () => {
        if (message.trim() !== '' && toUser) {
            // Encrypt message
            const encryptedMessage = await encryptMessage(message, toUser);

            // Send message mutation
            const res = await sendMessage({
                toUserId: toUser.id || '',
                content: encryptedMessage || '',
            });

            if (res.data?.sendMessage?.id) {
                // Decrypt and update local messages
                const decryptedMessage = await decryptMessage(res.data.sendMessage, toUser);
                setMessages([...messages, decryptedMessage!]);

                // Scroll to the end
                scrollToBottom();
            }

            // Clear the input field
            setMessage('');
        }
    };

    const scrollToBottom = () => {
        // @ts-ignore - scrollToEnd is not recognized by the type definition
        scrollViewRef.current?.scrollToEnd({ animated: true });
    };


    const updateChat = () => {
        // Get chat from context
        const chat = getChat(chatId);
        if (chat) {
            setChat(chat);
            setMessages(chat.messages!);
            setToUser(chat.members!.find((member) => member.id !== user!.id));
            scrollToBottom();
        }
    }



    if (!chat) return (
        <View className="flex-1 bg-midnight-black">
            <View className="flex-1 bg-midnight-black justify-center items-center">
                <Text className="font-primary-semibold text-white text-lg">Loading...</Text>
            </View>
        </View>
    
    );

    return (
        <View className="flex-1 bg-midnight-black pt-10">
            {/* Header */}
            <View className="flex-row justify-between py-3 space-x-2 items-center px-4">
                <View className="flex-row items-center space-x-3">
                    <Image source={toUser?.profileUrl || require('../../assets/logo.png')} className="w-10 h-10 rounded-2xl" />
                    <View className="">
                        <TouchableOpacity>
                            <Text className="font-primary-bold text-white text-xl">{toUser?.username}</Text>
                        </TouchableOpacity>
                        <Text className="font-primary-bold text-primary text-xs">Online</Text>
                    </View>
                </View>
                <Button
                    textColor={'black'}
                    bgColor={'primary'}
                    size={'small'}
                    width={'xmin'}
                    weight={'bold'}
                    onPress={() => { }}
                    icon={<FontAwesome name="ellipsis-v" size={18} />}
                />
            </View>
            {/* Messages */}
            <View className="flex-1">
                <View className="flex-1 p-4">
                    <ScrollView ref={scrollViewRef}
                        showsVerticalScrollIndicator={false}
                        className="flex-1">
                        <DateSplitter date={moment(chat?.updatedAt).format('LL')} />
                        {messages.length != 0 ? messages.map((msg: Message, index: number) => (
                            <View key={index}>
                                {index > 0 && moment(messages[index - 1].createdAt).format('LL') !== moment(msg.createdAt).format('LL') && (
                                    <DateSplitter date={moment(msg.createdAt).format('LL')} />
                                )}
                                <View
                                    className={`${msg.sender?.id === user?.id ? 'justify-end items-end' : 'justify-start items-start'} mb-2`}>
                                    <View
                                        className={`${msg.sender?.id === user?.id ? 'bg-primary' : 'bg-steel-gray'} rounded-md p-2 max-w-xs`}>
                                        <Text className={`${msg.sender?.id === user?.id ? 'text-black' : 'text-white'} font-primary-semibold text-base`}>
                                            {msg.content}
                                        </Text>
                                        <View className="flex flex-row justify-end items-center space-x-1">
                                            <Text className={`${msg.sender?.id === user?.id ? 'text-black' : 'text-white'} font-primary-regular text-xs`}>
                                                {moment(msg.createdAt).format('HH:mm')}
                                            </Text>
                                            {msg.sender?.id === user?.id ? (
                                                <Feather name="check" size={12} color={'black'} />
                                            ) : (
                                                <Feather name="check" size={12} color={'white'} />
                                            )}
                                        </View>
                                    </View>
                                </View>
                            </View>
                        )) :
                            <View className="flex flex-col justify-center items-center">
                                <Text className="font-primary-semibold text-white text-lg">No messages yet</Text>
                            </View>
                        }
                    </ScrollView>
                </View>
            </View>
            {/* Message Input */}
            <View className="flex flex-row items-center space-x-2 py-2 mx-3">
                <TextInput
                    className="flex-1 bg-steel-gray text-white p-2 text-lg font-primary-semibold rounded-lg mr-2"
                    placeholder="Message"
                    value={message}
                    placeholderTextColor="#474f54"
                    onChangeText={(text) => setMessage(text)}
                    onFocus={() => scrollToBottom()}
                />
                {message.trim() !== '' && (
                    <Button
                        icon={<AntDesign name="arrowup" size={22} />}
                        textColor={'black'}
                        bgColor={'primary'}
                        size={'medium'}
                        width={'xmin'}
                        weight={'bold'}
                        onPress={handleSendMessage}
                    />
                )}
            </View>
        </View>
    );
}
