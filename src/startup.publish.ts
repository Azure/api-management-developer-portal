import { InversifyInjector } from "@paperbits/common/injection";
import { IPublisher } from "@paperbits/common/publishing";
import { CoreModule } from "@paperbits/core/core.module";
import { CorePublishModule } from "@paperbits/core/core.publish.module";
import { StylePublishModule } from "@paperbits/styles/styles.publish.module";
import { ProseMirrorModule } from "@paperbits/prosemirror/prosemirror.module";
import { StaticSettingsProvider } from "./configuration/staticSettingsProvider";
import { FileSystemBlobStorage } from "./components/filesystemBlobStorage";
import { ApimPublishModule } from "./apim.publish.module";
import { useArmConfiguration } from "./configuration/settingsHelper";


const configuration = useArmConfiguration();

if (!configuration) {
    process.exit();
}

const settingsProvider = new StaticSettingsProvider(configuration);

/* Storage where the website get published */
const outputBlobStorage = new FileSystemBlobStorage("./dist/website");

/* Initializing dependency injection container */
const injector = new InversifyInjector();
injector.bindModule(new CoreModule());
injector.bindModule(new CorePublishModule());
injector.bindModule(new StylePublishModule());
injector.bindModule(new ProseMirrorModule());
injector.bindModule(new ApimPublishModule());
injector.bindInstance("settingsProvider", settingsProvider);
injector.bindInstance("outputBlobStorage", outputBlobStorage);
injector.resolve("autostart");


/* Bulding dependency injection container */
const publisher = injector.resolve<IPublisher>("sitePublisher");


// /* Running actual publishing */
publisher.publish()
    .then(() => {
        console.log("DONE.");
        process.exit();
    })
    .catch((error) => {
        console.log(error);
        process.exit();
    });