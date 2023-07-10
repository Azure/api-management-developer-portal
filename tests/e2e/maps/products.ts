import { Page } from "puppeteer";

export class ProductseWidget {
    constructor(private readonly page: Page) { }

    public async products(): Promise<void> {
        await this.page.waitForSelector("product-list-runtime div.table div.table-body div.table-row");
    }

    public async getProductsCount(): Promise<number | undefined> {
        return await this.page.evaluate(() =>
            document.querySelector("product-list-runtime div.table div.table-body div.table-row")?.parentElement?.childElementCount
        );
    }
}