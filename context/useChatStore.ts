import { create } from 'zustand'
import { Chat, Message, MessageStatus, User } from '../generated/graphql'
import ChatService from '../services/ChatService'
import { sortChats } from '../utils/sortChats'
import { decryptChats } from '../utils/decryptChats'
import { decryptMessage } from '../utils/decryptMessage'

type State = {
    chats: Chat[],
    syncing: boolean,
    isConnected: boolean,
}

type Actions = {
    clearChats: () => void
    setChats: (chats: Chat[]) => void
    setSyncing: (syncing: boolean) => void
    setIsConnected: (isConnected: boolean) => void
    updateChats: (message: Message, user: User) => Promise<void>
    updateMessage: (messageTempId: string, id: string, status: MessageStatus, createdAt: Date) => Promise<void>
    addNewChat: (newChat: Chat) => Promise<void>
    getChat: (chatId: string) => Chat | undefined
    fetchDataFromLocalStorage: (user: User) => Promise<void>
    fetchDataFromServer: (user: User) => Promise<void>
}

const useChatStore = create<State & Actions>((set, get) => ({
    chats: [],
    syncing: false,
    isConnected: false,
    clearChats: () => set({ chats: [] }),
    setChats: (chats) => set({ chats }),
    setSyncing: (syncing) => set({ syncing }),
    setIsConnected: (isConnected) => set({ isConnected }),
    updateChats: async (newMessage: Message, user: User) => {
        const { chats } = get();
        const updatedChats = [...chats];
        const chatIndex = updatedChats.findIndex((chat) => chat.id === newMessage.chat!.id);

        if (chatIndex !== -1) {
            const chat = updatedChats[chatIndex];
            const toUser = chat.members!.find((member) => member.id !== user!.id);
            if (toUser) {
                const decryptedMessage = await decryptMessage(newMessage, toUser);
                chat.messages!.push(decryptedMessage!);
                updatedChats.splice(chatIndex, 1);
                updatedChats.unshift(chat);
            }
        } else {
            // Handle new chat creation if needed
        }

        set({ chats: sortChats(updatedChats) });
        await ChatService.addMessageToChatStorage(newMessage);
    },
    updateMessage: async (messageTempId, id, status, createdAt) => {
        const { chats } = get();
        const updatedChats = [...chats];
        const chatIndex = updatedChats.findIndex((chat) => chat.messages!.some((message) => message.id === messageTempId));
        if (chatIndex !== -1) {
            const chat = updatedChats[chatIndex];
            const messageIndex = chat.messages!.findIndex((message) => message.id === messageTempId);
            if (messageIndex !== -1) {
                chat.messages![messageIndex].id = id;
                chat.messages![messageIndex].status = status;
                chat.messages![messageIndex].createdAt = createdAt;
                set({ chats: updatedChats });
                await ChatService.updateMessageStatus(messageTempId, id, createdAt);
            }
        }
    },
    addNewChat: async (newChat) => {
        const { chats } = get();
        const updatedChats = [newChat, ...chats];
        set({ chats: sortChats(updatedChats) });
        await ChatService.addChatToStorage(newChat);
    },
    getChat: (chatId) => {
        const { chats } = get();
        return chats.find((chat) => chat.id === chatId);
    },
    fetchDataFromLocalStorage: async (user) => {
        try {
            const localChats = await ChatService.getLocalChats();
            const decryptedChats = await decryptChats(localChats, user);
            set({ chats: sortChats(decryptedChats!) });
        } catch (error) {
            console.error('Error fetching messages from localstorage:', error);
        }
    },
    fetchDataFromServer: async (user) => {
        const { setSyncing, chats } = get();
        try {
            setSyncing(true);
            if (data?.chats) {
                const serverChats = data.chats;
                await ChatService.storeChatsLocally(serverChats);
                const decryptedChats = await decryptChats(serverChats, user);
                set({ chats: sortChats(decryptedChats) });
            }
        } catch (error) {
            console.error('Error fetching messages from the server:', error);
        } finally {
            setSyncing(false);
        }
    }
}))

export default useChatStore;
