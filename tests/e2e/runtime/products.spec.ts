import { Product } from "../../mocks/collection/product";
import { ProductseWidget } from "../maps/products";
import { test, expect } from '../playwright-test';
import { Templating } from "../../templating";

test.describe("products-page", async () => {
    test("published-products-visible-to-guests", async function ({page, configuration, cleanUp, mockedData, productService, testRunner})  { 
        var product1: Product = Product.getRandomProduct("product1");
        var product2: Product = Product.getRandomProduct("product2");

        mockedData.data = Templating.updateTemplate(JSON.stringify(mockedData.data), product1, product2);

        async function populateData(): Promise<any>{            
            await productService.putProduct("products/"+product1.productId, product1.getContract());
            await productService.putProductGroup("products/"+product1.productId, "groups/guests");
            await productService.putProduct("products/"+product2.productId, product2.getContract());
            await productService.putProductGroup("products/"+product2.productId, "groups/guests");
            cleanUp.push(async () => productService.deleteProduct("products/"+product1.productId, true));
            cleanUp.push(async () => productService.deleteProduct("products/"+product2.productId, true));
        }
        
        async function validate(){  
            await page.goto(configuration['urls']['products'], { waitUntil: 'domcontentloaded' });

            const productWidget = new ProductseWidget(page);
            await productWidget.waitRuntimeInit();
            var product1Html = await productWidget.getProductByName(product1.productName);
            var product2Html = await productWidget.getProductByName(product2.productName);
            expect(product1Html).not.toBe(null);
            expect(product2Html).not.toBe(null);
        }
        
        await testRunner.runTest(validate, populateData, mockedData.data);
    });
});