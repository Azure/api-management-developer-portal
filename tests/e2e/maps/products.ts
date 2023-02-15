import { Page } from "puppeteer";

export class ProductseWidget {
    constructor(private readonly page: Page) { }

    public async products(): Promise<void> {
        await this.page.waitForSelector("product-list-runtime.block");
        await this.page.waitForSelector("product-list-runtime div.table div.table-body div.table-row");
    }
}