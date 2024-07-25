import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Image, Modal, TouchableWithoutFeedback } from 'react-native';
import Button from '../../components/Button';
import { AntDesign, Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { User, Message, MessageStatus } from '../../generated/graphql';
import { encryptMessage } from '../../utils/encryptMessage';
import Widget from '../../components/Widget';
import MessageReceived from '../../components/MessageReceived';
import MessageSent from '../../components/MessageSent';
import { randomUUID } from 'expo-crypto';
import { useSession } from '../../context/useSession';
import useChatStore from '../../context/useChatStore';
import { sendMessage } from '../../operations/sendMessage';
import { useConnection } from '../../context/useConnection';
import useMessageSentSound from '../../utils/useMessageSentSound';
import QRcode from 'react-native-qrcode-svg';
import * as Clipboard from 'expo-clipboard';

export default function ChatScreen() {
    const flatListRef = useRef<FlatList>(null);
    const { isConnected } = useConnection();
    const { user, session } = useSession() as { user: User | null, session: string | null };
    //chat
    const { chats, updateChats, updateMessage } = useChatStore();
    const data = useLocalSearchParams();
    const chatId = data["chatId"] as string;
    const [chat] = useState(chats!.find((c) => c.id === chatId));
    const [messages, setMessages] = useState<Message[]>(chat?.messages!);
    const [message, setMessage] = useState('');
    const [toUser] = useState<User>(chat?.members!.find((member) => member.id !== user!.id)!);
    const playSound = useMessageSentSound();

    const [tabSelected, setTabSelected] = useState<"chat" | "notes">('chat');

    const [sendingAnAttachment, setSendingAnAttachment] = useState<boolean>(false);

    useEffect(() => {
        const chat = chats!.find((c) => c.id === chatId);
        if (chat) {
            setMessages(chat.messages!);
        }
    }, [chats]);



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


            // Update context with new message
            await updateChats(session!, encryptedMessage, user!);

            // Clear message input
            setMessage('');

            if (isConnected) {
                const message = await sendMessage(session!, toUser.id, encryptedContent!);

                // Update context with new message
                if (message) {
                    //play send message sound
                    await playSound();
                    await updateMessage(newMessage.id, message.id, MessageStatus.Sent, new Date(message.createdAt));
                }
            }
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
                {/* typing animation */}
                {/* {index === 0 && (
                    //TODO: add typing... feature
                    <TypingAnimation />
                )} */}
            </View>
        );
    };

    if (!chat) return null;

    const profileSource = toUser?.profileUrl
        ? { uri: toUser.profileUrl }
        : require("../../assets/images/logo.png");

    const [isQrVisible, setIsQrVisible] = useState(false);
    const [isIdCopied, setIsIdCopied] = useState<boolean>(false);

    const handleQrPress = () => {
        setIsQrVisible(true);
    };

    const handleCloseQr = () => {
        setIsQrVisible(false);
    };

    const handleCopyId = async () => {
        await Clipboard.setStringAsync(toUser!.id!)
            .then(() => {
                setIsIdCopied(true);
            });
    };

    return (
        <View className="flex-1 bg-midnight-black pt-10">

            {/* QR Code Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={isQrVisible}
                onRequestClose={handleCloseQr}
            >
                <TouchableWithoutFeedback onPress={handleCloseQr}>
                    <View className='flex-1 justify-end items-center'>
                        <TouchableWithoutFeedback>
                            <View className='py-4 px-20 bg-stormy-gray space-y-4 rounded-t-3xl'>
                                <View className='bg-midnight-black w-14 h-2 rounded-full mx-auto mb-'></View>
                                {/* QR Code Details */}
                                <View className='flex flex-col items-center '>
                                    <Image source={profileSource} className='w-10 h-10 rounded-3xl' />
                                    <Text className='font-primary-bold text-white text-lg text-center'>{toUser!.username}</Text>
                                    <Text className='font-primary-semibold text-gray-300 text-base text-center'>Encryptify Contact</Text>
                                </View>

                                {/* QR Code Image */}
                                <View className='flex items-center p-2 bg-white rounded-lg mx-10'>
                                    <QRcode
                                        value={toUser!.id!}
                                        logo={require('../../assets/images/logo.png')}
                                        logoSize={30}
                                        size={120}
                                        logoBackgroundColor='transparent'
                                    />
                                </View>
                                {/* make a splitter with or in the middle */}
                                <View className='flex flex-row items-center justify-center'>
                                    <View className='bg-midnight-black h-0.5 w-1/2'></View>
                                </View>
                                {/* id Display */}
                                <View className="flex-row items-center">
                                    <Text
                                        className="flex-1 py-2 px-5 text-white text-lg font-primary-regular rounded-md bg-steel-gray mr-2"
                                        numberOfLines={1}
                                        ellipsizeMode="tail"
                                    >
                                        {toUser!.id}
                                    </Text>
                                    <TouchableOpacity onPress={handleCopyId}>
                                        {isIdCopied ? (
                                            <Feather name="check" size={24} color="white" />
                                        ) : (
                                            <Feather name="copy" size={24} color="white" />
                                        )}
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>


            <View className="flex-row justify-between py-2 space-x-2 items-center px-4 border-b-2 border-steel-gray">
                <View className="flex-row items-center space-x-2">
                    {/* back button */}
                    <TouchableOpacity onPress={() => router.replace('/')}>
                        <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
                    </TouchableOpacity>
                    {/* User info */}
                    <TouchableOpacity className='flex-row items-center space-x-1' onPress={handleQrPress}>
                        <Image source={profileSource} className="w-10 h-10 rounded-2xl" />
                        <View>
                            <TouchableOpacity>
                                <Text className="font-primary-bold text-white text-xl">{toUser.username}</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                </View>
                {/* Tabs */}
                <View className='flex flex-row space-x-1.5 items-center'>
                    <View>
                        <Widget text='Chats' onClick={() => setTabSelected("chat")} active={tabSelected == "chat"} />
                    </View>
                    <View>
                        <Widget text='Notes' onClick={() => setTabSelected("notes")} active={tabSelected == "notes"} />
                    </View>
                </View>
            </View>
            {tabSelected === 'notes' ? (
                <View className="flex flex-1">
                    <TextInput
                        className='px-4 py-2 text-white font-primary-regular text-lg'
                        multiline
                        placeholder="Notes you type are only visible to you, and can always be accessed through the chat with this user. Notes are saved automatically as you type."
                        placeholderTextColor={'#474f54'}
                    />
                </View>
            ) : (
                <>
                    <View className="flex-1">
                        <View className="flex-1 px-4">
                            {
                                messages.length === 0 ? (
                                    <View className='flex items-center pt-32 bg-midnight-black space-y-4'>
                                        <Text className='text-2xl font-primary-semibold text-white text-center'>No messages</Text>
                                    </View>
                                ) : (
                                    <FlatList
                                        ref={flatListRef}
                                        data={messages}
                                        renderItem={renderMessage}
                                        keyExtractor={(item) => item.id}
                                        inverted
                                        onContentSizeChange={scrollToBottom}
                                    />
                                )
                            }


                        </View>

                    </View>
                    <View className="flex flex-row items-center my-2 mx-2">
                        <TextInput
                            className="flex-1 bg-steel-gray text-white px-3 py-1.5 text-lg font-primary-semibold rounded-3xl"
                            placeholder="Encryptify message..."
                            value={message}
                            placeholderTextColor="#474f54"
                            onChangeText={(text) => setMessage(text)}
                            onFocus={() => {
                                setSendingAnAttachment(false);
                            }}
                        />
                        <View className="w-2/12 flex items-center">
                            {message.trim() !== '' ? (
                                <Button
                                    icon={<Ionicons name="send" size={18} />}
                                    textColor={'black'}
                                    bgColor={'primary'}
                                    size={'xlarge'}
                                    width={'most'}
                                    weight={'bold'}
                                    onPress={handleSendMessage}
                                    rounded='rounded-full'
                                />
                            ) : (
                                <Button
                                    icon={<AntDesign name="plus" size={18} />}
                                    textColor={'black'}
                                    bgColor={'primary'}
                                    size={'xlarge'}
                                    width={'most'}
                                    weight={'bold'}
                                    onPress={() => setSendingAnAttachment(!sendingAnAttachment)}
                                    rounded='rounded-full'
                                />
                            )}
                        </View>
                    </View>
                </>
            )}
        </View>
    );
}
