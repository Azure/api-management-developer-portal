import { Page } from "playwright";
import { User } from "../../mocks/collection/user";

export class SignInBasicWidget {
    constructor(private readonly page: Page, private readonly configuration: object) { }

    public async signInWithBasic(userInfo: User): Promise<void> {
        await this.page.goto(this.configuration['urls']['signin'], { waitUntil: 'domcontentloaded' });

        await this.page.type("#email", userInfo.email);
        await this.page.type("#password", userInfo.password);
        await this.page.click("#signin");
    }
}