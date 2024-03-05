// This function sorts chats by last last message date.
import { Chat } from "../generated/graphql";

export const sortChats = (chats: Chat[]): Chat[] => {
    const sortedChats = [...chats].sort((chatA, chatB) => {
        const lastMessageTimeA = chatA.messages!.length > 0 ? new Date(chatA.messages![chatA.messages!.length - 1].createdAt) : new Date(0);
        const lastMessageTimeB = chatB.messages!.length > 0 ? new Date(chatB.messages![chatB.messages!.length - 1].createdAt) : new Date(0);

        return lastMessageTimeB.getTime() - lastMessageTimeA.getTime();
    });

    return sortedChats;
}