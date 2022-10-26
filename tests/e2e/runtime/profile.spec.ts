import * as puppeteer from "puppeteer";
import { expect } from "chai";
import { Utils } from "../../utils";
import { BrowserLaunchOptions } from "../../constants";
import { Profile } from "../maps/profile";
import { signIn } from "./signin.spec";

describe("User profile", async () => {
    let config;
    let browser: puppeteer.Browser;

    before(async () => {
        config = await Utils.getConfig();
        browser = await puppeteer.launch(BrowserLaunchOptions);
    });

    it("User can visit his profile page", async () => {
        const page = await browser.newPage();
        await Utils.mock(page, {
            "/service/sid/users/foo-bar": {},
            "/service/sid/users/foo-bar/subscriptions": {},
        });

        await signIn(config, page);
        expect(page.url()).to.equal(config.urls.home);

        await page.goto(config.urls.profile);

        const signInSocialWidget = new Profile(page);
        await signInSocialWidget.profile();
    })
});