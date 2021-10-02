import * as Utils from "@paperbits/common/utils";
import { IBlobStorage } from "@paperbits/common/persistence";
import { IPublisher } from "@paperbits/common/publishing";
import { RuntimeConfigBuilder } from "./runtimeConfigBuilder";
import { OAuthService } from "../services/oauthService";

/**
 * Runtime configuration publisher outputs runtime settings to the target website.
 */
export class RuntimeConfigPublisher implements IPublisher {
    constructor(
        private readonly runtimeConfigBuilder: RuntimeConfigBuilder,
        private readonly outputBlobStorage: IBlobStorage,        
        private readonly oauthService: OAuthService
    ) { }

    public async publish(): Promise<void> {
        const configuration = this.runtimeConfigBuilder.build();
        const content = Utils.stringToUnit8Array(JSON.stringify(configuration));

        await this.outputBlobStorage.uploadBlob("/config-apim.json", content);

        const servers = await this.oauthService.loadAllServers();        
        if(servers) {
            const serversContent = Utils.stringToUnit8Array(JSON.stringify(servers));
            await this.outputBlobStorage.uploadBlob("/auth-servers.json", serversContent);
        }
    }
}