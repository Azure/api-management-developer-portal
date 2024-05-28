/**
 * This script automates reverting the editor from a published developer portal revision. 
 * In order to run it, you need to:
 * 
 * 1) Clone the api-management-developer-portal repository:
 *    git clone https://github.com/Azure/api-management-developer-portal.git
 * 
 * 2) Install NPM  packages:
 *    npm install
 * 
 * 3) Run this script with a valid combination of arguments:
 *    node ./revert-revision ^
 *    --subscriptionId "< your subscription ID >" ^
 *    --resourceGroupName "< your resource group name >" ^
 *    --serviceName "< your service name >" ^
 *    --snapshotPath "< path to snapshot json file >"
 */
const path = require("path");
const { ImporterExporter } = require("./utils");

const yargs = require('yargs')
    .example(`node ./revert-revision ^ \r
     --subscriptionId "< your subscription ID >" ^ \r
     --resourceGroupName "< your resource group name >" ^ \r
     --serviceName "< your service name >" ^ \r
     --snapshotPath "< your revision number, like C:\/Temp\/20240521140951.json >" \n`)
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
    .option('snapshotPath', {
        type: 'string',
        description: 'Path to the published revision snapshot JSON file.',
        demandOption: true
    })
    
    .help()
    .argv;

async function revertRevision() {
    console.log(`Reverting editor to revision ${yargs.snapshotPath}`);
    const importerExporter = new ImporterExporter(
        yargs.subscriptionId,
        yargs.resourceGroupName,
        yargs.serviceName,
        null,
        null,
        null,
        null,
    );
    await importerExporter.revertRevisionSnapshot(yargs.snapshotPath);
}

revertRevision()
    .then(() => {
        console.log("DONE");
        process.exit(0);
    })
    .catch(error => {
        console.error(error.message);
        process.exit(1);
    });


module.exports = {
    revertRevision
}
