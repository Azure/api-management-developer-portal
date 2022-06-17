import { ASK_FOR_SECRETS_MESSAGE_KEY, TSecrets } from "@azure/apimanagement-custom-widget-tools";

function listenForSecretsRequests(): void {
    window.addEventListener("message", ({data}) => {
        const value = data[ASK_FOR_SECRETS_MESSAGE_KEY];
        if (!value || !("instanceId" in value)) return

        const { instanceId, origin, targetModule } = value;
        const widgetIFrame = (
            targetModule === "app"
                ? window.frames[0].document.getElementById(instanceId)
                : window.document.getElementById(instanceId)
        ) as HTMLIFrameElement;

        const secrets: TSecrets = {token: "the secret token", userId: "42"} // TODO actual values
        widgetIFrame.contentWindow.postMessage({[ASK_FOR_SECRETS_MESSAGE_KEY]: secrets}, origin);
    });
}

export default listenForSecretsRequests
