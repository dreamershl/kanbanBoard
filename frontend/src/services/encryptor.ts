// @ts-ignore
import { JSEncrypt } from "jsencrypt";

import defaultKey from "../../documents/unitTestPub.pem";

export function encryptPassword(text: string, publicKey?: string) {
    publicKey = publicKey || defaultKey;

    const encrypt = new JSEncrypt();

    encrypt.setPublicKey(publicKey);

    return encrypt.encrypt(text);
}
