import { IPublisher } from "@paperbits/common/publishing";
import { SiteService } from "@paperbits/common/sites";
import { isRedesignEnabledSetting } from "../constants";
import { RuntimeConfigBuilder } from "./runtimeConfigBuilder";

/**
 * Propagating Preview redesign switch value to runtime configuration.
 */
export class RedesignConfigPublisher implements IPublisher {
    constructor(
        private readonly runtimeConfigBuilder: RuntimeConfigBuilder,
        private readonly siteService: SiteService,
    ) { }

    public async publish(): Promise<void> {
        const redesignEnabled = await this.siteService.getSetting(isRedesignEnabledSetting);
        this.runtimeConfigBuilder.addSetting(isRedesignEnabledSetting, redesignEnabled);
    }
}