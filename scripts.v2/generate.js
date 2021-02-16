const fs = require("fs");
const { request, uploadBlobs, getStorageSasTokenOrThrow } = require("./utils");
const managementApiEndpoint = process.argv[2]
const managementApiAccessToken = process.argv[3]
const sourceFolder = process.argv[4];


async function generateJson() {
    try {
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
    catch (error) {
        throw new Error(`Unable to generate the content. ${error.message}`);
    }
}

async function generate() {
    try {
        const blobStorageUrl = await getStorageSasTokenOrThrow(managementApiEndpoint, managementApiAccessToken);
        const localMediaFolder = `./${sourceFolder}/media`;

        await generateJson();
        await uploadBlobs(blobStorageUrl, localMediaFolder);
    }
    catch (error) {
        throw new Error(`Unable to complete import. ${error.message}`);
    }
}

generate()
    .then(() => {
        console.log("DONE");
    })
    .catch(error => {
        console.log(error.message);
        process.exitCode = 1;
    });