import * as Utils from "@paperbits/common/utils";
import { IBlobStorage } from "@paperbits/common/persistence";
import { IPublisher } from "@paperbits/common/publishing";
import { ISiteService } from "@paperbits/common/sites";
import { Logger } from "@paperbits/common/logging";
import { WellKnownEventTypes } from "../logging/wellKnownEventTypes";
import { isRedesignEnabledSetting } from "../constants";
import { RuntimeConfigBuilder } from "./runtimeConfigBuilder";

/**
 * Runtime configuration publisher outputs runtime settings to the target website.
 */
export class RuntimeConfigPublisher implements IPublisher {
    constructor(
        private readonly runtimeConfigBuilder: RuntimeConfigBuilder,
        private readonly outputBlobStorage: IBlobStorage,
        private readonly siteService: ISiteService,
        private readonly logger: Logger,
    ) { }

    public async publish(): Promise<void> {
        let isRedesignEnabled = false;
        
        try {
            isRedesignEnabled = !!(await this.siteService.getSetting(isRedesignEnabledSetting));
        } catch (error) {
            this.logger?.trackError(error, { message: `Failed to get setting: ${isRedesignEnabledSetting} - RuntimeConfigPublisher` });
        }

        this.logger.trackEvent(WellKnownEventTypes.Publishing, { message: `Preview components ${isRedesignEnabled ? 'enabled' : 'disabled'}.`});

        const configuration = this.runtimeConfigBuilder.build();
        const content = Utils.stringToUnit8Array(JSON.stringify(configuration));

        await this.outputBlobStorage.uploadBlob("/config-apim.json", content);
    }
}