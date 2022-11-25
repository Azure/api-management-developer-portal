/**
 * If '--mock' param is present in process.argv, intercepts and mocks API calls.
 *
 * @param page puppeteer Page obj
 * @param urls pairs of URLs and JSON/string body response
 */
import { Page } from "puppeteer";
import { Utils as SrcUtils } from "../../../src/utils";
import { Utils } from "../../utils";
import { User } from "../../mocks";

type Mocks = Record<string, Record<string, any> | string>

export async function mock(page: Page, urls: Mocks): Promise<void> {
    const mock = process.argv.includes("--mock");
    if (mock) return mockPure(page, urls);
}

export async function mockPure(page: Page, urls: Mocks): Promise<void> {
    await page.setRequestInterception(true);
    page.on('request', request => {
        const found = Object.entries(urls).find(([url, body]) => {
            if (!SrcUtils.getRelativeUrl(request.url()).includes(SrcUtils.getRelativeUrl(url))) return false;

            //console.log("MOCK", SrcUtils.getRelativeUrl(request.url()));

            if (request.isInterceptResolutionHandled()) return;
            request.respond({
                status: 200,
                contentType: 'application/json',
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "*",
                    "Access-Control-Expose-Headers": "*",
                    "Date": new Date(),
                    "Ocp-Apim-Sas-Token": 'token="foo-bar&299910242302&aaaaaaaaaaaaaaaaa/aaaaaaaaaaaaaaaaaa/aaaaaaaaaaaaa/aaaaaaaaaaaaaaaaaaaaa/aaaaaaaaaaaaa==",refresh="true"',
                },
                body: typeof body === "string" ? body : JSON.stringify(body),
            }, 1);
            return true;
        })

        if (!found) {
            //console.log("pass", SrcUtils.getRelativeUrl(request.url()));
            if (request.isInterceptResolutionHandled()) return;
            request.continue(undefined, 0);
        }
    });
}

async function setupMocks(page: Page, config: any, confirmedUserProp?: User, additionalMocks: Mocks = {}): Promise<void> {
    const id = "/subscriptions/000/resourceGroups/000/providers/Microsoft.ApiManagement/service/000/users/" + config.signin.name;
    const confirmedUser = confirmedUserProp ?? await Utils.getConfirmedUserBasic();

    return mock(page, {
        "/sso-refresh": "OK",
        "/identity?": {
            id: config.signin.id
        },
        "/service/sid/users?": {},
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
        ...additionalMocks,
    })
}

export default setupMocks
