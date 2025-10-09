import { describe, it } from "mocha";
import { MapiClient } from "../clients";
import { MockHttpClient } from "./../../tests/mocks";
import { assert } from "chai";
import { stub } from "sinon";
import { Utils } from "../utils";
import * as Constants from "./../constants";
import { StaticSettingsProvider } from "../configuration/staticSettingsProvider";
import { AzureResourceManagementService } from "../services/armService";
import { ArmAuthenticator } from "../authentication/armAuthenticator";
import { NoRetryStrategy } from "./retryStrategy/noRetryStrategy";
import { ConsoleLogger } from "@paperbits/common/logging";
import { HttpClient, HttpResponse } from "@paperbits/common/http";
import { StaticAuthenticator } from "../authentication/staticAuthenticator";

interface Validity {
    isValid: boolean;
}

describe("Mapi Client", async () => {

    global.sessionStorage = {
        _values: new Map<string, string>(),
        length: global.sessionStorage._values.size,
        key: (index: number) => { return null; },
        getItem: (key: string) => { return global.sessionStorage._values.get(key); },
        setItem: (key: string, value: string) => { global.sessionStorage._values.set(key, value); },
        removeItem: (key: string) => { global.sessionStorage._values.delete(key); },
        clear: () => { global.sessionStorage._values.clear(); }
    }

    const settingsProvider = new StaticSettingsProvider({
        managementApiUrl: "https://contoso.management.azure-api.net",
        backendUrl: "https://contoso.developer.azure-api.net",
        managementApiAccessToken: createMockToken()
    });

    const authenticator = new ArmAuthenticator(new ConsoleLogger());

    authenticator.setEditorSettings({
        armEndpoint: "management.azure.com",
        clientId: "a962e1ed-5694-4abe-9e9b-d08d35877efc",
        tenantId: "https://login.windows.net/72f988bf-86f1-41af-91ab-2d7cd011db47"
    });

    it("setBaseUrl - Appends /mapi", async () => {
        //arrange
        const httpClient = new MockHttpClient();
        const settings = await settingsProvider.getSettings<object>();
        const armService = new AzureResourceManagementService(httpClient, authenticator, new ConsoleLogger());
        const path = "isValid";
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


    it("Localhost calls - replace https to http", async () => {
        //arrange
        const publisherSettingsProvider = new StaticSettingsProvider({
            backendUrl: "http://localhost:10000",
            managementApiAccessToken: createMockToken()
        });

        const httpClient = new MockHttpClient();
        const armService = new AzureResourceManagementService(httpClient, authenticator, new ConsoleLogger());

        const baseHost = "http://localhost:10000"
        const basePath = "/0/isValid";
        const expectedPath = "/mapi" + basePath;
        const expectedNextLinkPath = "/mapi/1/isValid"

        httpClient.mock()
            .get(baseHost + expectedPath)
            .reply(200, {
                value: [{
                    isValid: true,
                }],
                nextLink: "https://localhost:10000" + expectedNextLinkPath
            });

        httpClient.mock()
            .get(baseHost + expectedNextLinkPath)
            .reply(200, {
                value: [{
                    isValid: true,
                }],
                nextLink: null
            });

        const apiClient = new MapiClient(armService, httpClient, authenticator, publisherSettingsProvider, new NoRetryStrategy(), new ConsoleLogger());

        //act
        const result = await apiClient.getAll<Validity>(basePath, []);

        //assert
        assert.equal(result.length, 2);
        assert.isTrue(result[0].isValid);
        assert.isTrue(result[1].isValid);
    });

    it("Mapi client should never prefix user using header & token", async () => {

        //arrange
        const httpClient = new MockHttpClient();
        const settings = await settingsProvider.getSettings();
        const path = "isValid";
        const armService = new AzureResourceManagementService(httpClient, authenticator, new ConsoleLogger());
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
        const testsData = [
            { httpMethod: 'GET', body: undefined },
            { httpMethod: 'POST', body: { name: 'test' } }
        ];
        testsData.forEach(testData => {
            it(`Should return the response from the ${testData.httpMethod} send method`, async () => {
                const httpMethod = testData.httpMethod;

                const response = <HttpResponse<any>><any>{
                    statusCode: 200,
                    headers: [],
                    body: { message: 'Success' }
                };
                const httpClient: HttpClient = <any>{
                    send: async () => { }
                };
                const authenticator = new StaticAuthenticator();
                const settingsProviderMock = new StaticSettingsProvider({
                    backendUrl: "https://contoso.developer.azure-api.net",
                    managementApiAccessToken: "SharedAccessSignature integration&220001010000&000000000000000000000000000=="
                });

                const settings = await settingsProviderMock.getSettings();

                const url = "/users";
                const mockUrl = `${Utils.getBaseUrlWithMapiSuffix(settings[Constants.SettingNames.backendUrl])}${url}?api-version=${Constants.managementApiVersion}`;
                const apiClient = new MapiClient(undefined, httpClient, authenticator, settingsProviderMock, new NoRetryStrategy(), new ConsoleLogger());

                const sendStub = stub(httpClient, 'send').resolves(response);

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