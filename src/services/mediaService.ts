import * as Utils from "@paperbits/common/utils";
import { MediaContract, IMediaService } from "@paperbits/common/media";
import { ProgressPromise } from "@paperbits/common";
import { IBlobStorage } from "@paperbits/common/persistence";
import { Contract } from "@paperbits/common/contract";
import { SmapiClient } from "../services/smapiClient";
import { Page } from "../models/page";
import { HttpHeader } from "@paperbits/common/http";


const uploadsPath = "/contentTypes/blob/contentItems";

export class MediaService implements IMediaService {
    constructor(
        private readonly smapiClient: SmapiClient,
        private readonly blobStorage: IBlobStorage
    ) { }

    public async getMediaByUrl(permalink: string): Promise<MediaContract> {
        const pageOfMedia = await this.smapiClient.get<Page<MediaContract>>(`${uploadsPath}?$filter=permalink eq '${permalink}'`);

        if (pageOfMedia.count > 0) {
            return pageOfMedia.value[0];
        }
        else {
            return null;
        }
    }

    public async searchByProperties(propertyNames: string[], propertyValue: string, startSearch: boolean): Promise<MediaContract[]> {
        const pageOfMedia = await this.smapiClient.get<Page<MediaContract>>(uploadsPath);
        return pageOfMedia.value;
    }

    public async getMediaByKey(key: string): Promise<MediaContract> {
        if (!key) {
            throw new Error(`Parameter "key" not specified.`);
        }

        try {
            const media = await this.smapiClient.get<MediaContract>(key);

            if (media.blobKey) {
                let uri: string;

                try {
                    uri = await this.blobStorage.getDownloadUrl(media.blobKey);

                    if (uri) {
                        media.downloadUrl = uri;
                    }
                }
                catch (error) {
                    return null;
                }
            }

            return media;
        }
        catch (error) {
            return null;
        }
    }

    public async search(pattern: string = ""): Promise<MediaContract[]> {
        const pageOfMedia = await this.smapiClient.get<Page<MediaContract>>(`${uploadsPath}?$orderby=title&$filter=contains(filename,'${pattern}')`);
        return pageOfMedia.value;
    }

    public async deleteMedia(mediaContract: MediaContract): Promise<void> {
        const headers: HttpHeader[] = [];
        headers.push({ name: "If-Match", value: "*" });

        await this.blobStorage.deleteBlob(mediaContract.blobKey);
        await this.smapiClient.delete(mediaContract.key, headers);
    }

    public createMedia(name: string, content: Uint8Array, mimeType?: string): ProgressPromise<MediaContract> {
        return new ProgressPromise<MediaContract>(async (resolve, reject, progress) => {
            const blobKey = Utils.guid();

            await this.blobStorage
                .uploadBlob(blobKey, content, mimeType)
                .progress(progress);

            const uri = await this.blobStorage.getDownloadUrl(blobKey);
            const mediaKey = `${uploadsPath}/${blobKey}`;

            const media: MediaContract = {
                key: mediaKey,
                filename: name,
                blobKey: blobKey,
                description: "",
                keywords: "",
                permalink: `/content/${name}`,
                downloadUrl: uri,
                mimeType: mimeType
            };

            await this.smapiClient.put<MediaContract>(mediaKey, [], media);

            resolve(media);
        });
    }

    public async updateMedia(media: MediaContract): Promise<void> {
        const headers: HttpHeader[] = [];
        headers.push({ name: "If-Match", value: "*" });

        await this.smapiClient.put<Contract>(media.key, headers, media);
    }

    public async updateMediaContent(media: MediaContract, content: Uint8Array): ProgressPromise<MediaContract> {
        if (!media) {
            throw new Error(`Parameter "media" not specified.`);
        }
        if (!content) {
            throw new Error(`Parameter "content" not specified.`);
        }

        return new ProgressPromise<MediaContract>(async (resolve, reject, progress) => {
            try {
                await this.blobStorage
                    .uploadBlob(media.blobKey, content, media.mimeType)
                    .progress(progress);

                resolve(media);
            }
            catch (error) {
                reject(`Unable to update media content.`);
            }
        });
    }
}