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
        this.accessToken = this.getAccessToken();
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

    getAccessToken() {
        const accessToken = execSync(`az account get-access-token --resource-type arm --output tsv --query accessToken`).toString().trim();
        return `Bearer ${accessToken}`;
    }
}
class ImporterExporter {
    constructor(subscriptionId, resourceGroupName, serviceName, snapshotFolder = "../dist/snapshot") {
        this.httpClient = new HttpClient(subscriptionId, resourceGroupName, serviceName);
        this.snapshotFolder = snapshotFolder
    }

    /**
     * Returns list of files in specified directory and its sub-directories.
     * @param {string} dir Directory, e.g. "./dist/snapshot".
     */
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
     * Downloads media files from storage of specified API Management service.
     */
    async downloadBlobs() {
        try {
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
        catch (error) {
            throw new Error(`Unable to download media files. ${error.message}`);
        }
    }

    /**
     * Uploads media files to storage of specified API Management service.
     */
    async uploadBlobs() {
        try {
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
        catch (error) {
            throw new Error(`Unable to upload media files. ${error.message}`);
        }
    }

    /**
     * Deletes media files from storage of specified API Management service.
     */
    async deleteBlobs() {
        try {
            const blobStorageUrl = await this.getStorageSasUrl();
            const blobServiceClient = new BlobServiceClient(blobStorageUrl.replace(`/${blobStorageContainer}`, ""));
            const containerClient = blobServiceClient.getContainerClient(blobStorageContainer);

            let blobs = containerClient.listBlobsFlat();

            for await (const blob of blobs) {
                const blockBlobClient = containerClient.getBlockBlobClient(blob.name);
                await blockBlobClient.delete();
            }
        }
        catch (error) {
            throw new Error(`Unable to delete media files. ${error.message}`);
        }
    }

    /**
     * Captures the content of specified API Management service into snapshot.
     */
    async captureContent() {
        try {
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
        catch (error) {
            throw new Error(`Unable to capture content. ${error.message}`);
        }
    }

    /**
     * Deletes the content in specified API Management service.
     */
    async deleteContent() {
        try {
            const contentTypes = await this.getContentTypes();

            for (const contentType of contentTypes) {
                const contentItems = await this.getContentItems(contentType);

                for (const contentItem of contentItems) {
                    await this.httpClient.sendRequest("DELETE", `/${contentItem.id}`);
                }
            }
        }
        catch (error) {
            throw new Error(`Unable to delete content. ${error.message}`);
        }
    }

    /**
     * Generates the content in specified API Management service from snapshot.
     */
    async generateContent() {
        const snapshotFilePath = `${this.snapshotFolder}/data.json`;

        try {
            if (!fs.existsSync(snapshotFilePath)) {
                throw new Error(`Snapshot file ${snapshotFilePath} not found.`);
            }

            const data = fs.readFileSync(snapshotFilePath);
            const dataObj = JSON.parse(data);
            const keys = Object.keys(dataObj);

            for (const key of keys) {
                await this.httpClient.sendRequest("PUT", key, dataObj[key]);
            }
        }
        catch (error) {
            throw new Error(`Unable to generate the content. ${error.message}`);
        }
    }

    /**
     * Gets a storage SAS URL.
     */
    async getStorageSasUrl() {
        const response = await this.httpClient.sendRequest("POST", `/portalSettings/mediaContent/listSecrets`);
        return response.containerSasUrl;
    }

    /**
     * Deletes the content and media files in specfied service.
     */
    async cleanup() {
        console.log("Cleaning up...")

        try {
            await this.deleteContent();
            await this.deleteBlobs();
        }
        catch (error) {
            throw new Error(`Unable to complete cleanup. ${error.message}`);
        }
    }

    /**
     * Exports the content and media files from specfied service.
     */
    async export() {
        console.log("Exporting...")

        try {
            await this.captureContent();
            await this.downloadBlobs();
        }
        catch (error) {
            throw new Error(`Unable to complete export. ${error.message}`);
        }
    }

    /**
     * Imports the content and media files into specfied service.
     */
    async import() {
        console.log("Importing...")

        try {
            await this.generateContent();
            await this.uploadBlobs();
        }
        catch (error) {
            throw new Error(`Unable to complete import. ${error.message}`);
        }
    }

    /**
     * Publishes the content of the specified APIM instance using a SAS token.
     * @param {string} token the SAS token
     */
    async publish() {
        try {
            const timeStamp = new Date();
            const revision = timeStamp.toISOString().replace(/[\-\:\T]/g, "").substr(0, 14);
            const url = `/portalRevisions/${revision}`;
            const body = {
                description: `Migration ${revision}.`,
                isCurrent: true
            }

            await this.httpClient.sendRequest("PUT", url, body);
        }
        catch (error) {
            throw new Error(`Unable to schedule website publishing. ${error.message}`);
        }
    }
}

module.exports = {
    ImporterExporter
};
