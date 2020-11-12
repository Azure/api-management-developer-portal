const { sendRequest: request, deleteBlobs, getStorageSasTokenOrThrow } = require("./utils");

async function getContentTypes() {
    const data = await request("GET", `/contentTypes`, managementApiAccessToken);
    const contentTypes = data.value.map(x => x.id.replace("\/contentTypes\/", ""));

    return contentTypes;
}

async function getContentItems(contentType) {
    const data = await request("GET", `/contentTypes/${contentType}/contentItems`, managementApiAccessToken);
    const contentItems = data.value;

    return contentItems;
}

async function deleteContent() {
    const contentTypes = await getContentTypes();

    for (const contentType of contentTypes) {
        const contentItems = await getContentItems(contentType);

        for (const contentItem of contentItems) {
            await request("DELETE", `/${contentItem.id}`, managementApiAccessToken);
        }
    }
}

async function cleanup(managementApiEndpoint, managementApiAccessToken) {
    const blobStorageUrl = await getStorageSasTokenOrThrow(managementApiAccessToken);

    await deleteContent();
    await deleteBlobs(blobStorageUrl);
}

async function run() {
    const managementApiEndpoint = process.argv[2];
    const managementApiAccessToken = process.argv[3];

    await cleanup(managementApiEndpoint, managementApiAccessToken)
}

run()
    .then(() => console.log("DONE"))
    .catch(error => console.log(error));

module.exports = {
    cleanup
}