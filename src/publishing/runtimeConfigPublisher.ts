import * as Utils from "@paperbits/common/utils";
import { IBlobStorage } from "@paperbits/common/persistence";
import { IPublisher } from "@paperbits/common/publishing";
import { RuntimeConfigBuilder } from "./runtimeConfigBuilder";

/**
 * Runtime configuration publisher outputs runtime settings to the target website.
 */
export class RuntimeConfigPublisher implements IPublisher {
    constructor(
        private readonly runtimeConfigBuilder: RuntimeConfigBuilder,
        private readonly outputBlobStorage: IBlobStorage
    ) { }

    public async publish(): Promise<void> {
        const configuration = this.runtimeConfigBuilder.build();
        const content = Utils.stringToUnit8Array(JSON.stringify(configuration));

        await this.outputBlobStorage.uploadBlob("/config-apim.json", content);
    }
}