import exp from "constants";
import { Page } from "playwright";
import { expect } from '@playwright/test';

export class ApisWidget {
    constructor(private readonly page: Page) { }

    public async waitRuntimeInit(): Promise<void> {
        try {
            await this.page.locator("[aria-label='APIs']").waitFor({state: "visible", timeout: 13000});
        } catch (error) {
            console.error("Error in waitRuntimeInit:", error);
        }
    }

    public async getApiByName(apiName: string): Promise<string | null> {
        try {
             return await this.page.locator('api-list div.table div.table-body div.table-row a').filter({ hasText: apiName }).innerText();
        } catch (error) {
            console.error("Error in getApiByName:", error);
            return null;
        }
    }

    public async apis(): Promise<void> {
        try {
            await this.page.waitForSelector("api-list div.table div.table-body div.table-row");
        } catch (error) {
            console.error("Error in apis:", error);
        }
    }

    public async getnoApisMessage(): Promise<string | null> {
        try {
            return await this.page.locator("xpath=//div[contains(text(),'No APIs found')]").innerText();
        } catch (error) {
            console.error("Error in getnoApisMessage:", error);
            return null;
        }
    }

    public async clickOnApiNameLink(apiName: string): Promise<void> {
        try {
            await this.page.locator(`api-list div.table div.table-body div.table-row a[title='${apiName}']`).waitFor({state: "visible", timeout: 13000});
            await this.page.locator(`api-list div.table div.table-body div.table-row a[title='${apiName}']`).click({force: true});
        } catch (error) {
            console.error("Error in clickOnApiNameLink:", error);
        }
    }

    public async getNoOperationsMessage(): Promise<string | null> {
        try {
            await this.page.locator("[class='list-placeholder list-group-placeholder']").waitFor({ state: "visible", timeout: 13000 }); 
             const element = this.page.locator("[class='list-placeholder list-group-placeholder']");
             await expect(element).toHaveText("No operations found");
             return "No operations found";
        } catch (error) {
            console.error("Error in getNoOperationsMessage:", error);
            return null;
        }
    }

    public async getApisCount(): Promise<number | undefined> {
        try {
            return await this.page.evaluate(() =>
                document.querySelector("api-list div.table div.table-body div.table-row")?.parentElement?.childElementCount
            );
        } catch (error) {
            console.error("Error in getApisCount:", error);
            return undefined;
        }
    }

    public async searchApiByName(apiName: string): Promise<void> {
        try {
            await this.page.getByPlaceholder("Search APIs").waitFor({state: "visible", timeout: 13000});
            await this.page.getByPlaceholder("Search APIs").pressSequentially(apiName,{delay: 700});
            await this.page.getByPlaceholder("Search APIs").press("Enter");
            await this.page.locator(`api-list div.table div.table-body div.table-row a[title='${apiName}']`).waitFor({state: "visible", timeout: 13000});
            await expect(this.page.locator(`api-list div.table div.table-body div.table-row a[title='${apiName}']`)).toHaveText(apiName);

        } catch (error) {
            console.error("Error in searchApiByName:", error);
        }
    }

    public async waitForTableToLoad(): Promise<void> {
        try {
            await this.page.locator("api-list div.table").waitFor({ state: "visible", timeout: 10000 });
        } catch (error) {
            console.error("Error in waitForTableToLoad:", error);
        }
    }
}