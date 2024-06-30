// This function sorts chats by last message date.
import { Chat } from "../generated/graphql";

export const sortChats = (chats: Chat[]): Chat[] => {
    //if there is no chats
    if(!chats) return [];
    //if there is only one chat
    if(chats.length == 0 || chats.length == 1) {
        return chats;
    }
    else {
        const sortedChats = [...chats].sort((chatA, chatB) => {
            const lastMessageTimeA = chatA.messages!.length > 0 ? new Date(chatA.messages![chatA.messages!.length - 1].createdAt) : new Date(0);
            const lastMessageTimeB = chatB.messages!.length > 0 ? new Date(chatB.messages![chatB.messages!.length - 1].createdAt) : new Date(0);
    
            return lastMessageTimeB.getTime() - lastMessageTimeA.getTime();
        });
    
        return sortedChats;
    }
    
}