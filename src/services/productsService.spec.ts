import { expect } from "chai";
import { describe, it } from "mocha";
import { ProductService } from "./productService";
import { DataApiClient } from "../clients";
import { MockHttpClient, starterProduct } from "../../tests/mocks";
import { StaticAuthenticator } from "../components/staticAuthenticator";
import { StaticSettingsProvider } from "../components/staticSettingsProvider";
import { DelegationService } from "./delegationService";


const settingsProvider = new StaticSettingsProvider({
    backendUrl: "https://contoso.developer.azure-api.net",
});

const authenticator = new StaticAuthenticator();

describe("Product service", async () => {
    const productsResource = `/developer/products`
    const productResource = `/developer/products/starter`
    it("Returns list of products", async () => {
        const httpClient = new MockHttpClient();

        httpClient.mock()
            .get(productsResource)
            .reply(200, { value: [starterProduct] });

        const apiClient = new DataApiClient(httpClient, authenticator, settingsProvider);
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

        const apiClient = new DataApiClient(httpClient, authenticator, settingsProvider);
        const delegationService = new DelegationService(apiClient, settingsProvider);

        const productService = new ProductService(apiClient, delegationService);
        const product = await productService.getProduct("/products/starter");

        expect(product.displayName).to.equal(product.displayName);
    });
});