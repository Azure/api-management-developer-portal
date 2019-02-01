export class TtlCache {
    private cache: {
        [key: string]: {
            expires: number,
            promise: Promise<any>
        }
    } = {};

    public getOrAddAsync<T>(key: string, fetch: () => Promise<T>, ttl: number): Promise<T> {
        let cached = this.cache[key];
        const now = Date.now();

        if (cached) {
            if (cached.expires >= now) {
                return cached.promise;
            }
            else {
                delete this.cache[key];
            }
        }

        const fetchPromise = fetch();

        this.cache[key] = cached = {
            expires: Number.MAX_VALUE,
            promise: fetchPromise
        };

        fetchPromise.then(() => {
            cached.expires = now + ttl;
            this.cleanup(now);
        }, () => {
            cached.expires = now + ttl;
            this.cleanup(now);
        });

        return fetchPromise;
    }

    private cleanup(now: number): void {
        for (const key in this.cache) {
            if (this.cache[key].expires < now) {
                delete this.cache[key];
            }
        }
    }
}