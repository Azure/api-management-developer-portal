import { Page } from "puppeteer";

export class ApisWidget {
    constructor(private readonly page: Page) { }

    public async apis(): Promise<void> {
        await this.page.waitForSelector("api-list.block");
        await this.page.waitForSelector("api-list div.table div.table-body div.table-row");
    }
}