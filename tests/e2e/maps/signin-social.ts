import { Page } from "puppeteer";

export class SignInSocialWidget {
    constructor(private readonly page: Page) { }

    public async signInWitAadB2C(): Promise<void> {
        await this.page.click("#signinB2C");

        await new Promise<void>((resolve) => {
            this.page.once("popup", async (popup) => {
                await popup.waitForSelector("[type=email]");
                await popup.type("[type=email]", "foo@bar.com");
                await popup.type("[type=password]", "password");
                await popup.click("#next");

                popup.on("close", () => resolve());

                await new Promise(resolve => setTimeout(resolve, 50000000)); // just long wait
            });
        });

        await this.page.waitForNavigation({ waitUntil: "domcontentloaded" });
    }
}