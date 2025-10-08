import { IMediaService, MediaContract } from "@paperbits/common/media";
import { Query, Page } from "@paperbits/common/persistence";
import { AzureResourceManagementService } from "./armService";
import { HttpClient } from "@paperbits/common/http";
import { IAuthenticator } from "../authentication";
import { ISettingsProvider } from "@paperbits/common/configuration";
import { KnownHttpHeaders } from "../models/knownHttpHeaders";
import { ViewManager } from "@paperbits/common/ui";
import { Logger } from "@paperbits/common/logging";

export class ApimMediaService implements IMediaService {
    public constructor(
        private readonly viewManager: ViewManager,
        private readonly armService: AzureResourceManagementService,
        private readonly authenticator: IAuthenticator,
        private readonly httpClient: HttpClient,
        private readonly mediaService: IMediaService,
        private readonly settingsProvider: ISettingsProvider,
        private readonly logger: Logger
    ) { }

    public search(query: Query<MediaContract>): Promise<Page<MediaContract>> {
        return this.wrapWithLogger(() => this.mediaService.search(query), "search");
    }
    public getMediaByKey(key: string): Promise<MediaContract> {
        return this.wrapWithLogger(() => this.mediaService.getMediaByKey(key), "getMediaByKey");
    }
    public getMediaByPermalink(permalink: string): Promise<MediaContract> {
        return this.wrapWithLogger(() => this.mediaService.getMediaByPermalink(permalink), "getMediaByPermalink");
    }
    public deleteMedia(media: MediaContract): Promise<void> {
        return this.wrapWithLogger(() => this.mediaService.deleteMedia(media), "deleteMedia");
    }

    public updateMedia(media: MediaContract): Promise<void> {
        return this.wrapWithLogger(() => this.mediaService.updateMedia(media), "updateMedia");
    }

    public createMediaUrl(name: string, referenceUrl: string, mimeType?: string): Promise<MediaContract> {
        return this.wrapWithLogger(() => this.mediaService.createMediaUrl(name, referenceUrl, mimeType), "createMediaUrl");
    }

    public async createMedia(name: string, content: Uint8Array, contentType?: string): Promise<MediaContract> {
        const formData = new FormData();
        let blob = new Blob([content], { type: contentType ?? 'application/octet-stream' });
        formData.append('file', blob, name);

        const accessToken = await this.authenticator.getAccessToken();

        const result = await this.httpClient.send<MediaContract[]>({
            method: "POST",
            url: "/upload",
            headers: [
                { name: "X-Ms-Tenant-Arm-Id", value: await this.armService.getTenantArmUriAsync(this.settingsProvider) },
                { name: KnownHttpHeaders.Authorization, value: `${accessToken.toString()}` }
            ],
            body: formData
        });

        if (result.statusCode === 200) {
            return result.toObject()[0];
        }

        switch (result.statusCode) {
            case 400:
                const reason = JSON.parse(new TextDecoder().decode(result.body));
                this.viewManager.notifyError(`Could not upload file ${name}`, reason.message);
                return null;
            default:
                throw new Error("Unable to upload file.");
        }
    }

    public updateMediaContent(media: MediaContract, content: Uint8Array): Promise<MediaContract> {
        return this.mediaService.updateMediaContent(media, content);
    }

    private async wrapWithLogger<T>(action: () => Promise<T>, actionName: string): Promise<T> {
        try {
            return await action();
        } catch (error) {
            this.logger.trackError(error, { message: `MediaService: Failed to execute ${actionName}` });
            throw error;
        }
    }
}