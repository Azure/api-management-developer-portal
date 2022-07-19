import { ISettingsProvider } from "@paperbits/common/configuration";
import { HttpClient } from "@paperbits/common/http";
import { IAuthenticator } from "../authentication";
import ApiClient from "./apiClient";
import * as Constants from "./../constants";
import { Utils } from "../utils";

export default class MapiClient extends ApiClient {
    constructor(
        readonly httpClient: HttpClient,
        readonly authenticator: IAuthenticator,
        readonly settingsProvider: ISettingsProvider) {
        super(httpClient, authenticator, settingsProvider,);
    }

    protected override async setBaseUrl() {
        const settings = await this.settingsProvider.getSettings();
        this.backendUrl = Utils.getMapiEndpoint(settings[Constants.SettingNames.backendUrl] || "");
    }
}
