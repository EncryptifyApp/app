import { encrypt, getMySecretKey } from "./crypto";
import { box } from "tweetnacl";
import { decode as decodeBase64 } from '@stablelib/base64';
import { User } from "../generated/graphql";

export const encryptMessage = async (message: string, toUser: User) => {
    // encrypt message
    const privateKey = await getMySecretKey();
    if (!privateKey) {
        console.error("NO PRIVATE KEY");
        return;
    }
    const userPublicKey = decodeBase64(toUser!.publicKey!);
    const sharedKey = box.before(userPublicKey, privateKey);
  
    //@ts-ignore
    const encryptedMessage = encrypt(sharedKey, { message });
    return encryptedMessage;
}