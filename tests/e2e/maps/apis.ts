import { Page } from "playwright";

export class ApisWidget {
    constructor(private readonly page: Page) { }

    public async waitRuntimeInit(): Promise<void> {
        await this.page.waitForSelector("api-list");
        await this.page.waitForSelector("api-list div.table div.table-body div.table-row");
    }

    public async getApiByName(apiName: string): Promise<object | null> {
        const apis = await this.page.$$('api-list div.table div.table-body div.table-row a');

        for (let i = 0; i < apis.length; i++) {
            const productNameHtml = await (await apis[i].getProperty('innerText')).jsonValue();
            if (productNameHtml == apiName){
                return apis[i];
            }
        }
        return null;
    }

    public async getApisCount(): Promise<number | undefined> {
        return await this.page.evaluate(() =>
            document.querySelector("api-list div.table div.table-body div.table-row")?.parentElement?.childElementCount
        );
    }
}