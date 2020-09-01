const { request, deleteBlobs, getStorageSasTokenOrThrow } = require("./utils");
const managementApiEndpoint = process.argv[2];
const managementApiAccessToken = process.argv[3];


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

async function deleteContent() {
    const contentTypes = await getContentTypes();

    for (const contentType of contentTypes) {
        const contentItems = await getContentItems(contentType);

        for (const contentItem of contentItems) {
            await request("DELETE", `https://${managementApiEndpoint}//subscriptions/00000/resourceGroups/00000/providers/Microsoft.ApiManagement/service/00000/${contentItem.id}?api-version=2019-12-01`, managementApiAccessToken);
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