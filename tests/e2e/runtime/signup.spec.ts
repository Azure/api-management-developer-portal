import * as puppeteer from "puppeteer";
import { expect } from "chai";
import { BrowserLaunchOptions } from "../../constants";
import { Utils } from "../../utils";
import { SignupBasicWidget } from "../maps/signup-basic";
import { Server } from "http";
import { UserMockData } from "../../mocks/collection/user";

describe("User sign-up flow", async () => {
    let config;
    let browser: puppeteer.Browser;
    let server: Server

    before(async () => {
        config = await Utils.getConfig();
        browser = await puppeteer.launch(BrowserLaunchOptions);
    });
    after(async () => {
        browser.close();
        Utils.closeServer(server);
    });

    it("User can sign-up with basic credentials", (done) => {
        var userInfo = new UserMockData();
        server = Utils.createMockServer([userInfo.getUserRegisterResponse("email", "name", "lastname")]);

        async function validate(){
            const page = await browser.newPage();
            await page.goto(config.urls.signup);

            const signUpWidget = new SignupBasicWidget(page);
            await signUpWidget.signUpWithBasic();

            expect(await signUpWidget.getConfirmationMessageValue())
            .to.equal("Follow the instructions from the email to verify your account.");
        }

        Utils.startTest(server, validate, done);
    });
    
});