import React, { useEffect, useState } from 'react'
import { View, Text, TextInput, TouchableOpacity } from 'react-native'
import Button from '../../components/Button';
import { AntDesign, FontAwesome} from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import { ScrollView } from 'react-native-gesture-handler';
import { useSendMessageMutation, Chat as ChatType, User, Message, useChatQuery} from '../../generated/graphql';
import { useSession } from '../../context/useSession';
export default function chat() {
    const {user} = useSession() as { signOut: () => void, user: User | null };
 
    const toUser:User = useLocalSearchParams();
    const [,sendMessage] = useSendMessageMutation();
 
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    
    const [result] = useChatQuery({variables: {id: toUser!.id as string}});

    const {data} = result;

    useEffect(() => {
        if(data?.chat) {
            setMessages(data.chat.messages);
        }
    },[result]);

    const handleSendMessage = async () => {
        if (message.trim() !== '') {
            const res = await sendMessage({toUserId: toUser!.id as string, content: message});
            if(res.data?.sendMessage.success) {
                setMessages([...messages, {id:293847, receiver:toUser, content: message, sender: user!, createdAt: new Date().toISOString()}])
            }
            setMessage('');
        }
    };
    return (
        <View className="flex-1 bg-midnight-black pt-10">
            {/* Header */}
            <View className="flex-row justify-between py-3 space-x-2 items-center px-4">
                
                <View className="flex-row items-center space-x-3">
                <Image source={toUser!.profileUrl ? toUser!.profileUrl : require("../../assets/avatar.png")} className='w-10 h-10 rounded-2xl' />
                    <View className=''>
                    <Text className="font-primary-bold text-primary text-xs">Chat with</Text>
                    <TouchableOpacity>
                        <Text className="font-primary-bold text-white text-xl">
                            {toUser!.username}
                        </Text>
                    </TouchableOpacity>
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
                    <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
                        {messages.map((msg:Message, index:number) => (
                            <View
                                key={index}
                                className={`${msg.sender.id === user!.id ? 'justify-end items-end' : 'justify-start items-start'
                                    } mb-2`}
                            >
                                <View
                                    className={`${msg.sender.id === user!.id ? 'bg-steel-gray' : 'bg-primary'
                                        } rounded-md p-2 max-w-xs`}
                                >
                                    <Text className={`${msg.sender.id === user!.id ? 'text-white' : 'text-black'} font-primary-semibold text-base`}>
                                        {msg.content}
                                    </Text>
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
