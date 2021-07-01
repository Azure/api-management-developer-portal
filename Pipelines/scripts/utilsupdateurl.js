const fs = require("fs");
const path = require("path");
const https = require("https");
const { execSync } = require("child_process");
const { BlobServiceClient } = require("@azure/storage-blob");
const blobStorageContainer = "content";
const mime = require("mime-types");
const { count } = require("console");
const apiVersion = "2019-01-01"; // "2021-01-01-preview"; 
const managementApiEndpoint = "management.azure.com";


class HttpClient {
    constructor(subscriptionId, resourceGroupName, serviceName, tenantid, serviceprincipal, secret) {
        this.subscriptionId = subscriptionId;
        this.resourceGroupName = resourceGroupName;
        this.serviceName = serviceName;
        this.baseUrl = `https://${managementApiEndpoint}/subscriptions/${subscriptionId}/resourceGroups/${resourceGroupName}/providers/Microsoft.ApiManagement/service/${serviceName}`;
        this.accessToken = this.getAccessToken(tenantid, serviceprincipal, secret);
    }

    /**
     * A wrapper for making a request and returning its response body.
     * @param {string} method Http method, e.g. GET.
     * @param {string} url Relative resource URL, e.g. /contentTypes.
     * @param {string} body Request body.
    */
    async sendRequest(method, url, body) {
        let requestUrl;
        let requestBody;

        if (url.startsWith("https://")) {
            requestUrl = new URL(url);
        }
        else {
            const normalizedUrl = url.startsWith("/") ? url : `/${url}`;
            requestUrl = new URL(this.baseUrl + normalizedUrl);
        }

        if (!requestUrl.searchParams.has("api-version")) {
            requestUrl.searchParams.append("api-version", apiVersion);
        }

        const headers = {
            "If-Match": "*",
            "Content-Type": "application/json",
            "Authorization": this.accessToken
        };

        if (body) {
            if (!body.properties) {
                body = {
                    properties: body
                }
            }
            requestBody = JSON.stringify(body);
            headers["Content-Length"] = Buffer.byteLength(requestBody);
        }

        const options = {
            port: 443,
            method: method,
            headers: headers
        };

        return new Promise((resolve, reject) => {
            const req = https.request(requestUrl.toString(), options, (resp) => {
                let data = '';

                resp.on('data', (chunk) => {
                    data += chunk;
                });

                resp.on('end', () => {
                    switch (resp.statusCode) {
                        case 200:
                        case 201:
                            data.startsWith("{") ? resolve(JSON.parse(data)) : resolve(data);
                            break;
                        case 404:
                            reject({ code: "NotFound", message: `Resource not found: ${requestUrl}` });
                            break;
                        case 401:
                            reject({ code: "Unauthorized", message: `Unauthorized. Make sure you're logged-in with "az login" command before running the script.` });
                            break;
                        case 403:
                            reject({ code: "Forbidden", message: `Looks like you are not allowed to perform this operation. Please check with your administrator.` });
                            break;
                        default:
                            reject({ code: "UnhandledError", message: `Could not complete request to ${requestUrl}. Status: ${resp.statusCode} ${resp.statusMessage}` });
                    }
                });
            });

            req.on('error', (e) => {
                reject(e);
            });

            if (requestBody) {
                req.write(requestBody);
            }

            req.end();
        });
    }

    getAccessToken(tenantid, serviceprincipal, secret) {

        if (tenantid != "" && tenantid != null) {
            execSync(`az login --service-principal --username ` + serviceprincipal + ` --password ` + secret + ` --tenant ` + tenantid);
        }

        const accessToken = execSync(`az account get-access-token --resource-type arm --output tsv --query accessToken`).toString().trim();
        return `Bearer ${accessToken}`;
    }
}
class UpdateUrl {
    constructor(subscriptionId, resourceGroupName, serviceName, tenantid, serviceprincipal, secret, snapshotFolder = "../dist/snapshot") {
        this.httpClient = new HttpClient(subscriptionId, resourceGroupName, serviceName, tenantid, serviceprincipal, secret);
        this.snapshotFolder = snapshotFolder
    }


    /**
     * Returns list of content types.
     */
    async getContentTypes() {
        try {
            const data = await this.httpClient.sendRequest("GET", `/contentTypes`);
            const contentTypes = data.value.map(x => x.id.replace("\/contentTypes\/", ""));

            return contentTypes;
        }
        catch (error) {
            throw new Error(`Unable to fetch content types. ${error.message}`);
        }
    }

    /**
     * Returns list of content items of specified content type.
     * @param {string} contentType Content type, e.g. "page".
     */
    async getContentItems(contentType) {
        try {
            const contentItems = [];
            let nextPageUrl = `/contentTypes/${contentType}/contentItems`;

            do {
                const data = await this.httpClient.sendRequest("GET", nextPageUrl);
                contentItems.push(...data.value);

                if (data.value.length > 0 && data.nextLink) {
                    nextPageUrl = data.nextLink;
                }
                else {
                    nextPageUrl = null;
                }
            }
            while (nextPageUrl)

            return contentItems;
        }
        catch (error) {
            throw new Error(`Unable to fetch content items. ${error.message}`);
        }
    }


    /**
     * Captures the content of specified API Management service into snapshot.
     */
    async updateContentUrl(existingUrls, replaceableUrls) {
        try {
            const contentItems = await this.getContentItems("url");

            console.log("urls found in portal: " + contentItems.length);

            for (const contentItem of contentItems) {
                var count = 0;
                console.log("url found in portal: " + contentItem.properties.permalink);

                for (const existingUrl of existingUrls) {
                    if (contentItem.properties.permalink == existingUrl) {
                        contentItem.properties.permalink = replaceableUrls[count];
                        contentItem.properties.title = replaceableUrls[count];
                        console.log("updating url content..." + contentItem.properties.permalink);
                        console.log(" updated url content : " + JSON.stringify(contentItem));
                        const response = await this.httpClient.sendRequest("PUT", contentItem.id + "?api-version=2019-12-01", contentItem);

                        console.log(" resp: " + JSON.stringify(response));
                    }
                    count++;
                };
            };

        }
        catch (error) {
            throw new Error(`Unable to update url content. ${error.message}`);
        }
    }

}

module.exports = {
    UpdateUrl
};
