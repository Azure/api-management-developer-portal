const fs = require("fs");
const path = require("path");
const https = require("https");
const { execSync } = require("child_process");
const { BlobServiceClient } = require("@azure/storage-blob");
const blobStorageContainer = "content";
const mime = require("mime-types");
const apiVersion = "2019-01-01"; // "2021-01-01-preview"; 
const managementApiEndpoint = "management.azure.com";


class HttpClient {
    constructor(subscriptionId, resourceGroupName, serviceName) {
        this.subscriptionId = subscriptionId;
        this.resourceGroupName = resourceGroupName;
        this.serviceName = serviceName;
        this.baseUrl = `https://${managementApiEndpoint}/subscriptions/${subscriptionId}/resourceGroups/${resourceGroupName}/providers/Microsoft.ApiManagement/service/${serviceName}`;
        this.accessToken = getAccessToken();
    }

    /**
     * A wrapper for making a request and returning its response body.
     * @param {string} method Http method, e.g. GET.
     * @param {string} url Relative resource URL, e.g. /contentTypes.
     * @param {string} accessToken Access token, e.g. Bearer eyJhbGciOi...
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
                    try {
                        if (data && data.startsWith("{")) {
                            resolve(JSON.parse(data));
                        }
                        else {
                            resolve(data);
                        }
                    }
                    catch (e) {
                        reject(e);
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
}

class ImporterExporter {
    constructor(httpClient, snapshotFolder = "../dist/snapshot") {
        this.httpClient = httpClient;
        this.snapshotFolder = snapshotFolder
    }

    listFilesInDirectory(dir) {
        const results = [];

        fs.readdirSync(dir).forEach((file) => {
            file = dir + "/" + file;
            const stat = fs.statSync(file);

            if (stat && stat.isDirectory()) {
                results.push(...this.listFilesInDirectory(file));
            } else {
                results.push(file);
            }
        });

        return results;
    }

    async getContentTypes() {
        const data = await this.httpClient.sendRequest("GET", `/contentTypes`);
        const contentTypes = data.value.map(x => x.id.replace("\/contentTypes\/", ""));
        return contentTypes;
    }

    async getContentItems(contentType) {
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

    async captureJson() {
        const result = {};
        const contentTypes = await this.getContentTypes();

        for (const contentType of contentTypes) {
            const contentItems = await this.getContentItems(contentType);

            contentItems.forEach(contentItem => {
                result[contentItem.id] = contentItem;
                delete contentItem.id;
            });
        }

        await fs.promises.mkdir(path.resolve(this.snapshotFolder), { recursive: true });

        fs.writeFileSync(`${this.snapshotFolder}/data.json`, JSON.stringify(result));
    }

    async downloadBlobs() {
        const snapshotMediaFolder = `./${this.snapshotFolder}/media`;
        const blobStorageUrl = await this.getStorageSasUrl();
        const blobServiceClient = new BlobServiceClient(blobStorageUrl.replace(`/${blobStorageContainer}`, ""));
        const containerClient = blobServiceClient.getContainerClient(blobStorageContainer);

        let blobs = containerClient.listBlobsFlat();

        for await (const blob of blobs) {
            const blockBlobClient = containerClient.getBlockBlobClient(blob.name);
            const extension = mime.extension(blob.properties.contentType);
            let pathToFile;

            if (extension != null) {
                pathToFile = `${snapshotMediaFolder}/${blob.name}.${extension}`;
            }
            else {
                pathToFile = `${snapshotMediaFolder}/${blob.name}`;
            }

            const folderPath = pathToFile.substring(0, pathToFile.lastIndexOf("/"));
            await fs.promises.mkdir(path.resolve(folderPath), { recursive: true });

            await blockBlobClient.downloadToFile(pathToFile);
        }
    }

    async uploadBlobs() {
        const snapshotMediaFolder = `./${this.snapshotFolder}/media`;
        const blobStorageUrl = await this.getStorageSasUrl();
        const blobServiceClient = new BlobServiceClient(blobStorageUrl.replace(`/${blobStorageContainer}`, ""));
        const containerClient = blobServiceClient.getContainerClient(blobStorageContainer);
        const fileNames = this.listFilesInDirectory(snapshotMediaFolder);

        for (const fileName of fileNames) {
            const blobName = path.basename(fileName).split(".")[0];
            const contentType = mime.lookup(path.extname(fileName));

            const blockBlobClient = containerClient.getBlockBlobClient(blobName);

            await blockBlobClient.uploadFile(fileName, {
                blobHTTPHeaders: {
                    blobContentType: contentType
                }
            });
        }
    }

    async deleteBlobs() {
        const blobStorageUrl = await this.getStorageSasUrl();
        const blobServiceClient = new BlobServiceClient(blobStorageUrl.replace(`/${blobStorageContainer}`, ""));
        const containerClient = blobServiceClient.getContainerClient(blobStorageContainer);

        let blobs = containerClient.listBlobsFlat();

        for await (const blob of blobs) {
            const blockBlobClient = containerClient.getBlockBlobClient(blob.name);
            await blockBlobClient.delete();
        }
    }

    async deleteContent() {
        const contentTypes = await this.getContentTypes();

        for (const contentType of contentTypes) {
            const contentItems = await this.getContentItems(contentType);

            for (const contentItem of contentItems) {
                await this.httpClient.sendRequest("DELETE", `/${contentItem.id}`);
            }
        }
    }

    async generateJson() {
        const data = fs.readFileSync(`${this.snapshotFolder}/data.json`);
        const dataObj = JSON.parse(data);
        const keys = Object.keys(dataObj);

        for (const key of keys) {
            await this.httpClient.sendRequest("PUT", key, dataObj[key]);
        }
    }

    /**
     * Gets a storage SAS URL.
     */
    async getStorageSasUrl() {
        const response = await this.httpClient.sendRequest("POST", `/portalSettings/mediaContent/listSecrets`);
        return response.containerSasUrl;
    }

    async cleanup() {
        console.log("Cleaning up...")
        await this.deleteContent();
        await this.deleteBlobs();
    }

    async export() {
        console.log("Exporting...")
        await this.captureJson();
        await this.downloadBlobs();
    }

    async import() {
        console.log("Importing...")
        await this.generateJson();
        await this.uploadBlobs();
    }

    /**
     * Publishes the content of the specified APIM instance using a SAS token.
     * @param {string} token the SAS token
     */
    async publish() {
        const timeStamp = new Date();
        const revision = timeStamp.toISOString().replace(/[\-\:\T]/g, "").substr(0, 14);
        const url = `/portalRevisions/${revision}`;
        const body = {
            description: `Migration.`,
            isCurrent: true
        }

        await this.httpClient.sendRequest("PUT", url, body);
    }
}

function getAccessToken() {
    const accessToken = execSync(`az account get-access-token --resource-type arm --output tsv --query accessToken`).toString().trim();
    return `Bearer ${accessToken}`;
}

module.exports = {
    HttpClient,
    ImporterExporter
};
