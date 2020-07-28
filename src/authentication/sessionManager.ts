export class DefaultSessionManager {
    public async getItem<T>(key: string): Promise<T> {
        const value = sessionStorage.getItem(key);
        return JSON.parse(value);
    }

    public async setItem<T>(key: string, value: T): Promise<void> {
        sessionStorage.setItem(key, JSON.stringify(value));
    }
}