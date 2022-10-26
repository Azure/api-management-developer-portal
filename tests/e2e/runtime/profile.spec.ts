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
        const id = "/subscriptions/000/resourceGroups/000/providers/Microsoft.ApiManagement/service/000/users/" + config.signin.name;
        const primaryKey = "abc";

        await Utils.mock(page, {
            [`/service/sid/users/${config.signin.id}?`]: {
                id,
                "type": "Microsoft.ApiManagement/service/users",
                "name": config.signin.name,
                "properties": {
                    "firstName": confirmedUser.firstName,
                    "lastName": confirmedUser.lastName,
                    "email": confirmedUser.email,
                    "state": "active",
                    "identities": [
                        {
                            "provider": "Basic",
                            "id": config.signin.id,
                        }
                    ]
                }
            },
            [`/service/sid/users/${config.signin.id}/subscriptions?`]: {
                "value": [
                    {
                        "id": id + "/subscriptions/1",
                        "type": "Microsoft.ApiManagement/service/users/subscriptions",
                        "name": "1",
                        "properties": {
                            "ownerId": id,
                            "scope": "/subscriptions/000/resourceGroups/000/providers/Microsoft.ApiManagement/service/000/products/starter",
                            "displayName": "test",
                            "state": "active",
                            "createdDate": "2022-06-03T18:10:16.423Z",
                            "startDate": "2022-06-03T00:00:00Z",
                            "expirationDate": "2022-06-18T00:00:00Z",
                            "endDate": null,
                            "notificationDate": "2022-06-06T00:00:00Z",
                            "stateComment": null
                        }
                    }
                ],
                "count": 1
            },
            "/products/starter?": {
                "id": "/subscriptions/000/resourceGroups/000/providers/Microsoft.ApiManagement/service/000/products/starter",
                "type": "Microsoft.ApiManagement/service/products",
                "name": "starter",
                "properties": {
                    "displayName": "Starter",
                    "description": "Subscribers will be able to run 5 calls/minute up to a maximum of 100 calls/week.",
                    "terms": "",
                    "subscriptionRequired": true,
                    "approvalRequired": false,
                    "subscriptionsLimit": 1,
                    "state": "published"
                }
            },
            "/listSecrets?": {
                primaryKey,
                "secondaryKey": "123",
            },
        });

        await signIn(page, confirmedUser);
        expect(page.url()).to.equal(config.urls.home);

        await page.goto(config.urls.profile);

        const profileWidget = new ProfileWidget(page);
        await profileWidget.profile();

        // await new Promise(resolve => setTimeout(resolve, 50000000)); // just long wait

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