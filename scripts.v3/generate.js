const fs = require("fs");
const { request, uploadBlobs, getStorageSasTokenOrThrow } = require("./utils");


async function generateJson() {
    const data = fs.readFileSync(`${sourceFolder}/data.json`);
    const dataObj = JSON.parse(data);
    const keys = Object.keys(dataObj);

    for (const key of keys) {
        await request("PUT", key, managementApiAccessToken, JSON.stringify(dataObj[key]));
    }
}

async function generate(managementApiEndpoint, managementApiAccessToken, sourceFolder) {
    const blobStorageUrl = await getStorageSasTokenOrThrow(managementApiEndpoint, managementApiAccessToken);
    const localMediaFolder = `./${sourceFolder}/media`;

    await generateJson();
    await uploadBlobs(blobStorageUrl, localMediaFolder);
}


const managementApiEndpoint = process.argv[2]
const managementApiAccessToken = process.argv[3]
const sourceFolder = process.argv[4];

generate(managementApiEndpoint, managementApiAccessToken, sourceFolder)
    .then(() => {
        console.log("DONE");
    })
    .catch(error => {
        console.log(error);
    });