import { Page } from "puppeteer";
import { User } from "../../mocks/user";

export class SigninBasicWidget {
    constructor(private readonly page: Page) { }

    public async signInWithBasic(user: User): Promise<void> {
        await this.page.type("#email", user.email);
        await this.page.type("#password", user.password);
        await this.page.click("#signin");
        await this.page.waitForNavigation({ waitUntil: "domcontentloaded" });
    }
}