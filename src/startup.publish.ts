import * as fs from "fs";
import * as path from "path";
import { ISettingsProvider } from "@paperbits/common/configuration";
import { InversifyInjector } from "@paperbits/common/injection";
import { IPublisher } from "@paperbits/common/publishing";
import { CorePublishModule } from "@paperbits/core/core.publish.module";
import { FormsModule } from "@paperbits/forms/forms.module";
import { StylePublishModule } from "@paperbits/styles/styles.publish.module";
import { staticDataEnvironment, mockStaticDataEnvironment } from "./../environmentConstants";
import { ApimPublishModule } from "./apim.publish.module";
import { FileSystemBlobStorage } from "./components/filesystemBlobStorage";
import { StaticSettingsProvider } from "./configuration/staticSettingsProvider";
import { PublishingCacheModule } from "./persistence/publishingCacheModule";
import { SettingNames } from "./constants";


/* Reading settings from configuration file */
let settingsProvider: ISettingsProvider;

function getMapiUrl(configuration: object): string {
    const armEndpoint = configuration[SettingNames.armEndpoint];
    const subscriptionId = configuration[SettingNames.subscriptionId];
    const resourceGroupName = configuration[SettingNames.resourceGroupName];
    const serviceName = configuration[SettingNames.serviceName];

    if (!subscriptionId || !resourceGroupName || !serviceName) {
        throw new Error("Required service parameters (like subscription, resource group, service name) were not provided to start publisher");
    }

    return `https://${armEndpoint}/subscriptions/${subscriptionId}/resourceGroups/${resourceGroupName}/providers/Microsoft.ApiManagement/service/${serviceName}`;
}

if (process.env.NODE_ENV === staticDataEnvironment || process.env.NODE_ENV === mockStaticDataEnvironment) {
    settingsProvider = new StaticSettingsProvider({
        "environment": "publishing",
        "backendUrl": "https://contoso.developer.azure-api.net",
        "managementApiAccessToken": "SharedAccessSignature&1&",
        "useHipCaptcha": false,
        "managementApiUrl": "https://contoso.developer.azure-api.net/mapi"
    });
}
else {
    const configFile = path.resolve(__dirname, "./config.json");
    const configuration = JSON.parse(fs.readFileSync(configFile, "utf8").toString());
    configuration[SettingNames.managementApiUrl] = getMapiUrl(configuration);
    settingsProvider = new StaticSettingsProvider(configuration);
}

/* Storage where the website get published */
const outputBlobStorage = new FileSystemBlobStorage("./dist/website");

/* Initializing dependency injection container */
const injector = new InversifyInjector();
injector.bindModule(new CorePublishModule());
injector.bindModule(new StylePublishModule());
injector.bindModule(new FormsModule());
injector.bindModule(new ApimPublishModule());
injector.bindInstance("settingsProvider", settingsProvider);
injector.bindInstance("outputBlobStorage", outputBlobStorage);
injector.bindModule(new PublishingCacheModule());
injector.resolve("autostart");

/* Allowing self-signed certificates for HTTP requests */
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";

/* Building dependency injection container */
const publisher = injector.resolve<IPublisher>("sitePublisher");

/* Running actual publishing */
publisher.publish()
    .then(() => {
        console.log("DONE.");
        process.exit();
    })
    .catch((error) => {
        console.log(error);
        process.exit();
    });