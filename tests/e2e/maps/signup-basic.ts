import { Page } from "playwright";
import { UserSignUp } from "../../mocks/collection/userSignUp";

export class SignupBasicWidget {
    constructor(private readonly page: Page) { }

    public async populateSignUpData(user: UserSignUp): Promise<void> {
        try {
            await this.page.type("#email", user.email);
            await this.page.type("#password", user.password);
            await this.page.type("#confirmPassword", user.confirmPassword);
            await this.page.type("#firstName", user.firstName);
            await this.page.type("#lastName", user.lastName);
        } catch (error) {
            console.error("Error populating sign up data:", error);
        }
    }

    public async signUpWithBasic(user: UserSignUp): Promise<void> {
        try {
            await this.page.type("#email", user.email);
            await this.page.type("#password", user.password);
            await this.page.type("#confirmPassword", user.confirmPassword);
            await this.page.type("#firstName", user.firstName);
            await this.page.type("#lastName", user.lastName);

            var captchaTextBox = await this.page.evaluate(() => document.getElementById("captchaValue"));
            if (captchaTextBox) {
                console.log("Captcha is enabled and should be passed with the sign up request.");
            }

            await this.page.click("#signup");
        } catch (error) {
            console.error("Error during sign up:", error);
        }
    }

    public async waitRuntimeInit(): Promise<void> {
        try {
            await this.page.waitForSelector("#signup");
        } catch (error) {
            console.error("Error waiting for runtime init:", error);
        }
    }

    public async getConfirmationMessageValue(): Promise<string | undefined | null> {
        try {
            await this.page.waitForSelector("#confirmationMessage");
            return await this.page.evaluate(() => document.getElementById("confirmationMessage")?.textContent);
        } catch (error) {
            console.error("Error getting confirmation message value:", error);
            return null;
        }
    }

    public async getInvalidEmailError(): Promise<string | undefined | null> {
        try {
            return await this.page.evaluate(() => document.getElementById("emailError")?.textContent);
        } catch (error) {
            console.error("Error getting invalid email error:", error);
            return null;
        }
    }

    public async getInvalidPasswordError(): Promise<string | undefined | null> {
        try {
            return await this.page.evaluate(() => document.getElementById("passwordError")?.textContent);
        } catch (error) {
            console.error("Error getting invalid password error:", error);
            return null;
        }
    }

    public async getInvalidPasswordConfirmationError(): Promise<string | undefined | null> {
        try {
            return await this.page.evaluate(() => document.getElementById("confirmPasswordError")?.textContent);
        } catch (error) {
            console.error("Error getting invalid password confirmation error:", error);
            return null;
        }
    }

    public async getInvalidFirstNameError(): Promise<string | undefined | null> {
        try {
            return await this.page.evaluate(() => document.getElementById("firstNameError")?.textContent);
        } catch (error) {
            console.error("Error getting invalid first name error:", error);
            return null;
        }
    }

    public async getInvalidLastNameError(): Promise<string | undefined | null> {
        try {
            return await this.page.evaluate(() => document.getElementById("lastNameError")?.textContent);
        } catch (error) {
            console.error("Error getting invalid last name error:", error);
            return null;
        }
    }
}