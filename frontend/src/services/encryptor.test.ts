// @ts-ignore
import { JSEncrypt } from "jsencrypt";

import { encryptPassword } from "./encryptor";

describe("encryption", () => {
    const text = "aaaabbbbccccddddddde";

    test("encrypt with specified key pair", () => {
        const key = require("../../documents/unitTest.pem");

        const publicKey = require("../../documents/unitTestPub.pem");

        const encrypted = encryptPassword(text, publicKey);

        const encrypt = new JSEncrypt();

        encrypt.setPrivateKey(key);

        expect(encrypt.decrypt(encrypted)).toEqual(text);
    });

    test("encrypt with default key", () => {
        const encrypted = encryptPassword(text);

        const encrypt = new JSEncrypt();

        expect(encrypted).toBeTruthy();

        expect(encrypt.decrypt(encrypted)).toEqual(null);
    });
});
