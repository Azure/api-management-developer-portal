const fs = require("fs");
const path = require("path");
const https = require("https");
const { BlobServiceClient } = require("@azure/storage-blob");
const blobStorageContainer = "content";
const mime = require("mime");
const apiVersion = '2021-08-01';

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

function listFilesInDirectory(dir) {
    const results = [];

    fs.readdirSync(dir).forEach((file) => {
        file = dir + "/" + file;
        const stat = fs.statSync(file);

        if (stat && stat.isDirectory()) {
            results.push(...listFilesInDirectory(file));
        } else {
            results.push(file);
        }
    });

    return results;
}

/**
 * Attempts to get a developer portal storage connection string in two ways:
 * 1) if the connection string is explicitly set by the user, use it.
 * 2) retrieving the connection string from the management API using the instance endpoint and SAS token
 * @param {string} managementApiEndpoint the management endpoint of service instance
 * @param {string} managementApiAccessToken the SAS token
 */
async function getStorageSasTokenOrThrow(managementApiEndpoint, managementApiAccessToken) {
    if (managementApiAccessToken) {
        // token should always be available, because we call
        // getTokenOrThrow before this
        return await getStorageSasToken(managementApiEndpoint, managementApiAccessToken);
    }
    throw Error('Storage connection could not be retrieved');
}

/**
 * Gets a storage connection string from the management API for the specified APIM instance and
 * SAS token.
 * @param {string} managementApiEndpoint the management endpoint of service instance
 * @param {string} managementApiAccessToken the SAS token
 */
async function getStorageSasToken(managementApiEndpoint, managementApiAccessToken) {
    const response = await request("POST", `https://${managementApiEndpoint}/subscriptions/00000/resourceGroups/00000/providers/Microsoft.ApiManagement/service/00000/portalSettings/mediaContent/listSecrets?api-version=${apiVersion}`, managementApiAccessToken);
    return response.containerSasUrl;
}

/**
 * A wrapper for making a request and returning its response body.
 * @param {Object} options https options
 */
async function request(method, url, accessToken, body) {
    let requestBody;

    const headers = {
        "If-Match": "*",
        "Content-Type": "application/json",
        "Authorization": accessToken
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
        const req = https.request(url, options, (resp) => {
            let chunks = [];
            resp.on('data', (chunk) => {
                chunks.push(chunk);
            });

            resp.on('end', () => {
                let data = Buffer.concat(chunks).toString('utf8');
                switch (resp.statusCode) {
                    case 200:
                    case 201:
                        data.startsWith("{") ? resolve(JSON.parse(data)) : resolve(data);
                        break;
                    case 404:
                        reject({ code: "NotFound", message: `Resource not found: ${url}` });
                        break;
                    case 401:
                        reject({ code: "Unauthorized", message: `Unauthorized. Make sure you correctly specified management API access token before running the script.` });
                        break;
                    case 403:
                        reject({ code: "Forbidden", message: `Looks like you are not allowed to perform this operation. Please check with your administrator.` });
                        break;
                    default:
                        reject({ code: "UnhandledError", message: `Could not complete request to ${url}. Status: ${resp.statusCode} ${resp.statusMessage}` });
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

async function downloadBlobs(blobStorageUrl, snapshotMediaFolder) {
    try {
        const blobServiceClient = new BlobServiceClient(blobStorageUrl.replace(`/${blobStorageContainer}`, ""));
        const containerClient = blobServiceClient.getContainerClient(blobStorageContainer);

        await fs.promises.mkdir(path.resolve(snapshotMediaFolder), { recursive: true });

        await downloadBlobsRecursive(containerClient, snapshotMediaFolder)
    }
    catch (error) {
        throw new Error(`Unable to download media files. ${error.message}`);
    }
}

async function downloadBlobsRecursive(containerClient, outputFolder, prefix = undefined) {
    let blobs = containerClient.listBlobsByHierarchy("/", prefix ? { prefix: prefix } : undefined);
    for await (const blob of blobs) {
        if (blob.kind === "prefix") {
            await downloadBlobsRecursive(containerClient, outputFolder, blob.name);
            continue;
        }

        const blockBlobClient = containerClient.getBlockBlobClient(blob.name);
        const extension = mime.getExtension(blob.properties.contentType);
        let pathToFile;

        if (extension != null) {
            pathToFile = `${outputFolder}/${blob.name}.${extension}`;
        }
        else {
            pathToFile = `${outputFolder}/${blob.name}`;
        }

        const folderPath = pathToFile.substring(0, pathToFile.lastIndexOf("/"));
        await fs.promises.mkdir(path.resolve(folderPath), { recursive: true });
        await blockBlobClient.downloadToFile(pathToFile);
    }
}

async function uploadBlobs(blobStorageUrl, localMediaFolder) {
    if (!fs.existsSync(localMediaFolder)) {
        console.info("No media files found in the snapshot folder. Skipping media upload...");
        return;
    }

    try {
        const blobServiceClient = new BlobServiceClient(blobStorageUrl.replace(`/${blobStorageContainer}`, ""));
        const containerClient = blobServiceClient.getContainerClient(blobStorageContainer);
        const fileNames = listFilesInDirectory(localMediaFolder);

        for (const fileName of fileNames) {
            const blobKey = fileName.replace(localMediaFolder + "/", "").split(".")[0];
            const contentType = mime.getType(fileName) || "application/octet-stream";
            const blockBlobClient = containerClient.getBlockBlobClient(blobKey);

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

async function deleteBlobs(blobStorageUrl) {
    try {
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

module.exports = {
    apiVersion,
    request,
    downloadBlobs,
    uploadBlobs,
    deleteBlobs,
    getStorageSasTokenOrThrow
};
