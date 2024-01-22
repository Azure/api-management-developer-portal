import { APIM_ASK_FOR_SECRETS_MESSAGE_KEY, Secrets } from "@azure/api-management-custom-widgets-tools";
import { ISettingsProvider } from "@paperbits/common/configuration";
import { AccessToken, IAuthenticator } from "../../authentication";
import { managementApiVersion, SettingNames } from "../../constants";
import { Utils } from "../../utils";

export class ListenForSecretsRequests {
    constructor(
        private readonly authenticator: IAuthenticator,
        private readonly settingsProvider: ISettingsProvider,
    ) {
        window.addEventListener("message", async ({data}) => {
            const value = data[APIM_ASK_FOR_SECRETS_MESSAGE_KEY];
            if (!value || !("instanceId" in value)) return

            const { instanceId, targetModule } = value;
            const environment = await settingsProvider.getSetting<string>("environment");
            const widgetIFrame = (
                targetModule === "app" && environment === "development"
                    ? window.frames[0].document.getElementById(instanceId)
                    : window.document.getElementById(instanceId)
            ) as HTMLIFrameElement;

            const managementApiUrl = await settingsProvider.getSetting<string>(SettingNames.managementApiUrl);
            const secrets: Secrets = {
                parentLocation: JSON.parse(JSON.stringify(window.location)),
                managementApiUrl: Utils.ensureUrlArmified(managementApiUrl),
                apiVersion: managementApiVersion
            };

            const token = await authenticator.getAccessTokenAsString();
            if (token) {
                let { userId } = AccessToken.parse(token);
                if (userId === "integration") userId = "1"; // TODO ok?
                secrets.token = token
                secrets.userId = userId
            }

            const targetOrigin = "*"
            widgetIFrame.contentWindow.postMessage({[APIM_ASK_FOR_SECRETS_MESSAGE_KEY]: secrets}, targetOrigin); // value.origin
        });
    }
}
