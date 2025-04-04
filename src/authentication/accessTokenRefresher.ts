import * as Constants from "./../constants";
import { ISettingsProvider } from "@paperbits/common/configuration";
import { HttpMethod } from "@paperbits/common/http";
import { Logger } from "@paperbits/common/logging";
import { KnownHttpHeaders } from "../models/knownHttpHeaders";
import { Utils } from "../utils";
import { AccessToken, IAuthenticator } from "./../authentication";
import { IApiClient } from "../clients";

export class AccessTokenRefresher {
    private readonly interval: NodeJS.Timeout;

    constructor(
        private readonly settingsProvider: ISettingsProvider,
        private readonly authenticator: IAuthenticator,
        private readonly apiClient: IApiClient,
        private readonly logger: Logger
    ) {
        this.refreshToken = this.refreshToken.bind(this);
        this.interval = setInterval(() => this.refreshToken(), 60 * 1000);
    }

    private async refreshToken(): Promise<void> {
        const settings = await this.settingsProvider.getSettings<object>();
        const dataApiUrl = Utils.getDataApiUrl(settings);

        if (!dataApiUrl) {
            throw new Error(`Management API URL ("${Constants.SettingNames.dataApiUrl}") setting is missing in configuration file.`);
        }

        try {
            const accessToken = this.authenticator.getStoredAccessToken(); // refresh only if we have stored access token

            if (!accessToken) {
                return;
            }

            const expiresInMs = accessToken.expiresInMs();
            const refreshBufferMs = 5 * 60 * 1000; // 5 min

            if (expiresInMs > refreshBufferMs) {
                return;
            }

            const response = await this.apiClient.send(
                "/identity",
                HttpMethod.get,
                [ { name: KnownHttpHeaders.Authorization, value: accessToken.toString() }, await this.apiClient.getPortalHeader("refreshToken") ]
            );

            const accessTokenHeader = response.headers.find(x => x.name.toLowerCase() === KnownHttpHeaders.OcpApimSasToken.toLowerCase());

            if (!accessTokenHeader) {
                return;
            }

            const newAccessToken = AccessToken.parse(accessTokenHeader.value);
            await this.authenticator.setAccessToken(newAccessToken);
        }
        catch (error) {
            this.logger.trackError(error, { message: "Unable to refresh access token." });
        }
    }

    public async dispose() {
        clearInterval(this.interval);
    }
}