import { expect } from "chai";
import { describe, it } from "mocha";
import { ProductService } from "./productService";
import { DataApiClient, IApiClient } from "../clients";
import { MockHttpClient } from "../../tests/mocks";
import { StaticAuthenticator } from "../authentication/staticAuthenticator";
import { StaticSettingsProvider } from "../configuration/staticSettingsProvider";
import { DelegationService } from "./delegationService";
import { ConsoleLogger } from "@paperbits/common/logging";
import { NoRetryStrategy } from "../clients/retryStrategy/noRetryStrategy";
import { createStubInstance, SinonStubbedInstance } from "sinon";
import { Page } from "../models/page";
import { Subscription } from "../models/subscription";
import { SearchQuery } from "../contracts/searchQuery";
import { Product } from "../models/product";

const settingsProvider = new StaticSettingsProvider({
    directDataApi: false,
    dataApiUrl: "https://contoso.data.azure-api.net",
    backendUrl: "https://contoso.developer.azure-api.net",
    managementApiAccessToken: "SharedAccessSignature 1234&220001010000&000000000000000000000000000=="
});

const authenticator = new StaticAuthenticator();

const subscriptions = [
    {
        "id": "/subscriptions/starter",
        "name": "starter",
        "ownerId": "/users/1234",
        "scope": "/products/starter",
        "displayName": "Test1",
        "state": "active",
        "createdDate": "2019-09-19T18:43:15.077Z",
        "startDate": "2019-10-22T00:00:00Z",
        "expirationDate": null,
        "endDate": null,
        "notificationDate": null,
        "stateComment": null,
        "allowTracing": false
    },
    {
        "id": "/subscriptions/onUnlimited",
        "name": "onUnlimited",
        "ownerId": "/users/1234",
        "scope": "/products/unlimited",
        "displayName": null,
        "state": "active",
        "createdDate": "2019-09-19T18:43:15.287Z",
        "startDate": "2019-10-22T00:00:00Z",
        "expirationDate": null,
        "endDate": null,
        "notificationDate": null,
        "stateComment": null,
        "allowTracing": false
    }
]

const starterProduct: Product = {
    id: "/products/starter",
    name: "starter",
    displayName: "Starter",
    description: null,
    subscriptionRequired: true,
    approvalRequired: false,
    subscriptionsLimit: 1,
    terms: null,
    state: "published"
};

describe("Product service", async () => {
    const productsResource = `/developer/users/1234/products`
    const productResource = `/developer/users/1234/products/starter`

    const subscriptionsResource = `/developer/users/1234/subscriptions`
    const subscriptionResource = `/developer/users/1234/subscriptions/starter`
    it("Returns list of products", async () => {
        const httpClient = new MockHttpClient();

        httpClient.mock()
            .get(productsResource)
            .reply(200, { value: [starterProduct] });

        const apiClient = new DataApiClient(httpClient, authenticator, settingsProvider, new NoRetryStrategy(), new ConsoleLogger());
        const delegationService = new DelegationService(apiClient, settingsProvider);

        const productService = new ProductService(apiClient, delegationService);
        const products = await productService.getProducts(true);

        expect(products.length).to.equals(1);
    });

    it("Returns specific product", async () => {
        const httpClient = new MockHttpClient();

        httpClient.mock()
            .get(productResource)
            .reply(200, starterProduct);

        const apiClient = new DataApiClient(httpClient, authenticator, settingsProvider, new NoRetryStrategy(), new ConsoleLogger());
        const delegationService = new DelegationService(apiClient, settingsProvider);

        const productService = new ProductService(apiClient, delegationService);
        const product = await productService.getProduct("starter");

        expect(starterProduct.name).to.equal(product.displayName);
    });


    it("Returns list of subscriptions", async () => {
        const httpClient = new MockHttpClient();
        const httpClientMock = httpClient.mock();

        httpClientMock
            .get(subscriptionsResource)
            .reply(200, { value: subscriptions, count: subscriptions.length });

        subscriptions.forEach(subscription => {
            httpClientMock
                .post(`${subscriptionsResource}/${subscription.name}/listSecrets`)
                .reply(200, { primaryKey: "1234", secondaryKey: "5678" });
        });

        const apiClient = new DataApiClient(httpClient, authenticator, settingsProvider, new NoRetryStrategy(), new ConsoleLogger());
        const delegationService = new DelegationService(apiClient, settingsProvider);

        const productService = new ProductService(apiClient, delegationService);
        const page = await productService.getSubscriptions("/users/1234");

        expect(page.count).to.equals(2);
    });

    it("Calls with correct filter", async () => {
        const apiClient: SinonStubbedInstance<IApiClient> = createStubInstance(DataApiClient);
        apiClient.get.resolves(new Page<Subscription>());
        const delegationService = new DelegationService(apiClient, settingsProvider);
        const productService = new ProductService(apiClient, delegationService);

        var searchQuery: SearchQuery = { pattern: "test" }
        await productService.getSubscriptions("/users/1234", "/products/starter", searchQuery);

        const expectedUrl = "/users/1234/subscriptions?$top=50&$skip=0&$filter=(endswith(scope,'/products/starter')) and (contains(name,'test'))";
        expect(apiClient.get.getCall(0).calledWith(expectedUrl)).to.be.true;
    });

    it("Automaticaly add products prefix filter", async () => {
        const apiClient: SinonStubbedInstance<IApiClient> = createStubInstance(DataApiClient);
        apiClient.get.resolves(new Page<Subscription>());
        const delegationService = new DelegationService(apiClient, settingsProvider);
        const productService = new ProductService(apiClient, delegationService);

        var searchQuery: SearchQuery = { pattern: "test" }
        await productService.getSubscriptions("/users/1234", "starter", searchQuery);

        const expectedUrl = "/users/1234/subscriptions?$top=50&$skip=0&$filter=(endswith(scope,'/products/starter')) and (contains(name,'test'))";
        expect(apiClient.get.getCall(0).calledWith(expectedUrl)).to.be.true;
    });

    it("Returns specific subscription", async () => {
        const httpClient = new MockHttpClient();

        const expectedSubscription = subscriptions[0];
        httpClient.mock()
            .get(subscriptionResource)
            .reply(200, expectedSubscription);

        const apiClient = new DataApiClient(httpClient, authenticator, settingsProvider, new NoRetryStrategy(), new ConsoleLogger());
        const delegationService = new DelegationService(apiClient, settingsProvider);

        const productService = new ProductService(apiClient, delegationService);
        const subscription = await productService.getSubscription("starter");

        expect(expectedSubscription.name).to.equal(subscription.name);
    });

    it("Returns all user products subscriptions", async () => {
        const httpClient = new MockHttpClient();
        const httpClientMock = httpClient.mock();

        httpClientMock
            .get(subscriptionsResource)
            .reply(200, { value: subscriptions, count: subscriptions.length });

        const apiClient = new DataApiClient(httpClient, authenticator, settingsProvider, new NoRetryStrategy(), new ConsoleLogger());
        const delegationService = new DelegationService(apiClient, settingsProvider);

        const productService = new ProductService(apiClient, delegationService);
        const subscription = await productService.getProductsAllSubscriptions("book-store-api", [starterProduct], "/users/1234");

        expect(subscription.length).to.equals(1);
    });

    it("Subscriptions search with filter by name", async () => {
        const apiClient: SinonStubbedInstance<IApiClient> = createStubInstance(DataApiClient);
        apiClient.getAll.resolves(subscriptions);
        const delegationService = new DelegationService(apiClient, settingsProvider);
        const productService = new ProductService(apiClient, delegationService);

        var searchQuery: SearchQuery = { pattern: "test" }
        await productService.getProductsAllSubscriptions("book-store-api", [starterProduct], "/users/1234", searchQuery);

        const expectedUrl = "/users/1234/subscriptions?$top=100&$skip=0&$filter=(contains(name,'test'))";
        expect(apiClient.getAll.getCall(0).calledWith(expectedUrl)).to.be.true;
    });
});