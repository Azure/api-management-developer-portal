import { Page } from "puppeteer";

export class ProfileWidget {
    constructor(private readonly page: Page) { }

    public async profile(): Promise<void> {
        await this.page.waitForSelector("profile-runtime .row");
        await this.page.waitForSelector("subscriptions-runtime .table-row");
    }

    public async getUserEmail(): Promise<string | undefined | null> {
        await this.page.waitForSelector("[data-bind='text: user().email']");
        return await this.page.evaluate(() =>document.querySelector("[data-bind='text: user().email']")?.textContent);
    }
}