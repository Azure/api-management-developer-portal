import { LruCache } from "@paperbits/common/caching";
import { IObjectStorage, Page, Query } from "@paperbits/common/persistence";

export class CachedObjectStorage {
    private readonly cache: LruCache<Promise<any>>;

    constructor(
        private readonly underlyingStorage: IObjectStorage
    ) {
        this.cache = new LruCache(100, () => { return; });
    }

    public addObject<T>(key: string, dataObject: T): Promise<void> {
        throw new Error("Not supported.");
    }

    public getObject<T>(key: string): Promise<T> {
        const cachedItemPromise = this.cache.getItem(key);

        if (cachedItemPromise) {
            return cachedItemPromise;
        }

        const fetchPromise = this.underlyingStorage.getObject<T>(key);
   
        this.cache.setItem(key, fetchPromise);

        return fetchPromise;
    }

    public deleteObject(key: string): Promise<void> {
        throw new Error("Not supported.");
    }

    public updateObject<T>(key: string, dataObject: T): Promise<void> {
        throw new Error("Not supported.");
    }

    public async searchObjects<T>(key: string, query?: Query<T>): Promise<Page<T>> {
        return await this.underlyingStorage.searchObjects<T>(key, query);
    }
}