import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Image, Modal, TouchableWithoutFeedback } from 'react-native';
import Button from '../../components/Button';
import { AntDesign, Feather, Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { User, Message, MessageStatus } from '../../__generated__/graphql';
import { encryptMessage } from '../../utils/encryptMessage';
import Widget from '../../components/Widget';
import MessageReceived from '../../components/MessageReceived';
import MessageSent from '../../components/MessageSent';
import { randomUUID } from 'expo-crypto';
import { useSession } from '../../context/useSession';
import useChatStore from '../../context/useChatStore';
import { sendMessage } from '../../operations/sendMessage';
import { useConnection } from '../../context/useConnection';
import useMessageSentSound from '../../hooks/useMessageSentSound';
import QRcode from 'react-native-qrcode-svg';
import * as Clipboard from 'expo-clipboard';
import moment from 'moment';
import DateSplitter from '../../components/DateSplitter';
import NoteService from '../../services/NoteService';


export default function ChatScreen() {
    const flatListRef = useRef<FlatList>(null);
    const { isConnected } = useConnection();
    const { user, session } = useSession() as { user: User | null, session: string | null };
    //chat
    const { chats, updateChats, updateMessage, setChatIdToUpdated } = useChatStore();
    const data = useLocalSearchParams();
    const chatId = data["chatId"] as string;
    const [chat] = useState(chats?.find((c) => c.id === chatId));
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

            // Clear message input
            setMessage('');

            // Update context with new message
            await updateChats(session!, encryptedMessage, user!);

            //update chat id to updated
            setChatIdToUpdated(chatId);

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
        // Check if the current message is sent on a different day than the previous one
        const isDifferentDay = () => {
            if (index === 0) return false;
            return moment(item.createdAt).format('LL') !== moment(messages[index - 1].createdAt).format('LL');
        }

        // Check if the message is the first one and if the day is different from today
        const isFirstMessageDifferentDay = () => {
            return index === messages.length - 1;
        };

        return (
            <View key={item.id}>
                {
                    // if it the first message and the day is different than today
                    isFirstMessageDifferentDay() && (
                        <DateSplitter date={moment(item.createdAt).format('LL')} />
                    )
                }
                {item?.sender.id === user?.id ? (
                    <MessageSent message={item} />
                ) : (
                    <MessageReceived message={item} />
                )}
                {isDifferentDay() && (
                    <DateSplitter date={moment(messages[index - 1].createdAt).format('LL')} />
                )}

                {/* {
                    // Typing animation
                    index === 0 && <TypingAnimation />
                } */}
            </View>
        );
    };


    if (!chat) {
        return <Redirect href="/" />;
    }

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


    const [note, setNote] = useState<string>('');
    const saveNote = async () => {
        try {
            await NoteService.saveNote(chatId, note);
        } catch (error) {
            console.error('Error saving note:', error);
        }
    };

    useEffect(() => {
        const getNote = async () => {
            try {
                const note = await NoteService.getNoteByChatId(chatId);
                if (note) {
                    setNote(note);
                }
            } catch (error) {
                console.error('Error getting note:', error);
            }
        };

        getNote();
    }, [chatId]);

    // Debounce for saving notes
    useEffect(() => {
        const timeout = setTimeout(() => {
            saveNote();
        }, 300);

        // Clean up the timeout if note changes before the delay ends
        return () => clearTimeout(timeout);
    }, [note]);

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
                // 
                <View className="flex-1 bg-midnight-black px-4 py-4">
                    <View className='flex flex-row items-center space-x-2 mb-4'>
                        <MaterialIcons name="notes" size={24} color="#00e701" />
                        <Text className="text-white text-lg font-primary-semibold">Notes</Text>
                    </View>

                    <TextInput
                        className="flex-1 bg-midnight-black text-white text-base font-primary-semibold"
                        placeholder="Notes you type are only visible to you and can always be accessed through the chat with this user. Notes are saved automatically as you type."
                        placeholderTextColor="#474f54"
                        multiline
                        textAlignVertical="top"
                        value={note}
                        onChangeText={setNote}
                    />
                </View>
            ) : (
                <>
                    <View className="flex-1">
                        <View className="flex-1 px-4 pt-4">
                            {
                                messages.length === 0 ? (
                                    <View className='flex items-center pt-32 bg-midnight-black space-y-4'>
                                        <Text className='text-2xl font-primary-semibold text-white text-center'>No messages</Text>
                                        <Image source={require('../../assets/icons/message-icon.png')} className='w-40 h-40' />
                                        <Text className='text-lg font-primary-regular text-gray-300 text-center'>Send a message to start a conversation</Text>

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
                    {/* Input */}
                    <View className="flex flex-row items-center my-2 mx-3">
                        <View className="flex-1 flex flex-row items-center bg-steel-gray rounded-2xl px-3 py-2">
                            <TextInput
                                className="flex-1 text-white text-lg font-primary-semibold"
                                placeholder="Encryptify message..."
                                value={message}
                                placeholderTextColor="#474f54"
                                onChangeText={(text) => setMessage(text)}
                                onFocus={() => setSendingAnAttachment(false)}
                                multiline
                                style={{ maxHeight: 4 * 20 }}
                            />
                            {/* <TouchableOpacity className="ml-2">
                                <Ionicons name="camera-outline" size={24} color="white" />
                            </TouchableOpacity> */}
                        </View>
                        <View className="ml-3">
                            <Button
                                icon={message.trim() !== '' ? <MaterialCommunityIcons name="send-lock" size={22} /> :
                                    <AntDesign name="plus" size={20} />}
                                textColor={'black'}
                                bgColor={'primary'}
                                size={'xlarge'}
                                weight={'bold'}
                                onPress={message.trim() !== '' ? handleSendMessage : () => setSendingAnAttachment(!sendingAnAttachment)}
                                rounded='rounded-full'
                            />
                        </View>
                    </View>
                </>
            )}
        </View>
    );
}