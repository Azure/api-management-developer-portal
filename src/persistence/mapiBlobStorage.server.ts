import { ServerAzureBlobStorage } from "@paperbits/azure/persistence/azureBlobStorage.server";
import { ISettingsProvider } from "@paperbits/common/configuration";
import { Logger } from "@paperbits/common/logging/logger";
import { ReadStream } from "fs";
import { StaticSettingsProvider } from "../configuration";
import { TenantService } from "../services/tenantService";
import { IStreamBlobStorage } from "./IStreamBlobStorage";

const defaultContainerName = "content";

export class MapiBlobStorage implements IStreamBlobStorage {
    private azureStorageClient: IStreamBlobStorage;

    constructor(
        private readonly logger: Logger,
        private readonly tenantService: TenantService,
        private readonly settingsProvider: ISettingsProvider
    ) { }

    private async getStorageClient(): Promise<IStreamBlobStorage> {
        if (this.azureStorageClient) {
            return this.azureStorageClient;
        }

        let storageSettingsProvider: ISettingsProvider;

        const blobStorageContainer = await this.settingsProvider.getSetting<string>("blobStorageContainer");
        const blobStorageConnectionString = await this.settingsProvider.getSetting<string>("blobStorageConnectionString");

        if (blobStorageConnectionString) {
            storageSettingsProvider = new StaticSettingsProvider({
                blobStorageConnectionString: blobStorageConnectionString,
                blobStorageContainer: blobStorageContainer || defaultContainerName
            });
        }
        else {
            const containerSasUrl = await this.tenantService.getMediaContentBlobUrl();

            storageSettingsProvider = new StaticSettingsProvider({
                blobStorageUrl: containerSasUrl
            });
        }

        this.azureStorageClient = new ServerAzureBlobStorage(storageSettingsProvider, this.logger)
        return this.azureStorageClient;
    }

    /**
     * Lists all blobs in storage or with specific prefix (in a specific "folder").
     * @param blobPrefix Blob prefix.
     */
    public async listBlobs?(blobPrefix?: string): Promise<string[]> {
        const client = await this.getStorageClient();
        return client.listBlobs();
    }

    /**
     * Uploads blob with specified key to storage.
     * @param blobKey Unique blob identifier.
     * @param content Content in form of byte array.
     * @param contentType Content type (MIME) of the content.
     */
    public async uploadBlob(blobKey: string, content: Uint8Array, contentType?: string): Promise<void> {
        const client = await this.getStorageClient();
        return client.uploadBlob(blobKey, content, contentType);
    }

    /**
     * Downloads blob with specified key.
     * @param blobKey Unique blob identifier.
     */
    public async downloadBlob?(blobKey: string): Promise<Uint8Array> {
        const client = await this.getStorageClient();
        return client.downloadBlob(blobKey);
    }

    /**
     * Returns download URL of uploaded blob.
     * @param blobKey Unique blob identifier.
     */
    public async getDownloadUrl(blobKey: string): Promise<string> {
        const client = await this.getStorageClient();
        return client.getDownloadUrl(blobKey);
    }

    /**
     * Returns download URL of uploaded blob without token.
     * @param blobKey Unique blob identifier.
     */
    public async getDownloadUrlWithoutToken(blobKey: string): Promise<string> {
        const url = new URL(await this.getDownloadUrl(blobKey));
        ["sv", "st", "se", "sr", "sp", "sig"].forEach(key => url.searchParams.delete(key));
        return url.toString();
    }

    /**
     * Removes specified blob from memory.
     * @param blobKey Unique blob identifier.
     */
    public async deleteBlob(blobKey: string): Promise<void> {
        const client = await this.getStorageClient();
        return client.deleteBlob(blobKey);
    }

    /**
     * Uploads specified content into storage in Node.JS
     * @param blobKey {string} Blob key.
     * @param content {ReadStream} Content stream.
     * @param contentType {string} Content type, e.g. `image/png`.
     */
    public async uploadStreamToBlob(blobKey: string, contentStream: ReadStream, contentType?: string): Promise<void> {
        const client = await this.getStorageClient();
        await client.uploadStreamToBlob(blobKey, contentStream, contentType);
    }

    /**
     * Get blob as a stream from storage in Node.JS
     * @param blobKey {string} Blob key.
     */
    public async getBlobAsStream(blobKey: string): Promise<NodeJS.ReadableStream> {
        const client = await this.getStorageClient();
        return client.getBlobAsStream(blobKey);
    }
}
