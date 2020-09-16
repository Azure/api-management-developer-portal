import { TenantService } from "./tenantService";
import { expect } from "chai";
import { describe, it } from "mocha";
import { ProductService } from "./productService";
import { MapiClient } from "./mapiClient";
import { MockHttpClient, starterProduct } from "../../tests/mocks";
import { StaticAuthenticator } from "../components/staticAuthenticator";
import { StaticSettingsProvider } from "../components/staticSettingsProvider";

const settingsProvider = new StaticSettingsProvider({
    managementApiUrl: "https://contoso.management.azure-api.net",
    managementApiAccessToken: "SharedAccessSignature 1&220001010000&000000000000000000000000000=="
});

const authenticator = new StaticAuthenticator();

describe("Product service", async () => {
    it("Returns list of products", async () => {
        const httpClient = new MockHttpClient();

        httpClient.mock()
            .get("/products")
            .reply(200, { value: [starterProduct] });

        const mapiClient = new MapiClient(httpClient, authenticator, settingsProvider);
        const tenantService = new TenantService(mapiClient);

        const productService = new ProductService(mapiClient, tenantService);
        const products = await productService.getProducts();

        expect(products.length).to.equals(1);
    });

    it("Returns specific product", async () => {
        const httpClient = new MockHttpClient();

        httpClient.mock()
            .get("/products/starter")
            .reply(200, starterProduct);

        const mapiClient = new MapiClient(httpClient, authenticator, settingsProvider);
        const tenantService = new TenantService(mapiClient);

        const productService = new ProductService(mapiClient, tenantService);
        const product = await productService.getProduct("/products/starter");

        expect(product.displayName).to.equal(product.displayName);
    });
});