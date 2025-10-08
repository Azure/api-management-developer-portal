import { describe, it } from "mocha";
import { DataApiClient, MapiClient } from "../clients";
import { MockHttpClient } from "./../../tests/mocks";
import { StaticAuthenticator } from "../authentication/staticAuthenticator";
import { StaticSettingsProvider } from "./../configuration/staticSettingsProvider";
import { assert } from "chai";
import { stub } from "sinon";
import { Utils } from "../utils";
import * as Constants from "./../constants";
import { AccessToken } from "../authentication";
import { ConsoleLogger } from "@paperbits/common/logging";
import { NoRetryStrategy } from "./retryStrategy/noRetryStrategy";
import { HttpClient, HttpRequest, HttpResponse } from "@paperbits/common/http";

interface Validity {
    isValid: boolean;
}

describe("Data API Client", async () => {

    const settingsProvider = new StaticSettingsProvider({
        backendUrl: "https://contoso.developer.azure-api.net",
        managementApiAccessToken: "SharedAccessSignature 1&220001010000&000000000000000000000000000=="
    });

    it("setBaseUrl - Appends /developer", async () => {

        //arrange
        const httpClient = new MockHttpClient();
        const authenticator = new StaticAuthenticator();
        const settings = await settingsProvider.getSettings<object>();
        const path = "isValid"
        const mockUrl = `${Utils.getDataApiUrl(settings)}/${path}`
        httpClient.mock()
            .get(mockUrl)
            .reply(200, {
                isValid: true
            } as Validity);

        const apiClient = new DataApiClient(httpClient, authenticator, settingsProvider, new NoRetryStrategy(), new ConsoleLogger());

        //act
        const result = await apiClient.get<Validity>(path);

        //assert
        assert.isTrue(result.isValid);
    });

    it("Makes auth requests when logged in & if it is user resource", async () => {

        //arrange
        const httpClient = new MockHttpClient();
        const authenticator = new StaticAuthenticator();
        const settings = await settingsProvider.getSettings<object>();
        authenticator.setAccessToken(AccessToken.parse(settings[Constants.SettingNames.managementApiAccessToken]));

        const mainPath = "/isValid"
        const path = `/users/${(await authenticator.getAccessToken()).userId}${mainPath}`

        const mockUrlWithUser = `${Utils.getDataApiUrl(settings)}${path}`
        const mockUrl = `${Utils.getDataApiUrl(settings)}${mainPath}`

        httpClient.mock()
            .get(mockUrlWithUser)
            .reply(200, {
                isValid: true
            } as Validity);
        httpClient.mock()
            .get(mockUrl)
            .reply(200, {
                isValid: false
            } as Validity);

        const apiClient = new DataApiClient(httpClient, authenticator, settingsProvider, new NoRetryStrategy(), new ConsoleLogger());

        //act
        const resultWithUser = await apiClient.get<Validity>(mainPath, [Utils.getIsUserResourceHeader()]);
        const result = await apiClient.get<Validity>(mainPath);

        //assert
        assert.isTrue(resultWithUser.isValid);
        assert.isFalse(result.isValid);
    });


    it("Makes guest requests when not logged in", async () => {

        //arrange
        const httpClient = new MockHttpClient();
        const authenticator = new StaticAuthenticator();
        const settingsProviderMock = new StaticSettingsProvider({
            backendUrl: "https://contoso.developer.azure-api.net"
        });
        const settings = await settingsProviderMock.getSettings<object>();

        const mainPath = "/isValid"
        const mockUrl = `${Utils.getDataApiUrl(settings)}${mainPath}`

        httpClient.mock()
            .get(mockUrl)
            .reply(200, {
                isValid: true
            } as Validity);

        const apiClient = new DataApiClient(httpClient, authenticator, settingsProviderMock, new NoRetryStrategy(), new ConsoleLogger());

        //act
        const resultWithUserResourceHeader = await apiClient.get<Validity>(mainPath, [Utils.getIsUserResourceHeader()]);
        const result = await apiClient.get<Validity>(mainPath);

        //assert
        assert.isTrue(resultWithUserResourceHeader.isValid);
        assert.isTrue(result.isValid);
    });

    it("Makes guest requests when integration token used", async () => {

        //arrange
        const httpClient = new MockHttpClient();
        const authenticator = new StaticAuthenticator();
        const settingsProviderMock = new StaticSettingsProvider({
            backendUrl: "https://contoso.developer.azure-api.net",
            managementApiAccessToken: "SharedAccessSignature integration&220001010000&000000000000000000000000000=="
        });
        const settings = await settingsProviderMock.getSettings<object>();

        const mainPath = "/isValid"
        const mockUrl = `${Utils.getDataApiUrl(settings)}${mainPath}`

        httpClient.mock()
            .get(mockUrl)
            .reply(200, {
                isValid: true
            } as Validity);

        const apiClient = new DataApiClient(httpClient, authenticator, settingsProviderMock, new NoRetryStrategy(), new ConsoleLogger());

        //act
        const resultWithUserResourceHeader = await apiClient.get<Validity>(mainPath, [Utils.getIsUserResourceHeader()]);
        const result = await apiClient.get<Validity>(mainPath);

        //assert
        assert.isTrue(resultWithUserResourceHeader.isValid);
        assert.isTrue(result.isValid);
    });

    it("Throws correct error when receiving ValidationError with stringified response", async () => {
        // arrange
        const httpClient = new MockHttpClient();
        const authenticator = new StaticAuthenticator();
        const settingsProviderMock = new StaticSettingsProvider({
            backendUrl: "https://contoso.developer.azure-api.net",
            managementApiAccessToken: "SharedAccessSignature integration&220001010000&000000000000000000000000000=="
        });

        const settings = await settingsProviderMock.getSettings();

        const mainPath = "/users";
        const mockUrl = `${Utils.getDataApiUrl(settings[Constants.SettingNames.backendUrl])}${mainPath}`;

        const response = {
            "code": "BadRequest",
            "message": "{\"error\":{\"code\":\"ValidationError\",\"message\":\"One or more fields contain incorrect values:\",\"details\":[{\"code\":\"ValidationError\",\"target\":\"password\",\"message\":\"Passwords must have at least 8 characters and contain at least two of the following: uppercase letters, lowercase letters, numbers, and symbols\"}]}}"
        };

        httpClient.mock()
            .post(mockUrl)
            .reply(400, response);


        const apiClient = new DataApiClient(httpClient, authenticator, settingsProviderMock, new NoRetryStrategy(), new ConsoleLogger());

        // act
        try {
            await apiClient.post(mainPath);
        } catch (error) {
            // assert
            assert.equal(error.message, "One or more fields contain incorrect values:");
            assert.equal(error.details.length, 1);
            assert.equal(error.details[0].message, "Passwords must have at least 8 characters and contain at least two of the following: uppercase letters, lowercase letters, numbers, and symbols");
            return;
        }
    });

    it("Throws correct error when receiving ValidationError with object response", async () => {
        // arrange
        const httpClient = new MockHttpClient();
        const authenticator = new StaticAuthenticator();
        const settingsProviderMock = new StaticSettingsProvider({
            backendUrl: "https://contoso.developer.azure-api.net",
            managementApiAccessToken: "SharedAccessSignature integration&220001010000&000000000000000000000000000=="
        });

        const settings = await settingsProviderMock.getSettings();

        const mainPath = "/users";
        const mockUrl = `${Utils.getDataApiUrl(settings[Constants.SettingNames.backendUrl])}${mainPath}`;

        const response = {
            "error": {
                "code": "ValidationError",
                "message": "One or more fields contain incorrect values:",
                "details": [
                    {
                        "code": "ValidationError",
                        "target": "password",
                        "message": "Passwords must have at least 8 characters and contain at least two of the following: uppercase letters, lowercase letters, numbers, and symbols"
                    }
                ]
            }
        };

        httpClient.mock()
            .post(mockUrl)
            .reply(400, response);


        const apiClient = new DataApiClient(httpClient, authenticator, settingsProviderMock, new NoRetryStrategy(), new ConsoleLogger());

        // act
        try {
            await apiClient.post(mainPath);
        } catch (error) {
            // assert
            assert.equal(error.message, "One or more fields contain incorrect values:");
            assert.equal(error.details.length, 1);
            assert.equal(error.details[0].message, "Passwords must have at least 8 characters and contain at least two of the following: uppercase letters, lowercase letters, numbers, and symbols");
            return;
        }
    });

    describe("Send method", async () => {
        const testsData = [
            { httpMethod: 'GET', body: undefined },
            { httpMethod: 'POST', body: { name: 'test' } }
        ];

        testsData.forEach(testData => {
            it(`Should return the response from the send ${testData.httpMethod} method`, async () => {
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

                const settings = await settingsProviderMock.getSettings<object>();

                const url = "/users";
                const mockUrl = `${Utils.getDataApiUrl(settings)}${url}?api-version=${Constants.dataApiVersion}`;
                const apiClient = new DataApiClient(httpClient, authenticator, settingsProviderMock, new NoRetryStrategy(), new ConsoleLogger());

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
});