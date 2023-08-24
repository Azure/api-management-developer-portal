import { Locator, Page } from "playwright";

export class HomePageWidget {
    constructor(private readonly page: Page) { }

    public async waitRuntimeInit(): Promise<void> {
        await this.getWelcomeMessageLocator().waitFor();
    }

    public getWelcomeMessageLocator(): Locator {
        return this.page.locator("h1 span").filter({ hasText: "Welcome to Contoso!" });
    }
}