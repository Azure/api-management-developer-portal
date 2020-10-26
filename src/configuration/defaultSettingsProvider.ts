import { EventManager } from "@paperbits/common/events";
import { HttpClient } from "@paperbits/common/http";
import { ISettingsProvider } from "@paperbits/common/configuration";

export class DefaultSettingsProvider implements ISettingsProvider {
    private configuration: Object;
    private loadingPromise: Promise<Object>;

    constructor(
        private readonly httpClient: HttpClient,
        private readonly eventManager: EventManager,
        private readonly configFileUri: string
    ) {
    }

    private async loadSettings(): Promise<Object> {
        const response = await this.httpClient.send<any>({ url: this.configFileUri });
        this.configuration = response.toObject();

        return this.configuration;
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

    public setSetting<T>(name: string, value: T): void {
        this.configuration[name] = value;
        this.eventManager.dispatchEvent("onSettingChange", { name: name, value: value });
    }

    public getSettings(): Promise<any> {
        if (!this.loadingPromise) {
            this.loadingPromise = this.loadSettings();
        }

        return this.loadingPromise;
    }
}