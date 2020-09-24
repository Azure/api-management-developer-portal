export interface SessionManager {
    /**
     * Returns stored value.
     * @param key 
     */
    getItem<T>(key: string): Promise<T>;

    /**
     * Stores value with specified key.
     * @param key {string} Stored value key.
     * @param value {T} Stored value.
     */
    setItem<T>(key: string, value: T): Promise<void>;

    /**
     * Removes value with specified key.
     * @param key {string} Stored value key.
     */
    removeItem(key: string): Promise<void>;
}