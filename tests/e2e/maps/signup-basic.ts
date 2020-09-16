import { Page } from "puppeteer";
import { User } from "../../mocks/user";

export class SignupBasicWidget {
    constructor(private readonly page: Page) { }

    public async signUpWithBasic(user: User): Promise<void> {
        await this.page.type("#email", user.email);
        await this.page.type("#password", user.password);
        await this.page.type("#confirmPassword", user.password);
        await this.page.type("#firstName", user.firstName);
        await this.page.type("#lastName", user.lastName);
        await this.page.click("#signup");

        await this.page.waitForSelector("#confirmationMessage");
    }
}