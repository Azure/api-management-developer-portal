import * as puppeteer from "puppeteer";
import { expect } from "chai";
import { Utils } from "../../utils";
import { BrowserLaunchOptions } from "../../constants";
import { ProfileWidget } from "../maps/profile";
import { signIn } from "./signin.spec";
import defaultStaticData from "../../mocks/defaultStaticData.json";

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

        await signIn(page, config);
        expect(page.url()).to.equal(config.urls.home);

        await page.goto(config.urls.profile);

        const profileWidget = new ProfileWidget(page);
        await profileWidget.profile();

        const staticEmail = defaultStaticData["https://contoso.management.azure-api.net/subscriptions/sid/resourceGroups/rgid/providers/Microsoft.ApiManagement/service/sid/users/6189460d4634612164e10999"].body.properties.email;
        expect(await page.evaluate(() =>
            document.querySelector("[data-bind='text: user().email']").textContent
        )).to.equal(staticEmail);
        /*
        expect(await page.evaluate(() =>
            document.querySelector("subscriptions-runtime .table-body .table-row div").textContent.trim()
        )).to.equal("You don't have subscriptions.");
        */
        const staticPrimaryKey = defaultStaticData["https://contoso.management.azure-api.net/subscriptions/sid/resourceGroups/rgid/providers/Microsoft.ApiManagement/service/sid/users/6189460d4634612164e10999/subscriptions/61fd37461359a02500aad62f/listSecrets"].body.primaryKey;
        expect(await page.evaluate(() =>
            document.querySelector("[data-bind='text: primaryKey']").textContent
        )).to.equal(staticPrimaryKey);

        // await new Promise(resolve => setTimeout(resolve, 50000000)); // just long wait
    })
});