import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";
import { SettingNames } from "../constants";

function readConfigFile(): object {
    const configFilePath = path.resolve(__dirname, "./config.json");

    try {
        return JSON.parse(fs.readFileSync(configFilePath, "utf8").toString());
    }
    catch (error) {
        throw new Error(`Unable to find or parse configuration file.`);
    } 
}

export function useMapiConfiguration(): object {
    const configuration = readConfigFile();
    const managementApiUrl = configuration[SettingNames.managementApiUrl];
    const managementApiAccessToken = configuration[SettingNames.managementApiAccessToken];

    if (!managementApiUrl) {
        console.error(`Setting "${SettingNames.managementApiUrl}" is missing. Please check config.publish.json file.`);
        return null;
    }

    if (!managementApiAccessToken) {
        console.error(`Setting "${SettingNames.managementApiAccessToken}" is missing. Please check config.publish.json file.`);
        return null;
    }

    return configuration;
}

export function useArmConfiguration(): object {
    const configuration = readConfigFile();
    const subscriptionId = configuration[SettingNames.subscriptionId];
    const resourceGroupName = configuration[SettingNames.resourceGroupName];
    const serviceName = configuration[SettingNames.serviceName];
    const armEndpoint = configuration[SettingNames.armEndpoint] || "management.azure.com";

    if (!subscriptionId) {
        console.error(`Setting "${SettingNames.subscriptionId}" is missing. Please check config.publish.json file.`);
        return null;
    }

    if (!resourceGroupName) {
        console.error(`Setting "${SettingNames.resourceGroupName}" is missing. Please check config.publish.json file.`);
        return null;
    }

    if (!serviceName) {
        console.error(`Setting "${SettingNames.serviceName}" is missing. Please check config.publish.json file.`);
        return null;
    }

    try {
        const accessToken = execSync(`az account get-access-token --resource-type arm --output tsv --query accessToken`).toString().trim();
        configuration[SettingNames.managementApiUrl] = `https://${armEndpoint}/subscriptions/${subscriptionId}/resourceGroups/${resourceGroupName}/providers/Microsoft.ApiManagement/service/${serviceName}`;
        configuration[SettingNames.managementApiAccessToken] = `Bearer ${accessToken}`;
    }
    catch (error) {
        console.error(`Unable to get access token. Please authenticate using "az login" command and ensure you have access to the specified service.`);
        return null;
    }

    return configuration;
}
