import { expect } from "chai";
import { ArmService } from "./armService";
import { MockHttpClient } from "../../tests/mocks";
import { ConsoleLogger } from "@paperbits/common/logging";
import { ISettingsProvider } from "@paperbits/common/configuration";
import { DefaultSessionManager } from "@paperbits/common/persistence/defaultSessionManager";

describe("ArmService", () => {
  let service: ArmService;

  beforeEach(() => {
    const httpClient = new MockHttpClient();
    service = new ArmService(httpClient, null, new DefaultSessionManager(), new ConsoleLogger());
  });

  it("should return the correct tenant ARM URI", async () => {
    // Arrange
    const settingsProviderMock: ISettingsProvider = <any>{
      // Implement the necessary methods for the settings provider
      getSetting: async (settingName: string) => {
        switch (settingName) {
          case "subscriptionId":
            return "test_subscriptionId";
          case "resourceGroupName":
            return "test_resourceGroupName";
          case "serviceName":
            return "test_serviceName";
          case "authTenantId":
            return "test_authTenantId";
          default:
            throw new Error(`Unknown setting name: ${settingName}`);
        }
      }
    };

    global.location = <any>{ href: "https://contoso.com" };
    global.sessionStorage = <any>{
        getItem: () => null,
        setItem: (key, val) => {console.log(`Set ${key} to ${val}`); }
    };

    // Act
    const result = await service.getTenantArmUriAsync(settingsProviderMock);

    // Assert
    expect(result).to.equal("/subscriptions/test_subscriptionId/resourceGroups/test_resourceGroupName/providers/Microsoft.ApiManagement/service/test_serviceName");
  });

  it("should throw an error if required service parameters are not provided", async () => {
    // Arrange
    const settingsProviderMock: ISettingsProvider = <any>{
      // Implement the necessary methods for the settings provider
      getSetting: async (settingName: string) => null // Return null for all settings to simulate missing parameters
    };

    global.location = <any>{ href: "https://contoso.com" };
    global.sessionStorage = <any>{
        getItem: () => null,
        setItem: (key, val) => {console.log(`Set ${key} to ${val}`); }
    };

    // Act and Assert
    try {
        await service.getTenantArmUriAsync(settingsProviderMock);
        expect.fail("Expected an error to be thrown");
    } catch(error) {
        expect(error.message).to.equal("Required service parameters (like subscription, resource group, service name) were not provided to start editor");
    }
  });
});