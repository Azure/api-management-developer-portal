import { describe, it } from "mocha";
import { MapiClient } from "../clients";
import { MockHttpClient } from "./../../tests/mocks";
import { assert } from "chai";
import { stub } from "sinon";
import { Utils } from "../utils";
import * as Constants from "./../constants";
import { StaticSettingsProvider } from "./../configuration/staticSettingsProvider";
import { ArmService } from "../services/armService";
import { SelfHostedArmAuthenticator } from "./../authentication/armAuthenticator";
import { NoRetryStrategy } from "./retryStrategy/noRetryStrategy";
import { ConsoleLogger } from "@paperbits/common/logging";
import { HttpClient, HttpResponse } from "@paperbits/common/http";
import { StaticAuthenticator } from "../authentication/staticAuthenticator";
import { DefaultSessionManager } from "@paperbits/common/persistence/defaultSessionManager";

interface Validity {
    isValid: boolean;
}

describe("Mapi Client", async () => {

    global.sessionStorage = {
        _values: new Map<string, string>(),
        get length() {return this._values.size},
        key: (index: number) => { return null; },
        getItem: (key: string) => { return global.sessionStorage._values.get(key); },
        setItem: (key: string, value: string) => { global.sessionStorage._values.set(key, value); },
        removeItem: (key: string) => { global.sessionStorage._values.delete(key); },
        clear: () => { global.sessionStorage._values.clear(); }
    }

    const userAdminToken = {
        "value": createMockToken()
    };

    const serviceDescriptor = {
        "properties": {
            "developerPortalUrl": "https://test-service.developer.azure-api.net",
            "dataApiUrl": null,
            "managementApiUrl": "https://test-service.management.azure-api.net"
        },
        "sku": {
            "name": "Developer",
            "capacity": 1
        },
        "id": "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/test-rg/providers/Microsoft.ApiManagement/service/test-service",
        "name": "test-service",
        "type": "Microsoft.ApiManagement/service"
    };

    const armAuthSettings = {
        "armEndpoint": "management.azure.com",
        "subscriptionId": "00000000-0000-0000-0000-000000000000",
        "resourceGroupName": "test-rg",
        "serviceName": "test-service"
    };
    const settingsProvider = new StaticSettingsProvider(armAuthSettings);

    const managementApiUrl = "https://management.azure.com/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/test-rg/providers/Microsoft.ApiManagement/service/test-service";
    const userMapiUrl = `${managementApiUrl}/users/${Constants.adminUserId}/token?api-version=${Constants.managementApiVersion}`
    const serviceUrl = `${managementApiUrl}?api-version=${Constants.managementApiVersion}`

    sessionStorage.setItem("armAccessToken", createMockToken());
    const authenticator = new SelfHostedArmAuthenticator();

    it("setBaseUrl - Initialized with full ARM url", async () => {

        //arrange
        const httpClient = new MockHttpClient();
        const sessionManager = new DefaultSessionManager();
        const armService = new ArmService(httpClient, authenticator, sessionManager, new ConsoleLogger());

        httpClient.mock()
            .post(userMapiUrl)
            .reply(200, userAdminToken);
        httpClient.mock()
            .get(serviceUrl)
            .reply(200, serviceDescriptor);

        await armService.loadSessionSettings(settingsProvider);

        const path = "isValid";
        const settings = await settingsProvider.getSettings<object>();
        const mockUrl = `${settings[Constants.SettingNames.managementApiUrl]}/${path}`
        httpClient.mock()
            .get(mockUrl)
            .reply(200, {
                isValid: true
            } as Validity);

        const apiClient = new MapiClient(armService, httpClient, authenticator, settingsProvider, new NoRetryStrategy(), new ConsoleLogger());

        //act
        const result = await apiClient.get<Validity>(path);

        //assert
        assert.isTrue(result.isValid);
    });

    it("Mapi client should never prefix user using header & token", async () => {

        //arrange
        const httpClient = new MockHttpClient();
        const sessionManager = new DefaultSessionManager();
        const path = "isValid";

        const armService = new ArmService(httpClient, authenticator, sessionManager, new ConsoleLogger());
        httpClient.mock()
            .post(userMapiUrl)
            .reply(200, userAdminToken);
        httpClient.mock()
            .get(serviceUrl)
            .reply(200, serviceDescriptor);

        await armService.loadSessionSettings(settingsProvider);

        const settings = await settingsProvider.getSettings();
        const mockUrl = `${settings[Constants.SettingNames.managementApiUrl]}/${path}`
        httpClient.mock()
            .get(mockUrl)
            .reply(200, {
                isValid: true
            } as Validity);

        const apiClient = new MapiClient(armService, httpClient, authenticator, settingsProvider, new NoRetryStrategy(), new ConsoleLogger());

        //act
        const result = await apiClient.get<Validity>(path, [Utils.getIsUserResourceHeader()]);

        //assert
        assert.isTrue(result.isValid);
    });

    describe("Send method", async () => {
        const httpClient = new MockHttpClient();
        const sessionManager = new DefaultSessionManager();
        const armService = new ArmService(httpClient, authenticator, sessionManager, new ConsoleLogger());
        httpClient.mock()
            .post(userMapiUrl)
            .reply(200, userAdminToken);
        httpClient.mock()
            .get(serviceUrl)
            .reply(200, serviceDescriptor);

        const testsData = [
            { httpMethod: "GET", body: undefined },
            { httpMethod: "POST", body: { name: "test" } }
        ];
        testsData.forEach(testData => {
            it(`Should return the response from the ${testData.httpMethod} send method`, async () => {
                const httpMethod = testData.httpMethod;

                const response = <HttpResponse<any>><any>{
                    statusCode: 200,
                    headers: [],
                    body: { message: "Success" }
                };
                const httpClient: HttpClient = <any>{
                    send: async () => { return response; }
                };
                const authenticator = new StaticAuthenticator();

                const settings = await settingsProvider.getSettings();

                const url = "/users";
                const mockUrl = `${settings[Constants.SettingNames.managementApiUrl]}${url}?api-version=${Constants.managementApiVersion}`;
                const apiClient = new MapiClient(armService, httpClient, authenticator, settingsProvider, new NoRetryStrategy(), new ConsoleLogger());

                const sendStub = stub(httpClient, "send").resolves(response);

                const result = await apiClient.send(url, httpMethod, undefined, testData.body);

                assert.deepEqual(result, response);
                assert.isTrue(sendStub.calledOnce);
                assert.equal(sendStub.args[0][0].url, mockUrl);
                assert.equal(sendStub.args[0][0].method, httpMethod);
                assert.isDefined(sendStub.args[0][0].headers);
                if (testData.body) {
                    assert.deepEqual(sendStub.args[0][0].body, testData.body);
                }
            });
        });
    });

    function createMockToken() {
        return "SharedAccessSignature" + "1" + "&" + "220001010000" + "&" + "0".repeat(10) + "==";
    }
});