import { Locator, Page } from "playwright";

export class ProfileWidget {
    constructor(private readonly page: Page) { }

    public async waitRuntimeInit(): Promise<void> {
        await this.page.waitForSelector("profile-runtime .row");
        await this.page.waitForSelector("subscriptions-runtime .table-row");
    }

    public getUserEmailLocator(): Locator {
        return this.page.locator("profile-runtime [data-bind='text: user().email']").first();
    }

    public async getUserEmail(): Promise<string> {
        return await this.getUserEmailLocator().innerText();
    }

    public getUserFirstNameLocator(): Locator {
        return this.page.locator("profile-runtime [data-bind='text: user().firstName']").first();
    }

    public async getUserFirstName(): Promise<string > {
        return await this.getUserFirstNameLocator().innerText();
    }

    public getUserLastNameLocator(): Locator {
        return this.page.locator("profile-runtime [data-bind='text: user().lastName']").first();
    }

    public async getUserLastName(): Promise<string > {
        return await this.getUserLastNameLocator().innerText();
    }

    public getUserRegistrationDataLocator(): Locator {
        return this.page.locator("profile-runtime [data-bind='text: registrationDate']").first();
    }

    public async getUserRegistrationDate(): Promise<string> {
        return await this.getUserRegistrationDataLocator().innerText();
    }

    public getSubscriptionRow(subscriptionName: string): Locator {
        return this.page.locator("subscriptions-runtime div.table div.table-body div.table-row", { has: this.page.locator("div.row span[data-bind='text: model.name']").filter({ hasText: subscriptionName })});
    }

    public async getSubscriptioPrimarynKey(subscriptionName: string): Promise<string | null> {
        var subscriptionRow = this.getSubscriptionRow(subscriptionName);
        const primaryKeyElement = subscriptionRow.locator('code[data-bind="text: primaryKey"]').first();
        return await primaryKeyElement.textContent();
    }

    public async getSubscriptioSecondarynKey(subscriptionName: string): Promise<string | null> {
        var subscriptionRow = this.getSubscriptionRow(subscriptionName);
        const primaryKeyElement = subscriptionRow?.locator('code[data-bind="text: secondaryKey"]').first();
        return await primaryKeyElement.textContent();
    }

    public async togglePrimarySubscriptionKey(subscriptionName: string): Promise<void> {
        var subscriptionRow = this.getSubscriptionRow(subscriptionName);
        await subscriptionRow?.locator("a.btn-link[aria-label='Show primary key']", { hasText: "Show" }).click();
    }

    public async toggleSecondarySubscriptionKey(subscriptionName: string): Promise<void> {
        var subscriptionRow = this.getSubscriptionRow(subscriptionName);
        await subscriptionRow?.locator("a.btn-link[aria-label='Show Secondary key']", { hasText: "Show" }).click();
    }

    public async getListOfLocatorsToHide(): Promise<Locator[] | undefined> {
        const primaryKeyElements = await this.page.locator('code[data-bind="text: primaryKey"]').all();
        const secondaryKeyElements = await this.page.locator('code[data-bind="text: secondaryKey"]').all();
        const productNames = this.page.locator('span[data-bind="text: model.productName"]');
        const subscriptionNames = this.page.locator('span[data-bind="text: model.name"]');
        const subscriptionStartDates = this.page.locator('span[data-bind="text: $parent.timeToString(model.startDate)"]');
        return primaryKeyElements.concat(secondaryKeyElements).concat(productNames).concat(this.getUserProfileData()).concat(subscriptionNames).concat(subscriptionStartDates);
    }

    public getUserProfileData(): Locator[] {
        return [
            this.getUserEmailLocator(),
            this.getUserFirstNameLocator(),
            this.getUserLastNameLocator(),
            this.getUserRegistrationDataLocator()
        ];
    }
}