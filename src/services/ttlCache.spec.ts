import { expect } from "chai";
import { describe, it } from "mocha";
import { TtlCache } from "./ttlCache";


describe("Ttl cache", function() { // Changed to regular function for this context
    this.timeout(20000); // Set timeout to 20 seconds for all tests in this suite

    const target = new TtlCache();
    let attempt = 1;

    it("Add to cache, wait timeout - results are expired", async () => {
        const key = "testKey";

        const call = () => testFetch();

        const result1 = await target.getOrAddAsync(key, call, 1000);
        expect(result1.loadAttempt).to.equal(1);

        const cached = await target.getOrAddAsync(key, testFetch, 1000);
        expect(cached.loadAttempt).to.equal(1);

        await asyncTimeout(5010);

        const result2 = await target.getOrAddAsync(key, call, 1000);
        expect(result2.loadAttempt).to.equal(2);
    });


    it("Add to cache, wait timeout - results are expired", async () => {
        const key = "testKey";
        const key2 = "testKey2";

        const call1 = () => testFetch();
        const call2 = () => testFetch2();

        const result1 = await target.getOrAddAsync(key, call1, 10000);
        const t = result1.loadAttempt;

        const ff = await target.getOrAddAsync(key2, call2, 10000);
        expect(ff.loadAttempt).to.equal(undefined);

        const cached = await target.getOrAddAsync(key, call1, 1000);
        const tt = cached.loadAttempt;

        expect(tt).to.equal(t);

        await asyncTimeout(10010);

        const notCached = await target.getOrAddAsync(key, call1, 1000);
        const ttt = notCached.loadAttempt;

        expect(ttt).to.equal(tt + 2);
    });

    function asyncTimeout(duration: number): Promise<any> {
        return new Promise((resolve, reject) => {
            setTimeout(async () => {
                resolve({});
            }, duration);
        });
    }

    function testFetch(): Promise<TestFetchResult> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve({ loadAttempt: attempt++ });
            }, 5);
        });
    }

    function testFetch2(): Promise<any> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve({ loadAttempt2: attempt++ });
            }, 5);
        });
    }

    interface TestFetchResult {
        loadAttempt: number;
    }
});