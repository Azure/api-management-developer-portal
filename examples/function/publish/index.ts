import * as path from "path";
import * as fs from "fs";
import { AzureBlobStorage } from "../../../src/components/azureBlobStorage";
import { InversifyInjector } from "@paperbits/common/injection";
import { IPublisher } from "@paperbits/common/publishing";
import { FormsModule } from "@paperbits/forms/forms.module";
import { CoreModule } from "@paperbits/core/core.module";
import { ApimPublishModule } from "../../../src/apim.publish.module";
import { StyleModule } from "@paperbits/styles/styles.module";
import { ProseMirrorModule } from "@paperbits/prosemirror/prosemirror.module";
import { StaticSettingsProvider } from "../../../src/components/staticSettingsProvider";
import { PublishingNodeModule } from "../../../src/publishing";


export async function publish() {
    /* Reading settings from configuration file */
    const configFile = path.resolve(__dirname, "./config.json");
    const configuration = JSON.parse(fs.readFileSync(configFile, "utf8").toString());
    const settingsProvider = new StaticSettingsProvider(configuration);

    /* Storage that contains uploaded media files */
    const blobStorage = new AzureBlobStorage(configuration["blobStorageConnectionString"], configuration["blobStorageContainer"]);

    /* Storage where the website get published */
    const outputBlobStorage = new AzureBlobStorage(configuration["outputBlobStorageConnectionString"], configuration["outputBlobStorageContainer"]);

    const injector = new InversifyInjector();
    injector.bindModule(new CoreModule());
    injector.bindModule(new FormsModule());
    injector.bindModule(new StyleModule());
    injector.bindModule(new ProseMirrorModule());
    injector.bindModule(new ApimPublishModule());
    injector.bindInstance("settingsProvider", settingsProvider);
    injector.bindInstance("blobStorage", blobStorage);
    injector.bindInstance("outputBlobStorage", outputBlobStorage);
    injector.bindModule(new PublishingNodeModule());
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