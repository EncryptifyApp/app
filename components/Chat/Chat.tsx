import React, { useEffect, useState } from 'react'
import { Image } from 'expo-image';
import { View, Text, TouchableOpacity } from 'react-native'
import { Chat as ChatType, Message, User} from '../../generated/graphql'
import { router } from 'expo-router'
import moment from 'moment';
import { useSession } from '../../context/useSession';
import { decrypt, getMySecretKey } from '../../utils/crypto';
import { decode as decodeBase64 } from '@stablelib/base64';
import { box } from "tweetnacl";

interface Props {
    chat: ChatType,
}

export default function Chat({chat}:Props) {
    const {user} = useSession() as { signOut: () => void, user: User | null };
    const [lastMessage,setLastMessage] = useState<string>('');

    if(!chat) return;
    const toUser = chat.members[0];

    console.log(chat)


    const decryptMessage = async (message: Message) => {
        const privateKey = await getMySecretKey();
        if (!privateKey) {
            console.log("NO PRIVATE KEY");
            return;
        }

        if (!toUser?.publicKey || typeof toUser.publicKey !== 'string') {
            console.log("INVALID PUBLIC KEY");
            return;
        }

        const userPublicKeyBase64 = toUser.publicKey;
        const userPublicKey = decodeBase64(userPublicKeyBase64);

        const sharedKey = box.before(userPublicKey, privateKey);

        const decryptedMessage = decrypt(sharedKey, message.content);
        console.log(decryptedMessage)
        return decryptedMessage.message;
    };

    useEffect(() => {
        const fetchData = async () => {
            if (chat.messages.length > 0) {
                const message = await decryptMessage(chat.messages[chat.messages.length - 1]);
                setLastMessage(message);
            }
        };
    
        fetchData();
    }, [chat]);


    return (
        <TouchableOpacity onPress={() => {
            router.push({ pathname: "/chat", params: chat});
          }} className='flex flex-row justify-between bg-midnight-black py-5 px-3 space-x-3'>
            <View className='flex flex-row space-x-3 items-center'>
                <Image source={user?.profileUrl ? user.profileUrl : require("../../assets/logo.png")} className='w-12 h-12 rounded-2xl' />
                <View>
                    <Text className='text-white font-primary-bold text-lg'>{toUser.username}</Text>
                    <Text className='text-gray-400 font-primary-bold text-sm'>{lastMessage}</Text>
                </View>
            </View>

            <View className='space-y-2 items-end'>
                <View>
                    <Text className='text-white font-primary-regular text-sm'>{moment(chat.messages[chat.messages.length - 1].createdAt).fromNow()}</Text>
                </View>

                <View className='rounded-full bg-primary px-2'>
                    <Text className='font-primary-bold text-center text-sm'>1</Text>
                </View>
            </View>
        </TouchableOpacity>
    )
}