import * as puppeteer from "puppeteer";
import { expect } from "chai";
import { BrowserLaunchOptions } from "../../constants";
import { Utils } from "../../utils";
import { SignupBasicWidget } from "../maps/signup-basic";

describe("User sign-up flow", async () => {
    let config;
    let browser: puppeteer.Browser;

    before(async () => {
        config = await Utils.getConfig();
        browser = await puppeteer.launch(BrowserLaunchOptions);
    });
    after(async () => {
        browser.close();
    });

    it("User can sign-up with basic credentials", async () => {
        const page = await browser.newPage();
        await page.goto(config.urls.signup);

        await Utils.mock(page, {
            "/service/sid/users": {},
        });

        const signUpWidget = new SignupBasicWidget(page);
        const randomUser = await Utils.getRandomUser();
        await signUpWidget.signUpWithBasic(randomUser);

        expect(await page.evaluate(() => document.getElementById("confirmationMessage").textContent))
            .to.equal("Follow the instructions from the email to verify your account.");
    });
});