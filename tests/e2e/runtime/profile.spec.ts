import * as puppeteer from "puppeteer";
import { expect } from "chai";
import { Utils } from "../../utils";
import { BrowserLaunchOptions } from "../../constants";
import { ProfileWidget } from "../maps/profile";
import { signIn } from "./signin.spec";
import { Server } from "http";
import { UserMockData } from "../../mocks/collection/user";

describe("User profile", async () => {
    let config;
    let browser: puppeteer.Browser;
    let server: Server;
    
    before(async () => {
        config = await Utils.getConfig();
        browser = await puppeteer.launch(BrowserLaunchOptions);
    });
    after(async () => {
        browser.close();
        Utils.closeServer(server);
    });

    it("User can visit his profile page", async () => {
        var userInfo = new UserMockData();
        server = await Utils.createMockServer([await userInfo.getSignInResponse(), userInfo.getUserInfoResponse()]);
        const page = await browser.newPage();

        await signIn(page, config);
        expect(page.url()).to.equal(config.urls.home);

        await page.goto(config.urls.profile);

        const profileWidget = new ProfileWidget(page);
        await profileWidget.profile();

        expect(await page.evaluate(() =>
            document.querySelector("[data-bind='text: user().email']")?.textContent
        )).to.equal(userInfo.email);
    });
});