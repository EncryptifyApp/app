import React, { useEffect, useId, useRef, useState } from 'react'
import { View, Text, TextInput, TouchableOpacity } from 'react-native'
import Button from '../../components/Button';
import { AntDesign, FontAwesome } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import { ScrollView } from 'react-native-gesture-handler';
import { useSendMessageMutation, Chat as ChatType, User, Message, useChatQuery, Chat, useNewMessageSubscription } from '../../generated/graphql';
import { useSession } from '../../context/useSession';

import { box } from "tweetnacl";
import { decrypt, encrypt, getMySecretKey, stringToUint8Array } from '../../utils/crypto';
import { encode, decode } from '@stablelib/utf8';
import { decode as decodeBase64 } from '@stablelib/base64';
import moment from 'moment';
export default function chat() {
    const scrollViewRef = useRef(null);
    const { user } = useSession() as { signOut: () => void, user: User | null };
    const chat = useLocalSearchParams();

    const [, sendMessage] = useSendMessageMutation();

    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [toUser, setToUser] = useState<User>();

    const [result] = useChatQuery({
        variables: { id: chat.id as string },
    });
    const { data } = result

    const [res] = useNewMessageSubscription();
    useEffect(() => {
        const fetchData = async () => {
            if (res.data) {
                if (res.data.newMessage.id !== messages[messages.length - 1]?.id) {
                    const newMessage = await decryptMessage(res.data.newMessage);
                    setMessages((prevMessages) => [...prevMessages, newMessage]);
                    scrollViewRef.current.scrollToEnd({ animated: true });
                }
            }
        };

        fetchData();
    }, [res, messages]);


    useEffect(() => {
        if (data?.chat) {
            setToUser(data.chat.members.find(u => u.id != user!.id) as User);
        }
    }, [data]);

    useEffect(() => {
        if (toUser) {
            decryptAllMessages(data.chat.messages);
            console.log(messages);
        }
    }, [toUser]);


    const handleSendMessage = async () => {
        if (message.trim() !== '') {
            // encrypt message
            const privateKey = await getMySecretKey();
            if (!privateKey) {
                console.log("NO PRIVATE KEY");
                return;
            }
            const userPublicKey = decodeBase64(toUser!.publicKey!);
            const sharedKey = box.before(userPublicKey, privateKey);

            const encryptedMessage = encrypt(sharedKey, { message });

            const res = await sendMessage({
                toUserId: toUser!.id as string,
                content: encryptedMessage,
            });

            if (res.data?.sendMessage.success) {
            }
            setMessage('');
        }
    };

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
        return { ...message, content: decryptedMessage.message };
    };

    const decryptAllMessages = async (messages: Message[]) => {
        const decryptedMessages = await Promise.all(
            messages.map(async (message) => {
                const decryptedMessage = await decryptMessage(message);
                return decryptedMessage;
            })
        );
        //order messages by date
        const sortedMessages = decryptedMessages.sort((a, b) => {
            return new Date(a!.createdAt).getTime() - new Date(b!.createdAt).getTime();
        });
        //@ts-ignore
        setMessages(sortedMessages);
    }



    if (!toUser) return;

    return (
        <View className="flex-1 bg-midnight-black pt-10">
            {/* Header */}
            <View className="flex-row justify-between py-3 space-x-2 items-center px-4">

                <View className="flex-row items-center space-x-3">
                    <Image source={user?.profileUrl ? user.profileUrl : require("../../assets/logo.png")} className='w-10 h-10 rounded-2xl' />
                    <View className=''>

                        <TouchableOpacity>
                            <Text className="font-primary-bold text-white text-xl">
                                {toUser!.username}
                            </Text>
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
            <View className="flex-1">
                <View className="flex-1 p-4">
                    <ScrollView ref={scrollViewRef} showsVerticalScrollIndicator={false} className="flex-1">
                        {/* TODO: change this date splitter to a seperate component */}
                        <Text className="text-center text-gray-300 mb-2">
                            {moment(chat.updatedAt).format('LL')}
                        </Text>
                        {messages.map((msg: Message, index: number) => (
                            <View key={index}>
                                {/* Check if the previous message exists and its date is different from the current one */}
                                {index > 0 && moment(messages[index - 1].createdAt).format('LL') !== moment(msg.createdAt).format('LL') && (
                                    <Text className="text-center text-gray-300 mb-2">
                                        {moment(msg.createdAt).format('LL')}
                                    </Text>
                                )}

                                <View
                                    className={`${msg.sender.id === user!.id ? 'justify-end items-end' : 'justify-start items-start'
                                        } mb-2`}
                                >

                                    {/* add receipt icon */}
                                    <View
                                        className={`${msg.sender.id === user!.id ? 'bg-steel-gray' : 'bg-primary'
                                            } rounded-md p-2 max-w-xs`}
                                    >
                                        <Text className={`${msg.sender.id === user!.id ? 'text-white' : 'text-black'} font-primary-semibold text-base`}>
                                            {msg.content}
                                        </Text>

                                        <View className="flex flex-row justify-end items-center space-x-2">
                                            <Text className={`${msg.sender.id === user!.id ? 'text-white' : 'text-black'} font-primary-regular text-xs`}>
                                                {moment(msg.createdAt).format('LT')}
                                            </Text>
                                            {
                                                msg.sender.id === user!.id ? <FontAwesome name="check" size={12} color={"white"} /> : <FontAwesome name="check" size={12} color={"black"} />
                                            }

                                        </View>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </ScrollView>
                </View>
            </View>
            <View className="flex flex-row items-center space-x-2 py-2 mx-3">
                <Button
                    icon={<FontAwesome name="plus-square-o" size={28} />}
                    textColor={'primary'}
                    bgColor={'bg-steel-gray'}
                    size={'medium'}
                    width={'xmin'}
                    weight={'bold'}
                    onPress={handleSendMessage}
                />
                <TextInput
                    className="flex-1 bg-steel-gray text-white p-2 text-lg font-primary-semibold rounded-lg mr-2"
                    placeholder="Message"
                    value={message}
                    placeholderTextColor="#474f54"
                    onChangeText={(text) => setMessage(text)}
                />
                {
                    message.trim() !== '' && <Button
                        icon={<AntDesign name="arrowup" size={28} />}
                        textColor={'primary'}
                        bgColor={'bg-steel-gray'}
                        size={'medium'}
                        width={'xmin'}
                        weight={'bold'}
                        onPress={handleSendMessage}
                    />
                }

            </View>
        </View>
    )
}
