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
            `https://${managementApiEndpoint}${key}?api-version=2018-06-01-preview`,
            managementApiAccessToken,
            JSON.stringify(dataObj[key]));
    }
}

async function generate() {
    const blobStorageUrl = await getStorageSasTokenOrThrow(managementApiEndpoint, managementApiAccessToken);
    const localMediaFolder = `./${sourceFolder}/content`;

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