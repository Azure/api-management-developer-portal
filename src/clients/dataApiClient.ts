import { ISettingsProvider } from "@paperbits/common/configuration";
import { HttpClient } from "@paperbits/common/http";
import { IAuthenticator } from "../authentication";
import ApiClient from "./apiClient";
import * as Constants from "./../constants";
import { Utils } from "../utils";

export default class DataApiClient extends ApiClient {
    constructor(
        readonly httpClient: HttpClient,
        readonly authenticator: IAuthenticator,
        readonly settingsProvider: ISettingsProvider) {
        super(httpClient, authenticator, settingsProvider,);
    }

    protected override async setBaseUrl() {
        const settings = await this.settingsProvider.getSettings();
        this.backendUrl = Utils.getBaseUrlWithDeveloperSuffix(settings[Constants.SettingNames.backendUrl] || "");
    }

    protected override setUserPrefix(query: string, userId?: string) {
        return Utils.ensureUserPrefixed(query, userId);
    }
}
