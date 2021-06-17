import { Bag } from "@paperbits/common";

/**
 * Runtime config builder helps content publishers to compose runtime configuration.
 */
export class RuntimeConfigBuilder {
    private readonly configuration: Bag<Object> = {};

    /**
     * Adds setting to runtime configuration.
     * @param key {string} Setting key.
     * @param value {Object} Serializable object.
     */
    public addSetting(key: string, value: Object): void {
        this.configuration[key] = value;
    }

    public build(): Bag<Object> {
        return this.configuration;
    }
}