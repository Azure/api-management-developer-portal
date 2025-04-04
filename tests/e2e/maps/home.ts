import { Locator, Page } from "playwright";

export class HomePageWidget {
    constructor(private readonly page: Page) { }

    public async waitRuntimeInit(): Promise<void> {
        try {
            await this.getWelcomeMessageLocator().waitFor({ state: 'visible', timeout: 13000 });    
        } catch (error) {
            console.error("Error in waitRuntimeInit:", error);
        }
    }

    public async waitRuntimeInitDesignMode(): Promise<void> {
        try {
            await (await this.getWelcomeMessageLocatorDesignMode()).waitFor({ state: 'visible' });    
        } catch (error) {
            console.error("Error in waitRuntimeInitDesignMode:", error);
        }
    }

    public getWelcomeMessageLocator(): Locator {
        try {
            return this.page.locator("h1 span").filter({ hasText: "Welcome to Contoso!" });
        } catch (error) {
            console.error("Error in getWelcomeMessageLocator:", error);
            throw error;
        }
    }

    public async getWelcomeMessageLocatorDesignMode(): Promise<Locator> {
        try {
            if (await this.page.$('onboarding-modal-close')) {
                await this.page.click('.onboarding-modal-close [data-icon-name="Cancel"]');
            }
            return this.page.frameLocator('.host').locator("h1 span").filter({ hasText: "Welcome to Contoso!" });
        } catch (error) {
            console.error("Error in getWelcomeMessageLocatorDesignMode:", error);
            throw error;
        }
    }

    public async waitForSignInButton(): Promise<void> {
        try {
            await this.page.getByRole('link', { name: 'Sign in' }).waitFor({ state: 'visible', timeout: 13000 });    
        } catch (error) {
            console.error("Error in waitForSignInButton:", error);
        }
    }

    public async performTheResetOperation(): Promise<void> {
        try {
            await this.page.locator('div#admin-left-panel span.portal-name').first().isVisible();
            await this.page.getByRole('button', { name: 'Settings' }).click();
            await this.page.waitForSelector('[class="admin-modal-content"]');
            await this.page.getByText('Advanced').click();
            await this.page.locator(`//label//div`).click();
            await this.page.getByPlaceholder('Confirm by entering yes').fill('yes');
            await this.page.getByRole('button', { name: 'Save' }).click();
            await this.page.locator("button[aria-label='Close'].ms-Button.onboarding-modal-close").waitFor({ state: 'visible', timeout: 13000 });    
        } catch (error) {
            console.error("Error in performTheResetOperation:", error);
        }
    }

    public async resetContent(): Promise<void> {
        try {
            if (await this.page.getByRole('button', { name: 'Settings' }).isVisible()) {
                await this.performTheResetOperation();
            } else {
                await this.page.getByText('Back').click();
                await this.performTheResetOperation();
            }
        } catch (error) {
            console.error("Error in resetContent:", error);
        }
    }
}