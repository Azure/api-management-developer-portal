const { request, deleteBlobs, getStorageSasTokenOrThrow } = require("./utils");
const managementApiEndpoint = process.argv[2];
const managementApiAccessToken = process.argv[3];


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
        const data = await request("GET", `https://${managementApiEndpoint}/subscriptions/00000/resourceGroups/00000/providers/Microsoft.ApiManagement/service/00000/contentTypes/${contentType}/contentItems?api-version=2019-12-01`, managementApiAccessToken);
        const contentItems = data.value;

        return contentItems;
    }
    catch (error) {
        throw new Error(`Unable to fetch content items. ${error.message}`);
    }
}

async function deleteContent() {
    try {
        const contentTypes = await getContentTypes();

        for (const contentType of contentTypes) {
            const contentItems = await getContentItems(contentType);

            for (const contentItem of contentItems) {
                await request("DELETE", `https://${managementApiEndpoint}/subscriptions/00000/resourceGroups/00000/providers/Microsoft.ApiManagement/service/00000/${contentItem.id}?api-version=2019-12-01`, managementApiAccessToken);
            }
        }
    }
    catch (error) {
        throw new Error(`Unable to delete content. ${error.message}`);
    }
}

async function cleanup() {
    try {
        const blobStorageUrl = await getStorageSasTokenOrThrow(managementApiEndpoint, managementApiAccessToken);

        await deleteContent();
        await deleteBlobs(blobStorageUrl);
    }
    catch (error) {
        throw new Error(`Unable to complete cleanup. ${error.message}`);
    }
}

cleanup()
    .then(() => {
        console.log("DONE");
    })
    .catch(error => {
        console.log(error.message);
        process.exitCode = 1;        
    });