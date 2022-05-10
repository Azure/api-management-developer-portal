import * as Objects from "@paperbits/common/objects";
import { EventManager } from "@paperbits/common/events";
import { HttpClient } from "@paperbits/common/http";
import { ISettingsProvider } from "@paperbits/common/configuration";
import { SessionManager } from "@paperbits/common/persistence/sessionManager";

export class ApimSettingsProvider implements ISettingsProvider {
    private configuration: Object;
    private initializePromise: Promise<void>;

    constructor(
        private readonly httpClient: HttpClient,
        private readonly eventManager: EventManager,
        private readonly sessionManager: SessionManager
    ) { }

    private async ensureInitialized(): Promise<void> {
        if (!this.initializePromise) {
            this.initializePromise = this.loadSettings();
        }
        return this.initializePromise;
    }

    private async loadSettings(): Promise<void> {
        const commonConfigurationResponse = await this.httpClient.send<any>({ url: "/config.json" });
        const commonConfiguration = commonConfigurationResponse.toObject();

        const searializedDesignTimeSettings = await this.sessionManager?.getItem("designTimeSettings");

        if (searializedDesignTimeSettings) {
            const designTimeSettings = searializedDesignTimeSettings;
            Object.assign(commonConfiguration, designTimeSettings);
        }
        else {
            const apimsConfigurationResponse = await this.httpClient.send<any>({ url: "/config-apim.json" });

            if (apimsConfigurationResponse.statusCode === 200) {
                const apimConfiguration = apimsConfigurationResponse.toObject();
                Object.assign(commonConfiguration, apimConfiguration);
            }
        }

        this.configuration = commonConfiguration;
    }

    public async getSetting<T>(name: string): Promise<T> {
        await this.ensureInitialized();
        return Objects.getObjectAt(name, this.configuration);
    }

    public onSettingChange<T>(name: string, eventHandler: (value: T) => void): void {
        this.eventManager.addEventListener("onSettingChange", (setting) => {
            if (setting.name === name) {
                eventHandler(setting.value);
            }
        });
    }

    public async setSetting<T>(name: string, value: T): Promise<void> {
        await this.ensureInitialized();

        Objects.setValue(name, this.configuration, value);
        this.eventManager.dispatchEvent("onSettingChange", { name: name, value: value });
    }

    public async getSettings(): Promise<any> {
        await this.ensureInitialized();

        return this.configuration;
    }
}