/*
 * Important: this script is no longer maintained; new scripts are located in the scripts.v2 folder.
*/

const mkdirp = require("mkdirp");
const storage = require("azure-storage");
const containerName = "content";
const connectionString = process.argv[2];
const downloadPath = process.argv[3];

async function createPath(path) {
    return new Promise((resolve) => {
        mkdirp(path, (error) => {
            if (error) {
                reject(error);
            }
            else {
                resolve();
            }
        });
    });
}

async function downloadBlobs() {
    await createPath(downloadPath);

    return new Promise((resolve) => {
        blobService.listBlobsSegmented(containerName, null, function (error, result) {
            if (error) {
                console.log(error);
            }
            else {
                var blobs = result.entries;
                var blobsDownloaded = 0;

                blobs.forEach((blob) => {
                    blobService.getBlobToLocalFile(containerName, blob.name, downloadPath + '/' + blob.name, function (error2) {
                        blobsDownloaded++;

                        if (error2) {
                            console.log(error2);
                        }
                        else {
                            console.log('Blob ' + blob.name + ' download finished.');

                            if (blobsDownloaded === blobs.length) {
                                console.log('All files downloaded');
                                resolve();
                            }
                        }
                    });
                });
            }
        });
    });
}

const blobService = storage.createBlobService(connectionString);

downloadBlobs()
    .then(() => {
        console.log("DONE");
        process.exit();
    })
    .catch(error => {
        console.log(error);
    });