import * as path from "path";
import * as fs from "fs";
import { AzureBlobStorage } from "@paperbits/azure";
import { InversifyInjector } from "@paperbits/common/injection";
import { IPublisher } from "@paperbits/common/publishing";
import { CoreModule } from "@paperbits/core/core.module";
import { CorePublishModule } from "@paperbits/core/core.publish.module";
import { ApimPublishModule } from "../../../../src/apim.publish.module";
import { StylePublishModule } from "@paperbits/styles/styles.publish.module";
import { ProseMirrorModule } from "@paperbits/prosemirror/prosemirror.module";
import { StaticSettingsProvider } from "../../../../src/components/staticSettingsProvider";


export async function publish(): Promise<void> {
    /* Reading settings from configuration file */
    const configFile = path.resolve(__dirname, "./config.json");
    const configuration = JSON.parse(fs.readFileSync(configFile, "utf8").toString());

    const settingsProvider = new StaticSettingsProvider({
        managementApiUrl: configuration.managementApiUrl,
        managementApiVersion: configuration.managementApiVersion,
        managementApiAccessToken: configuration.managementApiAccessToken,
        blobStorageContainer: configuration.outputBlobStorageContainer,
        blobStorageConnectionString: configuration.outputBlobStorageConnectionString,
        environment: "publishing"
    });

    const outputSettingsProvider = new StaticSettingsProvider({
        blobStorageContainer: configuration.outputBlobStorageContainer,
        blobStorageConnectionString: configuration.outputBlobStorageConnectionString
    });

    /* Storage where the website get published */
    const outputBlobStorage = new AzureBlobStorage(outputSettingsProvider);

    const injector = new InversifyInjector();
    injector.bindModule(new CoreModule());
    injector.bindModule(new CorePublishModule());
    injector.bindModule(new StylePublishModule());
    injector.bindModule(new ProseMirrorModule());
    injector.bindModule(new ApimPublishModule());
    injector.bindInstance("settingsProvider", settingsProvider);
    injector.bindInstance("outputBlobStorage", outputBlobStorage);
    injector.resolve("autostart");

    const publisher = injector.resolve<IPublisher>("sitePublisher");
    await publisher.publish();
}

export async function run(context, req): Promise<void> {
    try {
        context.log("Publishing website...");
        await publish();
        context.log("Done.");

        context.res = {
            status: 200,
            body: "Done."
        };
    }
    catch (error) {
        context.log.error(error);

        context.res = {
            status: 500,
            body: JSON.stringify(error)
        };
    }
    finally {
        context.done();
    }
}