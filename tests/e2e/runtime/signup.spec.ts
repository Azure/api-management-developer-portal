import * as puppeteer from "puppeteer";
import { expect } from "chai";
import { LaunchOptions } from "../../constants";
import { Utils } from "../../utils";
import { SignupBasicWidget } from "../maps/signup-basic";


describe("User sign-up flow", async () => {
    let config;
    let browser: puppeteer.Browser;

    before(async () => {
        config = await Utils.getConfig();
        browser = await puppeteer.launch(LaunchOptions);
    });

    it("User can sign-up with basic credentials", async () => {
        const page = await browser.newPage();
        await page.goto(config.urls.signup);

        const signUpWidget = new SignupBasicWidget(page);
        const randomUser = await Utils.getRandomUser();
        await signUpWidget.signUpWithBasic(randomUser);

        expect(page.url()).to.equal(config.urls.signup);
    });

    after(async () => {
        browser.close();
    });
});