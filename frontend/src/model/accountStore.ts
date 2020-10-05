import { Subject } from "rxjs";
import { submitLogin } from "../services/channelAccount";

export enum EVENT {
    SESSION,
}

export interface AccountEvent {
    type: EVENT;
    account: string;
}

export const accountEventStream = new Subject<AccountEvent>();

let selfAccount = "";

export function setSelfAccount(account?: string) {
    selfAccount = account || "";

    accountEventStream.next({ type: EVENT.SESSION, account: selfAccount });
}

export function isLogin() {
    return Boolean(selfAccount);
}

export function login(loginId: string, password: string) {
    return submitLogin(loginId, password);
}
