import axios, { AxiosInstance } from "axios";
import configure from "../configure";

const connection = axios.create({
    baseURL: configure.endpoint,
    timeout: 1000,
});

export function getChannel(): AxiosInstance {
    return connection;
}
