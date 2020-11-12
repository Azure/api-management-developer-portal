const fs = require("fs");
const path = require("path");
const { sendRequest: request, downloadBlobs, getStorageSasTokenOrThrow } = require("./utils");


async function getContentTypes() {
    const data = await request("GET", `/contentTypes`, managementApiAccessToken);
    const contentTypes = data.value.map(x => x.id.replace("\/contentTypes\/", ""));

    return contentTypes;
}

async function getContentItems(contentType) {
    const contentItems = [];
    let nextPageUrl = `/contentTypes/${contentType}/contentItems`;

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

async function captureJson() {
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

async function capture(managementApiEndpoint, managementApiAccessToken, destinationFolder) {
    const blobStorageUrl = await getStorageSasTokenOrThrow(managementApiEndpoint, managementApiAccessToken);
    const localMediaFolder = `./${destinationFolder}/media`;

    await captureJson();
    await downloadBlobs(blobStorageUrl, localMediaFolder);
}

async function run() {
    const managementApiEndpoint = process.argv[2];
    const managementApiAccessToken = process.argv[3];
    const destinationFolder = process.argv[4];

    capture(managementApiEndpoint, managementApiAccessToken, destinationFolder)
}

run()
    .then(() => console.log("DONE"))
    .catch(error => console.log(error));

module.exports = {
    capture
}