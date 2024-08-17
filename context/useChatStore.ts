import { create } from 'zustand'
import { Chat, Message, MessageStatus, User } from '../__generated__/graphql'
import ChatService from '../services/ChatService'
import { sortChats } from '../utils/sortChats'
import { decryptChats } from '../utils/decryptChats'
import { decryptMessage } from '../utils/decryptMessage'
import getChatById from '../operations/getChatById'
import { decryptChat } from '../utils/decryptChat'
import getChats from '../operations/getChats'
import { sendPendingMessage } from '../operations/sendPendingMessages'

type State = {
    //TODO: remove this from here cause session is already set in the app context
    // this is done just to get it in the layout so we can detect if the user is logged in
    // without closing the app
    session: string | null,
    chats: Chat[],
    syncing: boolean,
    chatIdToUpdated?: string | null,
}

type Actions = {
    clearChats: () => void
    setChats: (chats: Chat[], user: User) => void,
    setChatIdToUpdated: (chatId: string | null) => void
    setSyncing: (syncing: boolean) => void
    updateChats: (session: string, message: Message, user: User) => Promise<void>
    updateMessage: (messageTempId: string, id: string, status: MessageStatus, createdAt: Date) => Promise<void>
    addNewChat: (newChat: Chat) => Promise<void>
    getChat: (chatId: string) => Chat | undefined
    fetchData: (user: User, isConnected: boolean, session: string) => Promise<void>
    sendPendingMessages: (user: User) => Promise<void>
}

const useChatStore = create<State & Actions>((set, get) => ({
    //TODO: remove this from here cause session is already set in the app context
    // this is done just to get it in the layout so we can detect if the user is logged in
    // without closing the app
    session: null,
    chats: [],
    syncing: true,
    isConnected: false,
    clearChats: () => {
        ChatService.clearChats();
        set({ chats: [] });
    },
    setChatIdToUpdated: (chatId) => set({ chatIdToUpdated: chatId }),
    setSyncing: (syncing) => set({ syncing }),
    setChats: async (chats, user) => {
        try {
            set({ syncing: true });
            if (chats) {
                await ChatService.storeChatsLocally(chats);
                const decryptedChats = await decryptChats(chats, user!);
                set({ chats: sortChats(decryptedChats!) });
            }
        } catch (error) {
            console.error('Error decrypting messages', error);
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
                existingChat.messages = [decryptedMessage as Message,...existingChat.messages as Message[]];
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
    fetchData: async (user, isConnected, userSession) => {
        //TODO: remove this from here cause session is already set in the app context
        // this is done just to get it in the layout so we can detect if the user is logged in
        // without closing the app
        const { session } = get();
        if (!session) {
            set({ session: userSession });
        }

        try {
            set({ syncing: true });
            const localChats = await ChatService.getLocalChats();
            const decryptedChats = await decryptChats(localChats, user);

            set({ chats: sortChats(decryptedChats!) });
            if (isConnected) {
                set({ syncing: true });
                try {
                    const chats = await getChats(userSession) as any;
                    if (chats) {
                        const decryptedChats = await decryptChats(chats, user);
                        set({ chats: sortChats(decryptedChats!) });
                        set({ syncing: false });
                        await ChatService.storeChatsLocally(chats);
                    }
                } catch (error) {
                    console.error('Error fetching messages from the server:', error);
                    throw error;
                }
                finally {
                    set({ syncing: false });
                }
            }
        } catch (error) {
            console.error('Error fetching messages from local storage:', error);
            throw error;
        } finally {
            set({ syncing: false })
        }
    },
    sendPendingMessages: async (user: User) => {
        try {
            const { session, updateMessage } = get();
            const pendings = await ChatService.getPendingMessages();
            if (pendings.length === 0) return;
            for (const message of pendings) {
                const res = await sendPendingMessage(session!, message.chat?.id!, message.content);
                if (res?.id) {
                    updateMessage(message.id, res.id, MessageStatus.Sent, new Date(res.createdAt));
                }
            }
        } catch (error) {
            console.error('Error sending pending messages:', error);
        }
    },
}))

export default useChatStore;
