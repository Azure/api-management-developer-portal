import { ISettingsProvider } from "@paperbits/common/configuration";
import { HttpClient } from "@paperbits/common/http";
import { IAuthenticator } from "../authentication";
import ApiClient from "./apiClient";
import { Utils } from "../utils";
import * as Constants from "./../constants";
import { IRetryStrategy } from "./retryStrategy/retryStrategy";
import { Logger } from "@paperbits/common/logging";

export class DataApiClient extends ApiClient {
    constructor(
        readonly httpClient: HttpClient,
        readonly authenticator: IAuthenticator,
        readonly settingsProvider: ISettingsProvider,
        readonly retryStrategy: IRetryStrategy,
        readonly logger: Logger
    ) {
        super(httpClient, authenticator, settingsProvider, retryStrategy, logger)
    }

    protected override async setBaseUrl() {
        const settings = await this.settingsProvider.getSettings<object>();
        this.baseUrl = Utils.getDataApiUrl(settings) || "";
    }

    protected override setUserPrefix(query: string, userId?: string) {
        return Utils.ensureUserPrefixed(query, userId);
    }

    protected override getApiVersion(): string {
        return Constants.dataApiVersion;
    }
}
