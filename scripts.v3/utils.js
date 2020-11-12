const fs = require("fs");
const path = require("path");
const https = require("https");
const moment = require('moment');
const crypto = require('crypto');
const { BlobServiceClient } = require("@azure/storage-blob");
const blobStorageContainer = "content";
const mime = require("mime-types");
const apiVersion = "2021-01-01-preview";


function listFilesInDirectory(dir) {
    const results = [];

    fs.readdirSync(dir).forEach((file) => {
        file = dir + "/" + file;
        const stat = fs.statSync(file);

        if (stat && stat.isDirectory()) {
            results.push(...this.listAllFilesInDirectory(file));
        } else {
            results.push(file);
        }
    });

    return results;
}

/**
 * Attempts to get a develoer portal storage connection string in two ways:
 * 1) if the connection string is explicitly set by the user, use it.
 * 2) retrieving the connection string from the management API using the instance endpoint and SAS token
 * @param {string} managementApiEndpoint the management endpoint of service instance
 * @param {string} managementApiAccessToken the SAS token
 */
async function getStorageSasTokenOrThrow(managementApiAccessToken) {
    if (managementApiAccessToken) {
        // token should always be available, because we call
        // getTokenOrThrow before this
        return await getStorageSasToken(managementApiAccessToken);
    }
    throw Error('Storage connection could not be retrieved');
}

/**
 * Gets a storage connection string from the management API for the specified APIM instance and
 * SAS token.
 * @param {string} managementApiAccessToken the SAS token
 */
async function getStorageSasToken(managementApiAccessToken) {
    const response = await sendRequest("POST", `/portalSettings/mediaContent/listSecrets`, managementApiAccessToken);
    return response.containerSasUrl;
}

/**
 * Returns base URL for ARM manegement endpoint.
 * @param {string} managementApiEndpoint Management API endpoint, e.g. management.azure.com.
 * @param {string} subscriptionId Subscription ID, e.g. afe3f3e0-6609-4bee-ad97-85d92c698c5c.
 * @param {string} resourceGroupName Resource group name, e.g. MyResourceGroup.
 * @param {string} serviceName Service name, e.g. "myservice".
 */
function getBaseUrl(managementApiEndpoint = "management.azure.com", subscriptionId = "00000", resourceGroupName = "00000", serviceName = "00000") {
    `https://${managementApiEndpoint}/subscriptions/${subscriptionId}/resourceGroups/${resourceGroupName}/providers/Microsoft.ApiManagement/service/${serviceName}`
}

/**
 * A wrapper for making a request and returning its response body.
 * @param {string} method Http method, e.g. GET.
 * @param {string} url Relative resource URL, e.g. /contentTypes.
 * @param {string} accessToken Access token, e.g. Bearer eyJhbGciOi...
 * @param {string} body Request body.
 */
async function sendRequest(method, url, accessToken, body) {
    const baseUrl = getBaseUrl();
    const normalizedUrl = url.startsWith("/") ? url : `/${url}`;
    const requestUrl = new URL(baseUrl + normalizedUrl);

    if (!requestUrl.searchParams.has("api-version")) {
        requestUrl.searchParams.append("api-version", apiVersion);
    }

    const headers = {
        "If-Match": "*",
        "Content-Type": "application/json",
        "Authorization": accessToken
    };

    if (body) {
        body = {
            properties: body
        }

        headers["Content-Length"] = Buffer.byteLength(body);
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

        if (body) {
            req.write(body);
        }

        req.end();
    });
}

async function downloadBlobs(blobStorageUrl, localMediaFolder) {
    const blobServiceClient = new BlobServiceClient(blobStorageUrl.replace(`/${blobStorageContainer}`, ""));
    const containerClient = blobServiceClient.getContainerClient(blobStorageContainer);

    await fs.promises.mkdir(path.resolve(localMediaFolder), { recursive: true });

    let blobs = containerClient.listBlobsFlat();

    for await (const blob of blobs) {
        const blockBlobClient = containerClient.getBlockBlobClient(blob.name);
        const extension = mime.extension(blob.properties.contentType);

        if (extension != null) {
            await blockBlobClient.downloadToFile(`${localMediaFolder}/${blob.name}.${extension}`);
        }
        else {
            await blockBlobClient.downloadToFile(`${localMediaFolder}/${blob.name}`);
        }
    }
}

async function uploadBlobs(blobStorageUrl, localMediaFolder) {
    const blobServiceClient = new BlobServiceClient(blobStorageUrl.replace(`/${blobStorageContainer}`, ""));
    const containerClient = blobServiceClient.getContainerClient(blobStorageContainer);
    const fileNames = listFilesInDirectory(localMediaFolder);

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

async function deleteBlobs(blobStorageUrl) {
    const blobServiceClient = new BlobServiceClient(blobStorageUrl.replace(`/${blobStorageContainer}`, ""));
    const containerClient = blobServiceClient.getContainerClient(blobStorageContainer);

    let blobs = containerClient.listBlobsFlat();

    for await (const blob of blobs) {
        const blockBlobClient = containerClient.getBlockBlobClient(blob.name);
        await blockBlobClient.delete();
    }
}

/**
 * Attempts to get a SAS token in two ways:
 * 1) if the token is explicitly set by the user, use that token.
 * 2) if the id and key are specified, manually generate a SAS token.
 * @param {string} token an optionally specified token
 * @param {string} id the Management API identifier
 * @param {string} key the Management API key
 */
async function getTokenOrThrow(token, id, key) {
    if (token) {
        return token;
    }
    if (id && key) {
        return await generateSASToken(id, key);
    }
    throw Error('You need to specify either: token or id AND key');
}

/**
 * Generates a SAS token from the specified Management API id and key.  Optionally
 * specify the expiry time, in seconds.
 * See https://docs.microsoft.com/en-us/rest/api/apimanagement/apimanagementrest/azure-api-management-rest-api-authentication#ManuallyCreateToken
 * @param {string} id The Management API identifier.
 * @param {string} key The Management API key (primary or secondary)
 * @param {number} expiresIn The number of seconds in which the token should expire.
 */
async function generateSASToken(id, key, expiresIn = 3600) {
    const now = moment.utc(moment());
    const expiry = now.clone().add(expiresIn, 'seconds');
    const expiryString = expiry.format(`YYYY-MM-DD[T]HH:mm:ss.SSSSSSS[Z]`);

    const dataToSign = `${id}\n${expiryString}`;
    const signedData = crypto.createHmac('sha512', key).update(dataToSign).digest('base64');
    return `SharedAccessSignature uid=${id}&ex=${expiryString}&sn=${signedData}`;
}


module.exports = {
    getBaseUrl,
    sendRequest,
    downloadBlobs,
    uploadBlobs,
    deleteBlobs,
    getStorageSasTokenOrThrow,
    getTokenOrThrow
};
