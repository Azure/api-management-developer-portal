/**
 * This script automates deployments between developer portal instances.
 * In order to run it, you need to:
 * 
 * 1) Clone the api-management-developer-portal repository:
 *    git clone https://github.com/Azure/api-management-developer-portal.git
 * 
 * 2) Install NPM  packages:
 *    npm install
 * 
 * 3) Run this script with a valid combination of arguments:
 *    node ./migrate ^
 *    --sourceSubscriptionId "< your subscription ID >" ^
 *    --sourceResourceGroupName "< your resource group name >" ^
 *    --sourceServiceName "< your service name >" ^
 *    --destSubscriptionId "< your subscription ID >" ^
 *    --destResourceGroupName "< your resource group name >" ^
 *    --destServiceName "< your service name >"
 * 
 * Auto-publishing is not supported for self-hosted versions, so make sure you publish the portal (for example, locally)
 * and upload the generated static files to your hosting after the migration is completed.
 * 
 * You can specify the SAS tokens directly (via sourceToken and destToken), or you can supply an identifier and key,
 * and the script will generate tokens that expire in 1 hour. (via sourceId, sourceKey, destId, destKey)
 */

const { ImporterExporter } = require('./utils.js');

const yargs = require('yargs')
    .example(`node ./migrate ^ \r
        --sourceSubscriptionId "< your subscription ID > ^ \r
        --sourceResourceGroupName "< your resource group name >" ^ \r
        --sourceServiceName "< your service name >" ^ \r
        --destSubscriptionId "< your subscription ID >" ^ \r
        --destResourceGroupName "< your resource group name >" ^ \r
        --destServiceName "< your service name >"\n`)
    .option('sourceSubscriptionId', {
        type: 'string',
        description: 'Azure subscription ID.',
        demandOption: true
    })
    .option('sourceResourceGroupName', {
        type: 'string',
        description: 'Azure resource group name.',
        demandOption: true
    })
    .option('sourceServiceName', {
        type: 'string',
        description: 'API Management service name.',
        demandOption: true
    })
    .option('destSubscriptionId', {
        type: 'string',
        description: 'Azure subscription ID.',
        demandOption: true
    })
    .option('destResourceGroupName', {
        type: 'string',
        description: 'Azure resource group name.',
        demandOption: true
    })
    .option('destServiceName', {
        type: 'string',
        description: 'API Management service name.',
        demandOption: true
    })
    .help()
    .argv;

async function migrate() {
    try {
        const sourceImporterExporter = new ImporterExporter(yargs.sourceSubscriptionId, yargs.sourceResourceGroupName, yargs.sourceServiceName);
        await sourceImporterExporter.export();
    
        const destIimporterExporter = new ImporterExporter(yargs.destSubscriptionId, yargs.destResourceGroupName, yargs.destServiceName);
        await destIimporterExporter.cleanup();
        await destIimporterExporter.import();
    
        /* New publishing endpoint is not deployed to production yet. */
        // await destIimporterExporter.publish();
    }
    catch (error) {
        throw new Error(`Unable to complete migration. ${error.message}`);
    }
}

migrate()
    .then(() => {
        console.log("DONE");
        process.exit(0);
    })
    .catch(error => {
        console.error(error.message);
        process.exit(1);
    });
