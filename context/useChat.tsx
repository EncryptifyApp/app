import React, { createContext, useContext, useEffect, useState } from 'react';
import { Chat, Message, User, useChatsQuery } from '../generated/graphql';
import NetInfo from '@react-native-community/netinfo';
import ChatService from '../services/ChatService';
import { sortChats } from '../utils/sortChats';
import { decryptChats } from '../utils/decryptChats';
import { useSession } from './useSession';
import { decryptMessage } from '../utils/decryptMessage';


// TODO: sync the messages between the server and client
// and only decrypt the new messages from the server that are not already decrypted locally

const ChatContext = createContext<{
    chats: Chat[] | null,
    updateChats: (message: Message) => void,
    syncing: boolean,
    getChat: (chatId: string) => Chat | undefined
} | null>({
    chats: null,
    updateChats: () => { },
    syncing: false,
    getChat: () => undefined
});


export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
    const { user } = useSession() as { user: User | null };
    const [isConnected, setIsConnected] = useState<boolean>();
    const [chats, setChats] = useState<Chat[]>([]);
    const [syncing, setSyncing] = useState<boolean>(true);
    const [result] = useChatsQuery();
    const { data } = result;
    // const [res] = useNewMessageSubscription();

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            setIsConnected(state.isConnected!);
        });

        return () => {
            unsubscribe();
        };
    }, [])


    useEffect(() => {
        if (user) {
            fetchDataFromLocalStorage();
        }
    }, [user,data]);

    const fetchDataFromLocalStorage = async () => {
        try {
            // Fetch chats from local storage
            const localChats = await ChatService.getLocalChats();
            // Decrypt local chats
            const decryptedChats = await decryptChats(localChats, user!);
            // Update state with sorted decrypted local messages
            setChats(sortChats(decryptedChats!));
            setSyncing(false);
            if (isConnected) {
                await fetchDataFromServer();
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const fetchDataFromServer = async () => {
        setSyncing(true);
        try {
            // Fetch messages from the server
            if (data?.chats) {
                const serverChats = data.chats;
                
                // Store server chats encrypted in local storage
                await ChatService.storeMessagesLocally(serverChats);
                //decrypt the server chats
                const decryptedChats = await decryptChats(serverChats, user!);
                console.log('decryptedChats', decryptedChats);
                // Update state with sorted server messages
                setChats(sortChats(decryptedChats!));
            }
        } catch (error) {
            console.error('Error fetching messages from the server:', error);
        } finally {
            setSyncing(false);
        }
    };


    const updateChats = async (newMessage: Message) => {
        //1. we need to decrypt the message and update the chat with the new message
        const updatedChats = [...chats!];
        const chatIndex = updatedChats.findIndex((chat) => chat.id === newMessage!.chat!.id);
        const chat = updatedChats[chatIndex];
        const toUser = chat.members?.find((member) => member.id !== user?.id);
        const decryptedMessage = await decryptMessage(newMessage, toUser!);

        // If the chat exists, update it with the new message
        if (chatIndex !== -1) {
            const existingChat = updatedChats[chatIndex];
            existingChat.messages = [...existingChat.messages as Message[], decryptedMessage as Message];
            // Move the chat to the beginning of the array
            updatedChats.splice(chatIndex, 1);
            updatedChats.unshift(existingChat);
        }
        setChats(updatedChats);

        //2. we need to store the encrypted message in local storage
        await ChatService.addMessageToChatStorage(newMessage);
    };


    const getChat = (chatId: string) => {
        return chats?.find((chat) => chat.id === chatId);
    }

    return (
        <ChatContext.Provider value={{ chats, updateChats, syncing, getChat}}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => {
    return useContext(ChatContext);
};