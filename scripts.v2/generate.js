const fs = require("fs");
const { request, uploadBlobs, getStorageSasTokenOrThrow } = require("./utils");
const managementApiEndpoint = process.argv[2]
const managementApiAccessToken = process.argv[3]
const sourceFolder = process.argv[4];


async function generateJson() {
    const data = fs.readFileSync(`${sourceFolder}/data.json`);
    const dataObj = JSON.parse(data);
    const keys = Object.keys(dataObj);

    for (const key of keys) {
        await request(
            "PUT",
            `https://${managementApiEndpoint}/subscriptions/00000/resourceGroups/00000/providers/Microsoft.ApiManagement/service/00000/${key}?api-version=2019-12-01`,
            managementApiAccessToken,
            JSON.stringify(dataObj[key]));
    }
}

async function generate() {
    const blobStorageUrl = await getStorageSasTokenOrThrow(managementApiEndpoint, managementApiAccessToken);
    const localMediaFolder = `./${sourceFolder}/media`;

    await generateJson();
    await uploadBlobs(blobStorageUrl, localMediaFolder);
}

generate()
    .then(() => {
        console.log("DONE");
    })
    .catch(error => {
        console.log(error);
    });