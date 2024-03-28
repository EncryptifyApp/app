import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import Button from '../../components/Button';
import { AntDesign, Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
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
import Widget from '../../components/Widget';
import MessageReceived from '../../components/MessageReceived';
import MessageSent from '../../components/MessageSent';


export default function ChatScreen() {
    const scrollViewRef = useRef(null);
    const { user } = useSession() as { signOut: () => void; user: User | null };
    const [chat, setChat] = useState<Chat>();
    const [tabSelected, setTabSelected] = useState<"chat" | "notes">('chat');
    const data = useLocalSearchParams();
    const chatId = data["chatId"] as string

    const { getChat, chats } = useChat() as { getChat: (chatId: string) => Chat | undefined; chats: Chat[] };
    const [, sendMessage] = useSendMessageMutation();
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [toUser, setToUser] = useState<User | undefined>();
    const [sendingAnAttachment, setSendingAnAttachment] = useState<boolean>(false);


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
                    <Image source={toUser?.profileUrl || require('../../assets/images/logo.png')} className="w-10 h-10 rounded-2xl" />
                    <View className="">
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
                        placeholder="
                        Notes you type are only visible to you, and can always be accessed through your messages with this client.
                        
                        Notes are saved automatically as you type."
                        placeholderTextColor={'#474f54'}
                    />
                </View>
            )}


            {/* Messages */}
            {tabSelected == "chat" &&
                <>
                    <View className="flex-1">
                        <View className="flex-1 px-4">
                            <ScrollView ref={scrollViewRef}
                                showsVerticalScrollIndicator={false}
                                className="flex-1">
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
                                )) :
                                    <View className="flex flex-col justify-center items-center">
                                        <Text className="font-primary-semibold text-white text-lg">No messages yet</Text>
                                    </View>
                                }
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
                            ) :
                                <Button
                                    icon={<AntDesign name="plus" size={22} />}
                                    textColor={'black'}
                                    bgColor={'primary'}
                                    size={'large'}
                                    width={'full'}
                                    weight={'bold'}
                                    onPress={() => setSendingAnAttachment(!sendingAnAttachment)}
                                />
                            }
                        </View>
                    </View>
                    {/* attrachment icons from assets */}

                    {/* {sendingAnAttachment && (
                        // scrollview of images from the gallery like signal
                        <View className='flex flex-col justify-center space-y-5'>
                            <ScrollView showsHorizontalScrollIndicator={false} horizontal className="flex flex-row space-x-5 px-3 py-2">
                                {
                                    [1, 2, 3, 4, 5].map((item, index) => (
                                        <Image key={index} source={require('../../assets/images/test.jpg')} className="w-48 h-48 rounded-xl" />
                                    ))
                                }
                                
                            </ScrollView>
                            <View className="flex flex-row justify-between space-x-5 px-3 pb-5">
                                <TouchableOpacity className='flex flex-col justify-center items-center w-16 py-2 rounded-md bg-steel-gray space-y-2'>
                                    <Ionicons name="images" size={32} color="#00e701" />
                                    <Text className="font-primary-semibold text-white text-sm">Image</Text>
                                </TouchableOpacity>
                                <TouchableOpacity className='flex flex-col justify-center items-center w-16 py-2 rounded-md bg-steel-gray space-y-2'>
                                    <Ionicons name="document" size={32} color="#00e701" />
                                    <Text className="font-primary-semibold text-white text-sm">File</Text>
                                </TouchableOpacity>
                                <TouchableOpacity className='flex flex-col justify-center items-center w-16 py-2 rounded-md bg-steel-gray space-y-2'>
                                    <Ionicons name="mic-outline" size={32} color="#00e701" />
                                    <Text className="font-primary-semibold text-white text-sm">Audio</Text>
                                </TouchableOpacity>

                                <TouchableOpacity className='flex flex-col justify-center items-center w-16 py-2 rounded-md bg-steel-gray space-y-2'>
                                    <Ionicons name="navigate-circle-outline" size={32} color="#00e701" />
                                    <Text className="font-primary-semibold text-white text-sm">Location</Text>
                                </TouchableOpacity>
                            </View></View>
                    )} */}

                </>
            }


        </View>
    );
}
