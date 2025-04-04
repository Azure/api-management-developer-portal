import { Page } from "playwright";
import { User } from "../../mocks/collection/user";
import { UserSignUp } from "../../mocks/collection/userSignUp";

export class SignInBasicWidget {
    constructor(private readonly page: Page, private readonly configuration: object) { }

    public async signInWithBasic(userInfo: User): Promise<void> {
        try {
            await this.page.goto(this.configuration['urls']['signin'], { waitUntil: 'domcontentloaded' });
            await this.page.type("#email", userInfo.email);
            await this.page.type("#password", userInfo.password);
            await this.page.click("#signin");
        } catch (error) {
            console.error("Error in signInWithBasic:", error);
        }
    }

    public async signInWithBasicSubscribe(userInfo: UserSignUp): Promise<void> {
        try {
            await this.page.type("#email", userInfo.email);
            await this.page.type("#password", userInfo.password);
            await this.page.click("#signin");
        } catch (error) {
            console.error("Error in signInWithBasicSubscribe:", error);
        }
    }
    
    public async waitRuntimeInit(): Promise<void> {
        try {
            await this.page.waitForSelector("#signin");
        } catch (error) {
            console.error("Error in waitRuntimeInit:", error);
        }
    }
    
    public async requestForPasswordReset(userInfo: User): Promise<void> {
        try {
            await this.page.type("#email", userInfo.email);
            await this.page.click("#reset");
        } catch (error) {
            console.error("Error in requestForPasswordReset:", error);
        }
    }

    public async requestResetButton(): Promise<void> {
        try {
            await this.page.click("#reset");
        } catch (error) {
            console.error("Error in requestResetButton:", error);
        }
    }

    public async getValidationMessageValue(): Promise<string | undefined | null | any> {
        try {
            return await this.page.locator("validation-summary").allInnerTexts();
        } catch (error) {
            console.error("Error in getValidationMessageValue:", error);
        }
    }

    public async clickLinkOnForgotYourPassword(): Promise<void> {
        try {
            await this.page.locator("xpath=//a[contains(text(), 'Forgot your password?')]").click();
        } catch (error) {
            console.error("Error in clickLinkOnForgotYourPassword:", error);
        }
    }
}