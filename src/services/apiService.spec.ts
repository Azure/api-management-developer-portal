import { expect } from "chai";
import { describe, it } from "mocha";
import { ApiService } from "./apiService";
import { DataApiClient } from "../clients";
import { MockHttpClient, bookStoreApi, mapiApiBookStoreSchema, dataApiBookStoreSchema, bookStoreApiProductsWithNextLink, bookStoreApiProducts } from "./../../tests/mocks";
import { StaticAuthenticator } from "../authentication/staticAuthenticator";
import { StaticSettingsProvider } from "./../configuration/staticSettingsProvider";
import { NoRetryStrategy } from "../clients/retryStrategy/noRetryStrategy";
import { ConsoleLogger } from "@paperbits/common/logging";
import { Schema } from "../models/schema";
import { SchemaContract } from "../contracts/schema";
import "fake-indexeddb/auto";
import { clear } from "idb-keyval";
import { AccessToken } from "../authentication";
import { MapiClient } from "../clients/mapiClient";
import { AzureResourceManagementService } from "./armService";


describe("API service", async () => {
    const runs = [
        { it: "Authenticated", options: { accessToken: "SharedAccessSignature 123&220001010000&000000000000000000000000000==", userId: "123" } },
        { it: "Anonymous", options: { accessToken: null, userId: null } }
    ];

    runs.forEach(function (run) {
        const settingsProvider = new StaticSettingsProvider({
            directDataApi: false,
            dataApiUrl: "https://contoso.data.azure-api.net",
            backendUrl: "https://contoso.developer.azure-api.net"
        });

        const authenticator = new StaticAuthenticator();

        beforeEach(async () => {
            authenticator.setAccessToken(run.options.accessToken ? AccessToken.parse(run.options.accessToken) : null);
            clear();
        });

        it(`${run.it} - Returns list of APIs`, async () => {
            const httpClient = new MockHttpClient();

            httpClient.mock()
                .get(buildResourceUri(run.options.userId, "apis"))
                .reply(200, {
                    value: [bookStoreApi]
                });

            const apiClient = new DataApiClient(httpClient, authenticator, settingsProvider, new NoRetryStrategy(), new ConsoleLogger());
            const apiService = new ApiService(apiClient);
            const apis = await apiService.getApis();

            expect(apis.value.length).to.equals(1);
        });

        it(`${run.it} - Returns specific API`, async () => {
            const httpClient = new MockHttpClient();

            httpClient.mock()
                .get(buildResourceUri(run.options.userId, "apis/book-store-api"))
                .reply(200, bookStoreApi);

            const apiClient = new DataApiClient(httpClient, authenticator, settingsProvider, new NoRetryStrategy(), new ConsoleLogger());
            const apiService = new ApiService(apiClient);
            const api = await apiService.getApi("apis/book-store-api");

            expect(api.displayName).to.equal(bookStoreApi.name);
        });

        it(`${run.it} - Returns all API products`, async () => {
            const httpClient = new MockHttpClient();

            const httpRequestMockBuilder = httpClient.mock();

            const responseNextLink = httpRequestMockBuilder.get(buildResourceUri(run.options.userId, "apis/book-store-api/products"))
                .reply(200, bookStoreApiProductsWithNextLink);
            const response = httpRequestMockBuilder.get("https://contoso.developer.azure-api.net/developer/users/123/apis/book-store-api/products/nextLink")
                .reply(200, bookStoreApiProducts);

            const apiClient = new DataApiClient(httpClient, authenticator, settingsProvider, new NoRetryStrategy(), new ConsoleLogger());
            const apiService = new ApiService(apiClient);
            const products = await apiService.getAllApiProducts("apis/book-store-api");

            expect(products.length).to.equal(4);
            expect(responseNextLink.callsCount).to.equal(1);
            expect(response.callsCount).to.equal(1);
        });

        it(`${run.it} - Returns ApiSchema`, async () => {
            const schemaResource = buildResourceUri(run.options.userId, "apis/book-store-api/schemas/test-schema");
            console.log(schemaResource);

            const httpClient = new MockHttpClient();

            httpClient.mock()
                .get(schemaResource)
                .reply(200, dataApiBookStoreSchema);

            const apiClient = new DataApiClient(httpClient, authenticator, settingsProvider, new NoRetryStrategy(), new ConsoleLogger());
            const apiService = new ApiService(apiClient);
            const apiSchema = await apiService.getApiSchema("apis/book-store-api/schemas/test-schema");

            expect(apiSchema.definitions).to.deep.equal(new Schema(dataApiBookStoreSchema).definitions);
        })

        it(`${run.it} - ManagementApi Returns ApiSchema`, async () => {
            const managementApiUrl = "https://contoso.management.azure-api.net";
            const settingsProvider = new StaticSettingsProvider({
                directDataApi: false,
                dataApiUrl: "https://contoso.data.azure-api.net",
                managementApiUrl
            });
            const schemaResource = `${managementApiUrl}/apis/book-store-api/schemas/test-schema`;
            const httpClient = new MockHttpClient();

            httpClient.mock()
                .get(schemaResource)
                .reply(200, mapiApiBookStoreSchema);

            const apiClient = new MapiClient(undefined, httpClient, authenticator, settingsProvider, new NoRetryStrategy(), new ConsoleLogger());
            const apiService = new ApiService(apiClient);
            const apiSchema = await apiService.getApiSchema("apis/book-store-api/schemas/test-schema");

            expect(apiSchema).to.deep.equal(new Schema(<SchemaContract><unknown>mapiApiBookStoreSchema.properties));
        })

        it(`${run.it} - ApiSchema - cache is used for second request`, async () => {
            const schemaResource = buildResourceUri(run.options.userId, "apis/book-store-api/schemas/test-schema");
            const httpClient = new MockHttpClient();

            const httpRequestMock = httpClient.mock()
                .get(schemaResource)
                .reply(200, dataApiBookStoreSchema);


            const apiClient = new DataApiClient(httpClient, authenticator, settingsProvider, new NoRetryStrategy(), new ConsoleLogger());

            // Calling first time, cache not used
            {
                const apiService = new ApiService(apiClient);
                const apiSchema = await apiService.getApiSchema("apis/book-store-api/schemas/test-schema");
                expect(apiSchema.definitions).to.deep.equal(new Schema(dataApiBookStoreSchema).definitions);
                expect(httpRequestMock.callsCount).to.equal(1);
            }

            // Calling second time, cache is used
            {
                const apiService = new ApiService(apiClient);
                const apiSchema = await apiService.getApiSchema("apis/book-store-api/schemas/test-schema");
                expect(apiSchema.definitions).to.deep.equal(new Schema(dataApiBookStoreSchema).definitions);
                expect(httpRequestMock.callsCount).to.equal(1);
            }
        })

        function buildResourceUri(userId: string | null, resource: string, mapi: boolean = false) {
            let result = mapi ? "/mapi" : "/developer";
            if (userId)
                result += `/users/${userId}`;
            result += `/${resource}`;
            return result;
        }
    });
});