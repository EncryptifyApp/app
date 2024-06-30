import React, { useEffect, useState } from 'react'
import { Image } from 'expo-image';
import { View, Text, TouchableOpacity } from 'react-native'
import { Chat as ChatType, User } from '../../generated/graphql'
import { router } from 'expo-router'
import moment from 'moment';
import { useSession } from '../../context/useSession';
import { useChat } from '../../context/useChat';

interface Props {
    chat: ChatType,
    chatIdToUpdated: string | null
}

export default function Chat({ chat, chatIdToUpdated }: Props) {
    const { user } = useSession() as { signOut: () => void, user: User | null };
    const [lastMessage, setLastMessage] = useState<string>('');
    const toUser = chat.members!.find((member) => member.id !== user!.id);
    const { chats } = useChat() as { chats: ChatType[] };



    // TODO: this is temporary
    // we should remove this when we implement read receipts
    const [newMessages, setNewMessages] = useState<number>(0);


    useEffect(() => {
        if (chat.messages!.length != 0) {
            setLastMessage(chat.messages![chat.messages!.length - 1].content);
        }
    }, [chat]);

    useEffect(() => {
        if (chatIdToUpdated === chat.id && chat.messages!.length != 0) {
            setNewMessages(newMessages + 1);
            setLastMessage(chat.messages![chat.messages!.length - 1].content);
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
        } else if (now.isSame(messageDate, 'week')) {
            // This week
            return messageDate.format('dddd'); // Full day name (e.g., Monday)
        } else {
            // Before this week
            return messageDate.format('YY/MM/DD');
        }
    };


    return (
        <TouchableOpacity onPress={() => {
            setNewMessages(0);
            router.push({ pathname: "/chat", params: { chatId: chat.id } });
        }}>
            <View className='flex flex-row justify-between bg-midnight-black py-2 px-3'>
                <View className='flex flex-row space-x-3 items-center w-3/4'>
                    <Image
                        source={toUser!.profileUrl ? toUser!.profileUrl : require("../../assets/images/logo.png")}
                        className='w-12 h-12 rounded-3xl'
                    />
                    <View className='flex-1'>
                        <Text className='text-white font-primary-bold text-base'>{toUser!.username}</Text>
                        <Text
                            numberOfLines={1}
                            ellipsizeMode='tail'
                            className={`${newMessages > 0 ? "font-primary-semibold" : "font-primary-regular"} text-gray-400 text-base overflow-hidden whitespace-nowrap overflow-ellipsis`}
                        >
                            {lastMessage}
                        </Text>
                    </View>
                </View>

                <View className={`flex flex-col items-center ${newMessages > 0 ? "justify-around" : "justify-start"}`}>
                    {chat.messages!.length > 0 && (
                        <View>
                            <Text className='text-white font-primary-regular text-base'>
                                {formatLastMessageDate(chat.messages![chat.messages!.length - 1].createdAt)}
                            </Text>
                        </View>
                    )}

                    {newMessages > 0 && chat.messages![chat.messages!.length - 1].sender.id !== user?.id && (
                        <View className='rounded-full bg-primary px-1.5'>
                            <Text className='font-primary-bold text-center text-sm'>
                                E
                            </Text>
                        </View>
                    )}

                    
                </View>
            </View>
        </TouchableOpacity>

    )
}
