import { Page } from "playwright";

export class ValidationWidget {
    constructor(private readonly page: Page) { }

    public async waitRuntimeInit(): Promise<void> {
        try {
            await this.page.waitForSelector(".alert-danger:not(.text-hide)");
        } catch (error) {
            console.error("Error in waitRuntimeInit:", error);
            throw error;
        }
    }

    public async getValidationSummaryErrors(): Promise<string[]> {
        try {
            return await this.page.evaluate(() => {
                const validationWidget = document.getElementsByClassName("alert-danger")[0];
                const validationErrors = Array.from(validationWidget.children).map((child: any) => child.textContent);

                return validationErrors;
            });
        } catch (error) {
            console.error("Error in getValidationSummaryErrors:", error);
            throw error;
        }
    }
}