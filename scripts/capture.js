const fs = require("fs");
const path = require("path");
const { request, downloadBlobs, getStorageSasTokenOrThrow } = require("./utils");
const managementApiEndpoint = process.argv[2];
const managementApiAccessToken = process.argv[3];
const destinationFolder = process.argv[4];


async function getContentTypes() {
    const data = await request("GET", `https://${managementApiEndpoint}/contentTypes?api-version=2018-06-01-preview`, managementApiAccessToken);
    const contentTypes = data.value.map(x => x.id.replace("\/contentTypes\/", ""));

    return contentTypes;
}

async function getContentItems(contentType) {
    const data = await request("GET", `https://${managementApiEndpoint}/contentTypes/${contentType}/contentItems?api-version=2018-06-01-preview`, managementApiAccessToken);
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
    const localMediaFolder = `./${destinationFolder}/content`;

    await captureJson();
    await downloadBlobs(blobStorageUrl, localMediaFolder);
}

capture()
    .then(() => {
        console.log("DONE");
    })
    .catch(error => {
        console.log(error);
    })