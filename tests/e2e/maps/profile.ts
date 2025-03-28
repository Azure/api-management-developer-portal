import { Locator, Page } from "playwright";

export class ProfileWidget {
    constructor(private readonly page: Page) { }

    public async waitRuntimeInit(): Promise<void> {
        try {
            await this.page.waitForSelector("profile-runtime .row");
            await this.page.waitForSelector("subscriptions-runtime .table-row");
        } catch (error) {
            console.error("Error in waitRuntimeInit:", error);
        }
    }

    public getUserEmailLocator(): Locator {
        try {
            return this.page.locator("profile-runtime [data-bind='text: user().email']").first();
        } catch (error) {
            console.error("Error in getUserEmailLocator:", error);
            throw error;
        }
    }

    public async getUserEmail(): Promise<string> {
        try {
            return await this.getUserEmailLocator().innerText();
        } catch (error) {
            console.error("Error in getUserEmail:", error);
            throw error;
        }
    }

    public getUserFirstNameLocator(): Locator {
        try {
            return this.page.locator("profile-runtime [data-bind='text: user().firstName']").first();
        } catch (error) {
            console.error("Error in getUserFirstNameLocator:", error);
            throw error;
        }
    }

    public async getUserFirstName(): Promise<string> {
        try {
            return await this.getUserFirstNameLocator().innerText();
        } catch (error) {
            console.error("Error in getUserFirstName:", error);
            throw error;
        }
    }

    public getUserLastNameLocator(): Locator {
        try {
            return this.page.locator("profile-runtime [data-bind='text: user().lastName']").first();
        } catch (error) {
            console.error("Error in getUserLastNameLocator:", error);
            throw error;
        }
    }

    public async getUserLastName(): Promise<string> {
        try {
            return await this.getUserLastNameLocator().innerText();
        } catch (error) {
            console.error("Error in getUserLastName:", error);
            throw error;
        }
    }

    public getUserRegistrationDataLocator(): Locator {
        try {
            return this.page.locator("profile-runtime [data-bind='text: registrationDate']").first();
        } catch (error) {
            console.error("Error in getUserRegistrationDataLocator:", error);
            throw error;
        }
    }

    public async getUserRegistrationDate(): Promise<string> {
        try {
            return await this.getUserRegistrationDataLocator().innerText();
        } catch (error) {
            console.error("Error in getUserRegistrationDate:", error);
            throw error;
        }
    }

    public getSubscriptionRow(subscriptionName: string): Locator {
        try {
            return this.page.locator("subscriptions-runtime div.table div.table-body div.table-row", { has: this.page.locator("div.row span[data-bind='text: model.name']").filter({ hasText: subscriptionName }) });
        } catch (error) {
            console.error("Error in getSubscriptionRow:", error);
            throw error;
        }
    }

    public async elementOfScroll(): Promise<string | any> {
        try {
            const scrollToElement = "//span[text()='Powered by ']";
            return scrollToElement;
        } catch (error) {
            console.error("Error in elementOfScroll:", error);
            throw error;
        }
    }

    public async getSubscriptioPrimarynKey(subscriptionName: string): Promise<string | null> {
        try {
            var subscriptionRow = this.getSubscriptionRow(subscriptionName);
            const primaryKeyElement = subscriptionRow.locator('code[data-bind="text: primaryKey"]').first();
            return await primaryKeyElement.textContent();
        } catch (error) {
            console.error("Error in getSubscriptioPrimarynKey:", error);
            throw error;
        }
    }

    public async getSubscriptioSecondarynKey(subscriptionName: string): Promise<string | null> {
        try {
            var subscriptionRow = this.getSubscriptionRow(subscriptionName);
            const primaryKeyElement = subscriptionRow?.locator('code[data-bind="text: secondaryKey"]').first();
            return await primaryKeyElement.textContent();
        } catch (error) {
            console.error("Error in getSubscriptioSecondarynKey:", error);
            throw error;
        }
    }

    public async togglePrimarySubscriptionKey(subscriptionName: string): Promise<void> {
        try {
            var subscriptionRow = this.getSubscriptionRow(subscriptionName);
            await subscriptionRow?.locator("a.btn-link[aria-label='Show primary key']", { hasText: "Show" }).click();
        } catch (error) {
            console.error("Error in togglePrimarySubscriptionKey:", error);
            throw error;
        }
    }

    public async toggleSecondarySubscriptionKey(subscriptionName: string): Promise<void> {
        try {
            var subscriptionRow = this.getSubscriptionRow(subscriptionName);
            await subscriptionRow?.locator("a.btn-link[aria-label='Show Secondary key']", { hasText: "Show" }).click();
        } catch (error) {
            console.error("Error in toggleSecondarySubscriptionKey:", error);
            throw error;
        }
    }

    public async getListOfLocatorsToHide(): Promise<Locator[] | undefined> {
        try {
            const primaryKeyElements = await this.page.locator('code[data-bind="text: primaryKey"]').all();
            const secondaryKeyElements = await this.page.locator('code[data-bind="text: secondaryKey"]').all();
            const productNames = this.page.locator('span[data-bind="text: model.productName"]');
            const subscriptionNames = this.page.locator('span[data-bind="text: model.name"]');
            const subscriptionStartDates = this.page.locator('span[data-bind="text: $parent.timeToString(model.startDate)"]');
            return primaryKeyElements.concat(secondaryKeyElements).concat(productNames).concat(this.getUserProfileData()).concat(subscriptionNames).concat(subscriptionStartDates);
        } catch (error) {
            console.error("Error in getListOfLocatorsToHide:", error);
            throw error;
        }
    }

    public getUserProfileData(): Locator[] {
        try {
            return [
                this.getUserEmailLocator(),
                this.getUserFirstNameLocator(),
                this.getUserLastNameLocator(),
                this.getUserRegistrationDataLocator()
            ];
        } catch (error) {
            console.error("Error in getUserProfileData:", error);
            throw error;
        }
    }

    public async getChangeNameButton(): Promise<Locator> {
        try {
            return this.page.locator("xpath=//button[contains(text(),'Change name')]");
        } catch (error) {
            console.error("Error in getChangeNameButton:", error);
            throw error;
        }
    }

    public async getFirstNameInput(): Promise<Locator> {
        try {
            return this.page.locator("profile-runtime div input[id='firstName']");
        } catch (error) {
            console.error("Error in getFirstNameInput:", error);
            throw error;
        }
    }

    public async getSaveButton(): Promise<Locator> {
        try {
            return this.page.locator("xpath=//button[contains(text(),'Save')]");
        } catch (error) {
            console.error("Error in getSaveButton:", error);
            throw error;
        }
    }

    public async getSignOutButton(): Promise<Locator> {
        try {
            return this.page.getByRole('link', { name: 'Sign out' });
        } catch (error) {
            console.error("Error in getSignOutButton:", error);
            throw error;
        }
    }

    public async updateFirstName(firstName: string): Promise<void> {
        try {
            const firstNameTxtBox = await this.getFirstNameInput();
            await firstNameTxtBox.clear();
            await firstNameTxtBox.fill(firstName);
            const saveBtn = await this.getSaveButton();
            await saveBtn.waitFor({ state: 'visible' });
            await saveBtn.click();
        } catch (error) {
            console.error("Error in updateFirstName:", error);
            throw error;
        }
    }

    public async closeAccount(): Promise<void> {
        try {
            const signOutBtn = this.page.locator("xpath=//button[contains(text(),'Close account')]");
            await signOutBtn.click();
        } catch (error) {
            console.error("Error in closeAccount:", error);
            throw error;
        }
    }

    public async scrollToBottomOfPage(): Promise<string | any> {
        try {
            const scrollToElement = "//span[text()='Powered by ']";
            return scrollToElement;
        } catch (error) {
            console.error("Error in scrollToBottomOfPage:", error);
            throw error;
        }
    }
}