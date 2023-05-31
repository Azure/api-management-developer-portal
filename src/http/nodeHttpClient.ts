import { ISettingsProvider } from "@paperbits/common/configuration";
import { HttpClient, HttpRequest, HttpResponse, XmlHttpRequestClient } from "@paperbits/common/http";
import * as Constants from "../constants";

export class NodeHttpClient implements HttpClient {
    private readonly httpClient: XmlHttpRequestClient;

    constructor(
        private readonly settingsProvider: ISettingsProvider) {
        this.httpClient = new XmlHttpRequestClient();
    }

    public async send<T>(request: HttpRequest): Promise<HttpResponse<T>> {
        if (!request.headers) {
            request.headers = [];
        }

        const developerPortalType = await this.settingsProvider.getSetting<string>(Constants.SettingNames.developerPortalType) || Constants.DeveloperPortalType.selfHosted;
        request.headers.push({ name: "developer-portal-type", value: developerPortalType });

        return await this.httpClient.send(request);
    }

}