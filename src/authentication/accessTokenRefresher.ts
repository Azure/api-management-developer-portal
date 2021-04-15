import * as Constants from "./../constants";
import { ISettingsProvider } from "@paperbits/common/configuration";
import { HttpClient } from "@paperbits/common/http";
import { Logger } from "@paperbits/common/logging";
import { KnownHttpHeaders } from "../models/knownHttpHeaders";
import { Utils } from "../utils";
import { AccessToken, IAuthenticator } from "./../authentication";


export class AccessTokenRefrsher {
    constructor(
        private readonly settingsProvider: ISettingsProvider,
        private readonly authenticator: IAuthenticator,
        private readonly httpClient: HttpClient,
        private readonly logger: Logger
    ) {
        this.refreshToken = this.refreshToken.bind(this);
        setInterval(() => this.refreshToken(), 60 * 1000);
    }

    private async refreshToken(): Promise<void> {
        const settings = await this.settingsProvider.getSettings();

        let managementApiUrl = settings[Constants.SettingNames.managementApiUrl];

        if (!managementApiUrl) {
            throw new Error(`Management API URL ("${Constants.SettingNames.managementApiUrl}") setting is missing in configuration file.`);
        }

        managementApiUrl = Utils.ensureUrlArmified(managementApiUrl);

        try {
            const accessToken = await this.authenticator.getAccessToken();

            if (!accessToken) {
                return;
            }

            const expiresInMs = accessToken.expiresInMs();
            const refreshBufferMs = 5 * 60 * 1000; // 5 min

            if (expiresInMs > refreshBufferMs) {
                return;
            }

            const response = await this.httpClient.send({
                method: "GET",
                url: `${managementApiUrl}${Utils.ensureLeadingSlash("/identity")}?api-version=${Constants.managementApiVersion}`,
                headers: [{ name: "Authorization", value: accessToken.toString() }]
            });

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
}