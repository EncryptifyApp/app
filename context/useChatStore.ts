import { create } from 'zustand'
import { Chat, Message, MessageStatus, User } from '../__generated__/graphql'
import ChatService from '../services/ChatService'
import { sortChats } from '../utils/sortChats'
import { decryptChats } from '../utils/decryptChats'
import { decryptMessage } from '../utils/decryptMessage'
import getChatById from '../operations/getChatById'
import { decryptChat } from '../utils/decryptChat'
import getChats from '../operations/getChats'

type State = {
    chats: Chat[],
    syncing: boolean,
}

type Actions = {
    clearChats: () => void
    setChats: (chats: Chat[], user: User) => void
    setSyncing: (syncing: boolean) => void
    updateChats: (session: string, message: Message, user: User) => Promise<void>
    updateMessage: (messageTempId: string, id: string, status: MessageStatus, createdAt: Date) => Promise<void>
    addNewChat: (newChat: Chat) => Promise<void>
    getChat: (chatId: string) => Chat | undefined
    fetchData: (user: User, isConnected: boolean, session: string) => Promise<void>
}

const useChatStore = create<State & Actions>((set, get) => ({
    chats: [],
    syncing: true,
    isConnected: false,
    clearChats: () => {
        ChatService.clearChats();
        set({ chats: [] })
    },
    setSyncing: (syncing) => set({ syncing }),
    setChats: async (chats, user) => {
        try {
            set({ syncing: true });
            console.log("fetching data from server");
            if (chats) {
                await ChatService.storeChatsLocally(chats);
                const decryptedChats = await decryptChats(chats, user!);
                set({ chats: sortChats(decryptedChats!) });
            }
        } catch (error) {
            console.error('Error fetching messages from the server:', error);
        } finally {
            set({ syncing: false });
        }
    },
    updateChats: async (session: string, newMessage: Message, user: User) => {
        const { chats } = get();
        const updatedChats = [...chats];
        const chatIndex = updatedChats.findIndex((chat) => chat.id === newMessage.chat!.id);
        if (chatIndex !== -1) {
            const existingChat = updatedChats[chatIndex];
            const toUser = existingChat.members!.find((member) => member.id !== user!.id);
            if (toUser) {
                const decryptedMessage = await decryptMessage(newMessage, toUser);
                //add message to top of the list
                existingChat.messages = [decryptedMessage as Message, ...existingChat.messages as Message[]];
                updatedChats.splice(chatIndex, 1);
                updatedChats.unshift(existingChat);
                set({ chats: updatedChats });
            }
        } else {
            //if the chat doesn't exist locally, 
            //we're going to fetch it from the server
            const chat = await getChatById(session, newMessage.chat!.id);
            if (chat) {
                if (chats.find((c) => c.id === chat.id)) {
                    return;
                }
                const decryptedChat = await decryptChat(chat, user!);
                set({ chats: [decryptedChat!, ...chats] });
                await ChatService.addChatToStorage(chat);
            }
        }

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
                set({ chats: sortChats(updatedChats) });
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
    fetchData: async (user, isConnected, session) => {
        console.log("fetching data from local storage");
        try {
            const localChats = await ChatService.getLocalChats();
            const decryptedChats = await decryptChats(localChats, user);
            set({ chats: sortChats(decryptedChats!) });

            if (isConnected) {
                console.log("fetching data from server");
                try {
                    const chats = await getChats(session);
                    if (chats) {
                        const decryptedChats = await decryptChats(chats, user);
                        set({ chats: sortChats(decryptedChats!) });
                        set({ syncing: false });
                    }
                } catch (error) {
                    console.error('Error fetching messages from the server:', error);
                    throw error;
                }
            } else {
                set({ syncing: false });
            }
        } catch (error) {
            console.error('Error fetching messages from local storage:', error);
            throw error;
        }
    },
}))

export default useChatStore;
