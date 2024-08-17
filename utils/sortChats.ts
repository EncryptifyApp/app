import { Chat } from "../__generated__/graphql";

export const sortChats = (chats: Chat[]): Chat[] => {
    if (!chats) return [];
    if (chats.length == 0 || chats.length == 1) {
        return chats;
    } else {
        // Sort chats by the last message date
        const sortedChats = [...chats].sort((chatA, chatB) => {
            const lastMessageTimeA = chatA.messages!.length > 0 ? new Date(chatA.messages![chatA.messages!.length - 1].createdAt) : new Date(0);
            const lastMessageTimeB = chatB.messages!.length > 0 ? new Date(chatB.messages![chatB.messages!.length - 1].createdAt) : new Date(0);

            return lastMessageTimeB.getTime() - lastMessageTimeA.getTime();
        });

        sortedChats.forEach(chat => {
            chat.messages = chat.messages!.sort((messageA, messageB) => {
                return new Date(messageB.createdAt).getTime() - new Date(messageA.createdAt).getTime();
            })
        });

        return sortedChats;
    }
};
