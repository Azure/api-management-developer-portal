import { Product } from "../../mocks/collection/product";
import { ApisWidget } from "../maps/apis";
import { test, expect } from '../playwright-test';
import { Api } from "../../mocks/collection/api";
import { Templating } from "../../templating";
import { Operation } from "../../mocks/collection/operation";
import { OperationsWidget } from "../maps/operations";

test.describe("apis-page", async () => {
    test("published-apis-visible-to-guests @main", async function ({ page, configuration, cleanUp, mockedData, productService, apiService, testRunner }) {
        try {
            var product1: Product = Product.getRandomProduct("product1");
            var api: Api = Api.getRandomApi("api1");

            async function populateData(): Promise<any> {
                mockedData.data = Templating.updateTemplate(configuration['isLocalRun'], JSON.stringify(mockedData.data), api);

                await productService.putProduct("products/" + product1.productId, product1.getRequestContract());
                await productService.putProductGroup("products/" + product1.productId, "groups/guests");
                cleanUp.push(async () => productService.deleteProduct("products/" + product1.productId, true));

                await apiService.putApi("apis/" + api.apiId, api.getRequestContract());
                await apiService.putApiProduct("products/" + product1.productId, "apis/" + api.apiId);
                cleanUp.push(async () => apiService.deleteApi("apis/" + api.apiId));
            }

            async function validate() {
                await page.goto(configuration['urls']['apis'], { waitUntil: 'domcontentloaded' });

                const apiWidget = new ApisWidget(page);
                await apiWidget.waitRuntimeInit();
                await apiWidget.searchApiByName(api.apiName);
                await apiWidget.waitForTableToLoad();
                var apiHtml = await apiWidget.getApiByName(api.apiName);
                expect(apiHtml).not.toBeNull();
            }

            await testRunner.runTest(validate, populateData, mockedData.data);
        } catch (error) {
            console.error("Error in test 'published-apis-visible-to-guests @main':", error);
            throw error;
        }
    });

    test("User can see and search all the APIs in the APIs view  @main", async function ({ page, configuration, cleanUp, productService, apiService, testRunner }) {
        try {
            var product1: Product = Product.getRandomProduct("product1");
            var api: Api = Api.getRandomApi("api1");

            async function populateData(): Promise<any> {
                await productService.putProduct("products/" + product1.productId, product1.getRequestContract());
                await productService.putProductGroup("products/" + product1.productId, "groups/guests");
                cleanUp.push(async () => productService.deleteProduct("products/" + product1.productId, true));

                await apiService.putApi("apis/" + api.apiId, api.getRequestContract());
                await apiService.putApiProduct("products/" + product1.productId, "apis/" + api.apiId);
                cleanUp.push(async () => apiService.deleteApi("apis/" + api.apiId));
            }

            async function validate() {
                await page.goto(configuration['urls']['apis'], { waitUntil: 'domcontentloaded' });

                const apiWidget = new ApisWidget(page);
                await apiWidget.waitRuntimeInit();

                await apiWidget.searchApiByName(api.apiName);
                await apiWidget.waitForTableToLoad();
                var apiHtml = await apiWidget.getApiByName(api.apiName);
                expect(apiHtml).toEqual(api.apiName);

                await apiWidget.searchApiByName("random");
                await apiWidget.waitForTableToLoad();
                let noApisMessage = await apiWidget.getnoApisMessage();
                expect(noApisMessage).toEqual("No APIs found");
            }
            await testRunner.runTest(validate, populateData);
        } catch (error) {
            console.error("Error in test 'User can see and search all the APIs in the APIs view  @main':", error);
            throw error;
        }
    });

    test("Search should fetch the API operations for API's @main", async function ({ page, configuration, cleanUp, productService, apiService, testRunner }) {
        test.setTimeout(150000);
        try {
            var product1: Product = Product.getRandomProduct("product1");
            var api: Api = Api.getRandomApi("api1");
            const operation = Operation.getRandomOperation("get");

            async function populateData(): Promise<any> {
                await productService.putProduct("products/" + product1.productId, product1.getRequestContract());
                await productService.putProductGroup("products/" + product1.productId, "groups/guests");
                cleanUp.push(async () => productService.deleteProduct("products/" + product1.productId, true));

                await apiService.putApi("apis/" + api.apiId, api.getRequestContract());
                await apiService.putApiOperation("apis/" + api.apiId, "operations/" + operation.id, operation.getRequestContract());
                await apiService.putApiProduct("products/" + product1.productId, "apis/" + api.apiId);
                cleanUp.push(async () => apiService.deleteApi("apis/" + api.apiId));
            }

            async function validate() {
                await page.goto(configuration['urls']['apis'], { waitUntil: 'domcontentloaded' });

                const apiWidget = new ApisWidget(page);
                const operationsWidget = new OperationsWidget(page);

                await apiWidget.waitRuntimeInit();
                await apiWidget.searchApiByName(api.apiName);
                await apiWidget.clickOnApiNameLink(api.apiName);

                await operationsWidget.waitRuntimeInit();
                await operationsWidget.waitForOperationsLoaded();
                await operationsWidget.searchForOperations("random-name");

                await apiWidget.getNoOperationsMessage();
            }
            await testRunner.runTest(validate, populateData);
        } catch (error) {
            console.error("Error in test 'Search should fetch the API operations for API's @main':", error);
            throw error;
        }
    });
});