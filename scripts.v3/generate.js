/**
 * This script automates generating the content of API Management developer portals from the snapshot.
 * In order to run it, you need to:
 * 
 * 1) Clone the api-management-developer-portal repository:
 *    git clone https://github.com/Azure/api-management-developer-portal.git
 * 
 * 2) Install NPM  packages:
 *    npm install
 * 
 * 3) Run this script with a valid combination of arguments:
 *    node ./generate ^
 *   --subscriptionId < your subscription ID > ^
 *   --resourceGroupName < your resource group name > ^
 *   --serviceName < your service name > ^
 *   --publish true [false: default]
 */

const path = require("path");
const { ImporterExporter } = require("./utils");

const yargs = require('yargs')
    .example(`node ./generate ^ \r
     --subscriptionId "< your subscription ID >" ^ \r
     --resourceGroupName "< your resource group name >" ^ \r
     --serviceName "< your service name >"\n`)
    .option('subscriptionId', {
        type: 'string',
        description: 'Azure subscription ID.',
        demandOption: true
    })
    .option('resourceGroupName', {
        type: 'string',
        description: 'Azure resource group name.',
        demandOption: true
    })
    .option('serviceName', {
        type: 'string',
        description: 'API Management service name.',
        demandOption: true
    })
    .option('folder', {
        type: 'string',
        default: '../dist/snapshot',
        description: 'The path to the folder which contains the content to be uploaded to the portal',
        example: '../dist/snapshot',
        demandOption: false
    })
    .option('publish', {
        type: 'boolean',
        default: false,
        description: 'Enabling this flag will publish the developer portal changes.',
        demandOption: false
    })
    .help()
    .argv;

async function generate() {

    // make the folder path understandable if running in Windows
    const folder = yargs.folder.split("\\").join("/");

    // get the absolute path
    var absoluteFolder = path.resolve(folder);
    console.log(`Going to upload the content in ${absoluteFolder}.`);

    const importerExporter = new ImporterExporter(
        yargs.subscriptionId,
        yargs.resourceGroupName,
        yargs.serviceName,
        null,
        null,
        null,
        absoluteFolder
    );

    await importerExporter.import();

    if (yargs.publish === true) {
        console.log("Publishing changes...");
        await importerExporter.publish();
        console.log("Published.");
    } else {
        console.warn("Skipped publishing changes! If you want to publish the changes run the script with --publish true flag.");    
    }
}

generate()
    .then(() => {
        console.log("DONE");
        process.exit(0);
    })
    .catch(error => {
        console.error(error.message);
        process.exit(1);
    });


module.exports = {
    generate
}
