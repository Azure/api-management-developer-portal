import { Page } from "puppeteer";
import { User } from "../../mocks";

export class SignupBasicWidget {
    constructor(private readonly page: Page) { }

    public async signUpWithBasic(): Promise<void> {
        await this.page.type("#email", "foo@bar.com");
        await this.page.type("#password", "password");
        await this.page.type("#confirmPassword", "password");
        await this.page.type("#firstName", "Foo");
        await this.page.type("#lastName", "Bar");
        await this.page.click("#signup");

        await this.page.waitForSelector("#confirmationMessage");
    }
}