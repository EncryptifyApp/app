import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import Button from '../../components/Button';
import { AntDesign, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import { useSendMessageMutation, User, Message, Chat, MessageStatus } from '../../generated/graphql';
import { useSession } from '../../context/useSession';
import moment from 'moment';
import DateSplitter from '../../components/DateSplitter';
import { encryptMessage } from '../../utils/encryptMessage';
import { useChat } from '../../context/useChat';
import Widget from '../../components/Widget';
import MessageReceived from '../../components/MessageReceived';
import MessageSent from '../../components/MessageSent';
import { randomUUID } from 'expo-crypto';
import useMessageSentSound from '../../utils/useMessageSentSound';

export default function ChatScreen() {
    const scrollViewRef = useRef<ScrollView>(null);
    const { user } = useSession() as { signOut: () => void; user: User | null };
    const data = useLocalSearchParams();
    const chatId = data["chatId"] as string;

    // context
    const { getChat, chats, updateChats, updateMessage, isConnected } = useChat() as {
        getChat: (chatId: string) => Chat | undefined;
        chats: Chat[];
        updateChats: (message: Message) => void;
        updateMessage: (messageTempId: string, id: string, status: MessageStatus, createdAt: Date) => void;
        isConnected: boolean | undefined;
    };

    //chat states
    const [tabSelected, setTabSelected] = useState<"chat" | "notes">('chat');
    const [chat, setChat] = useState<Chat>();
    const [, sendMessage] = useSendMessageMutation();
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [toUser, setToUser] = useState<User | undefined>();
    const [sendingAnAttachment, setSendingAnAttachment] = useState<boolean>(false);

    //Message sent sound
    const playSound = useMessageSentSound();

    useEffect(() => {
        scrollToBottom();
    }, []);

    useEffect(() => {
        updateChat();
    }, [chatId, chats]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async () => {
        if (message.trim() !== '' && toUser) {
            await playSound();
            // Encrypt message
            const encryptedMessage = await encryptMessage(message, toUser);

            // Add message to local messages
            const newMessage: Message = {
                id: randomUUID(),
                content: message,
                status: MessageStatus.Pending,
                createdAt: new Date().toISOString(),
                sender: user!,
                chat: {
                    id: chatId
                }
            };

            setMessages([...messages, newMessage]);
            // Scroll to the end
            scrollToBottom();

            // Clear the input field
            setMessage('');

            if (isConnected) {
                // Send message to server
                await sendMessageToServer(newMessage.id, encryptedMessage!);
            } else {
                // Update the local chat with new message until the user is connected
                updateChats({
                    id: newMessage.id,
                    content: encryptedMessage as string,
                    status: MessageStatus.Pending,
                    createdAt: newMessage.createdAt,
                    sender: user!,
                    chat: {
                        id: chatId
                    }
                });
            }


        }
    };

    const sendMessageToServer = async (messageId: string, encryptedMessage: string) => {
        // Send message mutation
        const res = await sendMessage({
            toUserId: toUser!.id,
            content: encryptedMessage,
        });

        if (res.data?.sendMessage?.id) {
            console.log('Message sent successfully', res.data.sendMessage);
            // Update message status
            updateMessage(messageId, res.data.sendMessage.id, MessageStatus.Sent, res.data.sendMessage.createdAt);
        }
    };

    const scrollToBottom = () => {
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
    };

    if (!chat) return (
        <View className="flex-1 bg-midnight-black"></View>
    );

    return (
        <View className="flex-1 bg-midnight-black pt-10">
            {/* Header */}
            <View className="flex-row justify-between py-3 space-x-2 items-center px-4">
                <View className="flex-row items-center space-x-3">
                    <Image source={toUser?.profileUrl || require('../../assets/images/logo.png')} className="w-10 h-10 rounded-2xl" />
                    <View>
                        <TouchableOpacity>
                            <Text className="font-primary-bold text-white text-xl">{toUser?.username}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <View className='flex flex-row space-x-1 items-center'>
                    <View>
                        <Widget text='Chats' onClick={() => setTabSelected("chat")} active={tabSelected == "chat"} />
                    </View>
                    <View>
                        <Widget text='Notes' onClick={() => setTabSelected("notes")} active={tabSelected == "notes"} />
                    </View>
                    <TouchableOpacity>
                        <MaterialCommunityIcons name="dots-vertical" size={28} color="gray" />
                    </TouchableOpacity>
                </View>
            </View>
            {/* Notes */}
            {tabSelected === 'notes' && (
                <View className="flex flex-1">
                    <TextInput
                        className='px-4 py-2 text-white font-primary-regular text-lg'
                        multiline
                        placeholder="Notes you type are only visible to you, and can always be accessed through your messages with this client. Notes are saved automatically as you type."
                        placeholderTextColor={'#474f54'}
                    />
                </View>
            )}
            {/* Messages */}
            {tabSelected == "chat" && (
                <>
                    <View className="flex-1">
                        <View className="flex-1 px-4">
                            <ScrollView
                                ref={scrollViewRef}
                                showsVerticalScrollIndicator={false}
                                className="flex-1"
                                onContentSizeChange={scrollToBottom}
                            >
                                <DateSplitter date={moment(chat?.updatedAt).format('LL')} />
                                {messages.length != 0 ? messages.map((msg: Message, index: number) => (
                                    <View key={index}>
                                        {index > 0 && moment(messages[index - 1].createdAt).format('LL') !== moment(msg.createdAt).format('LL') && (
                                            <DateSplitter date={moment(msg.createdAt).format('LL')} />
                                        )}
                                        {msg.sender?.id === user?.id ? (
                                            <MessageSent message={msg} />
                                        ) : (
                                            <MessageReceived message={msg} />
                                        )}
                                    </View>
                                )) : (
                                    <View className="flex flex-col justify-center items-center">
                                        <Text className="font-primary-semibold text-white text-lg">No messages yet</Text>
                                    </View>
                                )}
                            </ScrollView>
                        </View>
                    </View>

                    {/* Message Input */}
                    <View className="flex flex-row items-center my-2 mx-3">
                        <TextInput
                            className="flex-1 bg-steel-gray text-white px-2 py-1.5 text-lg font-primary-semibold rounded-lg mr-2"
                            placeholder="Encrypted message..."
                            value={message}
                            placeholderTextColor="#474f54"
                            onChangeText={(text) => setMessage(text)}
                            onFocus={() => {
                                scrollToBottom();
                                setSendingAnAttachment(false);
                            }}
                        />
                        <View className="w-2/12">
                            {message.trim() !== '' ? (
                                <Button
                                    icon={<Ionicons name="send" size={22} />}
                                    textColor={'black'}
                                    bgColor={'primary'}
                                    size={'large'}
                                    width={'full'}
                                    weight={'bold'}
                                    onPress={handleSendMessage}
                                />
                            ) : (
                                <Button
                                    icon={<AntDesign name="plus" size={22} />}
                                    textColor={'black'}
                                    bgColor={'primary'}
                                    size={'large'}
                                    width={'full'}
                                    weight={'bold'}
                                    onPress={() => setSendingAnAttachment(!sendingAnAttachment)}
                                />
                            )}
                        </View>
                    </View>
                </>
            )}
        </View>
    );
}
