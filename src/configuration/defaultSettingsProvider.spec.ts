import { DefaultSettingsProvider } from "./defaultSettingsProvider";
import { EventManager } from "@paperbits/common/events";
import { HttpClient } from "@paperbits/common/http";
import { expect } from "chai";
import { beforeEach, afterEach, describe, it } from "mocha";
import { stub, restore, SinonStub, createSandbox } from "sinon";

describe("DefaultSettingsProvider", () => {
    let settingsProvider: DefaultSettingsProvider;
    let mockHttpClient: Partial<HttpClient>;
    let mockEventManager: Partial<EventManager>;
    let httpSendStub: SinonStub;
    let eventAddListenerStub: SinonStub;
    let eventDispatchStub: SinonStub;
    let dateNowStub: SinonStub;
    let mockResponse: any;
    const configFileUri = "https://example.com/config.json";
    const mockConfigData = {
        apiUrl: "https://api.example.com",
        theme: "dark",
        timeout: 5000,
        features: {
            enableAnalytics: true,
            enableNotifications: false
        }
    };
    const sandbox = createSandbox();

    beforeEach(() => {
        // Create mock response object
        mockResponse = {
            toObject: sandbox.stub().returns(mockConfigData)
        };

        // Create stubs for HTTP client
        httpSendStub = sandbox.stub().resolves(mockResponse);
        mockHttpClient = {
            send: httpSendStub
        };

        // Create stubs for event manager
        eventAddListenerStub = sandbox.stub();
        eventDispatchStub = sandbox.stub();
        mockEventManager = {
            addEventListener: eventAddListenerStub,
            dispatchEvent: eventDispatchStub
        };

        // Create instance
        settingsProvider = new DefaultSettingsProvider(
            mockHttpClient as HttpClient,
            mockEventManager as EventManager,
            configFileUri,
            10 * 1000 // Set cache duration to 10 seconds for testing
        );
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe("getSettings", () => {
        it("should load settings from HTTP client on first call", async () => {
            const result = await settingsProvider.getSettings();

            expect(httpSendStub.calledWith({ url: configFileUri })).to.be.true;
            expect(mockResponse.toObject.called).to.be.true;
            expect(result).to.deep.equal(mockConfigData);
        });

        it("should cache settings and not reload on subsequent calls within cache duration", async () => {
            const mockNow = 1000000;
            dateNowStub = sandbox.stub(Date, 'now').returns(mockNow);

            // First call
            await settingsProvider.getSettings();
            expect(httpSendStub.callCount).to.equal(1);

            // Second call within cache duration (9 seconds later)
            dateNowStub.returns(mockNow + 9 * 1000);
            await settingsProvider.getSettings();

            expect(httpSendStub.callCount).to.equal(1); // Should still be 1
        });

        it("should reload settings when cache expires", async () => {
            const mockNow = 1000000;
            dateNowStub = sandbox.stub(Date, 'now').returns(mockNow);

            // First call
            await settingsProvider.getSettings();
            expect(httpSendStub.callCount).to.equal(1);

            // Second call after cache expiration (11 seconds later)
            dateNowStub.returns(mockNow + 11 * 1000);
            await settingsProvider.getSettings();

            expect(httpSendStub.callCount).to.equal(2);
        });

        it("should reload only specific settings when cache expires", async () => {
            const mockNow = 1000000;
            dateNowStub = sandbox.stub(Date, 'now').returns(mockNow);

            // First call
            await settingsProvider.setSetting("theme", "light");
            await settingsProvider.setSetting("testPersistent", true);
            const resultBeforeReload = await settingsProvider.getSettings();

            expect(resultBeforeReload["theme"]).to.equal("light");
            expect(resultBeforeReload["testPersistent"]).to.equal(true);
            expect(httpSendStub.callCount).to.equal(1);

            // Second call after cache expiration (11 seconds later)
            dateNowStub.returns(mockNow + 11 * 1000);
            const resultAfterReload = await settingsProvider.getSettings();

            expect(httpSendStub.callCount).to.equal(2);
            expect(resultAfterReload["theme"]).to.equal("dark");
            expect(resultAfterReload["testPersistent"]).to.equal(true);
        });

        it("should handle HTTP client errors", async () => {
            const error = new Error("Network error");
            httpSendStub.rejects(error);

            try {
                await settingsProvider.getSettings();
                expect.fail("Should have thrown an error");
            } catch (err) {
                expect(err.message).to.equal("Network error");
            }
        });

        it("should return the same promise for concurrent calls", async () => {
            const promise1 = settingsProvider.getSettings();
            const promise2 = settingsProvider.getSettings();

            expect(promise1).to.equal(promise2);

            const [result1, result2] = await Promise.all([promise1, promise2]);
            expect(result1).to.deep.equal(result2);
            expect(httpSendStub.callCount).to.equal(1);
        });
    });

    describe("getSetting", () => {
        it("should return specific setting value", async () => {
            const result = await settingsProvider.getSetting<string>("apiUrl");

            expect(result).to.equal("https://api.example.com");
            expect(httpSendStub.calledWith({ url: configFileUri })).to.be.true;
        });

        it("should return nested setting value", async () => {
            const result = await settingsProvider.getSetting<boolean>("features");

            expect(result).to.deep.equal(mockConfigData.features);
        });

        it("should return undefined for non-existent setting", async () => {
            const result = await settingsProvider.getSetting<string>("nonExistentSetting");

            expect(result).to.be.undefined;
        });

        it("should work with different data types", async () => {
            const stringResult = await settingsProvider.getSetting<string>("apiUrl");
            const numberResult = await settingsProvider.getSetting<number>("timeout");
            const objectResult = await settingsProvider.getSetting<object>("features");

            expect(typeof stringResult).to.equal("string");
            expect(typeof numberResult).to.equal("number");
            expect(typeof objectResult).to.equal("object");
            expect(stringResult).to.equal("https://api.example.com");
            expect(numberResult).to.equal(5000);
            expect(objectResult).to.deep.equal(mockConfigData.features);
        });
    });

    describe("setSetting", () => {
        it("should set a new setting value", async () => {
            await settingsProvider.setSetting("newSetting", "newValue");

            const result = await settingsProvider.getSetting<string>("newSetting");
            expect(result).to.equal("newValue");
        });

        it("should update an existing setting value", async () => {
            // First load the settings
            await settingsProvider.getSettings();

            // Update existing setting
            await settingsProvider.setSetting("apiUrl", "https://new-api.example.com");

            const result = await settingsProvider.getSetting<string>("apiUrl");
            expect(result).to.equal("https://new-api.example.com");
        });

        it("should dispatch setting change event", async () => {
            await settingsProvider.setSetting("testSetting", "testValue");

            expect(eventDispatchStub.calledWith("onSettingChange", {
                name: "testSetting",
                value: "testValue"
            })).to.be.true;
        });

        it("should load settings first if not already loaded", async () => {
            await settingsProvider.setSetting("newSetting", "value");

            expect(httpSendStub.calledWith({ url: configFileUri })).to.be.true;
            expect(eventDispatchStub.calledWith("onSettingChange", {
                name: "newSetting",
                value: "value"
            })).to.be.true;
        });
    });

    describe("onSettingChange", () => {
        it("should register event listener for setting changes", () => {
            const eventHandler = sandbox.stub();

            settingsProvider.onSettingChange("testSetting", eventHandler);

            expect(eventAddListenerStub.calledWith("onSettingChange")).to.be.true;
        });

        it("should call event handler when matching setting changes", () => {
            const eventHandler = sandbox.stub();
            let registeredHandler: Function;

            eventAddListenerStub.callsFake((eventName, handler) => {
                registeredHandler = handler;
            });

            settingsProvider.onSettingChange("testSetting", eventHandler);

            // Simulate event dispatch
            registeredHandler({ name: "testSetting", value: "newValue" });

            expect(eventHandler.calledWith("newValue")).to.be.true;
        });

        it("should not call event handler for different setting changes", () => {
            const eventHandler = sandbox.stub();
            let registeredHandler: Function;

            eventAddListenerStub.callsFake((eventName, handler) => {
                registeredHandler = handler;
            });

            settingsProvider.onSettingChange("testSetting", eventHandler);

            // Simulate event dispatch for different setting
            registeredHandler({ name: "differentSetting", value: "newValue" });

            expect(eventHandler.called).to.be.false;
        });
    });

    describe("caching behavior", () => {
        it("should have 10 second cache duration", async () => {
            const mockNow = 1000000;
            dateNowStub = sandbox.stub(Date, 'now').returns(mockNow);

            // First call
            await settingsProvider.getSettings();

            // Call just before cache expiration (9.9 seconds)
            dateNowStub.returns(mockNow + (10 * 1000) - 100);
            await settingsProvider.getSettings();
            expect(httpSendStub.callCount).to.equal(1);

            // Call just after cache expiration (10.1 seconds)
            dateNowStub.returns(mockNow + (10 * 1000) + 100);
            await settingsProvider.getSettings();
            expect(httpSendStub.callCount).to.equal(2);
        });

        it("should reload settings immediately if no previous load time exists", async () => {
            // This tests the isConfigurationExpired method when configurationLoadTime is not set
            const result = await settingsProvider.getSettings();

            expect(httpSendStub.callCount).to.equal(1);
            expect(result).to.deep.equal(mockConfigData);
        });
    });

    describe("error handling", () => {
        it("should handle malformed response from HTTP client", async () => {
            mockResponse.toObject.throws(new Error("Invalid JSON"));

            try {
                await settingsProvider.getSettings();
                expect.fail("Should have thrown an error");
            } catch (err) {
                expect(err.message).to.equal("Invalid JSON");
            }
        });

        it("should handle null response", async () => {
            httpSendStub.resolves(null);

            try {
                await settingsProvider.getSettings();
                expect.fail("Should have thrown an error");
            } catch (err) {
                expect(err).to.exist;
            }
        });
    });

    describe("integration scenarios", () => {
        it("should handle complete workflow: load, get, set, and listen for changes", async () => {
            const changeHandler = sandbox.stub();
            let registeredHandler: Function;

            eventAddListenerStub.callsFake((eventName, handler) => {
                registeredHandler = handler;
            });

            // Register for changes
            settingsProvider.onSettingChange("apiUrl", changeHandler);

            // Get initial setting
            const initialValue = await settingsProvider.getSetting<string>("apiUrl");
            expect(initialValue).to.equal("https://api.example.com");

            // Set new value
            await settingsProvider.setSetting("apiUrl", "https://updated-api.example.com");

            // Verify event was dispatched
            expect(eventDispatchStub.calledWith("onSettingChange", {
                name: "apiUrl",
                value: "https://updated-api.example.com"
            })).to.be.true;

            // Simulate event handling
            registeredHandler({ name: "apiUrl", value: "https://updated-api.example.com" });
            expect(changeHandler.calledWith("https://updated-api.example.com")).to.be.true;

            // Verify new value is returned
            const updatedValue = await settingsProvider.getSetting<string>("apiUrl");
            expect(updatedValue).to.equal("https://updated-api.example.com");
        });
    });
});
