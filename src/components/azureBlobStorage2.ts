import { ISettingsProvider } from "@paperbits/common/configuration";
import { IBlobStorage } from "@paperbits/common/persistence";
import { ProgressPromise } from "@paperbits/common";
import { Aborter, BlobURL, BlockBlobURL, ContainerURL, ServiceURL, StorageURL, AnonymousCredential } from "@azure/storage-blob";


/**
 * Static blob storage for demo purposes. It stores all the uploaded blobs in memory.
 */
export class AzureBlobStorage implements IBlobStorage {
    private containerURL: ContainerURL;

    /**
     * Creates Azure blob storage client.
     * @param storageURL Storage URL containing SAS key.
     * @param storageContainer Name of storage container.
     */
    constructor(private readonly settingsProvider: ISettingsProvider) {
        this.initialize();
    }

    private async initialize(): Promise<void> {
        const storageURL = await this.settingsProvider.getSetting<string>("blobStorageUrl");
        const storageContainer = await this.settingsProvider.getSetting<string>("blobStorageContainer");

        const credential = new AnonymousCredential();
        const pipeline = StorageURL.newPipeline(credential);
        const serviceURL: ServiceURL = new ServiceURL(storageURL, pipeline);

        this.containerURL = ContainerURL.fromServiceURL(serviceURL, storageContainer);
    }

    /**
     * Uploads specified content into browser memory and stores it as base64 string.
     * @param blobKey
     * @param content
     * @param contentType
     */
    public async uploadBlob(blobKey: string, content: Uint8Array, contentType?: string): ProgressPromise<void> {
        blobKey = blobKey.replace(/\\/g, "\/").replace("//", "/");

        const blobURL = BlobURL.fromContainerURL(this.containerURL, blobKey);
        const blockBlobURL = BlockBlobURL.fromBlobURL(blobURL);

        try {
            await blockBlobURL.upload(
                Aborter.none,
                content,
                content.byteLength,
                {
                    blobHTTPHeaders: {
                        blobContentType: contentType
                    }
                }
            );
        }
        catch (error) {
            throw new Error(`Unable to upload blob ${blobKey}.`);
        }
    }

    /**
     * Generates download URL of a blob (without checking for its existence).
     * @param blobKey
     */
    public async getDownloadUrl(blobKey: string): Promise<string> {
        try {
            const blobURL = BlobURL.fromContainerURL(this.containerURL, blobKey);
            return blobURL.url;
        }
        catch (error) {
            if (error && error.statusCode && error.statusCode === 404) {
                return null; // blob was already deleted
            }
            throw error;
        }
    }

    /**
     * Removes specified blob from memory.
     * @param blobKey
     */
    public async deleteBlob(blobKey: string): Promise<void> {
        try {
            const blobURL = BlobURL.fromContainerURL(this.containerURL, blobKey);
            await blobURL.delete(Aborter.none);
        }
        catch (error) {
            if (error && error.statusCode && error.statusCode === 404) {
                return; // blob was already deleted
            }
            throw error;
        }
    }

    /**
     * Returns array of keys for all the blobs in container.
     */
    public async listBlobs?(): Promise<string[]> {
        const listBlobsResponse = await this.containerURL.listBlobFlatSegment(Aborter.none, undefined);
        return listBlobsResponse.segment.blobItems.map(x => x.name);
    }
}