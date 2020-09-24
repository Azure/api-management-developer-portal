import { SessionManager } from "./sessionManager";

export class DefaultSessionManager implements SessionManager {
    public async getItem<T>(key: string): Promise<T> {
        const value = sessionStorage.getItem(key);

        if (!value) {
            return null;
        }

        return JSON.parse(value);
    }

    public async setItem<T>(key: string, value: T): Promise<void> {
        sessionStorage.setItem(key, JSON.stringify(value));
    }

    public async removeItem(key: string): Promise<void> {
        sessionStorage.removeItem(key);
    }
}