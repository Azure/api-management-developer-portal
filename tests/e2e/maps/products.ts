import { Page } from "playwright";

export class ProductseWidget {
    constructor(private readonly page: Page) { }

    public async waitRuntimeInit(): Promise<void> {
        await this.page.locator("product-list-runtime").waitFor();
    }

    public async getProductByName(productName: string): Promise<string | null> {
        return await this.page.locator('product-list-runtime div.table div.table-body div.table-row a').filter({ hasText: productName }).first().innerText();
    }

    public async goToProductPage(baseUrl, productId: string): Promise<void>{
        await this.page.goto(`${baseUrl}/product#product=${productId}`, { waitUntil: 'domcontentloaded' });
    }

    public async subscribeToProduct(baseUrl, productId: string, subscriptionName: string): Promise<void> {
        await this.goToProductPage(baseUrl, productId);
        await this.page.waitForSelector("product-subscribe-runtime form button");
        await this.page.type("product-subscribe-runtime form input", subscriptionName);
        await this.page.click("product-subscribe-runtime form button");
    }
}