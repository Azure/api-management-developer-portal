import { IBlobStorage } from "@paperbits/common/persistence/IBlobStorage";
import { ReadStream } from "node:fs";

export interface IStreamBlobStorage extends IBlobStorage {
    /**
     * Uploads specified content into storage in Node.JS
     * @param blobKey {string} Blob key.
     * @param content {ReadStream} Content stream.
     * @param contentType {string} Content type, e.g. `image/png`.
     */
    uploadStreamToBlob?(blobKey: string, contentStream: ReadStream, contentType?: string): Promise<void>

    /**
     * Get blob from storage in Node.JS
     * @param blobKey {string} Blob key.
     */
    getBlobAsStream?(blobKey: string): Promise<NodeJS.ReadableStream>
}