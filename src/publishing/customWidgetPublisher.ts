import { IPublisher } from "@paperbits/common/publishing";
import { Logger } from "@paperbits/common/logging";
import { IStreamBlobStorage } from "../persistence/IStreamBlobStorage";
import { ReadStream } from "node:fs";
import { MapiBlobStorage } from "../persistence/mapiBlobStorage";
import { BLOB_DATA_FOLDER, BLOB_ROOT } from "@azure/api-management-custom-widgets-tools";
import { WellKnownEventTypes } from "../logging/wellKnownEventTypes";

export class CustomWidgetPublisher implements IPublisher {
    constructor(
        private readonly blobStorage: MapiBlobStorage,
        private readonly outputBlobStorage: IStreamBlobStorage,
        private readonly logger: Logger
    ) { }

    private async publishFromStorageStream(blobItemFrom: string, blobItemTo: string): Promise<void> {
        try {
            const contentStream = await this.blobStorage.getBlobAsStream(blobItemFrom);

            if (!contentStream) {
                this.logger.trackEvent(WellKnownEventTypes.Publishing, { message: `Widget item with key ${blobItemFrom} not found in source storage.` });
                return null;
            }

            this.logger.trackEvent(WellKnownEventTypes.Publishing, { message: `Copy widget item from ${blobItemFrom} to ${blobItemTo}...` });
            await this.outputBlobStorage.uploadStreamToBlob(blobItemTo, <ReadStream>contentStream);
        } catch (error) {
            this.logger.trackEvent(WellKnownEventTypes.Publishing, { message: `Could not upload widget item from ${blobItemFrom} to ${blobItemTo}. ${error.message}` });
        }
    }

    public async publish(): Promise<void> {
        const blobPrefix = `${BLOB_ROOT}/${BLOB_DATA_FOLDER}/`;
        const widgetsData = await this.blobStorage.listBlobs(blobPrefix);
        this.logger.trackEvent("Publishing", { message: `From ${blobPrefix} loaded ${widgetsData.length} custom widget paths: ${JSON.stringify(widgetsData)}` });
        for (let i = 0; i < widgetsData.length; i++) {
            const widgetBlobItemPath = widgetsData[i];
            const widgetBlobItemPublishPath = widgetBlobItemPath.replace(`/${BLOB_DATA_FOLDER}/`, "/");
            await this.publishFromStorageStream(widgetBlobItemPath, `content/${widgetBlobItemPublishPath}`);
        }
    }
}