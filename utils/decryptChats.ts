import { decrypt, getMySecretKey } from "./crypto";
import { decode as decodeBase64 } from '@stablelib/base64';
import { box } from "tweetnacl";
import { Chat, User } from "../generated/graphql";

export const decryptChats = async (chats: Chat[], user: User) => {
    if (!user) return;
    const privateKey = await getMySecretKey();

    if (!privateKey) {
        console.error("NO PRIVATE KEY");
        return [];
    }

    const decryptedChats = chats.map((chat) => {
        const toUser = chat.members?.find((member) => member.id !== user?.id);

        if (!toUser?.publicKey || typeof toUser.publicKey !== 'string') {
            console.error("INVALID PUBLIC KEY");
            return chat;
        }

        const decryptedMessages = chat.messages?.map((message) => {
            const userPublicKeyBase64 = toUser.publicKey;
            const userPublicKey = decodeBase64(userPublicKeyBase64!);

            const sharedKey = box.before(userPublicKey, privateKey);

            const decryptedMessage = decrypt(sharedKey, message.content);

            return { ...message, content: decryptedMessage.message };
        });

        return { ...chat, messages: decryptedMessages };
    });
    return decryptedChats;
};