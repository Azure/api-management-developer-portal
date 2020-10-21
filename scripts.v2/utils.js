const fs = require("fs");
const path = require("path");
const https = require("https");
const { BlobServiceClient } = require("@azure/storage-blob");
const blobStorageContainer = "content";
const mime = require("mime-types");

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

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
    const response = await request("POST", `https://${managementApiEndpoint}/subscriptions/00000/resourceGroups/00000/providers/Microsoft.ApiManagement/service/00000/portalSettings/mediaContent/listSecrets?api-version=2019-12-01`, managementApiAccessToken);
    return response.containerSasUrl;
}

/**
 * A wrapper for making a request and returning its response body.
 * @param {Object} options https options
 */
async function request(method, url, accessToken, body) {
    const headers = {
        "If-Match": "*",
        "Content-Type": "application/json",
        "Authorization": accessToken
    };

    if (body) {
        headers["Content-Length"] = Buffer.byteLength(body);
    }

    const options = {
        port: 443,
        method: method,
        headers: headers
    };

    return new Promise((resolve, reject) => {
        const req = https.request(url, options, (resp) => {
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

module.exports = {
    request,
    downloadBlobs,
    uploadBlobs,
    deleteBlobs,
    getStorageSasTokenOrThrow
};
