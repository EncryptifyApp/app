import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, Alert } from 'react-native';
import { Chat as ChatType, User } from '../../__generated__/graphql';
import { router } from 'expo-router';
import { useSession } from '../../context/useSession';
import useChatStore from '../../context/useChatStore';
import { Ionicons } from '@expo/vector-icons';
import { formatLastMessageDate } from '../../utils/formatLastMessageDate';
import { Menu } from 'react-native-paper';
import { styles } from '../../styles/ItemMenuStyles';

interface Props {
    chat: ChatType;
}

export default function Chat({ chat }: Props) {
    const { user } = useSession() as { user: User | null };
    const [lastMessage, setLastMessage] = useState<string>('');
    const toUser = chat.members!.find((member) => member.id !== user!.id);
    const { chats, chatIdToUpdated, setChatIdToUpdated,pinnedChatsIds,pinChat } = useChatStore();

    const [isNewMessage, setIsNewMessage] = useState<boolean>(false);
    const [isMyMessage, setIsMyMessage] = useState<boolean>(false);

    useEffect(() => {
        if (chat.messages!.length != 0) {
            setLastMessage(chat.messages![0]?.content);
            setIsMyMessage(chat.messages![0]?.sender.id === user!.id);
        }
    }, [chat]);

    useEffect(() => {
        if (chatIdToUpdated === chat.id && chat.messages!.length != 0) {
            setLastMessage(chat.messages![0]?.content);
            if (chat.messages![0]?.sender.id !== user?.id) {
                setIsNewMessage(true);
            }
        }

        setIsMyMessage(chat.messages![0]?.sender.id === user!.id);
    }, [chatIdToUpdated, chat, chats]);

    if (!chat) return null;

    const profileSource = toUser?.profileUrl
        ? { uri: toUser.profileUrl }
        : require("../../assets/images/logo.png");


    //MENU
    const [visible, setVisible] = useState(false);
    const [anchor, setAnchor] = useState<{ x: number, y: number } | undefined>(undefined);

    const openMenu = () => setVisible(true);
    const closeMenu = () => setVisible(false);

    const handleLongPress = (event: any) => {
        setAnchor({ x: event.nativeEvent.pageX, y: event.nativeEvent.pageY });
        openMenu();
    };

    const handlePinChat = () => {
        if(pinnedChatsIds.length == 4) {
            Alert.alert('','You can only pin 4 chats');
            closeMenu();
            return;
        }
        pinChat(chat.id);
        closeMenu();
    };

    return (
        <>

            <TouchableOpacity
                onPress={() => {
                    setIsNewMessage(false);
                    setChatIdToUpdated(null);
                    router.push({ pathname: "/chat", params: { chatId: chat.id } });
                }}
                onLongPress={handleLongPress}
            >
                <View className='flex flex-row justify-between bg-midnight-black py-2 px-3'>
                    <View className='flex flex-row space-x-4 items-center w-3/4'>
                        <Image
                            source={profileSource}
                            className='w-12 h-12 rounded-3xl'
                        />
                        <View className='flex-1'>
                            <Text className='text-white font-primary-bold text-base'>{toUser!.username}</Text>
                            <View className='flex flex-row items-start'>
                                {isMyMessage && <Ionicons name="checkmark" size={18} color={'gray'} />}
                                <Text
                                    numberOfLines={2}
                                    ellipsizeMode='tail'
                                    className={`${isNewMessage ? "font-primary-semibold" : "font-primary-regular"}  text-gray-400 text-base overflow-hidden`}
                                >
                                    {lastMessage}
                                </Text>
                                {
                                    chat.messages!.length === 0  && (
                                        <Text className='text-primary font-primary-bold text-sm'>
                                            New
                                        </Text>
                                    )
                                }

                            </View>
                        </View>
                    </View>

                    <View className={`flex flex-col items-center ${isNewMessage ? "justify-around" : "justify-start"}`}>
                        {chat.messages!.length > 0 && (
                            <Text className='text-white font-primary-regular text-base'>
                                {formatLastMessageDate(chat.messages![0].createdAt)}
                            </Text>
                        )}

                        {isNewMessage && chat.messages![0].sender.id !== user?.id && (
                            <View className='rounded-full bg-primary px-1.5'>
                                <Text className='font-primary-bold text-center text-sm'>E</Text>
                            </View>
                        )}

                        {isNewMessage && chat.messages![0].sender.id === user?.id && (
                            <View className='rounded-full bg-primary px-1.5'>
                                <Text className='font-primary-bold text-center text-sm'>S</Text>
                            </View>
                        )}
                    </View>
                </View>
            </TouchableOpacity>

            {anchor && (
                <Menu
                    contentStyle={styles.Menu}
                    visible={visible}
                    onDismiss={closeMenu}
                    anchor={{ x: anchor.x - 10, y: anchor.y + 20 }}
                >
                    <Menu.Item
                        style={styles.MenuItem}
                        titleStyle={styles.MenuTitle}
                        onPress={() => handlePinChat()}
                        title="Pin"
                    />
                </Menu>
            )}
        </>

    );
}
