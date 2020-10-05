import forge from "node-forge";
import publicKey from "../../documents/unitTestPub.pem";
import { getChannel, setAuthToken } from "./channel";

const pubKey = forge.pki.publicKeyFromPem(publicKey) as forge.pki.rsa.PublicKey;

function processPassword(pwd: string) {
    const md = forge.md.md5.create();
    const hash = md.update(pwd).digest().bytes();
    pwd = forge.util.encode64(hash);
    return forge.util.encode64(pubKey.encrypt(pwd));
}

export function submitLogin(login: string, pwd: string): Promise<void> {
    const password = processPassword(pwd.trim());

    return getChannel()
        .get("/login", { params: { account: login.trim().toLowerCase(), password } })
        .then((r) => {
            const { error, token, message } = r.data;

            setAuthToken(token);

            if (error < 0) throw new Error(`error:${error}, ${message}`);
        });
}
