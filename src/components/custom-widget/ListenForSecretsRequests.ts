import { APIM_ASK_FOR_SECRETS_MESSAGE_KEY, Secrets } from "@azure/api-management-custom-widgets-tools";
import { ISettingsProvider } from "@paperbits/common/configuration";
import { AccessToken, IAuthenticator } from "../../authentication";
import { managementApiVersion, SettingNames } from "../../constants";

class ListenForSecretsRequests {
    constructor(authenticator: IAuthenticator, settingsProvider: ISettingsProvider) {
        window.addEventListener("message", async ({data}) => {
            const value = data[APIM_ASK_FOR_SECRETS_MESSAGE_KEY];
            if (!value || !("instanceId" in value)) return

            const { instanceId, targetModule } = value;
            const widgetIFrame = (
                targetModule === "app"
                    ? window.frames[0].document.getElementById(instanceId)
                    : window.document.getElementById(instanceId)
            ) as HTMLIFrameElement;

            const token = await authenticator.getAccessTokenAsString()
            let { userId } = AccessToken.parse(token);
            if (userId === "integration") userId = "1"; // TODO ok?
            const managementApiUrl = await settingsProvider.getSetting(SettingNames.managementApiUrl) as string
            const secrets: Secrets = { token, userId, managementApiUrl, apiVersion: managementApiVersion };

            widgetIFrame.contentWindow.postMessage({[APIM_ASK_FOR_SECRETS_MESSAGE_KEY]: secrets}, "*");
        });
    }
}

export default ListenForSecretsRequests
