import { Product } from "../../mocks/collection/product";
import { ApisWidget } from "../maps/apis";
import { test, expect } from '../playwright-test';
import { Api } from "../../mocks/collection/api";
import { Templating } from "../../templating";

test.describe("apis-page", async () => {
    test("published-apis-visible-to-guests", async function ({page, configuration, cleanUp, mockedData, productService, apiService, testRunner})  {
        var product1: Product = Product.getRandomProduct("product1");
        var api: Api = Api.getRandomApi("api1");

        mockedData.data = Templating.updateTemplate(JSON.stringify(mockedData.data), api);
        
        async function populateData(): Promise<any>{
            await productService.putProduct("products/"+product1.productId, product1.getContract());
            await productService.putProductGroup("products/"+product1.productId, "groups/guests");
            cleanUp.push(async () => productService.deleteProduct("products/"+product1.productId, true));

            await apiService.putApi("apis/"+api.apiId, api.getContract());
            await apiService.putApiProduct("products/"+product1.productId, "apis/"+api.apiId);
            cleanUp.push(async () => apiService.deleteApi("apis/"+api.apiId));
        }
        
        async function validate(){  
            await page.goto(configuration['urls']['apis']);
            
            const apiWidget = new ApisWidget(page);
            await apiWidget.waitRuntimeInit();
            
            var apiHtml = await apiWidget.getApiByName(api.apiName);
            expect(apiHtml).not.toBe(null);
        }
        
        await testRunner.runTest(validate, populateData, mockedData.data);
    });
});