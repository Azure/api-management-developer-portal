import { BrowserAzureBlobStorage } from "@paperbits/azure/persistence/azureBlobStorage.browser";
import { ISettingsProvider } from "@paperbits/common/configuration";
import { Logger } from "@paperbits/common/logging/logger";
import * as Utils from "@paperbits/common/utils";
import { StaticSettingsProvider } from "../configuration";
import { TenantService } from "../services/tenantService";
import { IStreamBlobStorage } from "./IStreamBlobStorage";
import { EventManager } from "@paperbits/common/events";

const defaultContainerName = "content";

export class MapiBlobStorage implements IStreamBlobStorage {
    private azureStorageClient: IStreamBlobStorage;

    constructor(
        private readonly logger: Logger,
        private readonly tenantService: TenantService,
        private readonly eventManager: EventManager,
        private readonly settingsProvider: ISettingsProvider
    ) { }

    private async getStorageClient(): Promise<IStreamBlobStorage> {
        if (this.azureStorageClient) {
            return this.azureStorageClient;
        }


        const storageSettingsProvider: ISettingsProvider = new StaticSettingsProvider({ blobStorageUrl: await this.getStorageUrl() }, this.eventManager);
        setInterval(async () => {
            try {
                const url = await this.getStorageUrl();
                storageSettingsProvider.setSetting("blobStorageUrl", url);
            } catch (error) {
                this.logger.trackError(error, { message:  "Failed to update blob storage URL" });
            }
        }, 1000 * 60 * 5); // Keep the connection string updated every 5 minutes
        this.azureStorageClient = new BrowserAzureBlobStorage(storageSettingsProvider, this.logger)
        return this.azureStorageClient;
    }

    /**
     * Returns storage url.
     */

    private async getStorageUrl(): Promise<string> {
        const blobStorageContainer = await this.settingsProvider.getSetting<string>("blobStorageContainer");
        const blobStorageUrl = await this.settingsProvider.getSetting<string>("blobStorageUrl");

        let storageUri: string;
        if (blobStorageUrl) {
            const parsedUrl = new URL(blobStorageUrl);

            const containerSegment = blobStorageContainer
                ? blobStorageContainer
                : defaultContainerName;

            storageUri = `${parsedUrl.protocol}//${parsedUrl.hostname}${Utils.ensureLeadingSlash(containerSegment)}${parsedUrl.search}`;
        }
        else {
            storageUri = await this.tenantService.getMediaContentBlobUrl();
        }

        return storageUri;
    }

    /**
     * Lists all blobs in storage or with specific prefix (in a specific "folder").
     * @param blobPrefix Blob prefix.
     */
    public async listBlobs?(blobPrefix?: string): Promise<string[]> {
        const client = await this.getStorageClient();
        return await client.listBlobs(blobPrefix);
    }

    /**
     * Uploads blob with specified key to storage.
     * @param blobKey Unique blob identifier.
     * @param content Content in form of byte array.
     * @param contentType Content type (MIME) of the content.
     */
    public async uploadBlob(blobKey: string, content: Uint8Array, contentType?: string): Promise<void> {
        const client = await this.getStorageClient();
        return await client.uploadBlob(blobKey, content, contentType);
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
     * Get blob as a stream from storage in Node.JS
     * @param blobKey {string} Blob key.
     */
    public async getBlobAsStream(blobKey: string): Promise<NodeJS.ReadableStream> {
        const client = await this.getStorageClient();
        return client.getBlobAsStream(blobKey);
    }
}
