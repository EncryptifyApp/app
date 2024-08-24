import { Entypo, Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View, Image } from "react-native";
import { Chat, User } from "../../__generated__/graphql";
import { useEffect, useState } from "react";
import { useSession } from "../../context/useSession";
import useChatStore from "../../context/useChatStore";
import { router } from "expo-router";
import { formatLastMessageDate } from "../../utils/formatLastMessageDate";
import { Menu } from "react-native-paper";
import { styles } from "../../styles/ItemMenuStyles";




export default function PinnedChat(
    { chat }: { chat: Chat }
) {
    const { user } = useSession() as { user: User | null };
    const [lastMessage, setLastMessage] = useState<string>('');
    const toUser = chat.members!.find((member) => member.id !== user!.id);
    const { chats, chatIdToUpdated, setChatIdToUpdated, unpinChat} = useChatStore();
    // TODO: this is temporary
    // we should remove this when we implement read receipts
    const [isNewMessage, setIsNewMessage] = useState<boolean>(false);

    const [isMyMessage, setIsMyMessage] = useState<boolean>(false);


    useEffect(() => {
        if (chat.messages!.length != 0) {
            setLastMessage(chat.messages![0]?.content);
            if (chat.messages![0]?.sender.id == user!.id) {
                setIsMyMessage(true)
            } else {
                setIsMyMessage(false)
            }
        }

    }, [chat]);

    useEffect(() => {
        if (chatIdToUpdated === chat.id && chat.messages!.length != 0) {
            setLastMessage(chat.messages![0]?.content);
            if (chat.messages![0]?.sender.id !== user?.id) {
                setIsNewMessage(true);
            }
        }

        if (chat.messages!.length != 0 && chat.messages![0]?.sender.id == user!.id) {
            setIsMyMessage(true)
        } else {
            setIsMyMessage(false)
        }
    }, [chatIdToUpdated, chat, chats]);



    if (!chat) return;


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

    const handleUnPinChat = () => {
        unpinChat(chat.id);
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
            className={`flex flex-col bg-midnight-black rounded-lg px-2 py-4 space-y-3
            ${isNewMessage ? 'border-b-2 border-primary' : 'border-b-2 border-transparent'}
            `}>
            <View className="flex flex-row items-center justify-between space-x-3">
                <View className="flex flex-row items-center space-x-3">
                    <Image
                        className="w-8 h-8 rounded-full"
                        source={profileSource}
                    />
                    <Text className="text-white font-primary-semibold text-sm">
                        {toUser!.username}
                    </Text>
                </View>
              
                {chat.messages!.length > 0 && (
                        <View>
                            <Text className='text-white font-primary-regular text-xs'>
                                {formatLastMessageDate(chat.messages![0].createdAt)}
                            </Text>
                        </View>
                    )}
            </View>

            <View className="flex flex-row items-center">
                {
                    isMyMessage && <Ionicons name="checkmark" size={16} color={'gray'} />
                }
                {
                    isNewMessage && <Entypo name="dot-single" size={16} color={'#00e701'} />
                }
                <Text
                    numberOfLines={1}
                    ellipsizeMode='tail'
                    className={`${isNewMessage ?
                        "font-primary-semibold" :
                        "font-primary-regular"} 
                        ml-2 text-gray-400 text-sm overflow-hidden whitespace-nowrap overflow-ellipsis`}
                >
                    {lastMessage}
                </Text>
                {
                    chat.messages!.length === 0 && (    
                        <Text className='text-primary font-primary-bold text-sm'>
                            New
                        </Text>
                    )
                }
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
                        onPress={() => handleUnPinChat()}
                        title="unpin"
                    />
                </Menu>
            )}  
                
        </>
    )
}