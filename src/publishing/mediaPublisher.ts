import { HttpClient } from "@paperbits/common/http";
import { IPublisher } from "@paperbits/common/publishing";
import { IBlobStorage } from "@paperbits/common/persistence";
import { IMediaService } from "@paperbits/common/media";
import { MediaContract } from "@paperbits/common/media/mediaContract";


export class MediaPublisher implements IPublisher {
    constructor(
        private readonly mediaService: IMediaService,
        private readonly blobStorage: IBlobStorage,
        private readonly outputBlobStorage: IBlobStorage,
        private readonly httpClient: HttpClient
    ) {
        this.publish = this.publish.bind(this);
        this.renderMediaFile = this.renderMediaFile.bind(this);
        this.renderMedia = this.renderMedia.bind(this);
    }

    private async renderMediaFile(mediaFile: MediaContract): Promise<void> {
        try {
            if (mediaFile.blobKey) {
                const blob = await this.blobStorage.downloadBlob(mediaFile.blobKey);

                if (blob) {
                    await this.outputBlobStorage.uploadBlob(mediaFile.permalink, blob, mediaFile.mimeType);
                    return;
                }
            }

            if (mediaFile.downloadUrl) { // if blob doesn't exit check if direct download URL is specifed:
                const response = await this.httpClient.send({ url: mediaFile.downloadUrl });
                await this.outputBlobStorage.uploadBlob(mediaFile.permalink, response.toByteArray(), mediaFile.mimeType);
            }
        }
        catch (error) {
            console.warn(error);
        }
    }

    private async renderMedia(mediaFiles: MediaContract[]): Promise<void> {
        const mediaPromises = new Array<Promise<void>>();

        mediaFiles.forEach(mediaFile => {
            console.log(`Publishing media ${mediaFile.fileName}...`);
            mediaPromises.push(this.renderMediaFile(mediaFile));
        });

        await Promise.all(mediaPromises);
    }

    public async publish(): Promise<void> {
        const mediaFiles = await this.mediaService.search("");
        await this.renderMedia(mediaFiles);
    }
}
