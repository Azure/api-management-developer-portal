const { request, deleteBlobs, getStorageSasTokenOrThrow } = require("./utils");
const managementApiEndpoint = process.argv[2];
const managementApiAccessToken = process.argv[3];


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

async function deleteContent() {
    const contentTypes = await getContentTypes();

    for (const contentType of contentTypes) {
        const contentItems = await getContentItems(contentType);

        for (const contentItem of contentItems) {
            await request("DELETE", `https://${managementApiEndpoint}${contentItem.id}?api-version=2018-06-01-preview`, managementApiAccessToken);
        }
    }
}

async function cleanup() {
    const blobStorageUrl = await getStorageSasTokenOrThrow(managementApiEndpoint, managementApiAccessToken);

    await deleteContent();
    await deleteBlobs(blobStorageUrl);
}

cleanup()
    .then(() => {
        console.log("DONE");
    })
    .catch(error => {
        console.log(error);
    });