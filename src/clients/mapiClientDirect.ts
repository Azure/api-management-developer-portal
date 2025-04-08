import { ISettingsProvider } from "@paperbits/common/configuration";
import { HttpClient } from "@paperbits/common/http";
import { IAuthenticator } from "../authentication";
import ApiClient from "./apiClient";
import * as Constants from "./../constants";
import { IRetryStrategy } from "./retryStrategy/retryStrategy";
import { Logger } from "@paperbits/common/logging";

// For dedicated: publisher MAPI client to avoid proxy through the backend.
// For multitenant: publisher MAPI client to direct calls for smapi.
export default class MapiClientDirect extends ApiClient {
    constructor(
        readonly httpClient: HttpClient,
        readonly authenticator: IAuthenticator,
        readonly settingsProvider: ISettingsProvider,
        readonly retryStrategy: IRetryStrategy,
        readonly logger: Logger) {
        super(httpClient, authenticator, settingsProvider, retryStrategy, logger);
    }

    protected override async setBaseUrl() {
        const settings = await this.settingsProvider.getSettings();
        this.baseUrl = settings[Constants.SettingNames.managementApiUrl];
    }

    protected override getApiVersion(): string {
        return Constants.managementApiVersion;
    }

    protected setUserPrefix(query: string): string {
        return query;
    }
}
