import { Message, User } from "../__generated__/graphql";
import { decrypt, getMySecretKey } from "./crypto";
import { decode as decodeBase64 } from '@stablelib/base64';
import { box } from "tweetnacl";

export const decryptMessage = async (message: Message,toUser:User) => {
    const privateKey = await getMySecretKey();
    
    if (!privateKey) {
        console.error("NO PRIVATE KEY");
        return;
    }

    if (!toUser?.publicKey || typeof toUser.publicKey !== 'string') {
        console.error("INVALID PUBLIC KEY");
        return;
    }

    const userPublicKeyBase64 = toUser.publicKey;
    const userPublicKey = decodeBase64(userPublicKeyBase64);

    const sharedKey = box.before(userPublicKey, privateKey);

    const decryptedMessage = decrypt(sharedKey, message.content);

    return { ...message, content: decryptedMessage.message };
};