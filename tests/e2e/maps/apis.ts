import { Page } from "playwright";

export class ApisWidget {
    constructor(private readonly page: Page) { }

    public async waitRuntimeInit(): Promise<void> {
        await this.page.locator("api-list").waitFor();
        
    }

    public async getApiByName(apiName: string): Promise<string | null> {
        return await this.page.locator('api-list div.table div.table-body div.table-row a').filter({ hasText: apiName }).first().innerText();
    }

    public async getApisCount(): Promise<number | undefined> {
        return await this.page.evaluate(() =>
            document.querySelector("api-list div.table div.table-body div.table-row")?.parentElement?.childElementCount
        );
    }
}