import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Chat, Message, User, useChatQuery, useChatsQuery } from '../generated/graphql';
import NetInfo from '@react-native-community/netinfo';
import ChatService from '../services/ChatService';
import { sortChats } from '../utils/sortChats';
import { decryptChats } from '../utils/decryptChats';
import { useSession } from './useSession';
import { decryptMessage } from '../utils/decryptMessage';
import { decryptChat } from '../utils/decryptChat';


// TODO: sync the messages between the server and client
// and only decrypt the new messages from the server that are not already decrypted locally

const ChatContext = createContext<{
    chats: Chat[] | null,
    updateChats: (message: Message) => void,
    syncing: boolean,
    getChat: (chatId: string) => Chat | undefined,
    addNewChat: (newChat: Chat) => void
} | null>({
    chats: null,
    updateChats: () => { },
    syncing: false,
    getChat: () => undefined,
    addNewChat: () => { }
});


export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
    const { user } = useSession() as { user: User | null };

    const [isConnected, setIsConnected] = useState<boolean>();
    const [chats, setChats] = useState<Chat[]>([]);
    const [syncing, setSyncing] = useState<boolean>(true);
    const [result] = useChatsQuery();
    const { data } = result;

    const [chatId, setChatId] = useState<string>('');
    const [res, reexecuteQuery] = useChatQuery({ variables: { id: chatId }, pause: chatId === '' });
    const reexecuteQueryRef = useRef(reexecuteQuery);

    useEffect(() => {
        reexecuteQueryRef.current = reexecuteQuery;
    }, [reexecuteQuery]);

    useEffect(() => {
        if (chatId !== '') {
            if (reexecuteQueryRef.current) {
                reexecuteQueryRef.current();
            }
        }
    }, [chatId]);


    useEffect(() => {
        const fetchData = async () => {
            const { data } = res;
            if (data) {
                const chat = data.chat!;
                const decryptedChat = await decryptChat(chat, user!);
                setChats([...chats, decryptedChat!]);
                await ChatService.addChatToStorage(chat);
            }
        };
    
        fetchData();
    }, [res]);
    


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
    }, [user]);

    const fetchDataFromLocalStorage = async () => {
        try {
            // Fetch chats from local storage
            const localChats = await ChatService.getLocalChats();
            console.log("LOCAL CHATS", localChats);
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
        try {
            // Fetch messages from the server
            if (data?.chats) {
                const serverChats = data.chats;

                // Store server chats encrypted in local storage
                await ChatService.storeChatsLocally(serverChats);
                //decrypt the server chats
                const decryptedChats = await decryptChats(serverChats, user!);
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
        const updatedChats = [...chats!];
        const chatIndex = updatedChats.findIndex((chat) => chat.id === newMessage!.chat!.id);

        console.log("CHAT INDEX", chatIndex);
        if (chatIndex !== -1) {
            // Update existing chat with the new message
            console.log("UPDATING EXISITNIG CHAT")
            const chat = updatedChats[chatIndex];
            const toUser = chat.members?.find((member) => member.id !== user?.id);
            const decryptedMessage = await decryptMessage(newMessage, toUser!);
            const existingChat = updatedChats[chatIndex];
            existingChat.messages = [...existingChat.messages as Message[], decryptedMessage as Message];
            // Move the chat to the beginning of the array
            updatedChats.splice(chatIndex, 1);
            updatedChats.unshift(existingChat);
        } else {
            // Add new chat with the new message
            console.log("ADDING NEW CHAT");
            setChatId(newMessage.chat!.id);
        }
    
        // Update state with the updated chats
        setChats(updatedChats);
        // Add the new message to local storage
        await ChatService.addMessageToChatStorage(newMessage);
    };
    


    const addNewChat = async (newChat: Chat) => {
        const updatedChats = [...chats!];
        console.log("ADDING NEW CHAT");
        console.log(newChat)
        updatedChats.unshift(newChat);
        setChats(updatedChats);
        await ChatService.addChatToStorage(newChat);
    }


    const getChat = (chatId: string) => {
        const chat = chats?.find((chat) => chat.id === chatId);
        return chat;
    };

    return (
        <ChatContext.Provider value={{ chats, updateChats, syncing, getChat, addNewChat }}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => {
    return useContext(ChatContext);
};