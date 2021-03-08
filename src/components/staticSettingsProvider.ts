import { ISettingsProvider } from "@paperbits/common/configuration";

export class StaticSettingsProvider implements ISettingsProvider {
    constructor(private readonly configuration: Object) { }

    public getSetting<T>(name: string): Promise<T> {
        return this.configuration[name];
    }

    public async setSetting<T>(name: string, value: T): Promise<void> {
        this.configuration[name] = value;
    }

    public async getSettings<T>(): Promise<T> {
        return <T>this.configuration;
    }
}