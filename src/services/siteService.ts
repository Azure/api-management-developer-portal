import { HttpHeader } from "@paperbits/common/http";
import { SmapiClient } from "../services/smapiClient";
import { ISettingsProvider, Settings } from "@paperbits/common/configuration";
import { SettingsContract, ISiteService } from "@paperbits/common/sites";

const settingsPath = "contentTypes/document/contentItems/configuration";

export class SiteService implements ISiteService {
    constructor(
        private readonly smapiClient: SmapiClient,
        private readonly settingsProvider: ISettingsProvider
    ) { }

    public async setSiteSettings(settings: SettingsContract): Promise<void> {
        const headers: HttpHeader[] = [];
        headers.push({ name: "If-Match", value: "*" });

        this.smapiClient.put(settingsPath, headers, { nodes: [settings] });
        await this.settingsProvider.setSetting(Settings.Config.Gtm, settings.integration.gtm);
        await this.settingsProvider.setSetting(Settings.Config.GMaps, settings.integration.googleMaps);
        await this.settingsProvider.setSetting(Settings.Config.Intercom, settings.integration.intercom);
    }

    public async getSiteSettings(): Promise<SettingsContract> {
        try {
            const configuration = await this.smapiClient.get<any>(settingsPath);
            const settings = configuration.nodes[0];

            return settings;
        }
        catch (error) {
            debugger;
        }
    }
}