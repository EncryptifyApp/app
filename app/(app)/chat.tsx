import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList } from 'react-native';
import Button from '../../components/Button';
import { AntDesign, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import { User, Message, MessageStatus } from '../../generated/graphql';
import moment from 'moment';
import { encryptMessage } from '../../utils/encryptMessage';
import Widget from '../../components/Widget';
import MessageReceived from '../../components/MessageReceived';
import MessageSent from '../../components/MessageSent';
import { randomUUID } from 'expo-crypto';
// import { useChatStore } from '../../context/useChatStore';
import { useSessionStore } from '../../context/useSession';

export default function ChatScreen() {
    const flatListRef = useRef<FlatList>(null);
    const { user } = useSessionStore();
    const data = useLocalSearchParams();
    const chatId = data["chatId"] as string;

    // const { chats, updateChats, sendMessageToServer, isConnected} = useChatStore();

    const [tabSelected, setTabSelected] = useState<"chat" | "notes">('chat');
    const [message, setMessage] = useState('');
    const [messages,setMessages] = useState<Message[]>();
    const [toUser] = useState<User | undefined>();
    const [sendingAnAttachment, setSendingAnAttachment] = useState<boolean>(false);

    // useEffect(() => {
    //     const chat = chats!.find((c) => c.id === chatId);
    //     if(chat) {
    //         setMessages(chat.messages!);
    //     }
    // }, [chats]);

    const handleSendMessage = async () => {
        if (message.trim() !== '' && toUser) {
            const encryptedContent = await encryptMessage(message, toUser);
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

            const encryptedMessage: Message = {
                ...newMessage,
                content: encryptedContent as string,
            };


            // // Update context with new message
            // await updateChats(encryptedMessage);

            // // Clear message input
            // setMessage('');

            // if (isConnected) {
            //     await sendMessageToServer(newMessage.id, toUser.id, encryptedContent!);
            // }
        }
    };





    const scrollToBottom = () => {
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    };


    const renderMessage = ({ item, index }: { item: Message, index: number }) => {
        // const isDifferentDay = index === 0 || moment(item.createdAt).format('LL') !== moment(messages[0].createdAt).format('LL');

        return (
            <View key={item.id}>
                {/* {isDifferentDay && (
                    <DateSplitter date={moment(item.createdAt).format('LL')} />
                )} */}
                {item.sender?.id === user?.id ? (
                    <MessageSent message={item} />
                ) : (
                    <MessageReceived message={item} />
                )}
            </View>
        );
    };

    return (
        <View className="flex-1 bg-midnight-black pt-10">
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
                    <Widget text='Chats' onClick={() => setTabSelected("chat")} active={tabSelected == "chat"} />
                    <Widget text='Notes' onClick={() => setTabSelected("notes")} active={tabSelected == "notes"} />
                    <TouchableOpacity>
                        <MaterialCommunityIcons name="dots-vertical" size={28} color="gray" />
                    </TouchableOpacity>
                </View>
            </View>
            {tabSelected === 'notes' ? (
                <View className="flex flex-1">
                    <TextInput
                        className='px-4 py-2 text-white font-primary-regular text-lg'
                        multiline
                        placeholder="Notes you type are only visible to you, and can always be accessed through your messages with this client. Notes are saved automatically as you type."
                        placeholderTextColor={'#474f54'}
                    />
                </View>
            ) : (
                <>
                    <View className="flex-1">
                        <View className="flex-1 px-4">
                            <FlatList
                                ref={flatListRef}
                                data={messages}
                                renderItem={renderMessage}
                                keyExtractor={(item) => item.id}
                                inverted
                                onContentSizeChange={scrollToBottom}
                            />

                            {/* <TypingAnimation/> */}
                        </View>
                    </View>
                    <View className="flex flex-row items-center my-2 mx-3">
                        <TextInput
                            className="flex-1 bg-steel-gray text-white px-2 py-1.5 text-lg font-primary-semibold rounded-lg mr-2"
                            placeholder="Encryptify message..."
                            value={message}
                            placeholderTextColor="#474f54"
                            onChangeText={(text) => setMessage(text)}
                            onFocus={() => {
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
