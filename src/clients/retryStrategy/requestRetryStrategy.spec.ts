import { describe, it } from "mocha";
import { expect } from "chai";
import { spy } from 'sinon';
import { Logger, ConsoleLogger } from "@paperbits/common/logging";
import { createStubInstance, SinonStubbedInstance, stub } from "sinon";
import { RequestRetryStrategy } from "./requestRetryStrategy";
import { MapiError, MapiErrorCodes } from "../../errors/mapiError";

describe("RequestRetryStrategy", async () => {

    let logger: SinonStubbedInstance<Logger>;

    before(() => {
        logger = createStubInstance(ConsoleLogger);
    });

    it('it should not repeat if there is not MapiError', async () => {
        //setup
        const retryStrategy = new RequestRetryStrategy(logger);
        const sampleApiResponse = { "hello": "world" };

        //run
        const response = await retryStrategy.invokeCall(() => {
            return Promise.resolve(sampleApiResponse);
        });

        //test
        expect(response).to.eq(sampleApiResponse);
    });``

    it('it should re-throw the same error if a api call throws one', async () => {
        //setup
        const retryStrategy = new RequestRetryStrategy(logger);
        const error = new Error('test');
        let reThrow = false;

        //run
        try {
            const response = await retryStrategy.invokeCall(() => {
                return Promise.reject(error);
            });
            //should not reach here
            return Promise.reject();
        } catch (err) {
            reThrow = true;
            expect(error).to.eq(err);
        }

        // est
        expect(reThrow).to.be.true;
    });

    it('it should not retry for specific MapiError "NotFound" error', async () => {
        //setup
        const retryStrategy = new RequestRetryStrategy(logger);
        retryStrategy.maxRetries = 10;
        const notFoundError = new MapiError(MapiErrorCodes.NotFound, 'Not found should not retry');
        const requestCallSpy = spy(async () => {
            throw notFoundError;
        });
        let reThrow = false;

        //run
        try {
            await retryStrategy.invokeCall(requestCallSpy);
        } catch (err) {
            reThrow = true;
            expect(notFoundError).to.eq(err);
        }

        //test
        expect(reThrow).to.be.true;
        expect(requestCallSpy.callCount).to.eq(1); // no retries
    });

    it('it should retry for specific MapiError, like "TooManyRequest"', async () => {
        //setup
        const retryStrategy = new RequestRetryStrategy(logger);
        retryStrategy.maxRetries = 4; // should try to max 4 retries
        retryStrategy.defaultDelayMs = 5; // should delay between each retry for 5 millisecods
        const error429 = new MapiError(MapiErrorCodes.TooManyRequest, 'Slow down bro!');
        const sleepSpy = spy(retryStrategy, 'sleep');
        const requestCallSpy = spy(async () => {
            throw error429;
        })

        //test
        try {
            await retryStrategy.invokeCall(requestCallSpy);
        } catch (err) {
            expect(error429).to.eq(err);
        }

        //test
        expect(requestCallSpy.callCount).to.equal(4); // 4 times tried to call
        expect(sleepSpy.callCount).to.equal(4); // 4 times slept with 5ms delay
        expect(sleepSpy.getCall(0).firstArg).to.equal(5);
        expect(sleepSpy.getCall(1).firstArg).to.equal(5);
        expect(sleepSpy.getCall(2).firstArg).to.equal(5);
        expect(sleepSpy.getCall(3).firstArg).to.equal(5);
    });

    it('it should use default values for delay if "Retry-After" header is not present', async () => {
        //setup
        const retryStrategy = new RequestRetryStrategy(logger);
        retryStrategy.defaultDelayMs = 6; // lets not wait for too long
        retryStrategy.maxRetries = 2;
        const sleepSpy = spy(retryStrategy, 'sleep');
        const error429 = new MapiError(MapiErrorCodes.TooManyRequest, 'Slow down bro!', [
            //no headers
        ]);
        const requestCallSpy = spy(async () => {
            throw error429;
        })

        //run
        try {
            await retryStrategy.invokeCall(requestCallSpy);
        } catch (err) {
            expect(error429).to.eq(err);
        }

        //test
        expect(requestCallSpy.callCount).to.eq(2);
        expect(sleepSpy.callCount).to.equal(2);
        expect(sleepSpy.getCall(0).firstArg).to.equal(6);
        expect(sleepSpy.getCall(1).firstArg).to.equal(6);
    });

    it('it should use "retry-after" header if present for the delay', async () => {
        //setup
        const retryStrategy = new RequestRetryStrategy(logger);
        retryStrategy.maxRetries = 1;
        retryStrategy.defaultDelayMs = 6;
        const sleepSpy = spy(retryStrategy, 'sleep');
        const error429 = new MapiError(MapiErrorCodes.TooManyRequest, 'Slow down bro!', [
            { message: "Retry-After", target: "1" }
        ]);
        const requestCallSpy = spy(async () => {
            throw error429;
        });

        //run
        try {
            await retryStrategy.invokeCall(requestCallSpy);
        } catch (err) {
            expect(error429).to.eq(err);
        }

        //test
        expect(requestCallSpy.callCount).to.eq(1)
        expect(sleepSpy.callCount).to.equal(1);
        expect(sleepSpy.getCall(0).firstArg).to.equal(1000); //taken from the header
    });

    it('it should use "Retry-After-Ms" and "X-Ms-Retry-After-Ms" header if present for the delay', async () => {
        //setup
        let retryStrategy = new RequestRetryStrategy(logger);
        retryStrategy.maxRetries = 4;
        retryStrategy.defaultDelayMs = 3;
        let sleepSpy = spy(retryStrategy, 'sleep');
        let error429 = new MapiError(MapiErrorCodes.TooManyRequest, 'Slow down bro!', [
            { message: "Retry-After-Ms", target: "10" }
        ]);
        let requestCallSpy = spy(async () => {
            throw error429;
        });

        //run
        try {
            await retryStrategy.invokeCall(requestCallSpy);
        } catch (err) {
            expect(error429).to.eq(err);
        }

        //test
        expect(requestCallSpy.callCount).to.eq(4)
        expect(sleepSpy.callCount).to.equal(4);
        expect(sleepSpy.getCall(0).args[0]).to.equal(10);
        expect(sleepSpy.getCall(1).args[0]).to.equal(10);
        expect(sleepSpy.getCall(2).args[0]).to.equal(10);
        expect(sleepSpy.getCall(3).args[0]).to.equal(10);

        // case 2
        retryStrategy = new RequestRetryStrategy(logger);
        retryStrategy.maxRetries = 3;
        retryStrategy.defaultDelayMs = 3;
        sleepSpy = spy(retryStrategy, 'sleep');
        error429 = new MapiError(MapiErrorCodes.TooManyRequest, 'Slow down bro!', [
            { message: "X-Ms-Retry-After-Ms", target: "11" }
        ]);
        requestCallSpy = spy(async () => {
            throw error429;
        });

        //run
        try {
            await retryStrategy.invokeCall(requestCallSpy);
        } catch (err) {
            expect(error429).to.eq(err);
        }

        //test
        expect(requestCallSpy.callCount).to.eq(3)
        expect(sleepSpy.callCount).to.equal(3);
        expect(sleepSpy.getCall(0).args[0]).to.equal(11);
        expect(sleepSpy.getCall(1).args[0]).to.equal(11);
        expect(sleepSpy.getCall(2).args[0]).to.equal(11);
    });


    it('it should stop the retries if there is no error', async () => {
        //setup
        const retryStrategy = new RequestRetryStrategy(logger);
        retryStrategy.defaultDelayMs = 9; // lets not wait for too long
        retryStrategy.maxRetries = 4;
        const sleepSpy = spy(retryStrategy, 'sleep');
        const error429 = new MapiError(MapiErrorCodes.TooManyRequest, 'Slow down bro!', [
            //no headers
        ]);

        let retryNumber = 0;
        const requestCallSpy = spy(async () => {
            // the 3rd retry is succesfull
            retryNumber++;
            if(retryNumber === 3) {
                return { "success": true };
            } else {
                throw error429;
            }
        })

        //run
        try {
            await retryStrategy.invokeCall(requestCallSpy);
        } catch (err) {
            expect(error429).to.eq(err);
        }

        //test
        expect(requestCallSpy.callCount).to.eq(3);
        expect(sleepSpy.callCount).to.equal(2);
        expect(sleepSpy.getCall(0).firstArg).to.equal(9);
        expect(sleepSpy.getCall(1).firstArg).to.equal(9);
    });
});