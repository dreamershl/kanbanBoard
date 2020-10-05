import axios, { AxiosInstance } from "axios";
import configure from "../configure";

const connection = axios.create({
    baseURL: configure.endpoint,
    timeout: 180000,
});

export function setAuthToken(token: string) {
    connection.defaults.headers.common.token = token;
}

export function getChannel(): AxiosInstance {
    return connection;
}

export function throwIfFail(response: any) {
    const { error, message } = response.data;
    if (error < 0) throw new Error(`error:${error}, ${message}`);
}
