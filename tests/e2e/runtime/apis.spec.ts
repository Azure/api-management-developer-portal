import * as puppeteer from "puppeteer";
import { expect } from "chai";
import { Utils } from "../../utils";
import { BrowserLaunchOptions } from "../../constants";
import { Server } from "http";
import { Apis } from "../../mocks/collection/apis";
import { Api } from "../../mocks/collection/api";
import { ApisWidget } from "../maps/apis";

describe("Apis page", async () => {
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

    it("User can see apis on the page", async () => {
        var apis = new Apis();
        apis.addApi(Api.getRandomApi());
        apis.addApi(Api.getRandomApi());
        server = await Utils.createMockServer([apis.getApisListResponse()]);

        const page = await browser.newPage();
        await page.goto(config.urls.apis);

        const apiWidget = new ApisWidget(page);
        await apiWidget.apis();

        expect(await page.evaluate(() =>
            document.querySelector("api-list div.table div.table-body div.table-row")?.parentElement?.childElementCount
        )).to.equal(apis.apiList.length);
    });
});