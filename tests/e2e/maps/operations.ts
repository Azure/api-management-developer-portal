import { Page } from "playwright";

export class OperationsWidget {
    constructor(private readonly page: Page) { }

    public async waitRuntimeInit(): Promise<void> {
        try {
             return await this.page.locator("operation-list").waitFor({ state: "visible", timeout: 13000 });
        } catch (error) {
            console.error("Error in waitRuntimeInit:", error);
        }
    }

    public async searchForOperations(operationName: string): Promise<void> {
        try {
            const searchBox = this.page.getByPlaceholder('Search operations');
            await searchBox.waitFor({ state: "visible", timeout: 13000 });    
            await searchBox.fill(operationName);
            await searchBox.press("Enter");
            await this.page.waitForTimeout(2000);
        } catch (error) {
            console.error("Error in searchForOperations:", error);
        }
    }

    public async waitForOperationsLoaded(): Promise<void> {
        try {
           return  await this.page.locator(".list").waitFor({state: "visible", timeout: 13000});
        } catch (error) {
            console.error("Error in waitForOperationsLoaded:", error);
        }
    }

    public async selctOperation(operationName: string): Promise<void> {
        try {
            const operation = this.page.getByTitle(operationName);
            await operation.click();
        } catch (error) {
            console.error("Error in selctOperation:", error);
        }
    }
}