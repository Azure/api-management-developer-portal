/*
 * Important: this script is no longer maintained; new scripts are located in the scripts.v2 folder.
*/

const fs = require("fs");
const path = require("path");
const storage = require("azure-storage");
const connectionString = process.argv[2];
const mediaPath = process.argv[3];
const container = process.argv[4];

function listFilesInDirectory(dir) {
    const results = [];

    fs.readdirSync(dir).forEach((file) => {
        file = dir + "/" + file;
        const stat = fs.statSync(file);

        if (stat && stat.isDirectory()) {
            results.push(...this.listAllFilesInDirectory(file));
        } else {
            results.push(file);
        }
    });

    return results;
}

async function upload(fileName, blobName) {
    return new Promise((resolve, reject) => {
        blobService.createBlockBlobFromLocalFile(container, blobName, fileName, function (error, result, response) {
            if (!error) {
                resolve();
            }
            else {
                reject(error);
            }
        });
    });
}

async function uploadFiles() {
    const fileNames = listFilesInDirectory(mediaPath);

    for (const fileName of fileNames) {
        const blobName = path.basename(fileName).split(".")[0];
        console.log(`Uploading file: ${blobName}`);
        await upload(fileName, blobName);
    }
}

const blobService = storage.createBlobService(connectionString);

uploadFiles()
    .then(() => {
        console.log("DONE");
        process.exit();
    })
    .catch(error => {
        console.log(error);
    })
