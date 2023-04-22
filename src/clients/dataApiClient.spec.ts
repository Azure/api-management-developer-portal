import { describe, it } from "mocha";
import { DataApiClient, MapiClient } from "../clients";
import { MockHttpClient } from "./../../tests/mocks";
import { StaticAuthenticator } from "./../components/staticAuthenticator";
import { StaticSettingsProvider } from "./../components/staticSettingsProvider";
import { assert } from "chai";
import { Utils } from "../utils";
import * as Constants from "./../constants";
import { AccessToken } from "../authentication";

interface Validity {
    isValid: boolean;
}

describe("Data API Client", async () => {

    const settingsProvider = new StaticSettingsProvider({
        backendUrl: "https://contoso.developer.azure-api.net",
        managementApiAccessToken: "SharedAccessSignature 1&220001010000&000000000000000000000000000=="
    });

    it("setBaseUrl - Appends /developer", async () => {
        //arrange
        const httpClient = new MockHttpClient();
        const authenticator = new StaticAuthenticator();
        const settings = await settingsProvider.getSettings();
        const path = "isValid"
        const mockUrl = `${Utils.getBaseUrlWithDeveloperSuffix(settings[Constants.SettingNames.backendUrl])}/${path}`
        httpClient.mock()
            .get(mockUrl)
            .reply(200, {
                isValid: true
            } as Validity);

        const apiClient = new DataApiClient(httpClient, authenticator, settingsProvider);

        //act
        const result = await apiClient.get<Validity>(path);

        //assert
        assert.isTrue(result.isValid);
    });

    it("Makes auth requests when logged in & if it is user resource", async () => {

        //arrange
        const httpClient = new MockHttpClient();
        const authenticator = new StaticAuthenticator();
        const settings = await settingsProvider.getSettings();
        authenticator.setAccessToken(AccessToken.parse(settings[Constants.SettingNames.managementApiAccessToken]));

        const mainPath = "/isValid"
        const path = `/users/${(await authenticator.getAccessToken()).userId}${mainPath}`

        const mockUrlWithUser = `${Utils.getBaseUrlWithDeveloperSuffix(settings[Constants.SettingNames.backendUrl])}${path}`
        const mockUrl = `${Utils.getBaseUrlWithDeveloperSuffix(settings[Constants.SettingNames.backendUrl])}${mainPath}`

        httpClient.mock()
            .get(mockUrlWithUser)
            .reply(200, {
                isValid: true
            } as Validity);
        httpClient.mock()
            .get(mockUrl)
            .reply(200, {
                isValid: false
            } as Validity);

        const apiClient = new DataApiClient(httpClient, authenticator, settingsProvider);

        //act
        const resultWithUser = await apiClient.get<Validity>(mainPath, [Utils.getIsUserResourceHeader()]);
        const result = await apiClient.get<Validity>(mainPath);

        //assert
        assert.isTrue(resultWithUser.isValid);
        assert.isFalse(result.isValid);
    });


    it("Makes guest requests when not logged in", async () => {

        //arrange
        const httpClient = new MockHttpClient();
        const authenticator = new StaticAuthenticator();
        const settingsProviderMock = new StaticSettingsProvider({
            backendUrl: "https://contoso.developer.azure-api.net"
        });
        const settings = await settingsProviderMock.getSettings();

        const mainPath = "/isValid"
        const mockUrl = `${Utils.getBaseUrlWithDeveloperSuffix(settings[Constants.SettingNames.backendUrl])}${mainPath}`

        httpClient.mock()
            .get(mockUrl)
            .reply(200, {
                isValid: true
            } as Validity);

        const apiClient = new DataApiClient(httpClient, authenticator, settingsProviderMock);

        //act
        const resultWithUserResourceHeader = await apiClient.get<Validity>(mainPath, [Utils.getIsUserResourceHeader()]);
        const result = await apiClient.get<Validity>(mainPath);

        //assert
        assert.isTrue(resultWithUserResourceHeader.isValid);
        assert.isTrue(result.isValid);
    });

    it("Makes guest requests when integration token used", async () => {

        //arrange
        const httpClient = new MockHttpClient();
        const authenticator = new StaticAuthenticator();
        const settingsProviderMock = new StaticSettingsProvider({
            backendUrl: "https://contoso.developer.azure-api.net",
            managementApiAccessToken: "SharedAccessSignature integration&220001010000&000000000000000000000000000=="
        });
        const settings = await settingsProviderMock.getSettings();

        const mainPath = "/isValid"
        const mockUrl = `${Utils.getBaseUrlWithDeveloperSuffix(settings[Constants.SettingNames.backendUrl])}${mainPath}`

        httpClient.mock()
            .get(mockUrl)
            .reply(200, {
                isValid: true
            } as Validity);

        const apiClient = new DataApiClient(httpClient, authenticator, settingsProviderMock);

        //act
        const resultWithUserResourceHeader = await apiClient.get<Validity>(mainPath, [Utils.getIsUserResourceHeader()]);
        const result = await apiClient.get<Validity>(mainPath);

        //assert
        assert.isTrue(resultWithUserResourceHeader.isValid);
        assert.isTrue(result.isValid);
    });

});