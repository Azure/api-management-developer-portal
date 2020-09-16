import * as puppeteer from "puppeteer";
import { expect } from "chai";
import { Utils } from "../../utils";
import { LaunchOptions } from "../../constants";
import { SigninSocialWidget } from "../maps/signin-social";
import { SigninBasicWidget } from "../maps/signin-basic";


describe("User sign-in flow", async () => {
    let config;
    let browser: puppeteer.Browser;

    before(async () => {
        config = await Utils.getConfig();
        browser = await puppeteer.launch(LaunchOptions);
    });

    it("User can sign-in with basic credentials", async () => {
        const confirmedUser = await Utils.getConfirmedUserBasic();

        if (!confirmedUser) {
            return; // skipping test
        }

        const page = await browser.newPage();
        await page.goto(config.urls.signin);

        const signInWidget = new SigninBasicWidget(page);
        await signInWidget.signInWithBasic(confirmedUser);

        expect(page.url()).to.equal(config.urls.home);
    });

    it("User can sign-in with AAD B2C credentials", async () => {
        const confirmedUser = await Utils.getConfirmedUserAadB2C();

        if (!confirmedUser) {
            return; // skipping test
        }

        const page = await browser.newPage();
        await page.goto(config.urls.signin);

        const signInSocialWidget = new SigninSocialWidget(page);
        await signInSocialWidget.signInWitAadB2C(confirmedUser);

        expect(page.url()).to.equal(config.urls.home);
    });

    after(async () => {
        browser.close();
    });
});