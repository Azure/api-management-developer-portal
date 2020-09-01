import { MapiClient } from "./../services/mapiClient";
import { IBlobStorage } from "@paperbits/common/persistence";
import { AzureBlobStorage } from "@paperbits/azure";
import { StaticSettingsProvider } from "../components/staticSettingsProvider";

export class MapiBlobStorage implements IBlobStorage {
    private storageClient: AzureBlobStorage;

    constructor(private readonly mapiClient: MapiClient) { }

    private async getStorageClient(): Promise<AzureBlobStorage> {
        if (this.storageClient) {
            return this.storageClient;
        }

        const result = await this.mapiClient.post<any>(`/portalSettings/mediaContent/listSecrets`);
        const blobStorageUrl = result.containerSasUrl;

        const settingsProvider = new StaticSettingsProvider({
            blobStorageUrl: blobStorageUrl
        });

        this.storageClient = new AzureBlobStorage(settingsProvider);

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