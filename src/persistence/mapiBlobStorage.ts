import { MapiClient } from "./../services/mapiClient";
import { IBlobStorage } from "@paperbits/common/persistence";
import { AzureBlobStorage } from "@paperbits/azure";
import { StaticSettingsProvider } from "../components/staticSettingsProvider";
import { ISettingsProvider } from "@paperbits/common/configuration";
import { Utils } from "../utils";


const defaultContainerName = "content";

export class MapiBlobStorage implements IBlobStorage {
    private storageClient: AzureBlobStorage;

    constructor(
        private readonly mapiClient: MapiClient,
        private readonly settingsProvider: ISettingsProvider
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

            const containerSegment = !!blobStorageContainer
                ? blobStorageContainer
                : defaultContainerName;

            const normalizedBlobStorageUrl = `${parsedUrl.protocol}//${parsedUrl.hostname}${Utils.ensureLeadingSlash(containerSegment)}${parsedUrl.search}`;

            storageSettingsProvider = new StaticSettingsProvider({
                blobStorageUrl: normalizedBlobStorageUrl
            });
        }
        else {
            const result = await this.mapiClient.post<any>(`/portalSettings/mediaContent/listSecrets`, [MapiClient.getPortalHeader("getStorageSasUrl")]);
            const blobStorageUrl = result.containerSasUrl;

            storageSettingsProvider = new StaticSettingsProvider({
                blobStorageUrl: blobStorageUrl
            });
        }

        this.storageClient = new AzureBlobStorage(storageSettingsProvider);

        return this.storageClient;
    }

    /**
     * Lists all blobs in storage.
     */
    public async listBlobs?(): Promise<string[]> {
        const client = await this.getStorageClient();
        return await client.listBlobs();
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
     * Removes specified blob from memory.
     * @param blobKey Unique blob identifier.
     */
    public async deleteBlob(blobKey: string): Promise<void> {
        const client = await this.getStorageClient();
        return await client.deleteBlob(blobKey);
    }
}