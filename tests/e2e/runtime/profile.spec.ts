import * as puppeteer from "puppeteer";
import { expect } from "chai";
import { Utils } from "../../utils";
import { BrowserLaunchOptions } from "../../constants";
import { ProfileWidget } from "../maps/profile";
import { signIn } from "./signin.spec";
import { Server } from "http";

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
        server = await Utils.createMockServer(["tests/mocks/collection/user-signin.json", "tests/mocks/collection/user-info.json"]);
        const page = await browser.newPage();

        await signIn(page, config);
        expect(page.url()).to.equal(config.urls.home);

        await page.goto(config.urls.profile);

        const profileWidget = new ProfileWidget(page);
        await profileWidget.profile();

        const userInfo = await import("../../mocks/collection/user-info.json");

        const staticEmail = userInfo["/subscriptions/sid/resourceGroups/rgid/providers/Microsoft.ApiManagement/service/sid/users/6189460d4634612164e10999"].body.properties.email;
        expect(await page.evaluate(() =>
            document.querySelector("[data-bind='text: user().email']").textContent
        )).to.equal(staticEmail);
    });
});