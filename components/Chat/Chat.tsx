import React from 'react'
import { Image } from 'expo-image';
import { View, Text, TouchableOpacity } from 'react-native'
import { Chat as ChatType, Message, User} from '../../generated/graphql'
import { router } from 'expo-router'
import moment from 'moment';
import { useSession } from '../../context/useSession';

interface Props {
    chat: ChatType,
}

export default function Chat({chat}:Props) {
    const {user} = useSession() as { signOut: () => void, user: User | null };
    console.log("CHAT",chat)
    if(!chat) return;
    const toUser = chat.members.find(u => u.id != user!.id);
    
    return (
        <TouchableOpacity onPress={() => {
            router.push({ pathname: "/chat", params: chat});
          }} className='flex flex-row justify-between items-start bg-midnight-black py-5 px-3 space-x-3'>
            <View className='flex flex-row space-x-3'>
                {/* <Image source={user.profileUrl ? user.profileUrl : require("../../assets/avatar.png")} className='w-14 h-14 rounded-2xl' /> */}
                <View>
                    <Text className='text-white font-primary-bold text-lg'>{user!.username}</Text>
                    <Text className='text-gray-400 font-primary-regular text-sm'>{chat.messages[chat.messages.length - 1].content}</Text>
                </View>
            </View>

            <View className='space-y-2'>
                <View>
                    <Text className='text-white font-primary-regular text-sm'>{moment(chat.messages[chat.messages.length - 1].createdAt).fromNow()}</Text>
                </View>

                {/* <View className='rounded-full bg-primary'>
                    <Text className='font-primary-bold text-center text-sm'>1</Text>
                </View> */}
            </View>
        </TouchableOpacity>
    )
}