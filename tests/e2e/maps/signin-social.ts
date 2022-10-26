import { Page } from "puppeteer";
import { User } from "../../mocks";

export class SignInSocialWidget {
    constructor(private readonly page: Page) { }

    public async signInWitAadB2C(user: User): Promise<void> {
        await this.page.click("#signinB2C");

        await new Promise<void>((resolve) => {
            this.page.once("popup", async (popup) => {
                await popup.waitForSelector("[type=email]");
                await popup.type("[type=email]", user.email);
                await popup.type("[type=password]", user.password);
                await popup.click("#next");

                popup.on("close", () => resolve());

                await new Promise(resolve => {
                    setTimeout(resolve, 50000000) // just long wait
                })
            });
        });

        await this.page.waitForNavigation({ waitUntil: "domcontentloaded" });
    }
}