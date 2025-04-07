import * as MediaUtils from "@paperbits/common/media/mediaUtils";
import parallel from "await-parallel-limit";
import { maxParallelPublisingTasks } from "@paperbits/common/constants";
import { HttpClient, HttpResponse } from "@paperbits/common/http";
import { IPublisher } from "@paperbits/common/publishing";
import { Query } from "@paperbits/common/persistence";
import { IMediaService, MediaContract, MediaVariantContract } from "@paperbits/common/media";
import { Logger } from "@paperbits/common/logging";
import { normalizePermalink } from "@paperbits/common/permalinks/utils";
import { RegExps } from "@paperbits/common";
import { IStreamBlobStorage } from "../persistence/IStreamBlobStorage";
import { ReadStream } from "node:fs";
import { WellKnownEventTypes } from "../logging/wellKnownEventTypes";
import { ISiteService, SiteSettingsContract } from "@paperbits/common/sites";

export class ApimMediaPublisher implements IPublisher {
    constructor(
        private readonly mediaService: IMediaService,
        private readonly siteService: ISiteService,
        private readonly blobStorage: IStreamBlobStorage,
        private readonly outputBlobStorage: IStreamBlobStorage,
        private readonly httpClient: HttpClient,
        private readonly logger: Logger
    ) { }

    private async publishFromUrl(permalink: string, mediaFile: MediaVariantContract): Promise<void> {
        let response: HttpResponse<any>;

        try {
            response = await this.httpClient.send({ url: mediaFile.downloadUrl });
        }
        catch (error) {
            this.logger.trackEvent(WellKnownEventTypes.Publishing, { message: `Could not download media from URL ${mediaFile.downloadUrl}. ${error.message}` });
            return null;
        }

        if (response?.statusCode !== 200) {
            this.logger.trackEvent(WellKnownEventTypes.Publishing, { message: `Could not download media from URL ${mediaFile.downloadUrl}. Status code: ${response?.statusCode}` });
            return null;
        }

        /// #if !SkuV2
        await this.publishMediaInStorage(response.toByteArray(), permalink, mediaFile);
        /// #else
        if (await this.isFaviconMedia(permalink)) {
            // We need to upload favicon to have an relative url
            await this.publishMediaInStorage(response.toByteArray(), permalink, mediaFile);
        } else {
            await this.publishMediaAsExternalReference(permalink, mediaFile);
        }
        /// #endif
    }

    private async isFaviconMedia(permalink: string): Promise<boolean> {
        try{
            const settings = await this.siteService.getSettings<any>();
            const siteSettings: SiteSettingsContract = settings.site;
            const faviconMedia = await this.mediaService.getMediaByKey(siteSettings.faviconSourceKey);
            return faviconMedia?.permalink === permalink;
        } catch (error) {
            this.logger.trackEvent(WellKnownEventTypes.Publishing, { message: `Unable to resolve favicon permalink` });
            return false;
        }
    }

    private async publishMediaAsExternalReference(permalink: string, mediaFile: MediaVariantContract) {
        this.logger.trackEvent(WellKnownEventTypes.Publishing, { message: `Skipped publishing of ${permalink}. This image will be used as an external reference.`});
    }

    private async publishMediaInStorage(content: Uint8Array, permalink: string, mediaFile: MediaVariantContract) {
        await this.uploadToStorage(permalink, content, mediaFile.mimeType);
        this.logger.trackEvent(WellKnownEventTypes.Publishing, { message: `Published ${permalink} to storage from link.`});
    }

    private async publishFromStorageStream(permalink: string, mediaFile: MediaVariantContract): Promise<void> {
        try {
            const contentStream = await this.blobStorage.getBlobAsStream(mediaFile.blobKey);

            if (!contentStream) {
                this.logger.trackEvent(WellKnownEventTypes.Publishing, { message: `Blob with key ${mediaFile.blobKey} not found in source storage.` });
                return null;
            }

            await this.outputBlobStorage.uploadStreamToBlob(permalink, <ReadStream>contentStream, mediaFile.mimeType);

            this.logger.trackEvent(WellKnownEventTypes.Publishing, { message: `Published ${permalink} to storage.`});
        }
        catch (error) {
            this.logger.trackEvent(WellKnownEventTypes.Publishing, { message: `Could not download media ${mediaFile.blobKey} from source storage. ${error.message}` });
            return null;
        }
    }

    private async uploadToStorage(permalink: string, content: Uint8Array, mimeType: string): Promise<void> {
        try {
            await this.outputBlobStorage.uploadBlob(permalink, content, mimeType);
        }
        catch (error) {
            throw new Error(`Unable to upload media file to destination storage. ${error.stack || error.message}`);
        }
    }

    private async renderMediaFile(permalink: string, mediaFile: MediaVariantContract): Promise<void> {
        if (mediaFile.blobKey) {
            await this.publishFromStorageStream(permalink, mediaFile);
            return;
        }

        if (mediaFile.downloadUrl) {
            await this.publishFromUrl(permalink, mediaFile);
            return;
        }
    }

    public async publish(): Promise<void> {
        const query: Query<MediaContract> = Query.from<MediaContract>();
        let pagesOfResults = await this.mediaService.search(query);

        do {
            const tasks = [];
            const mediaContracts = pagesOfResults.value;

            for (const mediaContract of mediaContracts) {
                if (!mediaContract.permalink) {
                    this.logger.trackEvent(WellKnownEventTypes.Publishing, { message: `Skipping media with no permalink specified: "${mediaContract.fileName}".` });
                    continue;
                }

                const permalink = normalizePermalink(mediaContract.permalink);

                const isPermalinkValid = RegExps.permalink.test(permalink);

                if (!isPermalinkValid) {
                    this.logger.trackEvent(WellKnownEventTypes.Publishing, { message: `Skipping media "${mediaContract.fileName}" with invalid permalink: "${permalink}".` });
                    continue;
                }

                this.logger.trackEvent(WellKnownEventTypes.Publishing, { message: `Publishing media ${mediaContract.fileName}...` });

                const original: MediaVariantContract = {
                    blobKey: mediaContract.blobKey,
                    downloadUrl: mediaContract.downloadUrl,
                    mimeType: mediaContract.mimeType
                };

                if (!mediaContract.blobKey && !mediaContract.downloadUrl) {
                    this.logger.trackEvent(WellKnownEventTypes.Publishing, { message: `Skipping media with no blob key or download URL specified: ${mediaContract.fileName}.` });
                    continue;
                }

                tasks.push(() => this.renderMediaFile(permalink, original));

                if (mediaContract.variants) {
                    for (const variant of mediaContract.variants) {
                        if (!mediaContract.blobKey && !mediaContract.downloadUrl) {
                            this.logger.trackEvent(WellKnownEventTypes.Publishing, { message: `Skipping media variant with no blob key or download URL specified: ${mediaContract.fileName}.` });
                            continue;
                        }

                        const variantPermalink = MediaUtils.getPermalinkForMediaVariant(permalink, variant);
                        tasks.push(() => this.renderMediaFile(variantPermalink, variant));
                    }
                }
            }

            await parallel(tasks, maxParallelPublisingTasks);

            if (pagesOfResults.takeNext) {
                pagesOfResults = await pagesOfResults.takeNext();
            }
            else {
                pagesOfResults = null;
            }
        }
        while (pagesOfResults);
    }
}