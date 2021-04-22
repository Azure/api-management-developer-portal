import * as Constants from "../constants";
import { ISettingsProvider } from "@paperbits/common/configuration";
import { HttpClient } from "@paperbits/common/http";
import { IAuthenticator } from "../authentication/IAuthenticator";
import { KnownHttpHeaders } from "../models/knownHttpHeaders";
import { ServiceDescriptionContract } from "../contracts/service";

export class AzureResourceManagementService {
    constructor(
        private readonly httpClient: HttpClient,
        private readonly settingsProvider: ISettingsProvider,
        private readonly authenticator: IAuthenticator
    ) { }

    /**
     * Returns API Management service description.
     */
    public async getServiceDescription(): Promise<ServiceDescriptionContract> {
        const managementApiUrl = await this.settingsProvider.getSetting<string>(Constants.SettingNames.managementApiUrl);
        const armAccessToken = await this.authenticator.getAccessTokenAsString();
 
        const serviceDescriptionResponse = await this.httpClient.send<ServiceDescriptionContract>({
            url: `${managementApiUrl}?api-version=${Constants.managementApiVersion}`,
            headers: [{
                name: KnownHttpHeaders.Authorization,
                value: armAccessToken
            }]
        });

        return serviceDescriptionResponse.toObject();
    }

    /**
     * Returns user-sepcific access token.
     * @param userName {string} User Identitfier, e.g. johndoe.
     */
    public async getUserAccessToken(userName: string): Promise<string> {
        const managementApiUrl = await this.settingsProvider.getSetting<string>(Constants.SettingNames.managementApiUrl);
        const armAccessToken = await this.authenticator.getAccessTokenAsString();
        const exp = new Date(new Date().valueOf() + 60 * 60 * 1000);

        const userTokenResponse = await this.httpClient.send<ServiceDescriptionContract>({
            url: `${managementApiUrl}/users/${userName}/token?api-version=${Constants.managementApiVersion}`,
            method: "POST",
            headers: [{
                name: KnownHttpHeaders.Authorization,
                value: armAccessToken
            },
            {
                name: KnownHttpHeaders.ContentType,
                value: "application/json"
            }],
            body: JSON.stringify({
                keyType: "primary",
                expiry: exp.toISOString()
            })
        });

        const userToken = userTokenResponse.toObject();
        const userTokenValue = userToken["value"];

        return userTokenValue;
    }
}