import { Locator, Page } from "playwright";

export class ProductseWidget {
    constructor(private readonly page: Page) { }

    public async waitRuntimeInit(): Promise<void> {
        try {
            await this.page.locator("product-list-runtime").waitFor();
        } catch (error) {
            console.error("Error in waitRuntimeInit:", error);
        }
    }

    public async products(): Promise<void> {
        try {
            await this.page.waitForSelector("product-list-runtime div.table div.table-body div.table-row");
        } catch (error) {
            console.error("Error in products:", error);
        }
    }

    public async getProductByName(productName: string): Promise<string | null> {
        try {
            await this.page.locator(`//input[@aria-label="Search"]`).clear();
            await this.page.locator(`//input[@aria-label="Search"]`).pressSequentially(productName, { delay: 200 });
            return await this.page.locator('product-list-runtime div.table div.table-body div.table-row a').filter({ hasText: productName }).first().innerText();
        } catch (error) {
            console.error("Error in getProductByName:", error);
            return null;
        }
    }

    public async goToProductPage(baseUrl, productId: string): Promise<void> {
        try {
            await this.page.goto(`${baseUrl}/product#product=${productId}`, { waitUntil: 'domcontentloaded' });
        } catch (error) {
            console.error("Error in goToProductPage:", error);
        }
    }

    public async subscribeToProduct(baseUrl, productId: string, subscriptionName: string): Promise<void> {
        try {
            await this.goToProductPage(baseUrl, productId);
            await this.page.waitForSelector("product-subscribe-runtime form button");
            await this.page.type("product-subscribe-runtime form input", subscriptionName);
            await this.page.click("product-subscribe-runtime form button");
        } catch (error) {
            console.error("Error in subscribeToProduct:", error);
        }
    }

    public async subscribeToStarterProduct(subscriptionName: string): Promise<void> {
        try {
            await this.page.waitForSelector("product-subscribe-runtime form button");
            await this.page.type("product-subscribe-runtime form input", subscriptionName);
            await this.page.click("product-subscribe-runtime form button");
        } catch (error) {
            console.error("Error in subscribeToStarterProduct:", error);
        }
    }

    public async clearExistingProductSubscription(): Promise<void> {
        try {
            return await this.page.locator("subscriptions-runtime div.table div.table-body div.table-row div[class='input-group has-validation'] input").clear();
        } catch (error) {
            console.error("Error in clearExistingProductSubscription:", error);
        }
    }

    public async initiateSubscriptionProcess(): Promise<void> {
        try {
            await this.page.waitForSelector("product-subscribe-runtime div button");
            await this.page.click("product-subscribe-runtime div button");
        } catch (error) {
            console.error("Error in initiateSubscriptionProcess:", error);
        }
    }
   
    public async clickOnProductNameLink(productName: string): Promise<void> {
        try {
            await this.page.locator(`//input[@aria-label="Search"]`).pressSequentially(productName, { delay: 200 });
            await this.page.waitForSelector('product-list-runtime div.table div.table-body div.table-row a');
            return await this.page.locator('product-list-runtime div.table div.table-body div.table-row a').filter({ hasText: productName }).first().click();
        } catch (error) {
            console.error("Error in clickOnProductNameLink:", error);
        }
    }

    public async clickOnProductsMenu(): Promise<void> {
        try {
            return await this.page.locator('div .menu-horizontal ul li a').filter({hasText:'Products'}).click();  
        } catch (error) {
            console.error("Error in clickOnProductsMenu:", error);
        }
    }

    public async clickProductFromDropdown(): Promise<void> {
        try {
            return await this.page.locator("product-list-dropdown-runtime div [aria-label='Products']").click();
        } catch (error) {
            console.error("Error in clickProductFromDropdown:", error);
        }
    }

    public async selectProductFromDropdown(productName: string): Promise<void> {
        try {
            await this.page.locator(`//div[@class="input-group"]//input[@aria-label="Search"]`).pressSequentially(productName, { delay: 200 });
            await this.page.locator(`div.dropdown div[role='list'] a`).filter({ hasText: productName }).first().click();
            await this.page.waitForSelector(`//div[@class="animation-fade-in"]/h2[text()='${productName}']`);
        } catch (error) {
            console.error("Error in selectProductFromDropdown:", error);
        }
    }

    public async getProductName(): Promise<string | null> {
        try {
            return await this.page.locator("product-details-runtime div.animation-fade-in h2").first().innerText();
        } catch (error) {
            console.error("Error in getProductName:", error);
            return null;
        }
    }

    public async getFirstProductNameFromTable(): Promise<string | null> {
        try {
            return await this.page.locator("subscriptions-runtime div.table div.table-body div.table-row span[data-bind='text: model.productName']").first().innerText();
        } catch (error) {
            console.error("Error in getFirstProductNameFromTable:", error);
            return null;
        }
    }

    public async enterTextInProductSearchBox(productName: string): Promise<void> {
        try {
            await this.page.type("product-list-runtime div input", productName);
        } catch (error) {
            console.error("Error in enterTextInProductSearchBox:", error);
        }
    }

    public async getSubscriptionsMessageLocator(): Promise<Locator | undefined> {
        try {
            return this.page.locator("product-subscriptions-runtime div.table p").filter({ hasText: "You don't have subscriptions yet." });
        } catch (error) {
            console.error("Error in getSubscriptionsMessageLocator:", error);
            return undefined;
        }
    }

    public async waitSubscriptionsRuntimeInit(): Promise<void> {
        try {
            const locator = await this.getSubscriptionsMessageLocator();
            if (locator) {
                await locator.waitFor();
            }
        } catch (error) {
            console.error("Error in waitSubscriptionsRuntimeInit:", error);
        }
    }

    public async renameProductName(): Promise<void> {
        try {
            return await this.page.locator("subscriptions-runtime div.table div.table-body div.table-row a[aria-label='Rename subscription']").first().click();
        } catch (error) {
            console.error("Error in renameProductName:", error);
        }
    }

    public async cancelSubscriptionOfProduct(): Promise<void> {
        try {
            await this.page.waitForSelector("subscriptions-runtime div.table div.table-body div.table-row a[aria-label='Cancel subscription']");
            return await this.page.locator("subscriptions-runtime div.table div.table-body div.table-row a[aria-label='Cancel subscription']").filter({ hasText: 'Cancel' }).first().dblclick({ force: true });
        } catch (error) {
            console.error("Error in cancelSubscriptionOfProduct:", error);
        }
    }

    public async cancelSubscriptionState(): Promise<string> {
        try {
            return await this.page.locator("subscriptions-runtime div.table div.table-body div.table-row span[data-bind='text: model.state']").first().innerText();
        } catch (error) {
            console.error("Error in cancelSubscriptionState:", error);
            return '';
        }
    }

    public async subscribeToRenameProduct(subscriptionName: string): Promise<void> {
        try {
            await this.page.waitForSelector("subscriptions-runtime div.table div.table-body div.table-row div[class='input-group has-validation']");
            await this.clearExistingProductSubscription();
            await this.page.type("subscriptions-runtime div.table div.table-body div.table-row div[class='input-group has-validation'] input", subscriptionName);
            await this.page.click("subscriptions-runtime div.table div.table-body div.table-row a[aria-label='Save subscription name']");
        } catch (error) {
            console.error("Error in subscribeToRenameProduct:", error);
        }
    }

    public async navigateToProductsPageOnClick(): Promise<void> {
        try {
            await this.page.getByRole('link', { name: 'Products' }).click({ timeout: 2000 });
        } catch (error) {
            console.error("Error in navigateToProductsPageOnClick:", error);
        }
    }

    public async subscriptionDetails(): Promise<string> {
        try {
            return await this.page.locator(`subscriptions-runtime div.table div.table-body div.table-row`).innerHTML();
        } catch (error) {
            console.error("Error in subscriptionDetails:", error);
            return '';
        }
    }
}