const fs = require("fs");
const path = require("path");
const { request, downloadBlobs, getStorageSasTokenOrThrow } = require("./utils");
const managementApiEndpoint = process.argv[2];
const managementApiAccessToken = process.argv[3];
const destinationFolder = process.argv[4];


async function getContentTypes() {
    const data = await request("GET", `https://${managementApiEndpoint}/subscriptions/00000/resourceGroups/00000/providers/Microsoft.ApiManagement/service/00000/contentTypes?api-version=2019-12-01`, managementApiAccessToken);
    const contentTypes = data.value.map(x => x.id.replace("\/contentTypes\/", ""));

    return contentTypes;
}

async function getContentItems(contentType) {
    const data = await request("GET", `https://${managementApiEndpoint}/subscriptions/00000/resourceGroups/00000/providers/Microsoft.ApiManagement/service/00000/contentTypes/${contentType}/contentItems?api-version=2019-12-01`, managementApiAccessToken);
    const contentItems = data.value;

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

async function capture() {
    const blobStorageUrl = await getStorageSasTokenOrThrow(managementApiEndpoint, managementApiAccessToken);
    const localMediaFolder = `./${destinationFolder}/media`;

    await captureJson();
    await downloadBlobs(blobStorageUrl, localMediaFolder);
}

capture()
    .then(() => {
        console.log("DONE");
    })
    .catch(error => {
        console.log(error);
    });