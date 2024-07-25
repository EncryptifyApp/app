import React, { useEffect, useState } from 'react'

import { View, Text, TouchableOpacity, Image } from 'react-native'
import { Chat as ChatType, User } from '../../generated/graphql'
import { router } from 'expo-router'
import moment from 'moment';
import { useSession } from '../../context/useSession';
import useChatStore from '../../context/useChatStore';

interface Props {
    chat: ChatType,
    chatIdToUpdated: string | null
}

export default function Chat({ chat, chatIdToUpdated }: Props) {
    const { user } = useSession() as { user: User | null };
    const [lastMessage, setLastMessage] = useState<string>('');
    const toUser = chat.members!.find((member) => member.id !== user!.id);
    const { chats } = useChatStore();

    // TODO: this is temporary
    // we should remove this when we implement read receipts
    const [isNewMessage, setIsNewMessage] = useState<boolean>(false);



    useEffect(() => {
        if (chat.messages!.length != 0) {
            setLastMessage(chat.messages![0].content);
        }
    }, [chat]);

    useEffect(() => {
        if (chatIdToUpdated === chat.id && chat.messages!.length != 0) {
            setIsNewMessage(true);
            setLastMessage(chat.messages![0].content);
        }
    }, [chatIdToUpdated, chat, chats]);

    if (!chat) return;


    //TODO: can be moved to a seperate file

    const formatLastMessageDate = (timestamp: Date) => {
        const now = moment();
        const messageDate = moment(timestamp);

        if (now.isSame(messageDate, 'day')) {
            // Today
            return messageDate.format('HH:mm');
        } else if (now.subtract(1, 'day').isSame(messageDate, 'day')) {
            // Yesterday
            return 'Yesterday';
        } else if (now.diff(messageDate, 'days') < 7) {
            // Within the last 7 days
            return messageDate.format('dddd'); // Full day name (e.g., Monday)
        } else {
            // More than 7 days ago
            return messageDate.format('DD/MM/YY');
        }
    };

    const profileSource = toUser?.profileUrl
        ? { uri: toUser.profileUrl }
        : require("../../assets/images/logo.png");

    return (
        <TouchableOpacity onPress={() => {
            setIsNewMessage(false);
            router.push({ pathname: "/chat", params: { chatId: chat.id } });
        }}>
            <View className='flex flex-row justify-between bg-midnight-black py-2 px-3'>
                <View className='flex flex-row space-x-4 items-center w-3/4'>
                    <Image
                        source={profileSource}
                        className='w-12 h-12 rounded-3xl'
                    />
                    <View className='flex-1'>
                        <Text className='text-white font-primary-bold text-base'>{toUser!.username}</Text>
                        <Text
                            numberOfLines={2}
                            ellipsizeMode='tail'
                            className={`${isNewMessage ? "font-primary-semibold" : "font-primary-regular"} text-gray-400 text-base overflow-hidden whitespace-nowrap overflow-ellipsis`}
                        >
                            {lastMessage}
                        </Text>
                    </View>
                </View>

                <View className={`flex flex-col items-center ${isNewMessage ? "justify-around" : "justify-start"}`}>
                    {chat.messages!.length > 0 && (
                        <View>
                            <Text className='text-white font-primary-regular text-base'>
                                {formatLastMessageDate(chat.messages![0].createdAt)}
                            </Text>
                        </View>
                    )}

                    {isNewMessage && chat.messages![0].sender.id !== user?.id && (
                        <View className='rounded-full bg-primary px-1.5'>
                            <Text className='font-primary-bold text-center text-sm'>E</Text>
                        </View>
                    )}

                    {
                        isNewMessage && chat.messages![0].sender.id === user?.id && (
                            <View className='rounded-full bg-primary px-1.5'>
                                <Text className='font-primary-bold text-center text-sm'>S</Text>
                            </View>
                        )
                    }
                </View>
            </View>
        </TouchableOpacity>

    )
}