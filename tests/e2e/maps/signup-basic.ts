import { Page } from "playwright";
import { User } from "../../mocks/collection/user";

export class SignupBasicWidget {
    constructor(private readonly page: Page) { }

    public async signUpWithBasic(user: User): Promise<void> {
        await this.page.type("#email", user.email);
        await this.page.type("#password", user.password);
        await this.page.type("#confirmPassword", user.password);
        await this.page.type("#firstName", user.firstName);
        await this.page.type("#lastName", user.lastName);

        var captchaTextBox = await this.page.evaluate(() => document.getElementById("captchaValue"));
        if (captchaTextBox) {
            console.log("Captcha is enabled and should be passed with the sign up request.");
        }

        await this.page.click("#signup");
    }

    public async getConfirmationMessageValue(): Promise<string | undefined | null> {
        await this.page.waitForSelector("#confirmationMessage");
        return await this.page.evaluate(() => document.getElementById("confirmationMessage")?.textContent);
    }
}