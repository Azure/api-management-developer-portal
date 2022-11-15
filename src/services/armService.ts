import * as Constants from "../constants";
import { ISettingsProvider } from "@paperbits/common/configuration";
import { HttpClient } from "@paperbits/common/http";
import { IAuthenticator } from "../authentication/IAuthenticator";
import { KnownHttpHeaders } from "../models/knownHttpHeaders";
import { ServiceDescriptionContract } from "../contracts/service";
import { SettingNames } from "../constants";

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

    public async loadSessionSettings(): Promise<void> {
        const url = new URL(location.href.toLowerCase());
        const subscriptionId = this.getStoredSetting(url, SettingNames.subscriptionId);
        const resourceGroupName = this.getStoredSetting(url, SettingNames.resourceGroupName);
        const serviceName = this.getStoredSetting(url, SettingNames.serviceName);

        const settings = await this.settingsProvider.getSettings();
        const armEndpoint = this.getStoredSetting(url, SettingNames.armEndpoint) || settings[SettingNames.armEndpoint];

        if (!subscriptionId || !resourceGroupName || !serviceName || !armEndpoint) {
            throw new Error("Required service parameters (like subscription, resource group, service name) were not provided to start editor");
        }

        if (subscriptionId && resourceGroupName && serviceName) {
            const managementApiUrl = `https://${armEndpoint}/subscriptions/${subscriptionId}/resourceGroups/${resourceGroupName}/providers/Microsoft.ApiManagement/service/${serviceName}`;
            await this.settingsProvider.setSetting(SettingNames.managementApiUrl, managementApiUrl);
            await this.settingsProvider.setSetting(SettingNames.backendUrl, `https://${serviceName}.developer.azure-api.net`);
            if(url.searchParams.has(SettingNames.subscriptionId.toLowerCase())) {
                location.href = location.origin + location.pathname;
            }
        }
    }

    private getStoredSetting(url: URL, settingName: string): string {
        settingName = settingName.toLowerCase();
        let settingValue = url.searchParams.get(settingName);
        if (settingValue) {
            settingValue = decodeURIComponent(settingValue);
            sessionStorage.setItem(settingName, settingValue);
        } else {
            settingValue = sessionStorage.getItem(settingName);
        }
        return settingValue;
    }
}