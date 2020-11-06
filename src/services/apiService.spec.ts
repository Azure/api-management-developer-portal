import { expect } from "chai";
import { describe, it } from "mocha";
import { ConsoleLogger } from "@paperbits/common/logging";
import { ApiService } from "./apiService";
import { MapiClient } from "./mapiClient";
import { MockHttpClient, bookStoreApi } from "./../../tests/mocks";
import { StaticAuthenticator } from "./../components/staticAuthenticator";
import { StaticSettingsProvider } from "./../components/staticSettingsProvider";

const settingsProvider = new StaticSettingsProvider({
    managementApiUrl: "https://contoso.management.azure-api.net",
    managementApiAccessToken: "SharedAccessSignature 1&220001010000&000000000000000000000000000=="
});

const authenticator = new StaticAuthenticator();

describe("API service", async () => {
    it("Returns list of APIs", async () => {
        const httpClient = new MockHttpClient();
        const logger = new ConsoleLogger();

        httpClient.mock()
            .get("/apis")
            .reply(200, {
                value: [bookStoreApi]
            });

        const mapiClient = new MapiClient(httpClient, authenticator, settingsProvider, logger);

        const apiService = new ApiService(mapiClient);
        const apis = await apiService.getApis();

        expect(apis.value.length).to.equals(1);
    });

    it("Returns specific API", async () => {
        const httpClient = new MockHttpClient();
        const logger = new ConsoleLogger();

        httpClient.mock()
            .get("/apis/book-store-api")
            .reply(200, bookStoreApi);

        const mapiClient = new MapiClient(httpClient, authenticator, settingsProvider, logger);

        const apiService = new ApiService(mapiClient);
        const api = await apiService.getApi("apis/book-store-api");

        expect(api.displayName).to.equal(bookStoreApi.properties.displayName);
    });
});