import { IBlobStorage } from "@paperbits/common/persistence";
import { ProgressPromise } from "@paperbits/common";
import * as stream from "stream";
import * as mime from "mime-types";
import * as storage from "azure-storage";

/**
 * Static blob storage for demo purposes. It stores all the uploaded blobs in memory.
 */
export class AzureBlobStorage implements IBlobStorage {
    private blobService: storage.BlobService;
    private isContainerExist: boolean;

    constructor(
        private readonly connectionString: string,
        private readonly containerName: string,
        private readonly basePath: string = ""
    ) {
        this.blobService = storage.createBlobService(this.connectionString);
    }

    /**
     * Uploads specified content into browser memory and stores it as base64 string.
     * @param blobKey
     * @param content
     * @param contentType
     */
    public async uploadBlob(blobKey: string, content: Uint8Array, contentType?: string): ProgressPromise<void> {
        if (!this.isContainerExist) {
            const result = await this.createContainerIfNotExists(this.containerName);
            this.isContainerExist = true;
        }
        blobKey = blobKey.replace(/\\/g, "\/").replace("//", "/");
        const fileName = blobKey.split("/").pop();

        const options = { contentSettings: { contentType: contentType || mime.lookup(fileName) || "application/octet-stream" }, metadata: { fileName: fileName } };

        const contentData = Buffer.from(content);
        const fromKey = this.getFullKey(blobKey);

        await this.upload(this.containerName, fromKey, contentData, options);
    }

    public async downloadBlob(blobKey: string): Promise<Uint8Array> {
        try {
            const fromKey = this.getFullKey(blobKey);
            return await this.getBlobData(this.containerName, fromKey);
        }
        catch (error) {
            if (error && error.code && error.code === "NotFound") {
                return null;
            }
            throw error;
        }
    }

    public async getBlobAsString(blobKey: string): Promise<string> {
        const data = await this.getBlobText(this.containerName, blobKey);
        return data;
    }

    /**
     * Returns download URL of uploaded blob.
     * @param blobKey
     */
    public async getDownloadUrl(blobKey: string): Promise<string> {
        const fromKey = this.getFullKey(blobKey);
        const startDate = new Date();
        const expiryDate = new Date(startDate);

        expiryDate.setMinutes(startDate.getMinutes() + 100);
        startDate.setMinutes(startDate.getMinutes() - 100);

        const sharedAccessPolicy = {
            AccessPolicy: {
                Permissions: storage.BlobUtilities.SharedAccessPermissions.READ,
                Start: startDate,
                Expiry: expiryDate
            }
        };

        const token = this.blobService.generateSharedAccessSignature(this.containerName, fromKey, sharedAccessPolicy);
        const downloadUrl = this.blobService.getUrl(this.containerName, fromKey, token);
        
        return downloadUrl;
    }

    /**
     * Removes specified blob.
     * @param blobKey
     */
    public async deleteBlob(blobKey: string): Promise<void> {
        if (!blobKey) {
            const blobs = await this.listAllBlobsNoPrefix();
            if (blobs && blobs.length > 0) {
                const deleteTasks = blobs.map(blob => this.delete(this.containerName, blob.name));
                await Promise.all(deleteTasks);
            }
        } else {
            const fromKey = this.getFullKey(blobKey);
            await this.delete(this.containerName, fromKey);
        }
    }

    public async listBlobs(prefix?: string): Promise<string[]> {
        const result = [];
        const blobPrefix = prefix || this.basePath;

        const allBlobs = await this.listAllBlobs(blobPrefix);
        if (allBlobs.length > 0) {
            allBlobs.map(blob => result.push(blob.name.split(blobPrefix).pop()));
        }

        return result;
    }

    public async copyBlob(fromContainer: string, fromBlob: string, toContainer: string, toBlob: string, toService?: storage.BlobService): Promise<void> {
        const toBlobService = toService || this.blobService;
        const read = this.blobService.createReadStream(fromContainer, fromBlob, null);
        const write = toBlobService.createWriteStreamToBlockBlob(toContainer, toBlob, null);
        return new Promise<void>((resolve, reject) => {
            read.on("error", (err) => reject(err));
            write.on("error", (err) => reject(err));
            write.on("end", () => resolve());

            read.pipe(write);
        });
    }

    public async createContainerIfNotExists(containerName: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.blobService.createContainerIfNotExists(containerName, err => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    private async deleteContainerIfExists(containerName: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.blobService.deleteContainerIfExists(containerName, err => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    private getFullKey(blobKey: string): string {
        let result = this.basePath.length > 0 ? `${this.basePath}${blobKey}` : blobKey;
        if (result && result.length > 0) {
            result = result.replace(/\\\\|\\|\/\//g, "/").replace(/^\/|\/$/g, "");
        }
        return result || "";
    }

    private async upload(containerName: string, blobName: string, data: Buffer, options?: storage.BlobService.CreateBlobRequestOptions): Promise<{ message: string }> {
        return new Promise<{ message: string }>((resolve, reject) => {
            this.blobService.createBlockBlobFromText(containerName, blobName, data, options, err => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve({ message: `Blob "${blobName}" was uploaded` });
                }
            });
        });
    }

    private async delete(containerName: string, blobName: string): Promise<{ message: string }> {
        return new Promise<{ message: string }>((resolve, reject) => {
            this.blobService.deleteBlobIfExists(containerName, blobName, err => {
                if (err) {
                    reject(err);
                } else {
                    resolve({ message: `Block blob '${blobName}' deleted` });
                }
            });
        });
    }

    private async getBlobText(containerName: string, blobName: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            this.blobService.getBlobToText(containerName, blobName, (err, data: string) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
    }

    private async getBlobData(containerName: string, blobName: string): Promise<Uint8Array> {
        return new Promise<Buffer>((resolve, reject) => {
            const chunks = [];
            const writeStream = new stream.Writable({
                write: (chunk, encoding, next) => {
                    chunks.push(chunk);
                    next();
                }
            });
            writeStream.on("error", reject);
            writeStream.on("finish", () => resolve(Buffer.concat(chunks)));

            this.blobService.getBlobToStream(containerName, blobName, writeStream, (error) => {
                if (error) {
                    reject(error);
                }
            });
        });
    }

    private async listAllBlobs(prefix: string): Promise<storage.BlobService.BlobResult[]> {
        const allItems = [];
        const call = (prefix: string, continuationToken: storage.common.ContinuationToken) => this.listBlobsInContainer(prefix, continuationToken);

        const takeResult = (result: storage.BlobService.ListBlobsResult): Promise<storage.BlobService.BlobResult[]> => {
            if (result) {
                if (result.entries) {
                    allItems.push(...result.entries);
                }
                if (result.continuationToken) {
                    return call(prefix, result.continuationToken).then(takeResult);
                }
            }
            return Promise.resolve(allItems);
        };

        return this.listBlobsInContainer(prefix).then(takeResult);
    }

    private async listBlobsInContainer(prefix: string, continuationToken?: storage.common.ContinuationToken): Promise<storage.BlobService.ListBlobsResult> {
        return new Promise<storage.BlobService.ListBlobsResult>((resolve, reject) => {
            this.blobService.listBlobsSegmentedWithPrefix(this.containerName, prefix, continuationToken, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
    }

    private async listAllBlobsNoPrefix(): Promise<storage.BlobService.BlobResult[]> {
        const allItems = [];
        const call = (continuationToken: storage.common.ContinuationToken) => this.listBlobsInContainerNoPrefix(continuationToken);

        const takeResult = (result: storage.BlobService.ListBlobsResult): Promise<storage.BlobService.BlobResult[]> => {
            if (result) {
                if (result.entries) {
                    allItems.push(...result.entries);
                }
                if (result.continuationToken) {
                    return call(result.continuationToken).then(takeResult);
                }
            }
            return Promise.resolve(allItems);
        };

        return this.listBlobsInContainerNoPrefix().then(takeResult);
    }

    private async listBlobsInContainerNoPrefix(continuationToken?: storage.common.ContinuationToken): Promise<storage.BlobService.ListBlobsResult> {
        return new Promise<storage.BlobService.ListBlobsResult>((resolve, reject) => {
            this.blobService.listBlobsSegmented(this.containerName, continuationToken, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
    }
}