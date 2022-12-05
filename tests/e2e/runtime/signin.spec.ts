import * as puppeteer from "puppeteer";
import { expect } from "chai";
import { Utils } from "../../utils";
import { BrowserLaunchOptions } from "../../constants";
import { SignInSocialWidget } from "../maps/signin-social";
import { SignInBasicWidget } from "../maps/signin-basic";

export async function signIn(page: puppeteer.Page, config: any): Promise<void> {
    await page.goto(config.urls.signin);

    const signInWidget = new SignInBasicWidget(page);
    await signInWidget.signInWithBasic();
}

describe("User sign-in flow", async () => {
    let config;
    let browser: puppeteer.Browser;

    before(async () => {
        config = await Utils.getConfig();
        browser = await puppeteer.launch(BrowserLaunchOptions);
    });
    after(async () => {
        await browser.close();
    });

    it("User can sign-in with basic credentials", async () => {
        const page = await browser.newPage();
        await signIn(page, config);
        expect(page.url()).to.equal(config.urls.home);
    });
    /*
    it("User can sign-in with AAD B2C credentials", async () => {
        const confirmedUser = await Utils.getConfirmedUserAadB2C();

        if (!confirmedUser) {
            return; // skipping test
        }

        const page = await browser.newPage();
        await page.goto(config.urls.signin);

        const signInSocialWidget = new SignInSocialWidget(page);
        await signInSocialWidget.signInWitAadB2C(confirmedUser);

        expect(page.url()).to.equal(config.urls.home);
    });
    /**/
});