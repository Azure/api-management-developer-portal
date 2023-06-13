import * as puppeteer from "puppeteer";
import { expect } from "chai";
import { Utils } from "../../utils";
import { BrowserLaunchOptions } from "../../constants";
import { SignInBasicWidget } from "../maps/signin-basic";
import { Server } from "http";
import { UserMockData } from "../../mocks/collection/user";

export async function signIn(page: puppeteer.Page, config: any): Promise<void> {
    await page.goto(config.urls.signin);

    const signInWidget = new SignInBasicWidget(page);
    await signInWidget.signInWithBasic();
}

describe("User sign-in flow", async () => {
    let config;
    let browser: puppeteer.Browser;
    let server: Server;

    before(async () => {
        config = await Utils.getConfig();
        browser = await puppeteer.launch(BrowserLaunchOptions);
    });
    after(async () => {
        Utils.closeServer(server);
        await browser.close();
    });

    it("User can sign-in with basic credentials", (done) => {
        var userInfo = new UserMockData();
        server = Utils.createMockServer([userInfo.getSignInResponse()]);
        async function validate(){
            const page = await Utils.getBrowserNewPage(browser);
            await signIn(page, config);
            expect(page.url()).to.equal(config.urls.home);
        }

        Utils.startTest(server, validate, done);
    });
});