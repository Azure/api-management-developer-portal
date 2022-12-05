import * as puppeteer from "puppeteer";
import { expect } from "chai";
import { Utils } from "../../utils";
import { BrowserLaunchOptions } from "../../constants";
import { ProfileWidget } from "../maps/profile";
import { signIn } from "./signin.spec";

describe("User profile", async () => {
    let config;
    let browser: puppeteer.Browser;

    before(async () => {
        config = await Utils.getConfig();
        browser = await puppeteer.launch(BrowserLaunchOptions);
    });
    after(async () => {
        browser.close();
    });

    it("User can visit his profile page", async () => {
        const page = await browser.newPage();
        const confirmedUser = await Utils.getConfirmedUserBasic();

        await signIn(page, config, confirmedUser);
        expect(page.url()).to.equal(config.urls.home);

        await page.goto(config.urls.profile);

        const profileWidget = new ProfileWidget(page);
        await profileWidget.profile();

        expect(await page.evaluate(() =>
            document.querySelector("[data-bind='text: user().email']").textContent
        )).to.equal(confirmedUser.email);
        /*
        expect(await page.evaluate(() =>
            document.querySelector("subscriptions-runtime .table-body .table-row div").textContent.trim()
        )).to.equal("You don't have subscriptions.");
        */
        expect(await page.evaluate(() =>
            document.querySelector("[data-bind='text: primaryKey']").textContent
        )).to.equal(primaryKey);
    })
});