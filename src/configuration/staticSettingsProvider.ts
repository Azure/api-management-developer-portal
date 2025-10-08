import * as Objects from "@paperbits/common/objects";
import { ISettingsProvider } from "@paperbits/common/configuration";
import { EventManager } from "@paperbits/common/events";

export class StaticSettingsProvider implements ISettingsProvider {
    constructor(
        private readonly configuration: Object,
        private readonly eventManager?: EventManager
    ) { }

    public getSetting<T>(path: string): Promise<T> {
        return Objects.getObjectAt(path, this.configuration);
    }

    public async setSetting<T>(path: string, value: T): Promise<void> {
        Objects.setValue(path, this.configuration, value);
        this.configuration[path] = value;
        this.eventManager?.dispatchEvent("onSettingChange", { name: path, value: value });
    }

    public async getSettings<T>(): Promise<T> {
        return <T>this.configuration;
    }

    public onSettingChange<T>(name: string, eventHandler: (value: T) => void): void {
        this.eventManager?.addEventListener("onSettingChange", (setting) => {
            if (setting.name !== name) {
                return;
            }

            eventHandler(setting.value);
        });
    }
}