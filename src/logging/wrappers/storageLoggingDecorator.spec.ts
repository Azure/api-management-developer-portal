import { expect } from "chai";
import { SinonStub, stub } from "sinon";
import { Logger } from "@paperbits/common/logging/logger";
import { IDefaultLogEventTypeProvider } from "../utils/defaultEventTypeProvider";
import { StorageLoggingDecorator } from "./storageLoggingDecorator";
import { IStreamBlobStorage } from "../../persistence/IStreamBlobStorage";
import { ReadStream } from "fs";
import * as stream from "stream";

describe("StorageLoggingDecorator", () => {
    let outputBlobStorage: IStreamBlobStorage;
    let loggingEventProvider: IDefaultLogEventTypeProvider;
    let logger: Logger;
    let storageLoggingDecorator: StorageLoggingDecorator;

    beforeEach(() => {
        outputBlobStorage = {
            uploadBlob: async (blobKey: string, content: Uint8Array, contentType?: string) => { },
            deleteBlob: async (blobKey: string) => { },
            uploadStreamToBlob: async (blobKey: string, contentStream: ReadStream, contentType?: string) => { },
        } as IStreamBlobStorage;
        loggingEventProvider = {
            getLogEventType: () => null
        } as IDefaultLogEventTypeProvider;
        logger = {
            trackEvent: async (eventName: string, properties?: { [key: string]: string }) => { }
        } as Logger;
        storageLoggingDecorator = new StorageLoggingDecorator(outputBlobStorage, loggingEventProvider, logger);
    });

    it("should call outputBlobStorage.uploadBlob with the provided parameters and log the upload event", async () => {
        const blobKey = "testBlobKey";
        const content = new Uint8Array([1, 2, 3]);
        const contentType = "image/jpeg";

        const uploadBlobStub: SinonStub = stub(outputBlobStorage, "uploadBlob").resolves();
        const trackEventStub: SinonStub = stub(logger, "trackEvent");

        await storageLoggingDecorator.uploadBlob(blobKey, content, contentType);

        expect(uploadBlobStub.calledOnceWith(blobKey, content, contentType)).to.be.true;
        expect(trackEventStub.calledTwice).to.be.true;
        const args = trackEventStub.lastCall.args;
        expect(args[1]?.message).to.contain(blobKey).and.contain(`${content.byteLength}`);

        uploadBlobStub.restore();
        trackEventStub.restore();
    });

    it("should call outputBlobStorage.deleteBlob with the provided blobKey and log the delete event", async () => {
        const blobKey = "testBlobKey";

        const deleteBlobStub: SinonStub = stub(outputBlobStorage, "deleteBlob").resolves();
        const trackEventStub: SinonStub = stub(logger, "trackEvent");

        await storageLoggingDecorator.deleteBlob(blobKey);

        expect(deleteBlobStub.calledOnceWithExactly(blobKey)).to.be.true;
        expect(trackEventStub.calledTwice).to.be.true;
        const args = trackEventStub.lastCall.args;
        expect(args[1]?.message).to.contain(blobKey);

        deleteBlobStub.restore();
        trackEventStub.restore();
    });

    it("should upload the content stream to the blob storage and log the upload event", async () => {
        const blobKey = "testBlobKey";
        const testContent = "test data";
        const contentType = "image/jpeg";

        const contentStream = new stream.Readable();
        contentStream.push(testContent);
        contentStream.push(null);

        const tt = new stream.Readable();
        tt.push(testContent);
        tt.push(null);

        const uploadStreamToBlobStub: SinonStub = stub(outputBlobStorage, "uploadStreamToBlob")
            .resolves()
            .callsFake(async (blobKey, contentStream, contentType) => { contentStream.read(); });
        const trackEventStub: SinonStub = stub(logger, "trackEvent");

        await storageLoggingDecorator.uploadStreamToBlob(blobKey, <ReadStream>contentStream, contentType);

        expect(uploadStreamToBlobStub.calledOnceWithExactly(blobKey, <ReadStream>contentStream, contentType)).to.be.true;
        expect(trackEventStub.calledTwice).to.be.true;
        const args = trackEventStub.lastCall.args;
        expect(args[1]?.message).to.contain(blobKey).and.contain(`${testContent.length}`);

        uploadStreamToBlobStub.restore();
        trackEventStub.restore();
    });

    it("should handle failures for uploadStreamToBlob method", async () => {
        const blobKey = "testBlobKey";
        const testContent = "test data";
        const contentType = "image/jpeg";

        const contentStream = new stream.Readable();
        contentStream.push(testContent);
        contentStream.push(null);

        const uploadStreamToBlobStub: SinonStub = stub(outputBlobStorage, "uploadStreamToBlob")
            .rejects(new Error("Failed to upload content to blob storage"));

        const trackEventStub: SinonStub = stub(logger, "trackEvent");

        let failed = false;
        try {
            await storageLoggingDecorator.uploadStreamToBlob(blobKey, <ReadStream>contentStream, contentType);
        } catch {
            // expect the error to be thrown
            failed = true;
        }

        expect(failed).to.be.true;
        expect(uploadStreamToBlobStub.calledOnceWithExactly(blobKey, <ReadStream>contentStream, contentType)).to.be.true;
        expect(trackEventStub.calledTwice).to.be.true;
        const args = trackEventStub.lastCall.args;
        expect(args[1]?.message).to.contain(`failure`);

        uploadStreamToBlobStub.restore();
        trackEventStub.restore();
    });
});