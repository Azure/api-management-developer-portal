import { describe, it } from "mocha";
import { MapiClient } from "../clients";
import { MockHttpClient } from "./../../tests/mocks";
import { StaticAuthenticator } from "./../components/staticAuthenticator";
import { StaticSettingsProvider } from "./../components/staticSettingsProvider";
import { assert } from "chai";
import { Utils } from "../utils";
import * as Constants from "./../constants";

interface Validity {
    isValid: boolean;
}

//TODO: https://msazure.visualstudio.com/One/_workitems/edit/15015393
describe("Mapi Client", async () => {

    const settingsProvider = new StaticSettingsProvider({
        backendUrl: "https://contoso.developer.azure-api.net",
        managementApiAccessToken: "SharedAccessSignature 1&220001010000&000000000000000000000000000=="
    });
    const authenticator = new StaticAuthenticator();

    it("setBaseUrl - Appends /mapi", async () => {

        //arrange
        const httpClient = new MockHttpClient();
        const settings = await settingsProvider.getSettings();
        const path = "isValid"
        const mockUrl = `${Utils.getBaseUrlWithMapiSuffix(settings[Constants.SettingNames.backendUrl])}/${path}`
        httpClient.mock()
            .get(mockUrl)
            .reply(200, {
                isValid: true
            } as Validity);

        const apiClient = new MapiClient(httpClient, authenticator, settingsProvider);

        //act
        var result = await apiClient.get<Validity>(path);

        //assert
        assert.isTrue(result.isValid);
    });

});