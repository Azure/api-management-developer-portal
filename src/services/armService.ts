import * as Constants from "../constants";
import { ISettingsProvider } from "@paperbits/common/configuration";
import { HttpClient } from "@paperbits/common/http";
import { KnownHttpHeaders } from "../models/knownHttpHeaders";
import { ServiceDescriptionContract } from "../contracts/service";
import { SettingNames } from "../constants";
import { Logger } from "@paperbits/common/logging/logger";
import { IAuthenticator } from "../authentication/IAuthenticator";


export class AzureResourceManagementService {
    private loadSettingsPromise: Promise<void>;

    constructor(
        private readonly httpClient: HttpClient,
        private readonly authenticator: IAuthenticator,
        private readonly logger: Logger
    ) { }

    /**
     * Returns API Management service description.
     */
    public async getServiceDescription(managementApiUrl: string): Promise<ServiceDescriptionContract> {
        const armAccessToken = await this.authenticator.getAccessTokenAsString();

        const serviceDescriptionResponse = await this.httpClient.send<ServiceDescriptionContract>({
            url: `${managementApiUrl}?api-version=${Constants.managementApiVersion}`,
            headers: [{
                name: KnownHttpHeaders.Authorization,
                value: armAccessToken
            }]
        });
        const service = serviceDescriptionResponse.toObject();
        this.logger.trackEvent("ArmService", { message: `Service: ${service.name} - SKU: ${service.sku.name}` });
        return service;
    }

    /**
     * Returns user-specific access token.
     * @param userName {string} User Identifier, e.g. johndoe.
     */
    public async getUserAccessToken(userName: string, managementApiUrl: string): Promise<string> {
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

    public async loadSessionSettings(settingsProvider: ISettingsProvider): Promise<void> {
        if (!this.loadSettingsPromise) {
            this.loadSettingsPromise = this.loadSettings(settingsProvider);
        }
        return this.loadSettingsPromise;
    }

    private async loadSettings(settingsProvider: ISettingsProvider): Promise<void> {
        const managementApiUrlDefined = await settingsProvider.getSetting(SettingNames.managementApiUrl);

        if (managementApiUrlDefined) {
            return;
        }

        const armEndpoint = await settingsProvider.getSetting(SettingNames.armEndpoint) || "management.azure.com";
        const armUri = await this.getTenantArmUriAsync(settingsProvider);

        if (!armUri || !armEndpoint) {
            throw new Error("Required service parameters (like subscription, resource group, service name) were not provided to start editor");
        }

        const managementApiUrl = `https://${armEndpoint}${armUri}`;
        await settingsProvider.setSetting(SettingNames.managementApiUrl, managementApiUrl);
        this.logger.trackEvent("ArmService", { message: `Management API URL: ${managementApiUrl}` });

        const serviceDescription = await this.getServiceDescription(managementApiUrl);
        const dataApiUrl = serviceDescription.properties.dataApiUrl;
        const developerPortalUrl = serviceDescription.properties.developerPortalUrl;
        const isMultitenant = serviceDescription.sku.name.includes("V2");

        await settingsProvider.setSetting(SettingNames.backendUrl, developerPortalUrl);
        await settingsProvider.setSetting(SettingNames.dataApiUrl, dataApiUrl);
        await settingsProvider.setSetting(SettingNames.isMultitenant, isMultitenant);
    }

    public async getTenantArmUriAsync(settingsProvider: ISettingsProvider): Promise<string> {
        const subscriptionId = await settingsProvider.getSetting(SettingNames.subscriptionId);
        const resourceGroupName = await settingsProvider.getSetting(SettingNames.resourceGroupName);
        const serviceName = await settingsProvider.getSetting(SettingNames.serviceName);

        if (!subscriptionId || !resourceGroupName || !serviceName) {
            throw new Error("Required service parameters (like subscription, resource group, service name, tenant Id) were not provided to start editor");
        }

        return `/subscriptions/${subscriptionId}/resourceGroups/${resourceGroupName}/providers/Microsoft.ApiManagement/service/${serviceName}`;
    }
}