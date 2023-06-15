import * as Objects from "@paperbits/common/objects";
import { ISettingsProvider } from "@paperbits/common/configuration";

export class StaticSettingsProvider implements ISettingsProvider {
    constructor(private readonly configuration: Object) { }

    public getSetting<T>(path: string): Promise<T> {
        return Objects.getObjectAt(path, this.configuration);
    }

    public async setSetting<T>(path: string, value: T): Promise<void> {
        Objects.setValue(path, this.configuration, value);
        this.configuration[path] = value;
    }

    public async getSettings<T>(): Promise<T> {
        return <T>this.configuration;
    }
}