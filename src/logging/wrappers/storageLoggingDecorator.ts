import { Logger } from "@paperbits/common/logging";
import { IDefaultLogEventTypeProvider } from "../utils/defaultEventTypeProvider";
import { IStreamBlobStorage } from "../../persistence/IStreamBlobStorage";
import { ReadStream } from "fs";

export class StorageLoggingDecorator implements IStreamBlobStorage {
    constructor(
        private readonly outputBlobStorage: IStreamBlobStorage,
        private readonly loggingEventProvider: IDefaultLogEventTypeProvider,
        private readonly logger: Logger
    ) { }

    public listBlobs?(): Promise<string[]> {
        return this.outputBlobStorage.listBlobs();
    }

    public uploadBlob(blobKey: string, content: Uint8Array, contentType?: string): Promise<void> {
        return this.wrapWithLogging(
            () => this.outputBlobStorage.uploadBlob(blobKey, content, contentType),
            "Uploading",
            blobKey,
            () => Promise.resolve(`Uploaded size: ${content.byteLength}`),
            { contentLength: content.byteLength, contentType: contentType });
    }

    public deleteBlob(blobKey: string): Promise<void> {
        return this.wrapWithLogging(
            () => this.outputBlobStorage.deleteBlob(blobKey),
            "Deleting",
            blobKey);
    }

    public downloadBlob?(blobKey: string): Promise<Uint8Array> {
        return this.outputBlobStorage.downloadBlob(blobKey);
    }

    public getDownloadUrl(blobKey: string): Promise<string> {
        return this.outputBlobStorage.getDownloadUrl(blobKey);
    }

    public getBlobAsStream?(blobKey: string): Promise<NodeJS.ReadableStream> {
        return this.outputBlobStorage.getBlobAsStream(blobKey);
    }

    public uploadStreamToBlob(blobKey: string, contentStream: ReadStream, contentType?: string): Promise<void> {
        let contentSize = 0;
        contentStream.on("data", (chunk) => { contentSize += chunk.length; });
        return this.wrapWithLogging(
            () => this.outputBlobStorage.uploadStreamToBlob(blobKey, contentStream, contentType),
            "Uploading as stream",
            blobKey,
            () => {
                return new Promise<string>((resolve) => {
                    contentStream.on("end", () => resolve(`Uploaded size: ${contentSize}`));
                    // This is a workaround for the case when uploadStreamToBlob failed and "end" event is not triggered.
                    setTimeout(() => resolve(`Uploaded size: ${contentSize}`), 500);
                });
            },
            { contentType });
    }

    private async wrapWithLogging(
        actionCallback: () => Promise<void>,
        action: string,
        key: string,
        additionalMessageFunc: () => Promise<string> = null,
        data: object = null
    ): Promise<void> {
        this.logger.trackEvent(this.getLoggingEvent(), { message: `Start ${action}: ${key}...`, eventData: JSON.stringify(data) });
        let succeeded: boolean = false;
        try {
            await actionCallback();
            succeeded = true;
        } finally {
            let additionalMessage = " ";
            if (succeeded && !!additionalMessageFunc) {
                additionalMessage = await additionalMessageFunc();
            }
            this.logger.trackEvent(this.getLoggingEvent(), { message: `${action} of ${key} completed ${succeeded ? 'successfully' : 'with failure'}. ${additionalMessage}` });
        }
    }

    private getLoggingEvent() { return this.loggingEventProvider?.getLogEventType() ?? "BlobStorage" };
}