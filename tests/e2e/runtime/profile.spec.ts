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

    it("User can visit his profile page", (done) => {
        var userInfo = new UserMockData();
        server = Utils.createMockServer([ userInfo.getSignInResponse(), userInfo.getUserInfoResponse()]);

        async function validate(){
            const page = await Utils.getBrowserNewPage(browser);

            await signIn(page, config);
            expect(page.url()).to.equal(config.urls.home);

            await page.goto(config.urls.profile);

            const profileWidget = new ProfileWidget(page);
            await profileWidget.profile();

            expect(await profileWidget.getUserEmail()).to.equal(userInfo.email);
        }
        Utils.startTest(server, validate, done);
    });
});