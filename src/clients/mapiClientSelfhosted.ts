import { ISettingsProvider } from "@paperbits/common/configuration";
import { HttpClient } from "@paperbits/common/http";
import { IAuthenticator } from "../authentication";
import ApiClient from "./apiClient";
import * as Constants from "./../constants";
import { IRetryStrategy } from "./retryStrategy/retryStrategy";
import { Logger } from "@paperbits/common/logging";
import { Utils } from "../utils";

export class MapiClientSelfhosted extends ApiClient {
    constructor(
        readonly httpClient: HttpClient,
        readonly authenticator: IAuthenticator,
        readonly settingsProvider: ISettingsProvider,
        readonly retryStrategy: IRetryStrategy,
        readonly logger: Logger) {
        super(httpClient, authenticator, settingsProvider, retryStrategy, logger)
    }

    protected override async setBaseUrl() {
        let settings = await this.settingsProvider.getSettings();
        this.baseUrl = Utils.getBaseUrlWithMapiSuffix(settings[Constants.SettingNames.backendUrl]) || "";
    }

    protected setUserPrefix(query: string): string {
        return query;
    }

    protected override getApiVersion(): string {
        return Constants.managementApiVersion;
    }
}

