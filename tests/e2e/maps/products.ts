import { Page } from "playwright";

export class ProductseWidget {
    constructor(private readonly page: Page) { }

    public async waitRuntimeInit(): Promise<void> {
        await this.page.waitForSelector("product-list-runtime.block");
        await this.page.waitForSelector("product-list-runtime div.table div.table-body div.table-row");
    }

    public async getProductsCount(): Promise<number | undefined> {
        return await this.page.evaluate(() =>
            document.querySelector("product-list-runtime div.table div.table-body div.table-row")?.parentElement?.childElementCount
        );
    }

    public async getProductByName(productName: string): Promise<object | null> {
        const products = await this.page.$$('product-list-runtime div.table div.table-body div.table-row a');

        for (let i = 0; i < products.length; i++) {
            const productNameHtml = await (await products[i].getProperty('innerText')).jsonValue();
            if (productNameHtml == productName){
                return products[i];
            }
        }
        return null;
    }

    public async goToProductPage(baseUrl, productId: string): Promise<void>{
        await this.page.goto(`${baseUrl}/product#product=${productId}`);
    }

    public async subscribeToProduct(baseUrl, productId: string, subscriptionName: string): Promise<void> {
        await this.goToProductPage(baseUrl, productId);
        await this.page.waitForSelector("product-subscribe-runtime form button");
        await this.page.type("product-subscribe-runtime form input", subscriptionName);
        await this.page.click("product-subscribe-runtime form button");
        await this.page.waitForNavigation({ waitUntil: "domcontentloaded" });
    }
}