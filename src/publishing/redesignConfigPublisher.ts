import { IPublisher } from "@paperbits/common/publishing";
import { SiteService } from "@paperbits/common/sites";
import { Logger } from "@paperbits/common/logging";
import { isRedesignEnabledSetting } from "../constants";
import { RuntimeConfigBuilder } from "./runtimeConfigBuilder";

/**
 * Propagating Preview redesign switch value to runtime configuration.
 */
export class RedesignConfigPublisher implements IPublisher {
    constructor(
        private readonly runtimeConfigBuilder: RuntimeConfigBuilder,
        private readonly siteService: SiteService,
        private readonly logger: Logger
    ) { }

    public async publish(): Promise<void> {
        let isRedesignEnabled = false;
        
        try {
            isRedesignEnabled = !!(await this.siteService.getSetting(isRedesignEnabledSetting));
        } catch (error) {
            this.logger?.trackError(error, { message: `Failed to get setting: ${isRedesignEnabledSetting} - RedesignConfigPublisher` });
        }

        this.runtimeConfigBuilder.addSetting(isRedesignEnabledSetting, isRedesignEnabled);
    }
}