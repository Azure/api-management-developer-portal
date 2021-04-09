const fs = require("fs");
const path = require("path");
const { request, downloadBlobs, getStorageSasTokenOrThrow } = require("./utils");
const managementApiEndpoint = process.argv[2];
const managementApiAccessToken = process.argv[3];
const destinationFolder = process.argv[4];


async function getContentTypes() {
    try {
        const data = await request("GET", `https://${managementApiEndpoint}/subscriptions/00000/resourceGroups/00000/providers/Microsoft.ApiManagement/service/00000/contentTypes?api-version=2019-12-01`, managementApiAccessToken);
        const contentTypes = data.value.map(x => x.id.replace("\/contentTypes\/", ""));

        return contentTypes;
    }
    catch (error) {
        throw new Error(`Unable to fetch content types. ${error.message}`);
    }
}

async function getContentItems(contentType) {
    try {
        const contentItems = [];
        let nextPageUrl = `https://${managementApiEndpoint}/subscriptions/00000/resourceGroups/00000/providers/Microsoft.ApiManagement/service/00000/contentTypes/${contentType}/contentItems?api-version=2019-12-01`;

        do {
            const data = await request("GET", nextPageUrl, managementApiAccessToken);
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

async function captureJson() {
    try {
        const result = {};
        const contentTypes = await getContentTypes();

        for (const contentType of contentTypes) {
            const contentItems = await getContentItems(contentType);

            contentItems.forEach(contentItem => {
                result[contentItem.id] = contentItem;
                delete contentItem.id;
            });
        }

        await fs.promises.mkdir(path.resolve(destinationFolder), { recursive: true });

        fs.writeFileSync(`${destinationFolder}/data.json`, JSON.stringify(result));
    }
    catch (error) {
        throw new Error(`Unable to capture content. ${error.message}`);
    }
}

async function capture() {
    try {
        const blobStorageUrl = await getStorageSasTokenOrThrow(managementApiEndpoint, managementApiAccessToken);
        const localMediaFolder = `./${destinationFolder}/media`;

        await captureJson();
        await downloadBlobs(blobStorageUrl, localMediaFolder);
    }
    catch (error) {
        throw new Error(`Unable to complete export. ${error.message}`);
    }
}

capture()
    .then(() => {
        console.log("DONE");
    })
    .catch(error => {
        console.log(error.message);
        process.exitCode = 1;
    });