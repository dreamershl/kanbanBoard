import forge from "node-forge";
import publicKey from "../../documents/unitTestPub.pem";
import { getChannel } from "./channel";

const pubKey = forge.pki.publicKeyFromPem(publicKey) as forge.pki.rsa.PublicKey;

function processPassword(pwd: string) {
    return forge.util.encode64(pubKey.encrypt(pwd));
}

export function submitLogin(login: string, pwd: string): Promise<void> {
    const password = processPassword(pwd);

    return getChannel()
        .get("/login", { params: { login, password } })
        .then((r) => {
            const { error } = r.data;

            if (error < 0) throw error;
        });
}
