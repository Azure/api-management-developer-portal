import { IBlobStorage } from "@paperbits/common/persistence";
import { AzureBlobStorage } from "@paperbits/azure";
import { Logger } from "@paperbits/common/logging";
import { ISettingsProvider } from "@paperbits/common/configuration";
import { MapiClient } from "../services";
import { StaticSettingsProvider } from "../components/staticSettingsProvider";
import { Utils } from "../utils";



const defaultContainerName = "content";

export class MapiBlobStorage implements IBlobStorage {
    private storageClient: AzureBlobStorage;

    constructor(
        private readonly mapiClient: MapiClient,
        private readonly settingsProvider: ISettingsProvider,
        private readonly logger: Logger
    ) { }

    private async getStorageClient(): Promise<AzureBlobStorage> {
        if (this.storageClient) {
            return this.storageClient;
        }

        let storageSettingsProvider: ISettingsProvider;

        const blobStorageContainer = await this.settingsProvider.getSetting<string>("blobStorageContainer");
        const blobStorageConnectionString = await this.settingsProvider.getSetting<string>("blobStorageConnectionString");
        const blobStorageUrl = await this.settingsProvider.getSetting<string>("blobStorageUrl");

        if (blobStorageConnectionString) {
            storageSettingsProvider = new StaticSettingsProvider({
                blobStorageConnectionString: blobStorageConnectionString,
                blobStorageContainer: blobStorageContainer || defaultContainerName
            });
        }
        else if (blobStorageUrl) {
            const parsedUrl = new URL(blobStorageUrl);

            const containerSegment = blobStorageContainer
                ? blobStorageContainer
                : defaultContainerName;

            const normalizedBlobStorageUrl = `${parsedUrl.protocol}//${parsedUrl.hostname}${Utils.ensureLeadingSlash(containerSegment)}${parsedUrl.search}`;

            storageSettingsProvider = new StaticSettingsProvider({
                blobStorageUrl: normalizedBlobStorageUrl
            });
        }
        else {
            const result = await this.mapiClient.post<any>(`/portalSettings/mediaContent/listSecrets`, [await this.mapiClient.getPortalHeader("getStorageSasUrl")]);
            const blobStorageUrl = result.containerSasUrl;

            storageSettingsProvider = new StaticSettingsProvider({
                blobStorageUrl: blobStorageUrl
            });
        }

        this.storageClient = new AzureBlobStorage(storageSettingsProvider, this.logger);

        return this.storageClient;
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
        return await client.downloadBlob(blobKey);
    }

    /**
     * Returns download URL of uploaded blob.
     * @param blobKey Unique blob identifier.
     */
    public async getDownloadUrl(blobKey: string): Promise<string> {
        const client = await this.getStorageClient();
        return await client.getDownloadUrl(blobKey);
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
        return await client.deleteBlob(blobKey);
    }
}