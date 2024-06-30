import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Chat, Message, MessageStatus, User, useChatQuery, useChatsQuery, useSendPendingMessageMutation } from '../generated/graphql';
import NetInfo from '@react-native-community/netinfo';
import ChatService from '../services/ChatService';
import { sortChats } from '../utils/sortChats';
import { decryptChats } from '../utils/decryptChats';
import { useSession } from './useSession';
import { decryptMessage } from '../utils/decryptMessage';
import { decryptChat } from '../utils/decryptChat';

const ChatContext = createContext<{
    chats: Chat[] | null,
    updateChats: (message: Message) => void,
    syncing: boolean,
    getChat: (chatId: string) => Chat | undefined,
    addNewChat: (newChat: Chat) => void,
    updateMessage: (messageTempId: string, id: string, status: MessageStatus, createdAt: Date) => void,
    isConnected: boolean | null
} | null>(null);

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
    const { user, fetching } = useSession() as { user: User | null, fetching: boolean };

    const [isConnected, setIsConnected] = useState<boolean | null>(null);
    const [chats, setChats] = useState<Chat[]>([]);
    const [syncing, setSyncing] = useState<boolean>(true);
    const [result] = useChatsQuery();
    const { data } = result;

    const [chatId, setChatId] = useState<string>('');
    const [res, reexecuteQuery] = useChatQuery({ variables: { id: chatId }, pause: chatId === '' });
    const reexecuteQueryRef = useRef(reexecuteQuery);

    const [, sendPendingMessage] = useSendPendingMessageMutation();
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
                if (chats.find((c) => c.id === chat.id)) {
                    return;
                }
                const decryptedChat = await decryptChat(chat, user!);
                setChats(sortChats([...chats, decryptedChat!]));
                await ChatService.addChatToStorage(chat);
            }
        };

        fetchData();
    }, [res]);

    const sendPendingMessages = async () => {
        try {
            const pendings = await ChatService.getPendingMessages();
            if (pendings.length === 0) return;
            for (const message of pendings) {
                const res = await sendPendingMessage({
                    chatId: message.chat!.id,
                    content: message.content,
                });
                if (res.data?.sendPendingMessage.id) {
                    updateMessage(message.id, res.data.sendPendingMessage.id, res.data.sendPendingMessage.status!, res.data.sendPendingMessage.createdAt);
                }
            }
        } catch (error) {
            console.error('Error sending pending messages:', error);
        }
    };

    useEffect(() => {
        if (isConnected && user) {
            sendPendingMessages();
        }
    }, [isConnected, user]);

    useEffect(() => {
        const fetchNetworkStatus = async () => {
            const state = await NetInfo.fetch();
            setIsConnected(state.isConnected);
        };

        fetchNetworkStatus();

        const unsubscribe = NetInfo.addEventListener(state => {
            setIsConnected(state.isConnected!);
        });

        return () => {
            unsubscribe();
        };
    }, [user]);

    useEffect(() => {
        const fetchData = async () => {
            if (isConnected !== null && user) {
                setSyncing(true);
                await fetchDataFromLocalStorage();
            }
        };

        fetchData();
    }, [user, isConnected]);


    

    const fetchDataFromLocalStorage = async () => {
        try {
            console.log("fetching data from local storage");
            const localChats = await ChatService.getLocalChats();
            const decryptedChats = await decryptChats(localChats, user!);
            setChats(sortChats(decryptedChats!));

            if (isConnected != null && isConnected) {
                await fetchDataFromServer();
            } else {
                console.log("not connected");
                setSyncing(false);
            }
        } catch (error) {
            console.error('Error fetching messages from localstorage:', error);
        }
    };

    const fetchDataFromServer = async () => {
        try {
            setSyncing(true);
            console.log("fetching data from server");
            if (data?.chats) {
                const serverChats = data.chats;
                await ChatService.storeChatsLocally(serverChats);
                const decryptedChats = await decryptChats(serverChats, user!);
                setChats(sortChats(decryptedChats!));
            }
        } catch (error) {
            console.error('Error fetching messages from the server:', error);
        } finally {
            setSyncing(false);
        }
    };

    const updateChats = async (newMessage: Message) => {
        try {
            const updatedChats = [...chats!];
            const chatIndex = updatedChats.findIndex((chat) => chat.id === newMessage!.chat!.id);
            let chat = updatedChats[chatIndex];
            let toUser;

            if (chatIndex !== -1) {
                toUser = chat.members?.find((member) => member.id !== user?.id);
                const decryptedMessage = await decryptMessage(newMessage, toUser!);
                const existingChat = updatedChats[chatIndex];
                existingChat.messages = [...existingChat.messages as Message[], decryptedMessage as Message];
                updatedChats.splice(chatIndex, 1);
                updatedChats.unshift(existingChat);
            } else {
                setChatId(newMessage.chat!.id);
            }

            setChats(updatedChats);
            await ChatService.addMessageToChatStorage(newMessage);
        } catch (error) {
            console.error('Error updating chats:', error);
        }
    };

    const updateMessage = async (messageTempId: string, id: string, status: MessageStatus, createdAt: Date) => {
        try {
            const updatedChats = [...chats!];
            const chatIndex = updatedChats.findIndex((chat) => chat.messages!.some((message: Message) => message.id === messageTempId));
            if (chatIndex !== -1) {
                const chat = updatedChats[chatIndex];
                const messageIndex = chat.messages!.findIndex((message: Message) => message.id === messageTempId);
                if (messageIndex !== -1) {
                    chat.messages![messageIndex].id = id;
                    chat.messages![messageIndex].status = status;
                    chat.messages![messageIndex].createdAt = createdAt;
                    setChats(updatedChats);
                    await ChatService.updateMessageStatus(messageTempId, id, createdAt);
                }
            }
        } catch (error) {
            console.error('Error updating message:', error);
        }
    };

    const addNewChat = async (newChat: Chat) => {
        try {
            const updatedChats = [...chats!];
            updatedChats.unshift(newChat);
            setChats(sortChats(updatedChats));
            await ChatService.addChatToStorage(newChat);
        } catch (error) {
            console.error('Error adding new chat:', error);
        }
    };

    const getChat = (chatId: string) => {
        const chat = chats?.find((chat) => chat.id === chatId);
        return chat;
    };

    return (
        <ChatContext.Provider value={{ chats, updateChats, syncing, getChat, addNewChat, updateMessage, isConnected }}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error("useChat must be used within a ChatProvider");
    }
    return context;
};
