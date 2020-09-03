/*
 * Important: this script is no longer maintained; new scripts are located in the scripts.v2 folder.
*/

const https = require("https");
const storage = require("azure-storage");
const managementEndpoint = process.argv[2];
const accessToken = process.argv[3];
const connectionString = process.argv[4];
const containerName = "content";

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

var options = {
    port: 443,
    method: "GET",
    headers: {
        "Authorization": accessToken,
        "If-Match": "*"
    }
};

const blobService = storage.createBlobService(connectionString);

async function request(method, url) {
    return new Promise((resolve, reject) => {
        options.method = method;

        const req = https.request(url, options, (resp) => {
            let data = "";

            resp.on("data", (chunk) => {
                data += chunk;
            });

            resp.on("end", () => {
                if (data) {
                    try {
                        resolve(JSON.parse(data));
                    }
                    catch (e) {
                        console.log(url);
                        reject(e);
                    }
                }
                else {
                    resolve();
                }
            });
        });

        req.on("error", (e) => {
            reject(e);
        });

        req.end();
    });
}

async function listFilesInContainer() {
    return new Promise((resolve, reject) => {
        blobService.listBlobsSegmented(containerName, null, function (error, result) {
            if (error) {
                reject(error);
            }
            else {
                resolve(result.entries.map(blob => blob.name));
            }
        });
    });
}

async function getContentTypes() {
    const data = await request("GET", `https://${managementEndpoint}/contentTypes?api-version=2018-06-01-preview`);
    const contentTypes = data.value.map(x => x.id.replace("\/contentTypes\/", ""));

    return contentTypes;
}

async function getContentItems(contentType) {
    const data = await request("GET", `https://${managementEndpoint}/contentTypes/${contentType}/contentItems?api-version=2018-06-01-preview`);
    const contentItems = data.value;

    return contentItems;
}

async function deleteContent() {
    const contentTypes = await getContentTypes();

    for (const contentType of contentTypes) {
        const contentItems = await getContentItems(contentType);

        for (const contentItem of contentItems) {
            await request("DELETE", `https://${managementEndpoint}${contentItem.id}?api-version=2018-06-01-preview`);
        }
    }
}

async function deleteBlobs() {
    const blobNames = await listFilesInContainer(containerName);

    for (const blobName of blobNames) {
        console.log(`Deleting blob: ${blobName}`);
        await deleteBlob(blobName);
    }
}

async function deleteBlob(blobName) {
    return new Promise((resolve, reject) => {

        blobService.deleteBlob(containerName, blobName, function (error, result, response) {
            if (!error) {
                resolve();
            }
            else {
                reject(error);
            }
        });

    });
}

async function cleanup() {
    try {
        await deleteContent();
        await deleteBlobs();
        process.exit();

        console.log("DONE");
    }
    catch (error) {
        console.error(error);
    }
}

cleanup();