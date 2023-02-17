import { Page } from "puppeteer";

export class SignInBasicWidget {
    constructor(private readonly page: Page) { }

    public async signInWithBasic(): Promise<void> {
        await this.page.type("#email", "foo@bar.com");
        await this.page.type("#password", "password");
        await this.page.click("#signin");
        await this.page.waitForNavigation({ waitUntil: "domcontentloaded" });
    }
}