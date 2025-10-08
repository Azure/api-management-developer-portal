import { ISettingsProvider } from "@paperbits/common/configuration";
import { HttpClient } from "@paperbits/common/http";
import { Logger } from "@paperbits/common/logging";
import { IAuthenticator } from "../authentication";
import { AzureResourceManagementService } from "../services/armService";
import * as Constants from "../constants";
import ApiClient from "./apiClient";
import { IRetryStrategy } from "./retryStrategy/retryStrategy";
import { SettingNames } from "../constants";

export class MapiClient extends ApiClient {
    constructor(
        readonly armService: AzureResourceManagementService,
        readonly httpClient: HttpClient,
        readonly authenticator: IAuthenticator,
        readonly settingsProvider: ISettingsProvider,
        readonly retryStrategy: IRetryStrategy,
        readonly logger: Logger
    ) {
        super(httpClient, authenticator, settingsProvider, retryStrategy, logger);
    }

    protected override async setBaseUrl() {
        const settings = await this.settingsProvider.getSettings();
        
        const serviceName = settings[Constants.SettingNames.serviceName];
        const subscriptionId = settings[Constants.SettingNames.subscriptionId];
        const resourceGroupName = settings[Constants.SettingNames.resourceGroupName];

        if (!serviceName) {
            throw new Error("Service name setting is missing.");
        }

        if (!subscriptionId) {
            throw new Error("Subscription ID setting is missing.");
        }

        if (!resourceGroupName) {
            throw new Error("Resource Group name setting is missing.");
        }

        this.baseUrl = `https://management.azure.com/subscriptions/${subscriptionId}/resourceGroups/${resourceGroupName}/providers/Microsoft.ApiManagement/service/${serviceName}`;

    }

    public async getTenantArmUriAsync(): Promise<string> {
        let settings = await this.settingsProvider.getSettings();

        const armEndpoint = settings[SettingNames.armEndpoint];
        const subscriptionId = settings[SettingNames.subscriptionId];
        const resourceGroupName = settings[SettingNames.resourceGroupName];
        const serviceName = settings[SettingNames.serviceName];

        if (!subscriptionId || !resourceGroupName || !serviceName) {
            throw new Error("Required service parameters (like subscription, resource group, service name) were not provided to start editor");
        }

        return `https://${armEndpoint}/subscriptions/${subscriptionId}/resourceGroups/${resourceGroupName}/providers/Microsoft.ApiManagement/service/${serviceName}`;
    }

    protected setUserPrefix(query: string): string {
        return query;
    }

    protected override getApiVersion(): string {
        return Constants.managementApiVersion;
    }
}
