import { expect } from "chai";
import { describe, it } from "mocha";
import { ApiService } from "./apiService";
import { DataApiClient } from "../clients";
import { MockHttpClient, bookStoreApi } from "./../../tests/mocks";
import { StaticAuthenticator } from "./../components/staticAuthenticator";
import { StaticSettingsProvider } from "./../components/staticSettingsProvider";

const settingsProvider = new StaticSettingsProvider({
    backendUrl: "https://contoso.developer.azure-api.net",
});

const authenticator = new StaticAuthenticator();

describe("API service", async () => {
    const apisResource = `/developer/apis`
    const apiResource = `/developer/apis/book-store-api`

    it("Returns list of APIs", async () => {
        const httpClient = new MockHttpClient();

        httpClient.mock()
            .get(apisResource)
            .reply(200, {
                value: [bookStoreApi]
            });

        const apiClient = new DataApiClient(httpClient, authenticator, settingsProvider);
        const apiService = new ApiService(apiClient);
        const apis = await apiService.getApis();

        expect(apis.value.length).to.equals(1);
    });

    it("Returns specific API", async () => {
        const httpClient = new MockHttpClient();

        httpClient.mock()
            .get(apiResource)
            .reply(200, bookStoreApi);


        const apiClient = new DataApiClient(httpClient, authenticator, settingsProvider);
        const apiService = new ApiService(apiClient);
        const api = await apiService.getApi("apis/book-store-api");

        expect(api.displayName).to.equal(bookStoreApi.name);
    });
});