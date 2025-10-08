import { EventManager } from "@paperbits/common/events";
import { HttpClient } from "@paperbits/common/http";
import { ISettingsProvider } from "@paperbits/common/configuration";

export class DefaultSettingsProvider implements ISettingsProvider {
    private configuration: Object;
    private loadingPromise: Promise<Object>;
    private configurationLoadTime: number;

    constructor(
        private readonly httpClient: HttpClient,
        private readonly eventManager: EventManager,
        private readonly configFileUri: string,
        private readonly configCacheDurationMs: number
    ) { }

    private async loadSettings(): Promise<Object> {
        this.configurationLoadTime = Date.now();
        if (!this.configuration) {
            this.configuration = {};
        }

        const response = await this.httpClient.send<any>({ url: this.configFileUri });
        const configurationData = response.toObject();
        if (configurationData){
            for (const key in configurationData) {
                this.configuration[key] = configurationData[key];
            }
        }

        return this.configuration;
    }

    private isConfigurationExpired(): boolean {
        if (!this.configurationLoadTime) {
            return true;
        }
        return (Date.now() - this.configurationLoadTime) > this.configCacheDurationMs;
    }

    public async getSetting<T>(name: string): Promise<T> {
        await this.getSettings();
        return this.configuration[name];
    }

    public onSettingChange<T>(name: string, eventHandler: (value: T) => void): void {
        this.eventManager.addEventListener("onSettingChange", (setting) => {
            if (setting.name === name) {
                eventHandler(setting.value);
            }
        });
    }

    public async setSetting<T>(name: string, value: T): Promise<void> {
        if (!this.configuration) {
            await this.getSettings();
        }
        this.configuration[name] = value;
        this.eventManager.dispatchEvent("onSettingChange", { name: name, value: value });
    }

    public getSettings(): Promise<any> {
        if (!this.loadingPromise || this.isConfigurationExpired()) {
            this.loadingPromise = this.loadSettings();
        }

        return this.loadingPromise;
    }
}